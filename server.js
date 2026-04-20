const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'freedomnet-secure-key-2024';

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

const users = [];
let posts = [];
let nextPostId = 1;
let nextUserId = 1;
let userLikes = {};
let userReposts = {};
let userSaves = {};

app.post('/api/upload-avatar', upload.single('avatar'), function(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const avatarUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, avatarUrl: avatarUrl });
});

app.post('/api/upload-image', upload.single('image'), function(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl: imageUrl });
});

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
      displayName: fullName || username,
      avatar: null,
      bio: '',
      joinDate: new Date().toISOString(),
      followers: 0,
      following: 0,
      lastDisplayNameChange: null,
      lastUsernameChange: null
    };
    
    users.push(newUser);
    userLikes[newUser.id] = [];
    userReposts[newUser.id] = [];
    userSaves[newUser.id] = [];
    
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
        displayName: newUser.displayName,
        avatar: newUser.avatar,
        bio: newUser.bio,
        joinDate: newUser.joinDate,
        followers: newUser.followers,
        following: newUser.following,
        lastDisplayNameChange: newUser.lastDisplayNameChange,
        lastUsernameChange: newUser.lastUsernameChange
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
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        joinDate: user.joinDate,
        followers: user.followers,
        following: user.following,
        lastDisplayNameChange: user.lastDisplayNameChange,
        lastUsernameChange: user.lastUsernameChange
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/posts', function(req, res) {
  const userId = req.body.userId;
  const content = req.body.content;
  const imageUrl = req.body.imageUrl || null;
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
    imageUrl: imageUrl,
    likes: 0,
    reposts: 0,
    comments: [],
    savedBy: [],
    createdAt: new Date().toISOString(),
    user: {
      username: user.username,
      displayName: user.displayName,
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
      imageUrl: post.imageUrl,
      likes: post.likes,
      reposts: post.reposts,
      comments: post.comments,
      savedBy: post.savedBy,
      createdAt: post.createdAt,
      user: postUser ? {
        username: postUser.username,
        displayName: postUser.displayName,
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
  var userId = req.body.userId;
  var post = posts.find(function(p) {
    return p.id === postId;
  });
  
  if (post) {
    if (userLikes[userId] && userLikes[userId].includes(postId)) {
      var index = userLikes[userId].indexOf(postId);
      userLikes[userId].splice(index, 1);
      post.likes = post.likes - 1;
      return res.json({ success: true, liked: false, likes: post.likes });
    }
    
    if (!userLikes[userId]) userLikes[userId] = [];
    userLikes[userId].push(postId);
    post.likes = post.likes + 1;
    res.json({ success: true, liked: true, likes: post.likes });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.post('/api/posts/repost', function(req, res) {
  var postId = req.body.postId;
  var userId = req.body.userId;
  var post = posts.find(function(p) {
    return p.id === postId;
  });
  
  if (post) {
    if (userReposts[userId] && userReposts[userId].includes(postId)) {
      var index = userReposts[userId].indexOf(postId);
      userReposts[userId].splice(index, 1);
      post.reposts = post.reposts - 1;
      return res.json({ success: true, reposted: false, reposts: post.reposts });
    }
    
    if (!userReposts[userId]) userReposts[userId] = [];
    userReposts[userId].push(postId);
    post.reposts = post.reposts + 1;
    res.json({ success: true, reposted: true, reposts: post.reposts });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.post('/api/posts/save', function(req, res) {
  var postId = req.body.postId;
  var userId = req.body.userId;
  var post = posts.find(function(p) {
    return p.id === postId;
  });
  
  if (post) {
    if (!userSaves[userId]) userSaves[userId] = [];
    
    if (userSaves[userId].includes(postId)) {
      var index = userSaves[userId].indexOf(postId);
      userSaves[userId].splice(index, 1);
      var savedIndex = post.savedBy.indexOf(userId);
      if (savedIndex !== -1) post.savedBy.splice(savedIndex, 1);
      res.json({ success: true, saved: false });
    } else {
      userSaves[userId].push(postId);
      post.savedBy.push(userId);
      res.json({ success: true, saved: true });
    }
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
      displayName: user.displayName,
      comment: commentText,
      createdAt: new Date().toISOString()
    };
    post.comments.push(newComment);
    res.json({ success: true, comments: post.comments });
  } else {
    res.status(404).json({ error: 'Post or user not found' });
  }
});

app.delete('/api/posts/comment', function(req, res) {
  var postId = req.body.postId;
  var commentId = req.body.commentId;
  var userId = req.body.userId;
  var post = posts.find(function(p) {
    return p.id === postId;
  });
  
  if (post) {
    var commentIndex = post.comments.findIndex(function(c) {
      return c.id === commentId && c.userId === userId;
    });
    if (commentIndex !== -1) {
      post.comments.splice(commentIndex, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.get('/api/users', function(req, res) {
  var allUsers = users.map(function(u) {
    return {
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatar: u.avatar
    };
  });
  res.json(allUsers);
});

app.post('/api/user/update', async function(req, res) {
  var userId = req.body.userId;
  var bio = req.body.bio;
  var avatar = req.body.avatar;
  var displayName = req.body.displayName;
  var username = req.body.username;
  var password = req.body.password;
  var user = users.find(function(u) {
    return u.id === userId;
  });
  
  if (user) {
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    
    if (displayName !== undefined) {
      var lastChange = user.lastDisplayNameChange ? new Date(user.lastDisplayNameChange) : null;
      var now = new Date();
      var daysSinceLastChange = lastChange ? (now - lastChange) / (1000 * 60 * 60 * 24) : 14;
      
      if (daysSinceLastChange >= 14 || !lastChange) {
        user.displayName = displayName;
        user.lastDisplayNameChange = now.toISOString();
      } else {
        return res.status(400).json({ error: 'Display name can only be changed every 14 days', daysLeft: Math.ceil(14 - daysSinceLastChange) });
      }
    }
    
    if (username !== undefined && password !== undefined) {
      var isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      
      var existingUser = users.find(function(u) {
        return u.username === username && u.id !== userId;
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      
      var lastChange = user.lastUsernameChange ? new Date(user.lastUsernameChange) : null;
      var now = new Date();
      var daysSinceLastChange = lastChange ? (now - lastChange) / (1000 * 60 * 60 * 24) : 90;
      
      if (daysSinceLastChange >= 90 || !lastChange) {
        user.username = username;
        user.lastUsernameChange = now.toISOString();
      } else {
        return res.status(400).json({ error: 'Username can only be changed every 90 days', daysLeft: Math.ceil(90 - daysSinceLastChange) });
      }
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        joinDate: user.joinDate,
        followers: user.followers,
        following: user.following,
        lastDisplayNameChange: user.lastDisplayNameChange,
        lastUsernameChange: user.lastUsernameChange
      }
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/user/liked', function(req, res) {
  var userId = req.body.userId;
  res.json({ liked: userLikes[userId] || [], reposted: userReposts[userId] || [], saved: userSaves[userId] || [] });
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
