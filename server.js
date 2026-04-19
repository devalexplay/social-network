const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const db = new sqlite3.Database('./freedomnet.db');

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        avatar TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        user_id INTEGER,
        UNIQUE(post_id, user_id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        user_id INTEGER,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id INTEGER,
        followee_id INTEGER,
        UNIQUE(follower_id, followee_id)
    )`);
    
    // Create uploads folder
    if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
});

app.use(express.json());
app.use(session({ secret: 'key', resave: false, saveUninitialized: false }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const upload = multer({ dest: 'uploads/' });

// Auth routes
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash], (err) => {
        if (err) return res.status(400).json({ error: 'Username or email taken' });
        res.json({ success: true });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
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

app.get('/api/me', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    db.get('SELECT id, username, avatar, role FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        res.json({ user });
    });
});

// Posts
app.get('/api/posts', (req, res) => {
    if (!req.session.userId) return res.json({ posts: [] });
    db.all(`SELECT p.*, u.username, u.avatar,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
            (SELECT EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?)) as user_liked
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC`, [req.session.userId], (err, posts) => {
        if (err) return res.json({ posts: [] });
        let completed = 0;
        posts.forEach((post, i) => {
            db.all('SELECT c.*, u.username, u.avatar FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at', [post.id], (err, comments) => {
                post.comments = comments || [];
                completed++;
                if (completed === posts.length) res.json({ posts });
            });
        });
        if (posts.length === 0) res.json({ posts: [] });
    });
});

app.post('/api/posts', upload.single('image'), (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    const { content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    db.run('INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)', [req.session.userId, content, image], (err) => {
        res.json({ success: true });
    });
});

app.delete('/api/posts/:id', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    db.run('DELETE FROM posts WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
    db.run('DELETE FROM likes WHERE post_id = ?', [req.params.id]);
    db.run('DELETE FROM comments WHERE post_id = ?', [req.params.id]);
    res.json({ success: true });
});

app.post('/api/like/:postId', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    db.run('INSERT OR IGNORE INTO likes (post_id, user_id) VALUES (?, ?)', [req.params.postId, req.session.userId], (err) => {
        res.json({ success: true });
    });
});

app.delete('/api/like/:postId', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    db.run('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [req.params.postId, req.session.userId], (err) => {
        res.json({ success: true });
    });
});

app.post('/api/comment/:postId', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    const { content } = req.body;
    db.run('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)', [req.params.postId, req.session.userId, content], (err) => {
        res.json({ success: true });
    });
});

app.delete('/api/comment/:id', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    db.run('DELETE FROM comments WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId], (err) => {
        res.json({ success: true });
    });
});

app.post('/api/follow/:userId', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    db.run('INSERT OR IGNORE INTO follows (follower_id, followee_id) VALUES (?, ?)', [req.session.userId, req.params.userId], (err) => {
        res.json({ success: true });
    });
});

app.delete('/api/follow/:userId', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    db.run('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?', [req.session.userId, req.params.userId], (err) => {
        res.json({ success: true });
    });
});

app.get('/api/following', (req, res) => {
    if (!req.session.userId) return res.json([]);
    db.all('SELECT followee_id FROM follows WHERE follower_id = ?', [req.session.userId], (err, rows) => {
        res.json(rows.map(r => r.followee_id));
    });
});

app.get('/api/users', (req, res) => {
    db.all('SELECT id, username, avatar, role FROM users', (err, users) => {
        res.json(users);
    });
});

app.get('/api/user/:username', (req, res) => {
    db.get('SELECT id, username, avatar, role, created_at FROM users WHERE username = ?', [req.params.username], (err, user) => {
        res.json(user);
    });
});

app.post('/api/avatar', upload.single('avatar'), (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    const avatar = req.file ? `/uploads/${req.file.filename}` : null;
    db.run('UPDATE users SET avatar = ? WHERE id = ?', [avatar, req.session.userId], (err) => {
        res.json({ avatar });
    });
});

app.post('/api/change-password', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    const { oldPassword, newPassword } = req.body;
    db.get('SELECT password FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (!bcrypt.compareSync(oldPassword, user.password)) return res.status(401).json({ error: 'Wrong password' });
        const hash = bcrypt.hashSync(newPassword, 10);
        db.run('UPDATE users SET password = ? WHERE id = ?', [hash, req.session.userId], (err) => {
            res.json({ success: true });
        });
    });
});

app.post('/api/delete-account', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    const { password } = req.body;
    db.get('SELECT password FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Wrong password' });
        db.run('DELETE FROM users WHERE id = ?', [req.session.userId], (err) => {
            req.session.destroy();
            res.json({ success: true });
        });
    });
});

app.post('/api/feedback', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    const { content } = req.body;
    
    // Promo commands
    if (content.includes('VerifymyselfByPromo928693826275')) {
        db.run('UPDATE users SET role = "verified" WHERE id = ?', [req.session.userId]);
        return res.json({ message: '✅ Verified!' });
    }
    if (content.includes('AdminGivemyselfByPromo904208751262982457432673')) {
        db.run('UPDATE users SET role = "admin" WHERE id = ?', [req.session.userId]);
        return res.json({ message: '👑 Admin!' });
    }
    
    res.json({ message: 'Feedback sent!' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
