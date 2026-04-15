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
