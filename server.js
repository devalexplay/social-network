// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const db = new sqlite3.Database('./freedomnet.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        avatar TEXT,
        bio TEXT,
        role TEXT DEFAULT 'user',
        is_official INTEGER DEFAULT 0,
        is_creator INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        user_id INTEGER,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(post_id) REFERENCES posts(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        user_id INTEGER,
        UNIQUE(post_id, user_id),
        FOREIGN KEY(post_id) REFERENCES posts(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id INTEGER,
        followee_id INTEGER,
        UNIQUE(follower_id, followee_id),
        FOREIGN KEY(follower_id) REFERENCES users(id),
        FOREIGN KEY(followee_id) REFERENCES users(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_id INTEGER,
        to_id INTEGER,
        content TEXT,
        image TEXT,
        read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(from_id) REFERENCES users(id),
        FOREIGN KEY(to_id) REFERENCES users(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS message_reactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER,
        user_id INTEGER,
        reaction TEXT,
        UNIQUE(message_id, user_id),
        FOREIGN KEY(message_id) REFERENCES messages(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        image_url TEXT,
        reason TEXT,
        reported_by TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS user_online (
        user_id INTEGER PRIMARY KEY,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_online INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
    
    db.run(`INSERT OR IGNORE INTO users (username, email, password, role, is_creator) 
            VALUES ('DevAlexPlay', 'admin@freedomnet.com', ?, 'admin', 1)`, [bcrypt.hashSync('admin123', 10)]);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'freedomnet-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.random().toString(36).substr(2, 8) + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

function isAuthenticated(req, res, next) {
    if (req.session.userId) return next();
    res.status(401).json({ error: 'Unauthorized' });
}

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const hash = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash], function(err) {
        if (err) return res.status(400).json({ error: 'Username or email taken' });
        res.json({ success: true });
    });
});

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [login, login], (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        req.session.userId = user.id;
        res.json({ success: true });
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/me', isAuthenticated, (req, res) => {
    db.get('SELECT id, username, email, avatar, bio, role, is_official, is_creator, created_at FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ user });
    });
});

app.post('/api/avatar', isAuthenticated, upload.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const avatarUrl = `/uploads/${req.file.filename}`;
    db.run('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.session.userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ avatar: avatarUrl });
    });
});

app.get('/api/feed', isAuthenticated, (req, res) => {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 15;
    
    db.all(`SELECT p.*, u.username, u.avatar, u.role, u.is_official, u.is_creator,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
            (SELECT EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?)) as user_liked
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?`, [req.session.userId, limit, offset], (err, posts) => {
        if (err) return res.status(500).json({ error: err.message });
        
        let completed = 0;
        if (posts.length === 0) return res.json({ posts: [], hasMore: false });
        
        posts.forEach((post, idx) => {
            db.all('SELECT c.*, u.username, u.avatar, u.role, u.is_official, u.is_creator FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC', [post.id], (err, comments) => {
                post.comments = comments || [];
                completed++;
                if (completed === posts.length) {
                    const hasMore = posts.length === limit;
                    res.json({ posts, hasMore });
                }
            });
        });
    });
});

app.post('/api/posts', isAuthenticated, upload.single('image'), (req, res) => {
    const { content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    if (!content && !image) return res.status(400).json({ error: 'Content or image required' });
    
    db.run('INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)', [req.session.userId, content || '', image], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

app.delete('/api/posts/:id', isAuthenticated, (req, res) => {
    const postId = req.params.id;
    db.get('SELECT user_id FROM posts WHERE id = ?', [postId], (err, post) => {
        if (err || !post) return res.status(404).json({ error: 'Post not found' });
        db.get('SELECT role FROM users WHERE id = ?', [req.session.userId], (err, user) => {
            if (post.user_id !== req.session.userId && user?.role !== 'admin') {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            db.run('DELETE FROM posts WHERE id = ?', [postId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                db.run('DELETE FROM comments WHERE post_id = ?', [postId]);
                db.run('DELETE FROM likes WHERE post_id = ?', [postId]);
                res.json({ success: true });
            });
        });
    });
});

app.post('/api/comment/:postId', isAuthenticated, (req, res) => {
    const { content } = req.body;
    const postId = req.params.postId;
    if (!content) return res.status(400).json({ error: 'Content required' });
    
    db.run('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)', [postId, req.session.userId, content], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

app.delete('/api/comment/:id', isAuthenticated, (req, res) => {
    const commentId = req.params.id;
    db.get('SELECT c.*, p.user_id as post_owner FROM comments c JOIN posts p ON c.post_id = p.id WHERE c.id = ?', [commentId], (err, comment) => {
        if (err || !comment) return res.status(404).json({ error: 'Comment not found' });
        db.get('SELECT role FROM users WHERE id = ?', [req.session.userId], (err, user) => {
            if (comment.user_id !== req.session.userId && comment.post_owner !== req.session.userId && user?.role !== 'admin') {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            db.run('DELETE FROM comments WHERE id = ?', [commentId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            });
        });
    });
});

app.post('/api/like/:postId', isAuthenticated, (req, res) => {
    const postId = req.params.postId;
    db.run('INSERT OR IGNORE INTO likes (post_id, user_id) VALUES (?, ?)', [postId, req.session.userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/api/like/:postId', isAuthenticated, (req, res) => {
    const postId = req.params.postId;
    db.run('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [postId, req.session.userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post('/api/follow/:userId', isAuthenticated, (req, res) => {
    const followeeId = req.params.userId;
    if (parseInt(followeeId) === req.session.userId) return res.status(400).json({ error: 'Cannot follow yourself' });
    db.run('INSERT OR IGNORE INTO follows (follower_id, followee_id) VALUES (?, ?)', [req.session.userId, followeeId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/api/follow/:userId', isAuthenticated, (req, res) => {
    const followeeId = req.params.userId;
    db.run('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?', [req.session.userId, followeeId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/follows', isAuthenticated, (req, res) => {
    db.all('SELECT followee_id FROM follows WHERE follower_id = ?', [req.session.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/followers/:userId', isAuthenticated, (req, res) => {
    db.all('SELECT u.id, u.username, u.avatar FROM follows f JOIN users u ON f.follower_id = u.id WHERE f.followee_id = ?', [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/following/:userId', isAuthenticated, (req, res) => {
    db.all('SELECT u.id, u.username, u.avatar FROM follows f JOIN users u ON f.followee_id = u.id WHERE f.follower_id = ?', [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/users', isAuthenticated, (req, res) => {
    db.all('SELECT id, username, avatar, role, is_official, is_creator FROM users', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/user/:username', isAuthenticated, (req, res) => {
    db.get('SELECT id, username, email, avatar, bio, role, is_official, is_creator, created_at FROM users WHERE username = ?', [req.params.username], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    });
});

app.get('/api/messages/:userId', isAuthenticated, (req, res) => {
    const otherId = req.params.userId;
    db.all(`SELECT * FROM messages 
            WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)
            ORDER BY created_at ASC`, 
            [req.session.userId, otherId, otherId, req.session.userId], (err, messages) => {
        if (err) return res.status(500).json({ error: err.message });
        db.run('UPDATE messages SET read = 1 WHERE from_id = ? AND to_id = ?', [otherId, req.session.userId]);
        res.json(messages);
    });
});

app.post('/api/messages/:userId', isAuthenticated, upload.single('image'), (req, res) => {
    const toId = req.params.userId;
    const { content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    if (!content && !image) return res.status(400).json({ error: 'Content or image required' });
    
    db.run('INSERT INTO messages (from_id, to_id, content, image) VALUES (?, ?, ?, ?)', 
        [req.session.userId, toId, content || '', image], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, from_id: req.session.userId, to_id: toId, content, image, created_at: new Date().toISOString() });
    });
});

app.get('/api/chat-users', isAuthenticated, (req, res) => {
    db.all(`SELECT DISTINCT 
            CASE WHEN m.from_id = ? THEN m.to_id ELSE m.from_id END as other_id,
            u.username, u.avatar, u.role, u.is_official, u.is_creator,
            (SELECT content FROM messages WHERE (from_id = ? AND to_id = other_id) OR (from_id = other_id AND to_id = ?) ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT created_at FROM messages WHERE (from_id = ? AND to_id = other_id) OR (from_id = other_id AND to_id = ?) ORDER BY created_at DESC LIMIT 1) as last_time,
            (SELECT COUNT(*) FROM messages WHERE from_id = other_id AND to_id = ? AND read = 0) as unread
            FROM messages m
            JOIN users u ON u.id = (CASE WHEN m.from_id = ? THEN m.to_id ELSE m.from_id END)
            WHERE m.from_id = ? OR m.to_id = ?
            GROUP BY other_id
            ORDER BY last_time DESC`, 
            [req.session.userId, req.session.userId, req.session.userId, req.session.userId, req.session.userId, req.session.userId, req.session.userId, req.session.userId, req.session.userId], 
            (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

app.post('/api/message-reaction/:messageId', isAuthenticated, (req, res) => {
    const { reaction } = req.body;
    const messageId = req.params.messageId;
    db.run('INSERT OR REPLACE INTO message_reactions (message_id, user_id, reaction) VALUES (?, ?, ?)', 
        [messageId, req.session.userId, reaction], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/message-reactions/:messageId', isAuthenticated, (req, res) => {
    const messageId = req.params.messageId;
    db.all('SELECT user_id, reaction FROM message_reactions WHERE message_id = ?', [messageId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/change-password', isAuthenticated, (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) return res.status(400).json({ error: 'New passwords do not match' });
    if (newPassword.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
    
    db.get('SELECT password FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (err || !user) return res.status(500).json({ error: 'User not found' });
        if (!bcrypt.compareSync(oldPassword, user.password)) return res.status(401).json({ error: 'Old password is incorrect' });
        const hash = bcrypt.hashSync(newPassword, 10);
        db.run('UPDATE users SET password = ? WHERE id = ?', [hash, req.session.userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

app.post('/api/change-username', isAuthenticated, (req, res) => {
    const { newUsername, password } = req.body;
    if (!newUsername.match(/^[a-zA-Z0-9_]{3,20}$/)) return res.status(400).json({ error: 'Username must be 3-20 characters (letters, numbers, underscore)' });
    
    db.get('SELECT password FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (err || !user) return res.status(500).json({ error: 'User not found' });
        if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Password is incorrect' });
        
        db.run('UPDATE users SET username = ? WHERE id = ?', [newUsername, req.session.userId], (err) => {
            if (err) return res.status(400).json({ error: 'Username already taken' });
            res.json({ success: true, username: newUsername });
        });
    });
});

app.post('/api/change-email', isAuthenticated, (req, res) => {
    const { newEmail, password } = req.body;
    const allowedDomains = ['gmail.com', 'mail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
    const domain = newEmail.split('@')[1];
    if (!allowedDomains.includes(domain)) return res.status(400).json({ error: 'Email must be from: gmail.com, mail.com, hotmail.com, outlook.com, yahoo.com' });
    
    db.get('SELECT password FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (err || !user) return res.status(500).json({ error: 'User not found' });
        if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Password is incorrect' });
        
        db.run('UPDATE users SET email = ? WHERE id = ?', [newEmail, req.session.userId], (err) => {
            if (err) return res.status(400).json({ error: 'Email already taken' });
            res.json({ success: true, email: newEmail });
        });
    });
});

app.post('/api/delete-account', isAuthenticated, (req, res) => {
    const { password } = req.body;
    db.get('SELECT password FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (err || !user) return res.status(500).json({ error: 'User not found' });
        if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Password is incorrect' });
        
        db.run('DELETE FROM users WHERE id = ?', [req.session.userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            req.session.destroy();
            res.json({ success: true });
        });
    });
});

app.post('/api/feedback', isAuthenticated, (req, res) => {
    const { content } = req.body;
    if (content.startsWith('/')) {
        const parts = content.slice(1).split(' ');
        const command = parts[0].toLowerCase();
        const target = parts[1];
        
        if (command === 'role' && target) {
            db.get('SELECT role FROM users WHERE id = ?', [req.session.userId], (err, user) => {
                if (user?.role === 'admin') {
                    const newRole = parts[2] || 'user';
                    if (!['user', 'moderator', 'admin'].includes(newRole)) return res.json({ message: 'Invalid role' });
                    db.run('UPDATE users SET role = ? WHERE username = ?', [newRole, target], (err) => {
                        if (err) return res.json({ message: 'User not found' });
                        broadcastWebSocket({ type: 'user_role_changed', username: target, newRole });
                        res.json({ message: `Role updated for ${target} to ${newRole}` });
                    });
                } else res.json({ message: 'Admin only' });
            });
            return;
        }
        
        if (command === 'ban' && target) {
            db.get('SELECT role FROM users WHERE id = ?', [req.session.userId], (err, user) => {
                if (user?.role === 'admin') {
                    db.run('DELETE FROM users WHERE username = ?', [target], (err) => {
                        if (err) return res.json({ message: 'User not found' });
                        res.json({ message: `${target} has been banned` });
                    });
                } else res.json({ message: 'Admin only' });
            });
            return;
        }
    }
    
    db.run('INSERT INTO feedback (user_id, content) VALUES (?, ?)', [req.session.userId, content], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Feedback sent successfully' });
    });
});

app.post('/api/report', isAuthenticated, (req, res) => {
    const { postId, imageUrl, reason } = req.body;
    db.run('INSERT INTO reports (post_id, image_url, reason, reported_by) VALUES (?, ?, ?, ?)', 
        [postId, imageUrl, reason, req.session.userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        broadcastWebSocket({ type: 'new_report', reportedBy: req.session.userId, reason });
        res.json({ success: true });
    });
});

app.get('/api/reports', isAuthenticated, (req, res) => {
    db.get('SELECT role FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (user?.role !== 'admin' && user?.role !== 'moderator') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        db.all('SELECT * FROM reports ORDER BY timestamp DESC', (err, reports) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(reports);
        });
    });
});

app.get('/api/search', isAuthenticated, (req, res) => {
    const query = `%${req.query.q}%`;
    db.all('SELECT id, username, avatar, role, is_official, is_creator FROM users WHERE username LIKE ? LIMIT 20', [query], (err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all('SELECT p.id, p.content, p.created_at, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.content LIKE ? ORDER BY p.created_at DESC LIMIT 20', [query], (err, posts) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ users, posts });
        });
    });
});

app.post('/api/online', isAuthenticated, (req, res) => {
    const { online } = req.body;
    db.run('INSERT OR REPLACE INTO user_online (user_id, last_seen, is_online) VALUES (?, CURRENT_TIMESTAMP, ?)', 
        [req.session.userId, online ? 1 : 0], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/online/:userId', (req, res) => {
    db.get('SELECT is_online FROM user_online WHERE user_id = ? AND julianday(CURRENT_TIMESTAMP) - julianday(last_seen) < 0.0007', 
        [req.params.userId], (err, row) => {
        res.json({ online: row ? row.is_online === 1 : false });
    });
});

const clients = new Map();

wss.on('connection', (ws, req) => {
    const cookies = req.headers.cookie;
    let userId = null;
    if (cookies) {
        const match = cookies.match(/connect\.sid=s%3A([^\.]+)/);
        if (match) {
            const sessionId = match[1];
            // In production, you'd need to properly parse the session
        }
    }
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'auth' && data.userId) {
                userId = data.userId;
                clients.set(userId, ws);
            } else if (userId) {
                broadcastToUser(data.to_id, data);
            }
        } catch(e) {}
    });
    
    ws.on('close', () => {
        if (userId) clients.delete(userId);
    });
});

function broadcastWebSocket(data) {
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function broadcastToUser(userId, data) {
    const client = clients.get(parseInt(userId));
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`FreedomNet server running on http://localhost:${PORT}`);
});
