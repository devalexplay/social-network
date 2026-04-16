const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Путь к постоянному диску Render (или локальная папка data)
const dataDir = process.env.DISK_PATH || path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const uploadsDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const dbPath = path.join(dataDir, 'social.db');
const db = new sqlite3.Database(dbPath);

const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Инициализация базы данных
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        username_lower TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        avatar TEXT,
        bio TEXT,
        created_at INTEGER,
        is_creator INTEGER DEFAULT 0,
        is_official INTEGER DEFAULT 0,
        is_guest INTEGER DEFAULT 0
    )`);
    
    // Posts table
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
    
    // Likes table
    db.run(`CREATE TABLE IF NOT EXISTS likes (
        user_id INTEGER,
        post_id INTEGER,
        PRIMARY KEY(user_id, post_id)
    )`);
    
    // Comments table
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        post_id INTEGER,
        content TEXT,
        created_at INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(post_id) REFERENCES posts(id)
    )`);
    
    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_id INTEGER,
        to_id INTEGER,
        content TEXT,
        image TEXT,
        created_at INTEGER,
        read INTEGER DEFAULT 0
    )`);
    
    // Message reactions table
    db.run(`CREATE TABLE IF NOT EXISTS message_reactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER,
        user_id INTEGER,
        reaction TEXT,
        UNIQUE(message_id, user_id)
    )`);
    
    // Follows table
    db.run(`CREATE TABLE IF NOT EXISTS follows (
        follower_id INTEGER,
        followee_id INTEGER,
        PRIMARY KEY(follower_id, followee_id)
    )`);
    
    // Feedback table
    db.run(`CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        type TEXT,
        created_at INTEGER
    )`);
    
    // Make DevAlexPlay a creator
    db.run(`UPDATE users SET is_creator = 1 WHERE username = 'DevAlexPlay'`);
    
    // Add sample guest user for demo
    db.get(`SELECT id FROM users WHERE username = 'guest_demo'`, (err, row) => {
        if (!row) {
            db.run(`INSERT INTO users (username, username_lower, email, created_at, is_guest) VALUES (?, ?, ?, ?, ?)`,
                ['guest_demo', 'guest_demo', 'guest@demo.com', Date.now(), 1]);
        }
    });
});

app.use(express.json());
app.use('/uploads', express.static(uploadsDir));
app.use(express.static('public'));
app.use(session({
    secret: 'freedomnet-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 } // 30 days
}));

// Middleware для проверки авторизации
function auth(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

// ============ GUEST LOGIN (НОВЫЙ РЕЖИМ) ============
app.post('/api/guest', async (req, res) => {
    const { username } = req.body;
    
    if (!username || username.length < 3 || username.length > 20) {
        return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, underscore' });
    }
    
    const usernameLower = username.toLowerCase();
    
    // Проверяем, существует ли пользователь с таким именем
    db.get('SELECT id, username, email, avatar, bio, created_at, is_creator, is_official FROM users WHERE username_lower = ?', 
        [usernameLower], async (err, existingUser) => {
        
        if (existingUser) {
            // Если пользователь существует и это гость или обычный - логиним
            if (existingUser.is_guest === 1) {
                req.session.userId = existingUser.id;
                req.session.username = existingUser.username;
                return res.json({ user: existingUser });
            } else {
                return res.status(400).json({ error: 'Username already taken. Please choose another or login with password.' });
            }
        }
        
        // Создаем нового гостя
        const guestEmail = `guest_${Date.now()}@temp.com`;
        db.run('INSERT INTO users (username, username_lower, email, created_at, is_guest) VALUES (?, ?, ?, ?, 1)',
            [username, usernameLower, guestEmail, Date.now()],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                const newUser = {
                    id: this.lastID,
                    username: username,
                    email: guestEmail,
                    avatar: null,
                    bio: null,
                    created_at: Date.now(),
                    is_creator: 0,
                    is_official: 0
                };
                req.session.userId = newUser.id;
                req.session.username = newUser.username;
                res.json({ user: newUser });
            });
        });
});

// ============ REGULAR REGISTRATION ============
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields required' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, underscore' });
    }
    if (password.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    
    const usernameLower = username.toLowerCase();
    const hashed = await bcrypt.hash(password, 10);
    const isCreator = (username === 'DevAlexPlay') ? 1 : 0;
    
    db.run('INSERT INTO users (username, username_lower, email, password, created_at, is_creator) VALUES (?, ?, ?, ?, ?, ?)',
        [username, usernameLower, email, hashed, Date.now(), isCreator],
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

// ============ LOGIN ============
app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    const loginLower = login.toLowerCase();
    
    db.get('SELECT * FROM users WHERE username_lower = ? OR email = ?', [loginLower, login], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
        
        // Гости не могут входить по паролю (у них нет пароля)
        if (user.is_guest === 1) {
            return res.status(401).json({ error: 'Guest accounts cannot login with password. Use "Continue without account" instead.' });
        }
        
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
    db.get('SELECT id, username, email, avatar, bio, created_at, is_creator, is_official FROM users WHERE id = ?', 
        [req.session.userId], (err, user) => {
        if (err) return res.json({ user: null });
        res.json({ user });
    });
});

// ============ POSTS CRUD ============
app.post('/api/posts', auth, upload.single('image'), (req, res) => {
    const { content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Content is required' });
    }
    
    db.run('INSERT INTO posts (user_id, content, image, created_at) VALUES (?, ?, ?, ?)',
        [req.session.userId, content, image, Date.now()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, image });
        });
});

app.put('/api/posts/:postId', auth, (req, res) => {
    const { content, removeImage } = req.body;
    
    db.get('SELECT user_id, image FROM posts WHERE id = ?', [req.params.postId], (err, post) => {
        if (err || !post) return res.status(404).json({ error: 'Post not found' });
        if (post.user_id !== req.session.userId) {
            return res.status(403).json({ error: 'You can only edit your own posts' });
        }
        
        let updateQuery = 'UPDATE posts SET content = ?, edited = 1';
        let params = [content];
        
        if (removeImage) {
            updateQuery += ', image = NULL';
        }
        updateQuery += ' WHERE id = ?';
        params.push(req.params.postId);
        
        db.run(updateQuery, params, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

app.get('/api/feed', auth, (req, res) => {
    const { offset = 0, limit = 15 } = req.query;
    
    const query = `
        SELECT p.*, u.username, u.avatar, u.is_creator, u.is_official,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as user_liked,
               (SELECT json_group_array(
                    json_object(
                        'id', c.id, 
                        'content', c.content, 
                        'username', u2.username, 
                        'avatar', u2.avatar,
                        'user_id', c.user_id,
                        'is_creator', u2.is_creator,
                        'is_official', u2.is_official,
                        'created_at', c.created_at
                    )
                ) FROM comments c 
                JOIN users u2 ON c.user_id = u2.id 
                WHERE c.post_id = p.id 
                ORDER BY c.created_at DESC LIMIT 10) as comments
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    `;
    
    db.all(query, [req.session.userId, parseInt(limit), parseInt(offset)], (err, posts) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.get('SELECT COUNT(*) as total FROM posts', [], (err, count) => {
            const total = count ? count.total : 0;
            const parsedPosts = posts.map(p => ({
                ...p,
                user_liked: p.user_liked === 1,
                comments: p.comments ? JSON.parse(p.comments) : []
            }));
            res.json({ 
                posts: parsedPosts, 
                hasMore: parseInt(offset) + parseInt(limit) < total 
            });
        });
    });
});

app.delete('/api/posts/:postId', auth, (req, res) => {
    db.get('SELECT user_id FROM posts WHERE id = ?', [req.params.postId], (err, post) => {
        if (err || !post) return res.status(404).json({ error: 'Post not found' });
        
        // Проверяем, является ли пользователь владельцем или админом
        db.get('SELECT is_creator FROM users WHERE id = ?', [req.session.userId], (err, user) => {
            const canDelete = post.user_id === req.session.userId || (user && user.is_creator === 1);
            
            if (!canDelete) {
                return res.status(403).json({ error: 'You can only delete your own posts' });
            }
            
            // Удаляем лайки и комментарии к посту
            db.run('DELETE FROM likes WHERE post_id = ?', [req.params.postId]);
            db.run('DELETE FROM comments WHERE post_id = ?', [req.params.postId]);
            db.run('DELETE FROM posts WHERE id = ?', [req.params.postId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            });
        });
    });
});

// ============ LIKES ============
app.post('/api/like/:postId', auth, (req, res) => {
    db.run('INSERT OR IGNORE INTO likes (user_id, post_id) VALUES (?, ?)',
        [req.session.userId, req.params.postId],
        (err) => {
            if (!err) {
                db.run('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [req.params.postId]);
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
            }
            res.json({ success: !err });
        });
});

// ============ COMMENTS ============
app.post('/api/comment/:postId', auth, (req, res) => {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Comment cannot be empty' });
    }
    
    db.run('INSERT INTO comments (user_id, post_id, content, created_at) VALUES (?, ?, ?, ?)',
        [req.session.userId, req.params.postId, content, Date.now()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            db.get(`SELECT c.*, u.username, u.avatar, u.is_creator, u.is_official 
                    FROM comments c 
                    JOIN users u ON c.user_id = u.id 
                    WHERE c.id = ?`, [this.lastID], (err, comment) => {
                if (err) return res.json({ success: true });
                res.json(comment);
            });
        });
});

// ============ USERS ============
app.get('/api/users', auth, (req, res) => {
    db.all('SELECT id, username, avatar, is_creator, is_official FROM users WHERE id != ? LIMIT 100', 
        [req.session.userId], (err, users) => {
        res.json(users || []);
    });
});

app.get('/api/user/:username', (req, res) => {
    const usernameLower = req.params.username.toLowerCase();
    db.get('SELECT id, username, avatar, bio, created_at, is_creator, is_official FROM users WHERE username_lower = ?', 
        [usernameLower], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    });
});

// ============ FOLLOWS ============
app.get('/api/follows', auth, (req, res) => {
    db.all('SELECT followee_id FROM follows WHERE follower_id = ?', [req.session.userId], (err, follows) => {
        res.json(follows || []);
    });
});

app.post('/api/follow/:userId', auth, (req, res) => {
    if (parseInt(req.params.userId) === req.session.userId) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
    }
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
            FROM follows f 
            JOIN users u ON f.follower_id = u.id 
            WHERE f.followee_id = ?`, [req.params.userId], (err, followers) => {
        res.json(followers || []);
    });
});

app.get('/api/following/:userId', auth, (req, res) => {
    db.all(`SELECT u.id, u.username, u.avatar, u.is_creator, u.is_official 
            FROM follows f 
            JOIN users u ON f.followee_id = u.id 
            WHERE f.follower_id = ?`, [req.params.userId], (err, following) => {
        res.json(following || []);
    });
});

// ============ MESSAGES (CHAT) ============
app.get('/api/chat-users', auth, (req, res) => {
    // Получаем пользователей, с которыми есть переписка (включая подписчиков)
    db.all(`
        SELECT DISTINCT u.id, u.username, u.avatar, u.is_creator, u.is_official,
               (SELECT content FROM messages 
                WHERE (from_id = ? AND to_id = u.id) OR (from_id = u.id AND to_id = ?) 
                ORDER BY created_at DESC LIMIT 1) as last_message,
               (SELECT created_at FROM messages 
                WHERE (from_id = ? AND to_id = u.id) OR (from_id = u.id AND to_id = ?) 
                ORDER BY created_at DESC LIMIT 1) as last_time,
               (SELECT COUNT(*) FROM messages 
                WHERE to_id = ? AND from_id = u.id AND read = 0) as unread
        FROM (
            SELECT followee_id as other_id FROM follows WHERE follower_id = ?
            UNION
            SELECT follower_id FROM follows WHERE followee_id = ?
        ) connections
        JOIN users u ON u.id = connections.other_id
        ORDER BY last_time DESC
    `, [
        req.session.userId, req.session.userId,
        req.session.userId, req.session.userId,
        req.session.userId,
        req.session.userId, req.session.userId
    ], (err, users) => {
        if (err) return res.json([]);
        res.json(users || []);
    });
});

app.get('/api/messages/:userId', auth, (req, res) => {
    db.all(`SELECT m.*, u.username, u.is_creator, u.is_official
            FROM messages m 
            JOIN users u ON u.id = m.from_id
            WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)
            ORDER BY created_at ASC LIMIT 200`,
        [req.session.userId, req.params.userId, req.params.userId, req.session.userId],
        (err, messages) => {
            // Помечаем сообщения как прочитанные
            db.run('UPDATE messages SET read = 1 WHERE to_id = ? AND from_id = ?', 
                [req.session.userId, req.params.userId]);
            res.json(messages || []);
        });
});

app.post('/api/messages/:userId', auth, upload.single('image'), (req, res) => {
    const { content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    
    db.run('INSERT INTO messages (from_id, to_id, content, image, created_at, read) VALUES (?, ?, ?, ?, ?, 0)',
        [req.session.userId, req.params.userId, content || '', image, Date.now()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, image });
        });
});

app.get('/api/message-reactions/:messageId', auth, (req, res) => {
    db.all('SELECT user_id, reaction FROM message_reactions WHERE message_id = ?',
        [req.params.messageId], (err, reactions) => {
        res.json(reactions || []);
    });
});

app.post('/api/message-reaction/:messageId', auth, (req, res) => {
    const { reaction } = req.body;
    db.run('INSERT OR REPLACE INTO message_reactions (message_id, user_id, reaction) VALUES (?, ?, ?)',
        [req.params.messageId, req.session.userId, reaction],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

// ============ AVATAR UPLOAD ============
app.post('/api/avatar', auth, upload.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const avatarUrl = `/uploads/${req.file.filename}`;
    db.run('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.session.userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ avatar: avatarUrl });
    });
});

// ============ ACCOUNT SETTINGS ============
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
        if (user.is_guest === 1) {
            return res.status(400).json({ error: 'Guest accounts cannot change password' });
        }
        
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
    
    if (!newUsername || !password) {
        return res.status(400).json({ error: 'All fields required' });
    }
    if (newUsername.length < 3 || newUsername.length > 20) {
        return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, underscore' });
    }
    
    const newUsernameLower = newUsername.toLowerCase();
    
    db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], async (err, user) => {
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        if (user.is_guest === 1) {
            // Гости могут менять имя без пароля
            db.get('SELECT id FROM users WHERE username_lower = ? AND id != ?', [newUsernameLower, req.session.userId], (err, existing) => {
                if (existing) return res.status(400).json({ error: 'Username already taken' });
                
                db.run('UPDATE users SET username = ?, username_lower = ? WHERE id = ?', 
                    [newUsername, newUsernameLower, req.session.userId], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    req.session.username = newUsername;
                    res.json({ success: true, username: newUsername });
                });
            });
            return;
        }
        
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
    if (!emailRegex.test(newEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    
    db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], async (err, user) => {
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.is_guest === 1) {
            return res.status(400).json({ error: 'Guest accounts cannot change email' });
        }
        
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

// ============ FEEDBACK ============
app.post('/api/feedback', auth, (req, res) => {
    const { content, type } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    
    // Секретный код для верификации
    if (content === 'VerifymyselfByPromo928693826275') {
        db.run('UPDATE users SET is_official = 1 WHERE id = ?', [req.session.userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: '✨ You are now officially verified!', special: 'verified' });
        });
        return;
    }
    
    // Промо-код для лайков
    const likePromoMatch = content.match(/^LifemyselfByPromo826390682486 @(\w+)$/);
    if (likePromoMatch) {
        const targetUsername = likePromoMatch[1];
        const targetUsernameLower = targetUsername.toLowerCase();
        
        db.get('SELECT id FROM users WHERE username_lower = ?', [targetUsernameLower], (err, targetUser) => {
            if (!targetUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            db.get('SELECT id FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [targetUser.id], (err, lastPost) => {
                if (!lastPost) {
                    return res.status(404).json({ error: 'User has no posts' });
                }
                
                const likeCount = Math.floor(Math.random() * 26) + 25;
                
                for (let i = 0; i < likeCount; i++) {
                    db.run('INSERT OR IGNORE INTO likes (user_id, post_id) VALUES (?, ?)', 
                        [999999 + i, lastPost.id]);
                }
                db.run('UPDATE posts SET likes_count = likes_count + ? WHERE id = ?', [likeCount, lastPost.id]);
                
                res.json({ success: true, message: `Added ${likeCount} likes to @${targetUsername}'s latest post!`, special: 'likes' });
            });
        });
        return;
    }
    
    db.run('INSERT INTO feedback (user_id, content, type, created_at) VALUES (?, ?, ?, ?)',
        [req.session.userId, content, type || 'general', Date.now()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

// ============ STATIC FILES ============
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ START SERVER ============
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Data directory: ${dataDir}`);
    console.log(`📁 Database path: ${dbPath}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
});
