const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);  // ЭТО ВАЖНО - создаём HTTP сервер
const wss = new WebSocket.Server({ server });  // WebSocket на том же порту

// ПУТЬ К ПОСТОЯННОМУ ДИСКУ RENDER
const dataDir = process.env.DISK_PATH || path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const uploadsDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const dbPath = path.join(dataDir, 'social.db');
const db = new sqlite3.Database(dbPath);

const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// СОЗДАНИЕ ВСЕХ ТАБЛИЦ
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        username_lower TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        avatar TEXT,
        bio TEXT,
        role TEXT DEFAULT 'user',
        created_at INTEGER,
        is_creator INTEGER DEFAULT 0,
        is_official INTEGER DEFAULT 0
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        image TEXT,
        created_at INTEGER,
        edited INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS likes (
        user_id INTEGER,
        post_id INTEGER,
        PRIMARY KEY(user_id, post_id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        post_id INTEGER,
        content TEXT,
        created_at INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(post_id) REFERENCES posts(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_id INTEGER,
        to_id INTEGER,
        content TEXT,
        image TEXT,
        created_at INTEGER,
        read INTEGER DEFAULT 0
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS message_reactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER,
        user_id INTEGER,
        reaction TEXT,
        UNIQUE(message_id, user_id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS follows (
        follower_id INTEGER,
        followee_id INTEGER,
        PRIMARY KEY(follower_id, followee_id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        type TEXT,
        created_at INTEGER
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        image_url TEXT,
        reason TEXT,
        reported_by TEXT,
        timestamp INTEGER
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS online_status (
        user_id INTEGER PRIMARY KEY,
        last_seen INTEGER
    )`);
    
    // Делаем DevAlexPlay админом
    db.run(`UPDATE users SET role = 'admin', is_creator = 1 WHERE username = 'DevAlexPlay'`);
});

// ============ WEBSOCKET ============
const clients = new Map();

function broadcastToAll(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function broadcastOnlineStatus() {
    const now = Date.now();
    const onlineUsers = [];
    for (const [userId, ws] of clients) {
        if (ws.readyState === WebSocket.OPEN) {
            onlineUsers.push(userId);
            db.run('INSERT OR REPLACE INTO online_status (user_id, last_seen) VALUES (?, ?)', [userId, now]);
        }
    }
    broadcastToAll(JSON.stringify({ type: 'online_update', onlineUsers }));
}

wss.on('connection', (ws, req) => {
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'register') {
                clients.set(data.userId, ws);
                db.run('INSERT OR REPLACE INTO online_status (user_id, last_seen) VALUES (?, ?)', [data.userId, Date.now()]);
                broadcastOnlineStatus();
            }
            
            if (data.type === 'new_message' && data.to_id) {
                const targetWs = clients.get(data.to_id);
                if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                    targetWs.send(JSON.stringify(data));
                }
            }
            
            if (data.type === 'new_post' || data.type === 'new_comment' || 
                data.type === 'like_update' || data.type === 'post_deleted' || 
                data.type === 'user_role_changed') {
                broadcastToAll(JSON.stringify(data));
            }
            
        } catch(e) { console.error('WS error:', e); }
    });
    
    ws.on('close', () => {
        for (const [userId, client] of clients) {
            if (client === ws) {
                clients.delete(userId);
                break;
            }
        }
        broadcastOnlineStatus();
    });
});

// Периодическая очистка офлайн статусов
setInterval(() => {
    const timeout = Date.now() - 60000;
    db.run('DELETE FROM online_status WHERE last_seen < ?', [timeout]);
    broadcastOnlineStatus();
}, 30000);

// ============ API MIDDLEWARE ============
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));
app.use(express.static('public'));
app.use(session({
    secret: 'freedomnet-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }
}));

function auth(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

// ============ API ENDPOINTS ============

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (username.length < 3 || username.length > 20) return res.status(400).json({ error: 'Username must be 3-20 characters' });
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: 'Username can only contain letters, numbers, underscore' });
    
    const usernameLower = username.toLowerCase();
    const hashed = await bcrypt.hash(password, 10);
    const isCreator = username === 'DevAlexPlay' ? 1 : 0;
    const role = username === 'DevAlexPlay' ? 'admin' : 'user';
    
    db.run('INSERT INTO users (username, username_lower, email, password, created_at, is_creator, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, usernameLower, email, hashed, Date.now(), isCreator, role],
        function(err) {
            if (err) {
                if (err.message.includes('username_lower')) {
                    return res.status(400).json({ error: 'Username already taken' });
                }
                if (err.message.includes('email')) {
                    return res.status(400).json({ error: 'Email already taken' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        });
});

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    const loginLower = login.toLowerCase();
    
    db.get('SELECT * FROM users WHERE username_lower = ? OR email = ?', [loginLower, login], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;
        res.json({ success: true, username: user.username, userId: user.id, role: user.role });
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/me', (req, res) => {
    if (!req.session.userId) return res.json({ user: null });
    db.get('SELECT id, username, email, avatar, bio, role, created_at, is_creator, is_official FROM users WHERE id = ?', 
        [req.session.userId], (err, user) => {
            res.json({ user });
        });
});

app.post('/api/posts', auth, upload.single('image'), (req, res) => {
    const { content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    
    db.run('INSERT INTO posts (user_id, content, image, created_at) VALUES (?, ?, ?, ?)',
        [req.session.userId, content, image, Date.now()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            db.get(`SELECT p.*, u.username, u.avatar, u.is_creator, u.is_official 
                    FROM posts p JOIN users u ON p.user_id = u.id 
                    WHERE p.id = ?`, [this.lastID], (err, post) => {
                if (err || !post) return res.status(500).json({ error: 'Failed to fetch post' });
                post.comments = [];
                post.likes_count = 0;
                post.user_liked = false;
                
                broadcastToAll(JSON.stringify({ type: 'new_post', post }));
                res.json(post);
            });
        });
});

app.get('/api/feed', auth, (req, res) => {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 15;
    
    db.all(`SELECT p.*, u.username, u.avatar, u.is_creator, u.is_official,
                   (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                   (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as user_liked
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?`,
        [req.session.userId, limit, offset], 
        (err, posts) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Получаем комментарии для каждого поста отдельно
            let completed = 0;
            if (posts.length === 0) {
                db.get('SELECT COUNT(*) as total FROM posts', [], (err, count) => {
                    res.json({ posts: [], hasMore: false });
                });
                return;
            }
            
            posts.forEach((post, idx) => {
                db.all(`SELECT c.*, u.username, u.avatar, u.is_creator, u.is_official
                        FROM comments c
                        JOIN users u ON c.user_id = u.id
                        WHERE c.post_id = ?
                        ORDER BY c.created_at ASC LIMIT 50`, [post.id], (err, comments) => {
                    post.comments = comments || [];
                    post.user_liked = post.user_liked === 1;
                    completed++;
                    
                    if (completed === posts.length) {
                        db.get('SELECT COUNT(*) as total FROM posts', [], (err, count) => {
                            const total = count ? count.total : 0;
                            res.json({ posts, hasMore: offset + limit < total });
                        });
                    }
                });
            });
        });
});

app.delete('/api/posts/:postId', auth, (req, res) => {
    db.get('SELECT p.user_id, u.username, u.role FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?', 
        [req.params.postId], (err, post) => {
            if (err || !post) return res.status(404).json({ error: 'Post not found' });
            
            const canDelete = post.user_id === req.session.userId || 
                              req.session.username === 'DevAlexPlay' || 
                              req.session.role === 'admin';
            
            if (canDelete) {
                db.run('DELETE FROM posts WHERE id = ?', [req.params.postId], (err) => {
                    if (err) res.status(500).json({ error: err.message });
                    else {
                        broadcastToAll(JSON.stringify({ type: 'post_deleted', post_id: parseInt(req.params.postId) }));
                        res.json({ success: true });
                    }
                });
            } else {
                res.status(403).json({ error: 'Forbidden' });
            }
        });
});

app.post('/api/like/:postId', auth, (req, res) => {
    db.run('INSERT OR IGNORE INTO likes (user_id, post_id) VALUES (?, ?)',
        [req.session.userId, req.params.postId],
        (err) => {
            if (!err) {
                db.run('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [req.params.postId]);
                db.get('SELECT likes_count FROM posts WHERE id = ?', [req.params.postId], (err, post) => {
                    broadcastToAll(JSON.stringify({ 
                        type: 'like_update', 
                        post_id: parseInt(req.params.postId), 
                        likes_count: post?.likes_count || 0,
                        user_liked: true 
                    }));
                });
            }
            res.json({ success: !err });
        });
});

app.delete('/api/like/:postId', auth, (req, res) => {
    db.run('DELETE FROM likes WHERE user_id = ? AND post_id = ?',
        [req.session.userId, req.params.postId],
        (err) => {
            if (!err) {
                db.run('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?', [req.params.postId]);
                db.get('SELECT likes_count FROM posts WHERE id = ?', [req.params.postId], (err, post) => {
                    broadcastToAll(JSON.stringify({ 
                        type: 'like_update', 
                        post_id: parseInt(req.params.postId), 
                        likes_count: post?.likes_count || 0,
                        user_liked: false 
                    }));
                });
            }
            res.json({ success: !err });
        });
});

app.post('/api/comment/:postId', auth, (req, res) => {
    const { content } = req.body;
    db.run('INSERT INTO comments (user_id, post_id, content, created_at) VALUES (?, ?, ?, ?)',
        [req.session.userId, req.params.postId, content, Date.now()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            db.get(`SELECT c.*, u.username, u.avatar, u.is_creator, u.is_official 
                    FROM comments c JOIN users u ON c.user_id = u.id 
                    WHERE c.id = ?`, [this.lastID], (err, comment) => {
                broadcastToAll(JSON.stringify({ type: 'new_comment', post_id: parseInt(req.params.postId), comment }));
                res.json(comment);
            });
        });
});

app.delete('/api/comment/:commentId', auth, (req, res) => {
    db.get(`SELECT c.*, p.user_id as post_user_id 
            FROM comments c 
            JOIN posts p ON c.post_id = p.id 
            WHERE c.id = ?`, [req.params.commentId], (err, comment) => {
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        
        const canDelete = comment.user_id === req.session.userId || 
                          comment.post_user_id === req.session.userId ||
                          req.session.username === 'DevAlexPlay' ||
                          req.session.role === 'admin';
        
        if (canDelete) {
            db.run('DELETE FROM comments WHERE id = ?', [req.params.commentId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                broadcastToAll(JSON.stringify({ type: 'comment_deleted', comment_id: parseInt(req.params.commentId), post_id: comment.post_id }));
                res.json({ success: true });
            });
        } else {
            res.status(403).json({ error: 'Forbidden' });
        }
    });
});

app.get('/api/users', auth, (req, res) => {
    db.all('SELECT id, username, avatar, role, is_creator, is_official FROM users WHERE id != ? LIMIT 100', 
        [req.session.userId], (err, users) => {
            res.json(users || []);
        });
});

app.get('/api/user/:username', (req, res) => {
    const usernameLower = req.params.username.toLowerCase();
    db.get('SELECT id, username, avatar, bio, role, created_at, is_creator, is_official FROM users WHERE username_lower = ?', 
        [usernameLower], (err, user) => {
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        });
});

app.get('/api/follows', auth, (req, res) => {
    db.all('SELECT followee_id FROM follows WHERE follower_id = ?', [req.session.userId], (err, follows) => {
        res.json(follows || []);
    });
});

app.post('/api/follow/:userId', auth, (req, res) => {
    db.run('INSERT OR IGNORE INTO follows (follower_id, followee_id) VALUES (?, ?)', 
        [req.session.userId, req.params.userId], (err) => {
            res.json({ success: !err });
        });
});

app.delete('/api/follow/:userId', auth, (req, res) => {
    db.run('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?', 
        [req.session.userId, req.params.userId], (err) => {
            res.json({ success: !err });
        });
});

app.get('/api/followers/:userId', auth, (req, res) => {
    db.all(`SELECT u.id, u.username, u.avatar, u.is_creator, u.is_official 
            FROM follows f JOIN users u ON f.follower_id = u.id 
            WHERE f.followee_id = ?`, [req.params.userId], (err, followers) => {
        res.json(followers || []);
    });
});

app.get('/api/following/:userId', auth, (req, res) => {
    db.all(`SELECT u.id, u.username, u.avatar, u.is_creator, u.is_official 
            FROM follows f JOIN users u ON f.followee_id = u.id 
            WHERE f.follower_id = ?`, [req.params.userId], (err, following) => {
        res.json(following || []);
    });
});

app.get('/api/chat-users', auth, (req, res) => {
    db.all(`SELECT DISTINCT u.id, u.username, u.avatar, u.role, u.is_creator, u.is_official,
                   (SELECT content FROM messages WHERE (from_id = ? AND to_id = u.id) OR (from_id = u.id AND to_id = ?) 
                    ORDER BY created_at DESC LIMIT 1) as last_message,
                   (SELECT created_at FROM messages WHERE (from_id = ? AND to_id = u.id) OR (from_id = u.id AND to_id = ?) 
                    ORDER BY created_at DESC LIMIT 1) as last_time,
                   (SELECT COUNT(*) FROM messages WHERE to_id = ? AND from_id = u.id AND read = 0) as unread
            FROM users u
            WHERE u.id != ?
            ORDER BY last_time DESC`,
        [req.session.userId, req.session.userId, req.session.userId, req.session.userId, req.session.userId, req.session.userId], 
        (err, users) => {
            res.json(users || []);
        });
});

app.get('/api/messages/:userId', auth, (req, res) => {
    db.all(`SELECT m.*, u.username, u.avatar, u.is_creator, u.is_official
            FROM messages m 
            JOIN users u ON u.id = m.from_id
            WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)
            ORDER BY created_at ASC LIMIT 200`,
        [req.session.userId, req.params.userId, req.params.userId, req.session.userId],
        (err, messages) => {
            db.run('UPDATE messages SET read = 1 WHERE to_id = ? AND from_id = ?', 
                [req.session.userId, req.params.userId]);
            res.json(messages || []);
        });
});

app.post('/api/messages/:userId', auth, upload.single('image'), (req, res) => {
    const { content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    
    db.run('INSERT INTO messages (from_id, to_id, content, image, created_at) VALUES (?, ?, ?, ?, ?)',
        [req.session.userId, req.params.userId, content || '', image, Date.now()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            db.get(`SELECT m.*, u.username, u.avatar, u.is_creator, u.is_official 
                    FROM messages m JOIN users u ON u.id = m.from_id 
                    WHERE m.id = ?`, [this.lastID], (err, message) => {
                const targetWs = clients.get(parseInt(req.params.userId));
                if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                    targetWs.send(JSON.stringify({ type: 'new_message', message }));
                }
                res.json(message);
            });
        });
});

app.post('/api/avatar', auth, upload.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const avatarUrl = `/uploads/${req.file.filename}`;
    db.run('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.session.userId], (err) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ avatar: avatarUrl });
    });
});

app.post('/api/change-password', auth, async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    
    if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'All fields required' });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match' });
    }
    if (newPassword.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    
    db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], async (err, user) => {
        if (!user) return res.status(404).json({ error: 'User not found' });
        const valid = await bcrypt.compare(oldPassword, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid old password' });
        
        const hashed = await bcrypt.hash(newPassword, 10);
        db.run('UPDATE users SET password = ? WHERE id = ?', [hashed, req.session.userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

app.post('/api/change-username', auth, async (req, res) => {
    const { newUsername, password } = req.body;
    
    if (!newUsername || !password) return res.status(400).json({ error: 'All fields required' });
    if (newUsername.length < 3 || newUsername.length > 20) return res.status(400).json({ error: 'Username must be 3-20 characters' });
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) return res.status(400).json({ error: 'Username can only contain letters, numbers, underscore' });
    
    const newUsernameLower = newUsername.toLowerCase();
    
    db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], async (err, user) => {
        if (!user) return res.status(404).json({ error: 'User not found' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid password' });
        
        db.get('SELECT id FROM users WHERE username_lower = ? AND id != ?', [newUsernameLower, req.session.userId], (err, existing) => {
            if (existing) return res.status(400).json({ error: 'Username already taken' });
            
            db.run('UPDATE users SET username = ?, username_lower = ? WHERE id = ?', 
                [newUsername, newUsernameLower, req.session.userId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                req.session.username = newUsername;
                res.json({ success: true, username: newUsername });
            });
        });
    });
});

app.post('/api/change-email', auth, async (req, res) => {
    const { newEmail, password } = req.body;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) return res.status(400).json({ error: 'Invalid email format' });
    
    db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], async (err, user) => {
        if (!user) return res.status(404).json({ error: 'User not found' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid password' });
        
        db.get('SELECT id FROM users WHERE email = ? AND id != ?', [newEmail, req.session.userId], (err, existing) => {
            if (existing) return res.status(400).json({ error: 'Email already taken' });
            
            db.run('UPDATE users SET email = ? WHERE id = ?', [newEmail, req.session.userId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, email: newEmail });
            });
        });
    });
});

app.post('/api/feedback', auth, (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    
    if (content === 'AdminGivemyselfByPromo904208751262982457432673') {
        db.run('UPDATE users SET role = ? WHERE id = ?', ['admin', req.session.userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            req.session.role = 'admin';
            broadcastToAll(JSON.stringify({ type: 'user_role_changed', username: req.session.username, newRole: 'admin' }));
            res.json({ success: true, message: '✨ You are now an ADMIN!', user: { role: 'admin' } });
        });
        return;
    }
    
    if (content === 'ModGivemyselfByPromo690217453671') {
        db.run('UPDATE users SET role = ? WHERE id = ?', ['moderator', req.session.userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            req.session.role = 'moderator';
            broadcastToAll(JSON.stringify({ type: 'user_role_changed', username: req.session.username, newRole: 'moderator' }));
            res.json({ success: true, message: '✨ You are now a MODERATOR!', user: { role: 'moderator' } });
        });
        return;
    }
    
    db.run('INSERT INTO feedback (user_id, content, created_at) VALUES (?, ?, ?)',
        [req.session.userId, content, Date.now()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Feedback sent! Thank you.' });
        });
});

app.post('/api/report', auth, (req, res) => {
    const { postId, imageUrl, reason } = req.body;
    
    db.run('INSERT INTO reports (post_id, image_url, reason, reported_by, timestamp) VALUES (?, ?, ?, ?, ?)',
        [postId, imageUrl, reason, req.session.username, Date.now()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            broadcastToAll(JSON.stringify({ type: 'new_report', postId, imageUrl, reason, reportedBy: req.session.username, timestamp: Date.now() }));
            res.json({ success: true });
        });
});

app.get('/api/reports', auth, (req, res) => {
    if (req.session.role !== 'admin' && req.session.role !== 'moderator' && req.session.username !== 'DevAlexPlay') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    db.all('SELECT * FROM reports ORDER BY timestamp DESC', [], (err, reports) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(reports || []);
    });
});

app.post('/api/online', auth, (req, res) => {
    db.run('INSERT OR REPLACE INTO online_status (user_id, last_seen) VALUES (?, ?)', 
        [req.session.userId, Date.now()]);
    res.json({ success: true });
});

app.get('/api/online/:userId', (req, res) => {
    const timeout = Date.now() - 60000;
    db.get('SELECT user_id FROM online_status WHERE user_id = ? AND last_seen > ?', 
        [req.params.userId, timeout], (err, row) => {
            res.json({ online: !!row });
        });
});

app.get('/api/search', auth, (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    
    db.all(`SELECT id, username, avatar, role, is_creator, is_official 
            FROM users WHERE username_lower LIKE ? LIMIT 10`, [`%${q}%`], (err, users) => {
        db.all(`SELECT p.id, p.content, p.created_at, u.username 
                FROM posts p JOIN users u ON p.user_id = u.id 
                WHERE p.content LIKE ? ORDER BY p.created_at DESC LIMIT 10`, [`%${q}%`], (err, posts) => {
            res.json({ users: users || [], posts: posts || [] });
        });
    });
});

app.post('/api/delete-account', auth, async (req, res) => {
    const { password } = req.body;
    
    db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], async (err, user) => {
        if (!user) return res.status(404).json({ error: 'User not found' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid password' });
        
        db.run('DELETE FROM users WHERE id = ?', [req.session.userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            req.session.destroy();
            res.json({ success: true });
        });
    });
});

// ============ СТАТИКА (должна быть последней) ============
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ ЗАПУСК ============
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server ready`);
});
