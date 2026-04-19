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
    secret: 'freedomnet-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

// Upload setup
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

// Data storage
const DATA_FILE = './data.json';
let data = {
    users: [],
    posts: [],
    follows: [],
    messages: [],
    reports: [],
    feedbacks: []
};

function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            console.log('Data loaded');
        }
    } catch(e) { console.error('Error loading data:', e); }
}

function saveData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch(e) { console.error('Error saving data:', e); }
}

loadData();
setInterval(saveData, 5000);

// Helpers
function getUserById(id) { return data.users.find(u => u.id === id); }
function getUserByUsername(username) { return data.users.find(u => u.username.toLowerCase() === username.toLowerCase()); }
function getUserByEmail(email) { return data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
function getPostById(id) { return data.posts.find(p => p.id === id); }

function requireAuth(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

function getFeedPosts(userId, offset = 0, limit = 15) {
    const followingIds = data.follows.filter(f => f.follower_id === userId).map(f => f.followee_id);
    followingIds.push(userId);
    
    let posts = data.posts.filter(p => followingIds.includes(p.user_id)).sort((a, b) => b.created_at - a.created_at);
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
                return { ...c, username: commentUser?.username || 'unknown', avatar: commentUser?.avatar || null };
            }),
            user_liked: (post.likes || []).includes(userId),
            likes_count: (post.likes || []).length
        };
    });
    
    return { posts, hasMore: offset + limit < total };
}

// ============ API ============

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    if (username.length < 3) return res.status(400).json({ error: 'Username too short' });
    if (password.length < 4) return res.status(400).json({ error: 'Password too short' });
    if (getUserByUsername(username)) return res.status(400).json({ error: 'Username taken' });
    if (getUserByEmail(email)) return res.status(400).json({ error: 'Email taken' });
    
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
        last_seen: Date.now()
    };
    data.users.push(newUser);
    saveData();
    res.json({ success: true });
});

app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;
    const user = getUserByUsername(login) || getUserByEmail(login);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    req.session.userId = user.id;
    res.json({ success: true });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/me', requireAuth, (req, res) => {
    const user = getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
});

app.get('/api/user/:username', (req, res) => {
    const user = getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

app.get('/api/users', (req, res) => {
    res.json(data.users.map(u => {
        const { password, ...rest } = u;
        return rest;
    }));
});

app.post('/api/avatar', requireAuth, upload.single('avatar'), (req, res) => {
    const user = getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (req.file) {
        user.avatar = `/uploads/${req.file.filename}`;
        saveData();
        res.json({ success: true, avatar: user.avatar });
    } else {
        res.status(400).json({ error: 'No file' });
    }
});

app.post('/api/change-password', requireAuth, async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Wrong password' });
    if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });
    if (newPassword.length < 4) return res.status(400).json({ error: 'Password too short' });
    
    user.password = await bcrypt.hash(newPassword, 10);
    saveData();
    res.json({ success: true });
});

app.post('/api/change-username', requireAuth, async (req, res) => {
    const { newUsername, password } = req.body;
    const user = getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Wrong password' });
    if (getUserByUsername(newUsername)) return res.status(400).json({ error: 'Username taken' });
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUsername)) return res.status(400).json({ error: 'Invalid username' });
    
    user.username = newUsername;
    saveData();
    res.json({ success: true, username: newUsername });
});

app.post('/api/change-email', requireAuth, async (req, res) => {
    const { newEmail, password } = req.body;
    const user = getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Wrong password' });
    if (getUserByEmail(newEmail)) return res.status(400).json({ error: 'Email taken' });
    
    user.email = newEmail;
    saveData();
    res.json({ success: true, email: newEmail });
});

app.post('/api/delete-account', requireAuth, async (req, res) => {
    const { password } = req.body;
    const user = getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Wrong password' });
    
    data.posts = data.posts.filter(p => p.user_id !== user.id);
    data.posts.forEach(post => {
        post.comments = (post.comments || []).filter(c => c.user_id !== user.id);
    });
    data.follows = data.follows.filter(f => f.follower_id !== user.id && f.followee_id !== user.id);
    data.messages = data.messages.filter(m => m.from_id !== user.id && m.to_id !== user.id);
    data.users = data.users.filter(u => u.id !== user.id);
    
    saveData();
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/feed', requireAuth, (req, res) => {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 15;
    res.json(getFeedPosts(req.session.userId, offset, limit));
});

app.post('/api/posts', requireAuth, upload.single('image'), (req, res) => {
    const { content } = req.body;
    if (!content || content.trim().length < 1) return res.status(400).json({ error: 'Content required' });
    if (content.length > 500) return res.status(400).json({ error: 'Too long' });
    
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
    
    res.json({ ...newPost, username: user.username, avatar: user.avatar });
});

app.delete('/api/posts/:id', requireAuth, (req, res) => {
    const post = getPostById(parseInt(req.params.id));
    if (!post) return res.status(404).json({ error: 'Not found' });
    const user = getUserById(req.session.userId);
    if (post.user_id !== req.session.userId && user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    
    data.posts = data.posts.filter(p => p.id !== post.id);
    saveData();
    res.json({ success: true });
});

app.post('/api/like/:postId', requireAuth, (req, res) => {
    const post = getPostById(parseInt(req.params.postId));
    if (!post) return res.status(404).json({ error: 'Not found' });
    
    const userId = req.session.userId;
    if (post.likes.includes(userId)) {
        post.likes = post.likes.filter(id => id !== userId);
    } else {
        post.likes.push(userId);
    }
    saveData();
    res.json({ success: true, likes_count: post.likes.length, user_liked: post.likes.includes(userId) });
});

app.post('/api/comment/:postId', requireAuth, (req, res) => {
    const post = getPostById(parseInt(req.params.postId));
    if (!post) return res.status(404).json({ error: 'Not found' });
    
    const { content } = req.body;
    if (!content || content.trim().length < 1) return res.status(400).json({ error: 'Content required' });
    
    const newComment = {
        id: Date.now(),
        user_id: req.session.userId,
        content: content.trim(),
        created_at: Date.now()
    };
    if (!post.comments) post.comments = [];
    post.comments.push(newComment);
    saveData();
    
    res.json({ success: true, comments: post.comments });
});

app.delete('/api/comment/:commentId', requireAuth, (req, res) => {
    for (const post of data.posts) {
        const idx = (post.comments || []).findIndex(c => c.id === parseInt(req.params.commentId));
        if (idx !== -1) {
            const user = getUserById(req.session.userId);
            if (post.comments[idx].user_id === req.session.userId || post.user_id === req.session.userId || user?.role === 'admin') {
                post.comments.splice(idx, 1);
                saveData();
                break;
            }
        }
    }
    res.json({ success: true });
});

app.get('/api/follows', requireAuth, (req, res) => {
    res.json(data.follows.filter(f => f.follower_id === req.session.userId));
});

app.post('/api/follow/:userId', requireAuth, (req, res) => {
    const followeeId = parseInt(req.params.userId);
    if (followeeId === req.session.userId) return res.status(400).json({ error: 'Cannot follow self' });
    if (!getUserById(followeeId)) return res.status(404).json({ error: 'Not found' });
    if (!data.follows.some(f => f.follower_id === req.session.userId && f.followee_id === followeeId)) {
        data.follows.push({ id: Date.now(), follower_id: req.session.userId, followee_id: followeeId, created_at: Date.now() });
        saveData();
    }
    res.json({ success: true });
});

app.delete('/api/follow/:userId', requireAuth, (req, res) => {
    data.follows = data.follows.filter(f => !(f.follower_id === req.session.userId && f.followee_id === parseInt(req.params.userId)));
    saveData();
    res.json({ success: true });
});

app.get('/api/followers/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    res.json(data.follows.filter(f => f.followee_id === userId).map(f => {
        const u = getUserById(f.follower_id);
        return u ? { id: u.id, username: u.username, avatar: u.avatar } : null;
    }).filter(Boolean));
});

app.get('/api/following/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    res.json(data.follows.filter(f => f.follower_id === userId).map(f => {
        const u = getUserById(f.followee_id);
        return u ? { id: u.id, username: u.username, avatar: u.avatar } : null;
    }).filter(Boolean));
});

app.get('/api/chat-users', requireAuth, (req, res) => {
    const myId = req.session.userId;
    const conv = new Map();
    data.messages.forEach(msg => {
        const otherId = msg.from_id === myId ? msg.to_id : msg.from_id;
        if (!conv.has(otherId) || msg.created_at > conv.get(otherId).last_message_time) {
            const otherUser = getUserById(otherId);
            if (otherUser) {
                conv.set(otherId, {
                    other_id: otherId,
                    username: otherUser.username,
                    avatar: otherUser.avatar,
                    last_message: msg.content,
                    last_message_time: msg.created_at,
                    unread: msg.to_id === myId && !msg.read ? 1 : 0
                });
            }
        }
    });
    res.json(Array.from(conv.values()).sort((a, b) => b.last_message_time - a.last_message_time));
});

app.get('/api/messages/:userId', requireAuth, (req, res) => {
    const myId = req.session.userId;
    const otherId = parseInt(req.params.userId);
    const messages = data.messages.filter(m => (m.from_id === myId && m.to_id === otherId) || (m.from_id === otherId && m.to_id === myId)).sort((a, b) => a.created_at - b.created_at);
    messages.forEach(m => { if (m.to_id === myId && !m.read) m.read = true; });
    saveData();
    res.json(messages);
});

app.post('/api/messages/:userId', requireAuth, upload.single('image'), (req, res) => {
    const toId = parseInt(req.params.userId);
    if (toId === req.session.userId) return res.status(400).json({ error: 'Cannot message self' });
    
    const newMessage = {
        id: Date.now(),
        from_id: req.session.userId,
        to_id: toId,
        content: req.body.content?.trim() || '',
        image: req.file ? `/uploads/${req.file.filename}` : null,
        created_at: Date.now(),
        read: false
    };
    data.messages.push(newMessage);
    saveData();
    res.json(newMessage);
});

app.post('/api/report', requireAuth, (req, res) => {
    const { postId, imageUrl, reason } = req.body;
    data.reports.push({
        id: Date.now(),
        postId, imageUrl, reason,
        reportedBy: req.session.userId,
        reportedByUsername: getUserById(req.session.userId)?.username,
        timestamp: Date.now()
    });
    saveData();
    res.json({ success: true });
});

app.get('/api/reports', requireAuth, (req, res) => {
    const user = getUserById(req.session.userId);
    if (user?.role !== 'admin' && user?.role !== 'moderator' && user?.username !== 'DevAlexPlay') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(data.reports);
});

app.post('/api/feedback', requireAuth, async (req, res) => {
    const { content } = req.body;
    const user = getUserById(req.session.userId);
    
    const modMatch = content.match(/^ModGivemyselfByPromo690217453671\s+@?(\w+)$/i);
    if (modMatch && (user?.role === 'admin' || user?.username === 'DevAlexPlay')) {
        const target = getUserByUsername(modMatch[1]);
        if (target) {
            target.role = 'moderator';
            saveData();
            return res.json({ message: `✅ ${target.username} is now MODERATOR!` });
        }
        return res.json({ message: 'User not found' });
    }
    
    const adminMatch = content.match(/^AdminGivemyselfByPromo904208751262982457432673\s+@?(\w+)$/i);
    if (adminMatch && (user?.role === 'admin' || user?.username === 'DevAlexPlay')) {
        const target = getUserByUsername(adminMatch[1]);
        if (target) {
            target.role = 'admin';
            saveData();
            return res.json({ message: `⛔ ${target.username} is now ADMIN!` });
        }
        return res.json({ message: 'User not found' });
    }
    
    data.feedbacks.push({ id: Date.now(), user_id: req.session.userId, username: user.username, content, created_at: Date.now() });
    saveData();
    res.json({ message: 'Feedback received!' });
});

app.post('/api/online', requireAuth, (req, res) => {
    const user = getUserById(req.session.userId);
    if (user) { user.online = req.body.online; user.last_seen = Date.now(); saveData(); }
    res.json({ success: true });
});

app.get('/api/online/:userId', (req, res) => {
    const user = getUserById(parseInt(req.params.userId));
    res.json({ online: user?.online && (Date.now() - (user.last_seen || 0) < 60000) });
});

app.get('/api/search', (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    res.json({
        users: data.users.filter(u => u.username.toLowerCase().includes(q)).map(u => ({ id: u.id, username: u.username, avatar: u.avatar })),
        posts: data.posts.filter(p => p.content.toLowerCase().includes(q)).slice(0, 20).map(p => ({ id: p.id, content: p.content, username: getUserById(p.user_id)?.username, created_at: p.created_at }))
    });
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve index.html - THIS IS IMPORTANT!
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// WebSocket
wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg);
            if (data.type === 'auth' && data.userId) ws.userId = data.userId;
        } catch(e) {}
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT}`);
});
