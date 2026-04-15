const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const db = new sqlite3.Database('social.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        avatar TEXT,
        bio TEXT,
        created_at INTEGER
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        image TEXT,
        created_at INTEGER,
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
        created_at INTEGER,
        read INTEGER DEFAULT 0
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS follows (
        follower_id INTEGER,
        followee_id INTEGER,
        PRIMARY KEY(follower_id, followee_id)
    )`);
});

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(session({
    secret: 'freedomnet-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

function auth(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (username.length < 3 || username.length > 20) return res.status(400).json({ error: 'Username must be 3-20 characters' });
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: 'Username can only contain letters, numbers, underscore' });
    
    const hashed = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, ?)',
        [username, email, hashed, Date.now()],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Username or email already taken' });
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        });
});

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [login, login], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        req.session.userId = user.id;
        req.session.username = user.username;
        res.json({ success: true, username: user.username, userId: user.id });
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/me', (req, res) => {
    if (!req.session.userId) return res.json({ user: null });
    db.get('SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ?', [req.session.userId], (err, user) => {
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
            res.json({ id: this.lastID, image });
        });
});

app.get('/api/feed', auth, (req, res) => {
    const query = `
        SELECT p.*, u.username, u.avatar,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as user_liked,
               (SELECT json_group_array(json_object('id', c.id, 'content', c.content, 'username', u2.username, 'avatar', u2.avatar, 'created_at', c.created_at))
                FROM comments c JOIN users u2 ON c.user_id = u2.id WHERE c.post_id = p.id ORDER BY c.created_at DESC LIMIT 5) as comments
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 100
    `;
    db.all(query, [req.session.userId], (err, posts) => {
        if (err) return res.status(500).json({ error: err.message });
        const parsedPosts = posts.map(p => ({
            ...p,
            user_liked: p.user_liked === 1,
            comments: p.comments ? JSON.parse(p.comments) : []
        }));
        res.json(parsedPosts);
    });
});

app.post('/api/like/:postId', auth, (req, res) => {
    db.run('INSERT OR IGNORE INTO likes (user_id, post_id) VALUES (?, ?)',
        [req.session.userId, req.params.postId],
        (err) => {
            if (!err) db.run('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [req.params.postId]);
            res.json({ success: !err });
        });
});

app.delete('/api/like/:postId', auth, (req, res) => {
    db.run('DELETE FROM likes WHERE user_id = ? AND post_id = ?',
        [req.session.userId, req.params.postId],
        (err) => {
            if (!err) db.run('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?', [req.params.postId]);
            res.json({ success: !err });
        });
});

app.post('/api/comment/:postId', auth, (req, res) => {
    const { content } = req.body;
    db.run('INSERT INTO comments (user_id, post_id, content, created_at) VALUES (?, ?, ?, ?)',
        [req.session.userId, req.params.postId, content, Date.now()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            db.get('SELECT c.*, u.username, u.avatar FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?',
                [this.lastID], (err, comment) => {
                    res.json(comment);
                });
        });
});

app.get('/api/users', auth, (req, res) => {
    db.all('SELECT id, username, avatar FROM users WHERE id != ? LIMIT 100', [req.session.userId], (err, users) => {
        res.json(users || []);
    });
});

app.get('/api/conversations', auth, (req, res) => {
    const query = `
        SELECT DISTINCT 
            CASE WHEN m.from_id = ? THEN m.to_id ELSE m.from_id END as other_id,
            u.username, u.avatar,
            (SELECT content FROM messages WHERE (from_id = ? AND to_id = other_id) OR (from_id = other_id AND to_id = ?) 
             ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT created_at FROM messages WHERE (from_id = ? AND to_id = other_id) OR (from_id = other_id AND to_id = ?) 
             ORDER BY created_at DESC LIMIT 1) as last_time,
            (SELECT COUNT(*) FROM messages WHERE to_id = ? AND from_id = other_id AND read = 0) as unread
        FROM messages m
        JOIN users u ON u.id = CASE WHEN m.from_id = ? THEN m.to_id ELSE m.from_id END
        WHERE m.from_id = ? OR m.to_id = ?
        GROUP BY other_id
        ORDER BY last_time DESC
    `;
    db.all(query, [req.session.userId, req.session.userId, req.session.userId, req.session.userId, req.session.userId, req.session.userId, req.session.userId, req.session.userId, req.session.userId], 
        (err, convs) => {
            res.json(convs || []);
        });
});

app.get('/api/messages/:userId', auth, (req, res) => {
    db.all(`SELECT m.*, u.username 
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

app.post('/api/messages/:userId', auth, (req, res) => {
    const { content } = req.body;
    db.run('INSERT INTO messages (from_id, to_id, content, created_at) VALUES (?, ?, ?, ?)',
        [req.session.userId, req.params.userId, content, Date.now()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.delete('/api/posts/:postId', auth, (req, res) => {
    db.run('DELETE FROM posts WHERE id = ? AND user_id = ?', [req.params.postId, req.session.userId], (err) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true });
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

app.get('/api/user/:username', (req, res) => {
    db.get('SELECT id, username, avatar, bio, created_at FROM users WHERE username = ?', [req.params.username], (err, user) => {
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
    db.run('INSERT OR IGNORE INTO follows (follower_id, followee_id) VALUES (?, ?)', [req.session.userId, req.params.userId], (err) => {
        res.json({ success: !err });
    });
});

app.delete('/api/follow/:userId', auth, (req, res) => {
    db.run('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?', [req.session.userId, req.params.userId], (err) => {
        res.json({ success: !err });
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
