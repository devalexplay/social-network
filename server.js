const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'freedomnet-secure-key-2024';

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

const users = [];
const posts = [];
const settings = {};

app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (users.find(u => u.username === username || u.email === email)) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      fullName: fullName || username,
      avatar: `https://ui-avatars.com/api/?name=${fullName || username}&background=1d9bf0&color=fff`,
      createdAt: new Date().toISOString(),
      preferences: {
        theme: 'dark',
        notifications: true,
        animations: true
      }
    };
    
    users.push(newUser);
    
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, email: newUser.email },
      SECRET_KEY,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        avatar: newUser.avatar,
        preferences: newUser.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const user = users.find(u => u.username === username || u.email === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      SECRET_KEY,
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/posts', (req, res) => {
  const { userId, content } = req.body;
  const newPost = {
    id: Date.now().toString(),
    userId,
    content,
    likes: 0,
    comments: [],
    createdAt: new Date().toISOString()
  };
  posts.unshift(newPost);
  res.json({ success: true, post: newPost });
});

app.get('/api/posts', (req, res) => {
  const postsWithUsers = posts.map(post => {
    const user = users.find(u => u.id === post.userId);
    return {
      ...post,
      user: user ? {
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar
      } : null
    };
  });
  res.json(postsWithUsers);
});

app.post('/api/posts/like', (req, res) => {
  const { postId } = req.body;
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.likes++;
    res.json({ success: true, likes: post.likes });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.post('/api/settings', (req, res) => {
  const { userId, preferences } = req.body;
  const user = users.find(u => u.id === userId);
  if (user) {
    user.preferences = { ...user.preferences, ...preferences };
    res.json({ success: true, preferences: user.preferences });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/api/verify', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`FreedomNet running on http://localhost:${PORT}`);
});
