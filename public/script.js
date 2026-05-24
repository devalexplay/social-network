/* ═══════════════════════════════════════════════════════════
   FreedomNet – script.js
   All data is stored in localStorage (no backend needed).
═══════════════════════════════════════════════════════════ */

/* ─── i18n ──────────────────────────────────────────────────── */
const I18N = {
  appName: 'FreedomNet', signIn: 'Sign in', signUp: 'Sign up',
  emailOrUsername: 'Email or username', password: 'Password',
  rememberMe: 'Remember me', forgotPassword: 'Forgot password?',
  signInBtn: 'Sign in', fullName: 'Full name', username: 'Username',
  email: 'Email', confirmPassword: 'Confirm password',
  createAccount: 'Create account', home: 'Home', explore: 'Explore',
  notifications: 'Notifications', messages: 'Messages', profile: 'Profile',
  settings: 'Settings', changeAvatar: 'Change avatar', logout: 'Logout',
  post: 'Post', trendingNow: 'Trending now', welcomeNotification: 'Welcome to FreedomNet!',
  noMessages: 'No messages yet', posts: 'Posts', followers: 'Followers',
  following: 'Following', editProfile: 'Edit profile', appearance: 'Appearance',
  theme: 'Theme', dark: 'Dark', light: 'Light', profileSettings: 'Profile Settings',
  displayName: 'Display Name', displayNameHint: 'Can be changed every 14 days',
  usernameHint: 'Can be changed every 90 days', notificationsSettings: 'Notifications',
  pushNotifications: 'Push notifications', emailUpdates: 'Email updates',
  saveChanges: 'Save changes', editPost: 'Edit post', cancel: 'Cancel',
  save: 'Save', deletePost: 'Delete post?', delete: 'Delete',
  deleteConfirm: 'Are you sure you want to delete this post? This action cannot be undone.',
  addComment: 'Add comment', comment: 'Comment',
};
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.dataset.i18n;
    if (I18N[k]) el.textContent = I18N[k];
  });
}

/* ─── Storage helpers ───────────────────────────────────────── */
const store = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: k => localStorage.removeItem(k),
};

/* ─── State ─────────────────────────────────────────────────── */
let currentUser = null;
let editingPostId = null;
let deletingPostId = null;
let commentingPostId = null;
let selectedAvatarColor = '1d9bf0';

/* ─── DOM refs ──────────────────────────────────────────────── */
const authScreen    = document.querySelector('.auth-screen');
const appEl         = document.getElementById('app');
const authMessage   = document.getElementById('authMessage');

const loginForm     = document.getElementById('loginForm');
const registerForm  = document.getElementById('registerForm');
const authTabs      = document.querySelectorAll('.auth-tab');

const postsList     = document.getElementById('postsList');
const postContent   = document.getElementById('postContent');
const createPostBtn = document.getElementById('createPostBtn');

const searchInput   = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

const pages     = document.querySelectorAll('.page');
const navBtns   = document.querySelectorAll('.nav-btn, .mobile-btn');
const pageTitle = document.getElementById('pageTitle');

const headerAvatar = document.getElementById('headerAvatar');
const headerName   = document.getElementById('headerName');
const composeAvatar= document.getElementById('composeAvatar');
const profileAvatar= document.getElementById('profileAvatar');
const profileName  = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const profileBio   = document.getElementById('profileBio');
const userPostsList= document.getElementById('userPostsList');
const userPostCount= document.getElementById('userPostCount');
const userFollowerCount = document.getElementById('userFollowerCount');
const userFollowingCount= document.getElementById('userFollowingCount');

const logoutBtn    = document.getElementById('logoutBtn');
const editAvatarBtn= document.getElementById('editAvatarBtn');

/* Modals */
const editModal    = document.getElementById('editModal');
const deleteModal  = document.getElementById('deleteModal');
const editProfileModal = document.getElementById('editProfileModal');
const commentModal = document.getElementById('commentModal');
const avatarModal  = document.getElementById('avatarModal');
const customAlert  = document.getElementById('customAlert');

/* Settings */
const displayNameInput    = document.getElementById('displayNameInput');
const usernameInput       = document.getElementById('usernameInput');
const confirmPasswordInput= document.getElementById('confirmPasswordInput');
const confirmNewPasswordInput = document.getElementById('confirmNewPasswordInput');
const saveProfileSettingsBtn = document.getElementById('saveProfileSettingsBtn');
const displayNameStatus   = document.getElementById('displayNameStatus');
const usernameStatus      = document.getElementById('usernameStatus');

/* ════════════════════════════════════════════════════════════
   AVATAR UTILS
════════════════════════════════════════════════════════════ */
function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
}

function makeAvatarSvg(name, color = '1d9bf0', size = 44) {
  const initials = getInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#${color}"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
      font-family="Syne,sans-serif" font-size="${Math.round(size*.38)}" font-weight="700" fill="#fff">${initials}</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

function userAvatar(user, size = 44) {
  return makeAvatarSvg(
    user.avatarName || user.displayName || user.fullName,
    user.avatarColor || '1d9bf0',
    size
  );
}

/* ════════════════════════════════════════════════════════════
   AUTH
════════════════════════════════════════════════════════════ */
function getUsers() { return store.get('fn_users') || {}; }
function saveUsers(u) { store.set('fn_users', u); }
function getPosts() { return store.get('fn_posts') || []; }
function savePosts(p) { store.set('fn_posts', p); }

function showAuth()  {
  authScreen.style.display = 'flex';
  appEl.classList.remove('visible');
}
function showApp()   {
  authScreen.style.display = 'none';
  appEl.classList.add('visible');
  renderApp();
}

function setAuthMsg(msg, isError = true) {
  authMessage.textContent = msg;
  authMessage.className = 'auth-message' + (isError ? '' : ' success');
}

/* Tab switching */
authTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    authTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    loginForm.classList.toggle('active', tab.dataset.tab === 'login');
    registerForm.classList.toggle('active', tab.dataset.tab === 'register');
    setAuthMsg('');
  });
});

/* Register */
registerForm.addEventListener('submit', e => {
  e.preventDefault();
  const fullName = document.getElementById('regFullName').value.trim();
  const username = document.getElementById('regUsername').value.trim().toLowerCase();
  const email    = document.getElementById('regEmail').value.trim().toLowerCase();
  const pass     = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirmPassword').value;

  if (!fullName || !username || !email || !pass) return setAuthMsg('All fields are required.');
  if (pass !== confirm) return setAuthMsg('Passwords do not match.');
  if (pass.length < 6)  return setAuthMsg('Password must be at least 6 characters.');
  if (!/^[a-z0-9_]+$/.test(username)) return setAuthMsg('Username can only contain letters, numbers, and underscores.');

  const users = getUsers();
  if (users[username]) return setAuthMsg('Username already taken.');
  if (Object.values(users).find(u => u.email === email)) return setAuthMsg('Email already in use.');

  const user = {
    id: Date.now().toString(),
    fullName, displayName: fullName, username, email,
    password: btoa(pass), // very basic obfuscation, not real security
    avatarColor: '1d9bf0', avatarName: fullName,
    bio: '', createdAt: Date.now(),
    lastDisplayNameChange: 0, lastUsernameChange: 0,
    followers: 0, following: 0,
  };
  users[username] = user;
  saveUsers(users);
  setAuthMsg('Account created! You can now sign in.', false);
  registerForm.reset();
});

/* Login */
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const identifier = document.getElementById('loginUsername').value.trim().toLowerCase();
  const pass       = document.getElementById('loginPassword').value;
  const remember   = document.getElementById('rememberMe').checked;

  const users = getUsers();
  const user  = Object.values(users).find(
    u => u.username === identifier || u.email === identifier
  );
  if (!user || atob(user.password) !== pass) return setAuthMsg('Invalid credentials.');

  currentUser = user;
  store.set('fn_session', { username: user.username, persist: remember });
  showApp();
});

/* Logout */
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  store.del('fn_session');
  showAuth();
});

/* Auto-login */
function tryAutoLogin() {
  const session = store.get('fn_session');
  if (!session) return false;
  const users = getUsers();
  const user  = users[session.username];
  if (!user) return false;
  currentUser = user;
  return true;
}

/* ════════════════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════════════════ */
const pageTitleMap = {
  home: 'Home', explore: 'Explore', notifications: 'Notifications',
  messages: 'Messages', profile: 'Profile', settings: 'Settings',
};

function navigateTo(pageName) {
  navBtns.forEach(b => b.classList.toggle('active', b.dataset.page === pageName));
  pages.forEach(p => p.classList.toggle('active', p.id === pageName + 'Page'));
  pageTitle.textContent = pageTitleMap[pageName] || pageName;

  if (pageName === 'profile') renderProfile();
  if (pageName === 'settings') populateSettings();
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

/* ════════════════════════════════════════════════════════════
   RENDER APP
════════════════════════════════════════════════════════════ */
function renderApp() {
  applyI18n();
  applyTheme(store.get('fn_theme') || 'dark');

  const src = userAvatar(currentUser, 32);
  headerAvatar.src = src;
  headerName.textContent = currentUser.displayName || currentUser.fullName;
  composeAvatar.src = userAvatar(currentUser, 44);

  renderPosts();
  navigateTo('home');
}

/* ════════════════════════════════════════════════════════════
   POSTS
════════════════════════════════════════════════════════════ */
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)   return 'just now';
  if (s < 3600) return Math.floor(s/60)   + 'm ago';
  if (s < 86400)return Math.floor(s/3600) + 'h ago';
  return Math.floor(s/86400) + 'd ago';
}

function renderPosts() {
  const posts = getPosts();
  postsList.innerHTML = '';
  if (!posts.length) {
    postsList.innerHTML = '<p style="padding:24px;color:var(--text3);text-align:center">No posts yet. Be the first!</p>';
    return;
  }
  posts.slice().reverse().forEach(post => {
    postsList.appendChild(buildPostCard(post, false));
  });
}

function buildPostCard(post, isProfile) {
  const users = getUsers();
  const author = users[post.authorUsername] || { displayName: post.authorName, username: post.authorUsername, avatarColor: '1d9bf0', avatarName: post.authorName };
  const isOwner = currentUser && currentUser.username === post.authorUsername;
  const liked = post.likes && post.likes.includes(currentUser?.username);

  const card = document.createElement('div');
  card.className = 'post-card';
  card.dataset.id = post.id;

  card.innerHTML = `
    <img class="avatar-medium" src="${userAvatar(author, 44)}" alt="">
    <div class="post-body">
      <div class="post-header">
        <div class="post-meta">
          <span class="post-author">${escHtml(author.displayName || author.fullName || author.username)}</span>
          <span class="post-handle">@${escHtml(author.username)}</span>
          <span class="post-time">${timeAgo(post.createdAt)}</span>
        </div>
        ${isOwner ? `
        <div class="post-controls">
          <button class="post-ctrl-btn edit" data-action="edit" data-id="${post.id}" title="Edit">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="post-ctrl-btn del" data-action="delete" data-id="${post.id}" title="Delete">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>` : ''}
      </div>
      <p class="post-text">${escHtml(post.content)}</p>
      <div class="post-actions">
        <button class="post-action-btn ${liked ? 'liked' : ''}" data-action="like" data-id="${post.id}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="${liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span class="post-action-count">${(post.likes || []).length || ''}</span>
        </button>
        <button class="post-action-btn" data-action="comment" data-id="${post.id}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span class="post-action-count">${(post.comments || []).length || ''}</span>
        </button>
        <button class="post-action-btn" data-action="repost" data-id="${post.id}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          <span class="post-action-count">${post.reposts || ''}</span>
        </button>
      </div>
      ${buildCommentsHtml(post)}
    </div>
  `;

  /* Events */
  card.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      handlePostAction(btn.dataset.action, btn.dataset.id);
    });
  });

  return card;
}

function buildCommentsHtml(post) {
  if (!post.comments || !post.comments.length) return '';
  const users = getUsers();
  const items = post.comments.map(c => {
    const u = users[c.authorUsername] || { displayName: c.authorName };
    return `
      <div class="comment-item">
        <img class="avatar-small" src="${userAvatar(u, 32)}" alt="">
        <div class="comment-body">
          <span class="comment-author">${escHtml(u.displayName || u.username || c.authorName)}</span>
          <p class="comment-text">${escHtml(c.content)}</p>
          <span class="comment-time">${timeAgo(c.createdAt)}</span>
        </div>
      </div>`;
  }).join('');
  return `<div class="comments-section">${items}</div>`;
}

function handlePostAction(action, postId) {
  const posts = getPosts();
  const idx   = posts.findIndex(p => p.id === postId);
  if (idx === -1) return;

  if (action === 'like') {
    const post = posts[idx];
    if (!post.likes) post.likes = [];
    const ui = post.likes.indexOf(currentUser.username);
    ui === -1 ? post.likes.push(currentUser.username) : post.likes.splice(ui, 1);
    savePosts(posts);
    renderPosts();
    if (document.getElementById('profilePage').classList.contains('active')) renderProfile();
  }
  if (action === 'comment') {
    commentingPostId = postId;
    document.getElementById('commentInput').value = '';
    openModal(commentModal);
  }
  if (action === 'repost') {
    posts[idx].reposts = (posts[idx].reposts || 0) + 1;
    savePosts(posts);
    renderPosts();
    showAlert('Reposted!');
  }
  if (action === 'edit') {
    editingPostId = postId;
    document.getElementById('editPostContent').value = posts[idx].content;
    openModal(editModal);
  }
  if (action === 'delete') {
    deletingPostId = postId;
    openModal(deleteModal);
  }
}

/* Create post */
createPostBtn.addEventListener('click', () => {
  const text = postContent.value.trim();
  if (!text) return;
  const posts = getPosts();
  posts.push({
    id: Date.now().toString(),
    authorUsername: currentUser.username,
    authorName: currentUser.displayName || currentUser.fullName,
    content: text,
    createdAt: Date.now(),
    likes: [], comments: [], reposts: 0,
  });
  savePosts(posts);
  postContent.value = '';
  renderPosts();
  updatePostCount();
});

/* ════════════════════════════════════════════════════════════
   MODALS
════════════════════════════════════════════════════════════ */
function openModal(modal)  { modal.classList.add('open'); }
function closeModal(modal) { modal.classList.remove('open'); }

/* Edit post */
document.getElementById('closeEditModal').addEventListener('click', () => closeModal(editModal));
document.getElementById('saveEditBtn').addEventListener('click', () => {
  const text = document.getElementById('editPostContent').value.trim();
  if (!text) return;
  const posts = getPosts();
  const idx   = posts.findIndex(p => p.id === editingPostId);
  if (idx !== -1) { posts[idx].content = text; savePosts(posts); }
  closeModal(editModal);
  renderPosts();
  if (document.getElementById('profilePage').classList.contains('active')) renderProfile();
});

/* Delete post */
document.getElementById('cancelDeleteBtn').addEventListener('click', () => closeModal(deleteModal));
document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
  let posts = getPosts().filter(p => p.id !== deletingPostId);
  savePosts(posts);
  closeModal(deleteModal);
  renderPosts();
  if (document.getElementById('profilePage').classList.contains('active')) renderProfile();
  updatePostCount();
});

/* Comment */
document.getElementById('closeCommentModal').addEventListener('click', () => closeModal(commentModal));
document.getElementById('submitCommentBtn').addEventListener('click', () => {
  const text = document.getElementById('commentInput').value.trim();
  if (!text) return;
  const posts = getPosts();
  const idx   = posts.findIndex(p => p.id === commentingPostId);
  if (idx !== -1) {
    if (!posts[idx].comments) posts[idx].comments = [];
    posts[idx].comments.push({
      id: Date.now().toString(),
      authorUsername: currentUser.username,
      authorName: currentUser.displayName || currentUser.fullName,
      content: text,
      createdAt: Date.now(),
    });
    savePosts(posts);
  }
  closeModal(commentModal);
  renderPosts();
  if (document.getElementById('profilePage').classList.contains('active')) renderProfile();
});

/* Edit profile */
document.getElementById('editProfileBtn').addEventListener('click', () => {
  document.getElementById('editBioInput').value = currentUser.bio || '';
  openModal(editProfileModal);
});
document.getElementById('closeProfileModal').addEventListener('click', () => closeModal(editProfileModal));
document.getElementById('saveProfileBtn').addEventListener('click', () => {
  const bio = document.getElementById('editBioInput').value.trim();
  currentUser.bio = bio;
  syncUser();
  closeModal(editProfileModal);
  renderProfile();
});

/* Close modals on backdrop click */
[editModal, deleteModal, editProfileModal, commentModal, avatarModal].forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) closeModal(m); });
});

/* ════════════════════════════════════════════════════════════
   AVATAR MODAL
════════════════════════════════════════════════════════════ */
editAvatarBtn.addEventListener('click', () => {
  selectedAvatarColor = currentUser.avatarColor || '1d9bf0';
  document.getElementById('avatarNameInput').value = currentUser.avatarName || currentUser.displayName || currentUser.fullName;
  updateAvatarPreview();
  document.querySelectorAll('.avatar-color').forEach(el => {
    el.classList.toggle('selected', el.dataset.color === selectedAvatarColor);
  });
  openModal(avatarModal);
});

document.querySelectorAll('.avatar-color').forEach(el => {
  el.addEventListener('click', () => {
    selectedAvatarColor = el.dataset.color;
    document.querySelectorAll('.avatar-color').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    updateAvatarPreview();
  });
});
document.getElementById('avatarNameInput').addEventListener('input', updateAvatarPreview);

function updateAvatarPreview() {
  const name  = document.getElementById('avatarNameInput').value || currentUser.displayName || currentUser.fullName;
  const color = selectedAvatarColor;
  document.getElementById('avatarPreview').src = makeAvatarSvg(name, color, 80);
}

document.getElementById('closeAvatarModal').addEventListener('click', () => closeModal(avatarModal));
document.getElementById('saveAvatarBtn').addEventListener('click', () => {
  const name = document.getElementById('avatarNameInput').value.trim() || currentUser.displayName || currentUser.fullName;
  currentUser.avatarColor = selectedAvatarColor;
  currentUser.avatarName  = name;
  syncUser();
  closeModal(avatarModal);
  renderApp();
});

/* ════════════════════════════════════════════════════════════
   PROFILE PAGE
════════════════════════════════════════════════════════════ */
function renderProfile() {
  profileAvatar.src = userAvatar(currentUser, 84);
  profileName.textContent     = currentUser.displayName || currentUser.fullName;
  profileUsername.textContent = '@' + currentUser.username;
  profileBio.textContent      = currentUser.bio || '';

  const posts = getPosts().filter(p => p.authorUsername === currentUser.username);
  userPostCount.textContent   = posts.length;
  userFollowerCount.textContent  = currentUser.followers  || 0;
  userFollowingCount.textContent = currentUser.following  || 0;

  userPostsList.innerHTML = '';
  posts.slice().reverse().forEach(post => {
    userPostsList.appendChild(buildPostCard(post, true));
  });
}

function updatePostCount() {
  const posts = getPosts().filter(p => p.authorUsername === currentUser.username);
  userPostCount.textContent = posts.length;
}

/* ════════════════════════════════════════════════════════════
   SEARCH / EXPLORE
════════════════════════════════════════════════════════════ */
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { searchResults.style.display = 'none'; return; }

  const users = getUsers();
  const posts = getPosts();

  const matchedUsers = Object.values(users).filter(u =>
    u.username.includes(q) || (u.displayName || '').toLowerCase().includes(q) || (u.fullName || '').toLowerCase().includes(q)
  );
  const matchedPosts = posts.filter(p => p.content.toLowerCase().includes(q));

  searchResults.innerHTML = '';
  searchResults.style.display = 'flex';

  if (matchedUsers.length) {
    const h = document.createElement('p');
    h.style.cssText = 'font-weight:600;font-size:.8rem;color:var(--text2);padding:4px 0;';
    h.textContent = 'People';
    searchResults.appendChild(h);

    matchedUsers.slice(0, 5).forEach(u => {
      const el = document.createElement('div');
      el.className = 'search-result-item';
      el.innerHTML = `
        <img class="avatar-medium" src="${userAvatar(u, 44)}" alt="">
        <div class="search-result-info">
          <div class="result-name">${escHtml(u.displayName || u.fullName)}</div>
          <div class="result-handle">@${escHtml(u.username)}</div>
        </div>`;
      searchResults.appendChild(el);
    });
  }

  if (matchedPosts.length) {
    const h = document.createElement('p');
    h.style.cssText = 'font-weight:600;font-size:.8rem;color:var(--text2);padding:4px 0;margin-top:8px;';
    h.textContent = 'Posts';
    searchResults.appendChild(h);
    matchedPosts.slice(0, 5).forEach(p => {
      const u = getUsers()[p.authorUsername] || { displayName: p.authorName, username: p.authorUsername, avatarColor: '1d9bf0', avatarName: p.authorName };
      const el = document.createElement('div');
      el.className = 'search-result-item';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'flex-start';
      el.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px">
          <img class="avatar-small" src="${userAvatar(u, 32)}" alt="">
          <span style="font-weight:600;font-size:.84rem">@${escHtml(u.username)}</span>
          <span style="font-size:.75rem;color:var(--text3)">${timeAgo(p.createdAt)}</span>
        </div>
        <p style="font-size:.88rem;color:var(--text);margin-top:6px;line-height:1.4">${escHtml(p.content.slice(0, 120))}${p.content.length > 120 ? '…' : ''}</p>`;
      searchResults.appendChild(el);
    });
  }

  if (!matchedUsers.length && !matchedPosts.length) {
    searchResults.innerHTML = '<p style="color:var(--text3);font-size:.9rem;padding:12px 0">No results found.</p>';
  }
});

/* ════════════════════════════════════════════════════════════
   SETTINGS
════════════════════════════════════════════════════════════ */
function populateSettings() {
  displayNameInput.value = currentUser.displayName || currentUser.fullName;
  usernameInput.value    = currentUser.username;
  displayNameStatus.textContent = '';
  usernameStatus.textContent    = '';

  const activeTheme = store.get('fn_theme') || 'dark';
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === activeTheme);
  });
}

/* Theme */
document.querySelectorAll('.theme-option').forEach(btn => {
  btn.addEventListener('click', () => {
    applyTheme(btn.dataset.theme);
    document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  store.set('fn_theme', theme);
}

/* Save profile settings */
saveProfileSettingsBtn.addEventListener('click', () => {
  const newDisplayName = displayNameInput.value.trim();
  const newUsername    = usernameInput.value.trim().toLowerCase();
  const confirmPass    = confirmPasswordInput.value;
  const newPass        = confirmNewPasswordInput.value;

  displayNameStatus.textContent = '';
  usernameStatus.textContent    = '';

  if (!newDisplayName) return displayNameStatus.textContent = 'Display name cannot be empty.';
  if (!newUsername)    return usernameStatus.textContent = 'Username cannot be empty.';
  if (!/^[a-z0-9_]+$/.test(newUsername)) return (usernameStatus.textContent = 'Invalid username format.');

  /* Cooldowns */
  const now = Date.now();
  const DAY = 86400000;

  if (newDisplayName !== (currentUser.displayName || currentUser.fullName)) {
    if (now - (currentUser.lastDisplayNameChange || 0) < 14 * DAY) {
      const left = Math.ceil((14 * DAY - (now - currentUser.lastDisplayNameChange)) / DAY);
      return (displayNameStatus.textContent = `Wait ${left} more day(s) to change display name.`);
    }
    currentUser.displayName = newDisplayName;
    currentUser.lastDisplayNameChange = now;
  }

  if (newUsername !== currentUser.username) {
    if (now - (currentUser.lastUsernameChange || 0) < 90 * DAY) {
      const left = Math.ceil((90 * DAY - (now - currentUser.lastUsernameChange)) / DAY);
      return (usernameStatus.textContent = `Wait ${left} more day(s) to change username.`);
    }
    const users = getUsers();
    if (users[newUsername]) return (usernameStatus.textContent = 'Username already taken.');
    const old = currentUser.username;
    delete users[old];
    currentUser.username = newUsername;
    currentUser.lastUsernameChange = now;
    users[newUsername] = currentUser;
    saveUsers(users);
    store.set('fn_session', { username: newUsername, persist: true });
  }

  if (newPass) {
    if (!confirmPass) return showAlert('Enter current password to set a new one.');
    if (atob(currentUser.password) !== confirmPass) return showAlert('Current password is incorrect.');
    if (newPass.length < 6) return showAlert('New password must be at least 6 characters.');
    currentUser.password = btoa(newPass);
  }

  syncUser();
  showAlert('Profile settings saved!');
  renderApp();
});

/* ════════════════════════════════════════════════════════════
   CUSTOM ALERT
════════════════════════════════════════════════════════════ */
function showAlert(msg) {
  document.getElementById('alertMessage').textContent = msg;
  customAlert.classList.add('open');
}
document.getElementById('alertOkBtn').addEventListener('click', () => customAlert.classList.remove('open'));
customAlert.addEventListener('click', e => { if (e.target === customAlert) customAlert.classList.remove('open'); });

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
function syncUser() {
  const users = getUsers();
  users[currentUser.username] = currentUser;
  saveUsers(users);
}

function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* Password visibility toggles */
document.querySelectorAll('.password-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    target.type  = target.type === 'password' ? 'text' : 'password';
  });
});

/* Forgot password placeholder */
document.querySelector('.forgot-link')?.addEventListener('click', e => {
  e.preventDefault();
  showAlert('Password reset is not available in this demo.');
});

/* ════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════ */
applyI18n();
applyTheme(store.get('fn_theme') || 'dark');

if (tryAutoLogin()) {
  showApp();
} else {
  showAuth();
}
