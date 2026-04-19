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
let posts = [];
let nextPostId = 1;
let nextUserId = 1;

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
    
    const userExists = users.find(function(u) {
      return u.username === username || u.email === email;
    });
    if (userExists) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: (nextUserId++).toString(),
      username: username,
      email: email,
      password: hashedPassword,
      fullName: fullName || username,
      avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName || username) + '&background=1d9bf0&color=fff&bold=true&size=128',
      bio: '',
      joinDate: new Date().toISOString(),
      followers: 0,
      following: 0
    };
    
    users.push(newUser);
    
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, email: newUser.email },
      SECRET_KEY,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      success: true,
      token: token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        avatar: newUser.avatar,
        bio: newUser.bio,
        joinDate: newUser.joinDate,
        followers: newUser.followers,
        following: newUser.following
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
    
    const user = users.find(function(u) {
      return u.username === username || u.email === username;
    });
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
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        bio: user.bio,
        joinDate: user.joinDate,
        followers: user.followers,
        following: user.following
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/posts', function(req, res) {
  const userId = req.body.userId;
  const content = req.body.content;
  const user = users.find(function(u) {
    return u.id === userId;
  });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const newPost = {
    id: (nextPostId++).toString(),
    userId: userId,
    content: content,
    likes: 0,
    reposts: 0,
    comments: [],
    saved: false,
    createdAt: new Date().toISOString(),
    user: {
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar
    }
  };
  
  posts.unshift(newPost);
  res.json({ success: true, post: newPost });
});

app.get('/api/posts', function(req, res) {
  var postsWithUsers = posts.map(function(post) {
    var postUser = users.find(function(u) {
      return u.id === post.userId;
    });
    return {
      id: post.id,
      userId: post.userId,
      content: post.content,
      likes: post.likes,
      reposts: post.reposts,
      comments: post.comments,
      saved: post.saved,
      createdAt: post.createdAt,
      user: postUser ? {
        username: postUser.username,
        fullName: postUser.fullName,
        avatar: postUser.avatar
      } : null
    };
  });
  res.json(postsWithUsers);
});

app.put('/api/posts/:id', function(req, res) {
  var postId = req.params.id;
  var newContent = req.body.content;
  var post = posts.find(function(p) {
    return p.id === postId;
  });
  if (post) {
    post.content = newContent;
    res.json({ success: true, post: post });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.delete('/api/posts/:id', function(req, res) {
  var postId = req.params.id;
  var postIndex = posts.findIndex(function(p) {
    return p.id === postId;
  });
  if (postIndex !== -1) {
    posts.splice(postIndex, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.post('/api/posts/like', function(req, res) {
  var postId = req.body.postId;
  var post = posts.find(function(p) {
    return p.id === postId;
  });
  if (post) {
    post.likes = post.likes + 1;
    res.json({ success: true, likes: post.likes });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.post('/api/posts/repost', function(req, res) {
  var postId = req.body.postId;
  var post = posts.find(function(p) {
    return p.id === postId;
  });
  if (post) {
    post.reposts = post.reposts + 1;
    res.json({ success: true, reposts: post.reposts });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.post('/api/posts/save', function(req, res) {
  var postId = req.body.postId;
  var post = posts.find(function(p) {
    return p.id === postId;
  });
  if (post) {
    post.saved = !post.saved;
    res.json({ success: true, saved: post.saved });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.post('/api/posts/comment', function(req, res) {
  var postId = req.body.postId;
  var userId = req.body.userId;
  var commentText = req.body.comment;
  var post = posts.find(function(p) {
    return p.id === postId;
  });
  var user = users.find(function(u) {
    return u.id === userId;
  });
  
  if (post && user) {
    var newComment = {
      id: Date.now().toString(),
      userId: userId,
      username: user.username,
      fullName: user.fullName,
      comment: commentText,
      createdAt: new Date().toISOString()
    };
    post.comments.push(newComment);
    res.json({ success: true, comments: post.comments });
  } else {
    res.status(404).json({ error: 'Post or user not found' });
  }
});

app.post('/api/user/update', function(req, res) {
  var userId = req.body.userId;
  var bio = req.body.bio;
  var user = users.find(function(u) {
    return u.id === userId;
  });
  
  if (user) {
    if (bio !== undefined) {
      user.bio = bio;
    }
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        bio: user.bio,
        joinDate: user.joinDate,
        followers: user.followers,
        following: user.following
      }
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

function authMiddleware(req, res, next) {
  var authHeader = req.headers.authorization;
  var token = authHeader ? authHeader.split(' ')[1] : null;
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  try {
    var verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/verify', authMiddleware, function(req, res) {
  res.json({ success: true, user: req.user });
});

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, function() {
  console.log('FreedomNet running on http://localhost:' + PORT);
});
