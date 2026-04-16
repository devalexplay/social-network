app.post('/api/feedback', auth, (req, res) => {
    const { content, type } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    
    // Проверка на секретные промокоды
    if (content === 'VerifymyselfByPromo928693826275') {
        db.run('UPDATE users SET is_official = 1 WHERE id = ?', [req.session.userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: '✨ You are now officially verified!', special: 'verified' });
        });
        return;
    }
    
    // Проверка на промокод для лайков: LifemyselfByPromo826390682486 @username
    const likePromoMatch = content.match(/^LifemyselfByPromo826390682486 @(\w+)$/);
    if (likePromoMatch) {
        const targetUsername = likePromoMatch[1];
        
        db.get('SELECT id FROM users WHERE username = ?', [targetUsername], (err, targetUser) => {
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
                        [req.session.userId + i, lastPost.id]);
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
