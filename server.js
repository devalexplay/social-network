app.post('/api/change-username', auth, async (req, res) => {
    const { newUsername, password } = req.body;
    
    if (!newUsername || !password) return res.status(400).json({ error: 'All fields required' });
    if (newUsername.length < 3 || newUsername.length > 20) return res.status(400).json({ error: 'Username must be 3-20 characters' });
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) return res.status(400).json({ error: 'Username can only contain letters, numbers, underscore' });
    
    db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], async (err, user) => {
        if (!user) return res.status(404).json({ error: 'User not found' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid password' });
        
        db.get('SELECT id FROM users WHERE username = ?', [newUsername], (err, existing) => {
            if (existing) return res.status(400).json({ error: 'Username already taken' });
            
            db.run('UPDATE users SET username = ? WHERE id = ?', [newUsername, req.session.userId], (err) => {
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
