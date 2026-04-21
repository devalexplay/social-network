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

const DATA_DIR = './data';
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

function loadData(filename, defaultValue) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {}
  return defaultValue;
}

function saveData(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

let users = loadData('users.json', []);
let posts = loadData('posts.json', []);
let messages = loadData('messages.json', []);
let officialUsers = loadData('official.json', []);
let userLikes = loadData('likes.json', {});
let userReposts = loadData('reposts.json', {});
let userSaves = loadData('saves.json', {});
let commentLikes = loadData('commentLikes.json', {});

let nextPostId = posts.length > 0 ? Math.max(...posts.map(p => parseInt(p.id))) + 1 : 1;
let nextUserId = users.length > 0 ? Math.max(...users.map(u => parseInt(u.id))) + 1 : 1;
let nextMessageId = messages.length > 0 ? Math.max(...messages.map(m => parseInt(m.id))) + 1 : 1;

function saveAll() {
  saveData('users.json', users);
  saveData('posts.json', posts);
  saveData('messages.json', messages);
  saveData('official.json', officialUsers);
  saveData('likes.json', userLikes);
  saveData('reposts.json', userReposts);
  saveData('saves.json', userSaves);
  saveData('commentLikes.json', commentLikes);
}

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
      lastUsernameChange: null,
      passwordHint: password.slice(0, 3) + '...' + password.slice(-3),
      coverColor: '#1d9bf0'
    };
    
    users.push(newUser);
    if (!userLikes[newUser.id]) userLikes[newUser.id] = [];
    if (!userReposts[newUser.id]) userReposts[newUser.id] = [];
    if (!userSaves[newUser.id]) userSaves[newUser.id] = [];
    
    saveAll();
    
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
        lastUsernameChange: newUser.lastUsernameChange,
        passwordHint: newUser.passwordHint,
        coverColor: newUser.coverColor
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
        lastUsernameChange: user.lastUsernameChange,
        passwordHint: user.passwordHint,
        coverColor: user.coverColor
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
  const isMature = req.body.isMature || false;
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
    isMature: isMature,
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
  saveAll();
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
      isMature: post.isMature,
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
    saveAll();
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
    saveAll();
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
      saveAll();
      return res.json({ success: true, liked: false, likes: post.likes });
    }
    
    if (!userLikes[userId]) userLikes[userId] = [];
    userLikes[userId].push(postId);
    post.likes = post.likes + 1;
    saveAll();
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
      saveAll();
      return res.json({ success: true, reposted: false, reposts: post.reposts });
    }
    
    if (!userReposts[userId]) userReposts[userId] = [];
    userReposts[userId].push(postId);
    post.reposts = post.reposts + 1;
    saveAll();
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
      saveAll();
      res.json({ success: true, saved: false });
    } else {
      userSaves[userId].push(postId);
      post.savedBy.push(userId);
      saveAll();
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
      likes: 0,
      createdAt: new Date().toISOString()
    };
    post.comments.push(newComment);
    saveAll();
    res.json({ success: true, comments: post.comments });
  } else {
    res.status(404).json({ error: 'Post or user not found' });
  }
});

app.put('/api/posts/comment/:commentId', function(req, res) {
  var commentId = req.params.commentId;
  var postId = req.body.postId;
  var newContent = req.body.content;
  var post = posts.find(function(p) {
    return p.id === postId;
  });
  
  if (post) {
    var comment = post.comments.find(function(c) {
      return c.id === commentId;
    });
    if (comment) {
      comment.comment = newContent;
      saveAll();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.delete('/api/posts/comment', function(req, res) {
  var postId = req.body.postId;
  var commentId = req.body.commentId;
  var userId = req.body.userId;
  var post = posts.find(function(p) {
    return p.id === postId;
  });
  var isAdmin = users.find(u => u.id === userId && u.username === 'devalexplay');
  
  if (post) {
    var commentIndex = post.comments.findIndex(function(c) {
      return c.id === commentId && (c.userId === userId || isAdmin);
    });
    if (commentIndex !== -1) {
      post.comments.splice(commentIndex, 1);
      saveAll();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.post('/api/comments/like', function(req, res) {
  var postId = req.body.postId;
  var commentId = req.body.commentId;
  var userId = req.body.userId;
  var post = posts.find(function(p) {
    return p.id === postId;
  });
  
  if (post) {
    var comment = post.comments.find(function(c) {
      return c.id === commentId;
    });
    if (comment) {
      if (!commentLikes[commentId]) commentLikes[commentId] = [];
      if (commentLikes[commentId].includes(userId)) {
        var index = commentLikes[commentId].indexOf(userId);
        commentLikes[commentId].splice(index, 1);
        comment.likes = comment.likes - 1;
        saveAll();
        res.json({ success: true, liked: false, likes: comment.likes });
      } else {
        commentLikes[commentId].push(userId);
        comment.likes = comment.likes + 1;
        saveAll();
        res.json({ success: true, liked: true, likes: comment.likes });
      }
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
      avatar: u.avatar,
      bio: u.bio,
      joinDate: u.joinDate,
      followers: u.followers,
      following: u.following,
      coverColor: u.coverColor
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
  var email = req.body.email;
  var password = req.body.password;
  var newPassword = req.body.newPassword;
  var coverColor = req.body.coverColor;
  var user = users.find(function(u) {
    return u.id === userId;
  });
  
  if (user) {
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (coverColor !== undefined) user.coverColor = coverColor;
    
    if (email !== undefined) {
      var existingEmail = users.find(function(u) {
        return u.email === email && u.id !== userId;
      });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already taken' });
      }
      user.email = email;
    }
    
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
    
    if (newPassword !== undefined && password !== undefined) {
      var isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid current password' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
      user.passwordHint = newPassword.slice(0, 3) + '...' + newPassword.slice(-3);
    }
    
    saveAll();
    
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
        lastUsernameChange: user.lastUsernameChange,
        passwordHint: user.passwordHint,
        coverColor: user.coverColor
      }
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/user/delete', async (req, res) => {
  const { userId, password, email } = req.body;
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (email !== user.email) {
    return res.status(401).json({ error: 'Email does not match' });
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  
  const userIndex = users.findIndex(u => u.id === userId);
  users.splice(userIndex, 1);
  
  posts = posts.filter(p => p.userId !== userId);
  
  saveAll();
  
  res.json({ success: true });
});

app.post('/api/user/liked', function(req, res) {
  var userId = req.body.userId;
  res.json({ liked: userLikes[userId] || [], reposted: userReposts[userId] || [], saved: userSaves[userId] || [] });
});

app.get('/api/messages/:userId', function(req, res) {
  var userId = req.params.userId;
  var userMessages = messages.filter(function(m) {
    return m.senderId === userId || m.receiverId === userId;
  });
  res.json(userMessages);
});

app.post('/api/messages/send', function(req, res) {
  var senderId = req.body.senderId;
  var receiverId = req.body.receiverId;
  var content = req.body.content;
  
  var newMessage = {
    id: (nextMessageId++).toString(),
    senderId: senderId,
    receiverId: receiverId,
    content: content,
    createdAt: new Date().toISOString(),
    read: false
  };
  
  messages.push(newMessage);
  saveAll();
  res.json({ success: true, message: newMessage });
});

app.post('/api/official/add', (req, res) => {
  const { userId, adminId } = req.body;
  const admin = users.find(u => u.id === adminId);
  if (admin && admin.username === 'devalexplay') {
    if (!officialUsers.includes(userId)) {
      officialUsers.push(userId);
      saveAll();
    }
    res.json({ success: true });
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
});

app.post('/api/official/remove', (req, res) => {
  const { userId, adminId } = req.body;
  const admin = users.find(u => u.id === adminId);
  if (admin && admin.username === 'devalexplay') {
    const index = officialUsers.indexOf(userId);
    if (index !== -1) {
      officialUsers.splice(index, 1);
      saveAll();
    }
    res.json({ success: true });
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
});

app.get('/api/official/users', (req, res) => {
  res.json(officialUsers);
});

app.post('/api/help/ask', (req, res) => {
  const { question } = req.body;
  const lowerQuestion = question.toLowerCase();
  let answer = '';
  
  if (lowerQuestion.includes('password') || lowerQuestion.includes('change password')) {
    answer = 'To change your password, go to Settings → Profile Settings → Change Password. You will need your current password and then enter a new password.';
  } else if (lowerQuestion.includes('username') || lowerQuestion.includes('change username')) {
    answer = 'To change your username, go to Settings → Profile Settings → Change Username. Note: Username can only be changed once every 90 days.';
  } else if (lowerQuestion.includes('display name') || lowerQuestion.includes('change display')) {
    answer = 'To change your display name, go to Settings → Profile Settings → Change Display Name. Note: Display name can only be changed once every 14 days.';
  } else if (lowerQuestion.includes('email') || lowerQuestion.includes('change email')) {
    answer = 'To change your email, go to Settings → Profile Settings → Change Email. Enter your current password and then your new email address.';
  } else if (lowerQuestion.includes('delete account')) {
    answer = 'To delete your account, go to Settings → Account Privacy → Delete Account. You will need to confirm your email and password. This action is permanent!';
  } else if (lowerQuestion.includes('post') || lowerQuestion.includes('create post')) {
    answer = 'To create a post, click on the text area at the top of the Home page, write your content, and click the Post button. You can also add images by clicking the image icon.';
  } else if (lowerQuestion.includes('like') || lowerQuestion.includes('repost')) {
    answer = 'To like a post, click the heart icon. To repost a post, click the repost icon (two arrows). You can only like or repost a post once.';
  } else if (lowerQuestion.includes('comment')) {
    answer = 'To comment on a post, click the comment icon (speech bubble) below any post. You can delete your own comments by clicking the × button. You can also like and reply to comments.';
  } else if (lowerQuestion.includes('save') || lowerQuestion.includes('bookmark')) {
    answer = 'To save a post, click the bookmark icon. Your saved posts can be found in the Bookmarks tab in the sidebar.';
  } else if (lowerQuestion.includes('avatar') || lowerQuestion.includes('profile picture')) {
    answer = 'To change your avatar, click "Change avatar" in the sidebar, then select an image from your computer and click Save.';
  } else if (lowerQuestion.includes('theme') || lowerQuestion.includes('dark') || lowerQuestion.includes('light')) {
    answer = 'To change the theme, go to Settings → Appearance and select Dark or Light mode. Your preference will be saved automatically.';
  } else if (lowerQuestion.includes('language') || lowerQuestion.includes('translation')) {
    answer = 'To change the language, go to Settings → Language and select your preferred language from the dropdown menu.';
  } else if (lowerQuestion.includes('official') || lowerQuestion.includes('badge')) {
    answer = 'The Official badge (⭐Official) is given to verified accounts. Admin users can add or remove this badge via the Admin Panel.';
  } else if (lowerQuestion.includes('message') || lowerQuestion.includes('chat')) {
    answer = 'To send a message, go to the Messages page, search for a user, click on their name, type your message, and press Send.';
  } else if (lowerQuestion.includes('help') || lowerQuestion.includes('support')) {
    answer = 'Welcome to the Help Center! You can ask me questions about: password changes, username/display name changes, email updates, account deletion, creating posts, likes, reposts, comments, saves, avatars, themes, languages, messages, and more. What would you like to know?';
  } else {
    answer = 'I couldn\'t find an answer to your question. Please try asking differently, or contact support@freedomnet.com for more help. You can ask about: password, username, display name, email, delete account, posts, likes, reposts, comments, saves, avatar, theme, language, official badge, or messages.';
  }
  
  res.json({ answer: answer });
});

app.post('/api/user/cover', (req, res) => {
  const { userId, color } = req.body;
  const user = users.find(u => u.id === userId);
  if (user) {
    user.coverColor = color;
    saveAll();
    res.json({ success: true, coverColor: color });
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
