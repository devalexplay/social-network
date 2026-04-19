const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(session({
    secret: 'freedomnet-super-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.random().toString(36).substring(7) + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Data storage (in memory with persistence)
const DATA_FILE = './data.json';
let data = {
    users: [],
    posts: [],
    follows: [],
    messages: [],
    reports: [],
    feedbacks: [],
    sessions: {}
};

function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            data = { ...data, ...saved };
            console.log('Data loaded from disk');
        }
    } catch(e) { console.error('Error loading data:', e); }
}

function saveData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch(e) { console.error('Error saving data:', e); }
}

loadData();
setInterval(saveData, 5000); // Auto-save every 5 seconds

// Helper functions
function getUserById(id) { return data.users.find(u => u.id === id); }
function getUserByUsername(username) { return data.users.find(u => u.username.toLowerCase() === username.toLowerCase()); }
function getUserByEmail(email) { return data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
function getPostById(id) { return data.posts.find(p => p.id === id); }

function addNotification(userId, type, fromUserId, postId = null) {
    const user = getUserById(userId);
    if (!user) return;
    if (!user.notifications) user.notifications = [];
    user.notifications.unshift({
        id: uuidv4(),
        type,
        fromUserId,
        postId,
        read: false,
        createdAt: Date.now()
    });
    user.notifications = user.notifications.slice(0, 50);
    saveData();
}

function getFeedPosts(userId, offset = 0, limit = 15) {
    const followingIds = data.follows.filter(f => f.follower_id === userId).map(f => f.followee_id);
    followingIds.push(userId);
    
    let posts = data.posts
        .filter(p => followingIds.includes(p.user_id))
        .sort((a, b) => b.created_at - a.created_at);
    
    const total = posts.length;
    posts = posts.slice(offset, offset + limit);
    
    const usersMap = new Map(data.users.map(u => [u.id, u]));
    
    posts = posts.map(post => {
        const user = usersMap.get(post.user_id);
        return {
            ...post,
            username: user?.username || 'unknown',
            avatar: user?.avatar || null,
            is_creator: user?.is_creator || false,
            is_official: user?.is_official || false,
            role: user?.role || null,
            comments: (post.comments || []).map(c => {
                const commentUser = usersMap.get(c.user_id);
                return {
                    ...c,
                    username: commentUser?.username || 'unknown',
                    avatar: commentUser?.avatar || null,
                    is_creator: commentUser?.is_creator || false,
                    is_official: commentUser?.is_official || false,
                    role: commentUser?.role || null
                };
            }),
            user_liked: (post.likes || []).includes(userId),
            likes_count: (post.likes || []).length
        };
    });
    
    return { posts, hasMore: offset + limit < total };
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

// ============ API ROUTES ============

// Register
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    if (username.length < 3 || username.length > 20) return res.status(400).json({ error: 'Username must be 3-20 characters' });
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: 'Username can only contain letters, numbers, underscore' });
    if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
    
    if (getUserByUsername(username)) return res.status(400).json({ error: 'Username already taken' });
    if (getUserByEmail(email)) return res.status(400).json({ error: 'Email already registered' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: Date.now(),
        username,
        email,
        password: hashedPassword,
        avatar: null,
        bio: '',
        is_creator: username === 'DevAlexPlay',
        is_official: false,
        role: username === 'DevAlexPlay' ? 'admin' : null,
        created_at: Date.now(),
        online: false,
        last_seen: Date.now(),
        notifications: []
    };
    data.users.push(newUser);
    saveData();
    res.json({ success: true });
});

// Login
app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;
    const user = getUserByUsername(login) || getUserByEmail(login);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    req.session.userId = user.id;
    res.json({ success: true });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Get current user
app.get('/api/me', requireAuth, (req, res) => {
    const user = getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user: { ...user, password: undefined } });
});

// Get user by username
app.get('/api/user/:username', (req, res) => {
    const user = getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ...user, password: undefined });
});

// Get all users
app.get('/api/users', (req, res) => {
    res.json(data.users.map(u => ({ ...u, password: undefined })));
});

// Update avatar
app.post('/api/avatar', requireAuth, upload.single('avatar'), (req, res) => {
    const user = getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (req.file) {
        user.avatar = `/uploads/${req.file.filename}`;
        saveData();
        res.json({ success: true, avatar: user.avatar });
    } else {
        res.status(400).json({ error: 'No file uploaded' });
    }
});

// Change password
app.post('/api/change-password', requireAuth, async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    if (newPassword !== confirmPassword) return res.status(400).json({ error: 'New passwords do not match' });
    if (newPassword.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
    
    user.password = await bcrypt.hash(newPassword, 10);
    saveData();
    res.json({ success: true });
});

// Change username
app.post('/api/change-username', requireAuth, async (req, res) => {
    const { newUsername, password } = req.body;
    const user = getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Password is incorrect' });
    if (getUserByUsername(newUsername)) return res.status(400).json({ error: 'Username already taken' });
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUsername)) return res.status(400).json({ error: 'Invalid username format' });
    
    user.username = newUsername;
    saveData();
    res.json({ success: true, username: newUsername });
});

// Change email
app.post('/api/change-email', requireAuth, async (req, res) => {
    const { newEmail, password } = req.body;
    const user = getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Password is incorrect' });
    if (getUserByEmail(newEmail)) return res.status(400).json({ error: 'Email already used' });
    
    user.email = newEmail;
    saveData();
    res.json({ success: true, email: newEmail });
});

// Delete account
app.post('/api/delete-account', requireAuth, async (req, res) => {
    const { password } = req.body;
    const user = getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Password is incorrect' });
    
    // Delete user's posts
    data.posts = data.posts.filter(p => p.user_id !== user.id);
    // Delete user's comments
    data.posts.forEach(post => {
        post.comments = (post.comments || []).filter(c => c.user_id !== user.id);
    });
    // Delete follows
    data.follows = data.follows.filter(f => f.follower_id !== user.id && f.followee_id !== user.id);
    // Delete messages
    data.messages = data.messages.filter(m => m.from_id !== user.id && m.to_id !== user.id);
    // Delete user
    data.users = data.users.filter(u => u.id !== user.id);
    
    saveData();
    req.session.destroy();
    res.json({ success: true });
});

// ============ POSTS ============
app.get('/api/feed', requireAuth, (req, res) => {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 15;
    const result = getFeedPosts(req.session.userId, offset, limit);
    res.json(result);
});

app.post('/api/posts', requireAuth, upload.single('image'), (req, res) => {
    const { content } = req.body;
    if (!content || content.trim().length < 1) return res.status(400).json({ error: 'Post content required' });
    if (content.length > 500) return res.status(400).json({ error: 'Post too long' });
    
    const user = getUserById(req.session.userId);
    const newPost = {
        id: Date.now(),
        user_id: req.session.userId,
        content: content.trim(),
        image: req.file ? `/uploads/${req.file.filename}` : null,
        likes: [],
        comments: [],
        created_at: Date.now(),
        edited: false
    };
    data.posts.unshift(newPost);
    saveData();
    
    // Notify followers via WebSocket
    const followers = data.follows.filter(f => f.followee_id === req.session.userId).map(f => f.follower_id);
    wss.clients.forEach(client => {
        if (client.userId && followers.includes(client.userId)) {
            client.send(JSON.stringify({ type: 'new_post', post: { ...newPost, username: user.username, avatar: user.avatar } }));
        }
    });
    
    res.json({ ...newPost, username: user.username, avatar: user.avatar });
});

app.put('/api/posts/:id', requireAuth, (req, res) => {
    const post = getPostById(parseInt(req.params.id));
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user_id !== req.session.userId) return res.status(403).json({ error: 'Not your post' });
    
    const { content, removeImage } = req.body;
    if (!content || content.trim().length < 1) return res.status(400).json({ error: 'Content required' });
    if (content.length > 500) return res.status(400).json({ error: 'Post too long' });
    
    post.content = content.trim();
    if (removeImage) post.image = null;
    post.edited = true;
    saveData();
    res.json({ success: true });
});

app.delete('/api/posts/:id', requireAuth, (req, res) => {
    const post = getPostById(parseInt(req.params.id));
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const user = getUserById(req.session.userId);
    if (post.user_id !== req.session.userId && user?.role !== 'admin') return res.status(403).json({ error: 'Not your post' });
    
    data.posts = data.posts.filter(p => p.id !== post.id);
    saveData();
    res.json({ success: true });
});

// Like/Unlike
app.post('/api/like/:postId', requireAuth, (req, res) => {
    const post = getPostById(parseInt(req.params.postId));
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const userId = req.session.userId;
    if (post.likes.includes(userId)) {
        post.likes = post.likes.filter(id => id !== userId);
    } else {
        post.likes.push(userId);
        if (post.user_id !== userId) {
            addNotification(post.user_id, 'like', userId, post.id);
        }
    }
    saveData();
    res.json({ success: true, likes_count: post.likes.length, user_liked: post.likes.includes(userId) });
});

// Comments
app.post('/api/comment/:postId', requireAuth, (req, res) => {
    const post = getPostById(parseInt(req.params.postId));
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const { content } = req.body;
    if (!content || content.trim().length < 1) return res.status(400).json({ error: 'Comment content required' });
    
    const newComment = {
        id: Date.now(),
        user_id: req.session.userId,
        content: content.trim(),
        created_at: Date.now()
    };
    if (!post.comments) post.comments = [];
    post.comments.push(newComment);
    saveData();
    
    if (post.user_id !== req.session.userId) {
        addNotification(post.user_id, 'comment', req.session.userId, post.id);
    }
    
    res.json({ success: true, comments: post.comments });
});

app.delete('/api/comment/:commentId', requireAuth, (req, res) => {
    let found = false;
    for (const post of data.posts) {
        const commentIndex = (post.comments || []).findIndex(c => c.id === parseInt(req.params.commentId));
        if (commentIndex !== -1) {
            const comment = post.comments[commentIndex];
            const user = getUserById(req.session.userId);
            if (comment.user_id === req.session.userId || post.user_id === req.session.userId || user?.role === 'admin') {
                post.comments.splice(commentIndex, 1);
                saveData();
                found = true;
                break;
            }
        }
    }
    if (!found) return res.status(404).json({ error: 'Comment not found' });
    res.json({ success: true });
});

// ============ FOLLOWS ============
app.get('/api/follows', requireAuth, (req, res) => {
    res.json(data.follows.filter(f => f.follower_id === req.session.userId));
});

app.post('/api/follow/:userId', requireAuth, (req, res) => {
    const followeeId = parseInt(req.params.userId);
    if (followeeId === req.session.userId) return res.status(400).json({ error: 'Cannot follow yourself' });
    if (!getUserById(followeeId)) return res.status(404).json({ error: 'User not found' });
    if (data.follows.some(f => f.follower_id === req.session.userId && f.followee_id === followeeId)) {
        return res.json({ success: true, alreadyFollowing: true });
    }
    data.follows.push({
        id: Date.now(),
        follower_id: req.session.userId,
        followee_id: followeeId,
        created_at: Date.now()
    });
    saveData();
    addNotification(followeeId, 'follow', req.session.userId);
    res.json({ success: true });
});

app.delete('/api/follow/:userId', requireAuth, (req, res) => {
    const followeeId = parseInt(req.params.userId);
    data.follows = data.follows.filter(f => !(f.follower_id === req.session.userId && f.followee_id === followeeId));
    saveData();
    res.json({ success: true });
});

app.get('/api/followers/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const followers = data.follows.filter(f => f.followee_id === userId).map(f => {
        const user = getUserById(f.follower_id);
        return user ? { id: user.id, username: user.username, avatar: user.avatar } : null;
    }).filter(Boolean);
    res.json(followers);
});

app.get('/api/following/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const following = data.follows.filter(f => f.follower_id === userId).map(f => {
        const user = getUserById(f.followee_id);
        return user ? { id: user.id, username: user.username, avatar: user.avatar } : null;
    }).filter(Boolean);
    res.json(following);
});

// ============ MESSAGES ============
app.get('/api/chat-users', requireAuth, (req, res) => {
    const myId = req.session.userId;
    const conversations = new Map();
    
    data.messages.forEach(msg => {
        const otherId = msg.from_id === myId ? msg.to_id : msg.from_id;
        if (!conversations.has(otherId) || msg.created_at > conversations.get(otherId).last_message_time) {
            const otherUser = getUserById(otherId);
            if (otherUser) {
                conversations.set(otherId, {
                    other_id: otherId,
                    username: otherUser.username,
                    avatar: otherUser.avatar,
                    is_creator: otherUser.is_creator,
                    is_official: otherUser.is_official,
                    role: otherUser.role,
                    last_message: msg.content,
                    last_message_time: msg.created_at,
                    unread: msg.to_id === myId && !msg.read ? 1 : 0
                });
            }
        }
    });
    
    const result = Array.from(conversations.values()).sort((a, b) => b.last_message_time - a.last_message_time);
    res.json(result);
});

app.get('/api/messages/:userId', requireAuth, (req, res) => {
    const myId = req.session.userId;
    const otherId = parseInt(req.params.userId);
    
    const messages = data.messages
        .filter(m => (m.from_id === myId && m.to_id === otherId) || (m.from_id === otherId && m.to_id === myId))
        .sort((a, b) => a.created_at - b.created_at);
    
    // Mark as read
    messages.forEach(m => {
        if (m.to_id === myId && !m.read) {
            m.read = true;
        }
    });
    saveData();
    
    res.json(messages);
});

app.post('/api/messages/:userId', requireAuth, upload.single('image'), (req, res) => {
    const myId = req.session.userId;
    const toId = parseInt(req.params.userId);
    const { content } = req.body;
    
    if (toId === myId) return res.status(400).json({ error: 'Cannot message yourself' });
    if (!content?.trim() && !req.file) return res.status(400).json({ error: 'Message content required' });
    
    const newMessage = {
        id: Date.now(),
        from_id: myId,
        to_id: toId,
        content: content?.trim() || '',
        image: req.file ? `/uploads/${req.file.filename}` : null,
        created_at: Date.now(),
        read: false
    };
    data.messages.push(newMessage);
    saveData();
    
    // Send via WebSocket
    const fromUser = getUserById(myId);
    wss.clients.forEach(client => {
        if (client.userId === toId) {
            client.send(JSON.stringify({
                type: 'new_message',
                from_id: myId,
                to_id: toId,
                message: { ...newMessage, from_username: fromUser?.username, from_avatar: fromUser?.avatar }
            }));
        }
    });
    
    res.json(newMessage);
});

// Message reactions
app.get('/api/message-reactions/:messageId', (req, res) => {
    const message = data.messages.find(m => m.id === parseInt(req.params.messageId));
    res.json(message?.reactions || []);
});

app.post('/api/message-reaction/:messageId', requireAuth, (req, res) => {
    const message = data.messages.find(m => m.id === parseInt(req.params.messageId));
    if (!message) return res.status(404).json({ error: 'Message not found' });
    
    const { reaction } = req.body;
    if (!message.reactions) message.reactions = [];
    const existingIndex = message.reactions.findIndex(r => r.user_id === req.session.userId && r.reaction === reaction);
    if (existingIndex !== -1) {
        message.reactions.splice(existingIndex, 1);
    } else {
        message.reactions.push({ user_id: req.session.userId, reaction, created_at: Date.now() });
    }
    saveData();
    res.json(message.reactions);
});

// ============ REPORTS ============
app.post('/api/report', requireAuth, (req, res) => {
    const { postId, imageUrl, reason } = req.body;
    data.reports.push({
        id: Date.now(),
        postId,
        imageUrl,
        reason,
        reportedBy: req.session.userId,
        reportedByUsername: getUserById(req.session.userId)?.username,
        timestamp: Date.now(),
        resolved: false
    });
    saveData();
    
    // Notify admins and moderators
    const adminsAndMods = data.users.filter(u => u.role === 'admin' || u.role === 'moderator' || u.username === 'DevAlexPlay');
    wss.clients.forEach(client => {
        if (adminsAndMods.some(a => a.id === client.userId)) {
            client.send(JSON.stringify({ type: 'new_report', reportedBy: getUserById(req.session.userId)?.username, reason }));
        }
    });
    
    res.json({ success: true });
});

app.get('/api/reports', requireAuth, (req, res) => {
    const user = getUserById(req.session.userId);
    if (user?.role !== 'admin' && user?.role !== 'moderator' && user?.username !== 'DevAlexPlay') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(data.reports);
});

// ============ FEEDBACK & COMMANDS ============
app.post('/api/feedback', requireAuth, async (req, res) => {
    const { content } = req.body;
    const user = getUserById(req.session.userId);
    
    // Check for MODERATOR command
    const modMatch = content.match(/^ModGivemyselfByPromo690217453671\s+@?(\w+)$/i);
    if (modMatch && (user?.role === 'admin' || user?.username === 'DevAlexPlay')) {
        const targetUsername = modMatch[1];
        const targetUser = getUserByUsername(targetUsername);
        if (!targetUser) return res.json({ message: `User @${targetUsername} not found` });
        
        targetUser.role = 'moderator';
        saveData();
        
        // Notify via WebSocket
        wss.clients.forEach(client => {
            if (client.userId === targetUser.id) {
                client.send(JSON.stringify({ type: 'user_role_changed', username: targetUsername, newRole: 'moderator' }));
            }
        });
        return res.json({ message: `✅ User @${targetUsername} is now MODERATOR!` });
    }
    
    // Check for ADMIN command
    const adminMatch = content.match(/^AdminGivemyselfByPromo904208751262982457432673\s+@?(\w+)$/i);
    if (adminMatch && (user?.role === 'admin' || user?.username === 'DevAlexPlay')) {
        const targetUsername = adminMatch[1];
        const targetUser = getUserByUsername(targetUsername);
        if (!targetUser) return res.json({ message: `User @${targetUsername} not found` });
        
        targetUser.role = 'admin';
        saveData();
        
        wss.clients.forEach(client => {
            if (client.userId === targetUser.id) {
                client.send(JSON.stringify({ type: 'user_role_changed', username: targetUsername, newRole: 'admin' }));
            }
        });
        return res.json({ message: `⛔ User @${targetUsername} is now ADMIN!` });
    }
    
    // Regular feedback
    data.feedbacks.push({
        id: Date.now(),
        user_id: req.session.userId,
        username: user.username,
        content,
        created_at: Date.now()
    });
    saveData();
    
    res.json({ message: 'Feedback received! Thank you.' });
});

// ============ ONLINE STATUS ============
app.post('/api/online', requireAuth, (req, res) => {
    const user = getUserById(req.session.userId);
    if (user) {
        user.online = req.body.online;
        user.last_seen = Date.now();
        saveData();
    }
    res.json({ success: true });
});

app.get('/api/online/:userId', (req, res) => {
    const user = getUserById(parseInt(req.params.userId));
    const isOnline = user?.online && (Date.now() - (user.last_seen || 0) < 60000);
    res.json({ online: isOnline });
});

// ============ SEARCH ============
app.get('/api/search', (req, res) => {
    const query = (req.query.q || '').toLowerCase();
    const users = data.users
        .filter(u => u.username.toLowerCase().includes(query))
        .map(u => ({ id: u.id, username: u.username, avatar: u.avatar, is_creator: u.is_creator, is_official: u.is_official, role: u.role }));
    
    const posts = data.posts
        .filter(p => p.content.toLowerCase().includes(query))
        .slice(0, 20)
        .map(p => {
            const user = getUserById(p.user_id);
            return { id: p.id, content: p.content, username: user?.username, created_at: p.created_at };
        });
    
    res.json({ users, posts });
});

// ============ STATIC FILES ============
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============ WEBSOCKET ============
wss.on('connection', (ws, req) => {
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
        const sessionIdMatch = cookieHeader.match(/connect\.sid=s%3A([^.]*)/);
        // Simplified - in production use proper session parsing
    }
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'auth' && data.userId) {
                ws.userId = data.userId;
            }
        } catch(e) {}
    });
    
    ws.on('close', () => {});
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`FreedomNet server running on http://localhost:${PORT}`);
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
