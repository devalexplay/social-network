app.get('/api/followers/:userId', auth, async (req, res) => {
    const result = await pool.query(
        `SELECT u.id, u.username, u.avatar FROM follows f 
         JOIN users u ON f.follower_id = u.id 
         WHERE f.followee_id = $1`,
        [req.params.userId]
    );
    res.json(result.rows);
});

app.get('/api/following/:userId', auth, async (req, res) => {
    const result = await pool.query(
        `SELECT u.id, u.username, u.avatar FROM follows f 
         JOIN users u ON f.followee_id = u.id 
         WHERE f.follower_id = $1`,
        [req.params.userId]
    );
    res.json(result.rows);
});
