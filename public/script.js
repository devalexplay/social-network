const API_URL = window.location.origin;
let currentUser = null;
let currentPage = 'home';
let allPosts = [];
let currentEditPostId = null;
let currentDeletePostId = null;
let currentCommentPostId = null;
let userLikedPosts = new Set();
let userRepostedPosts = new Set();
let userSavedPosts = new Set();

const translations = {
    en: {
        appName: 'FreedomNet', signIn: 'Sign in', signUp: 'Sign up',
        emailOrUsername: 'Email or username', password: 'Password',
        rememberMe: 'Remember me', forgotPassword: 'Forgot password?',
        signInBtn: 'Sign in', fullName: 'Full name', username: 'Username',
        email: 'Email', confirmPassword: 'Confirm password', createAccount: 'Create account',
        home: 'Home', explore: 'Explore', notifications: 'Notifications',
        messages: 'Messages', profile: 'Profile', settings: 'Settings',
        logout: 'Logout', post: 'Post', trendingNow: 'Trending now',
        welcomeNotification: 'Welcome to FreedomNet!', noMessages: 'No messages yet',
        posts: 'Posts', followers: 'Followers', following: 'Following',
        editProfile: 'Edit profile', appearance: 'Appearance', theme: 'Theme',
        dark: 'Dark', light: 'Light', language: 'Language',
        notificationsSettings: 'Notifications', pushNotifications: 'Push notifications',
        emailUpdates: 'Email updates', saveChanges: 'Save changes',
        editPost: 'Edit post', cancel: 'Cancel', save: 'Save',
        deletePost: 'Delete post?', deleteConfirm: 'Are you sure you want to delete this post? This action cannot be undone.',
        delete: 'Delete', addComment: 'Add comment', comment: 'Comment',
        edit: 'Edit', delete_: 'Delete', changeAvatar: 'Change avatar',
        profileSettings: 'Profile Settings', displayName: 'Display Name',
        displayNameHint: 'Can be changed every 14 days', usernameHint: 'Can be changed every 90 days'
    },
    zh: {
        appName: '自由网', signIn: '登录', signUp: '注册',
        emailOrUsername: '邮箱或用户名', password: '密码',
        rememberMe: '记住我', forgotPassword: '忘记密码？',
        signInBtn: '登录', fullName: '全名', username: '用户名',
        email: '邮箱', confirmPassword: '确认密码', createAccount: '创建账户',
        home: '首页', explore: '探索', notifications: '通知',
        messages: '消息', profile: '个人资料', settings: '设置',
        logout: '退出', post: '发布', trendingNow: '热门趋势',
        welcomeNotification: '欢迎来到自由网！', noMessages: '暂无消息',
        posts: '帖子', followers: '粉丝', following: '关注',
        editProfile: '编辑资料', appearance: '外观', theme: '主题',
        dark: '深色', light: '浅色', language: '语言',
        notificationsSettings: '通知设置', pushNotifications: '推送通知',
        emailUpdates: '邮件更新', saveChanges: '保存更改',
        editPost: '编辑帖子', cancel: '取消', save: '保存',
        deletePost: '删除帖子？', deleteConfirm: '确定要删除此帖子吗？此操作无法撤销。',
        delete: '删除', addComment: '添加评论', comment: '评论',
        edit: '编辑', delete_: '删除', changeAvatar: '更换头像',
        profileSettings: '个人资料设置', displayName: '显示名称',
        displayNameHint: '每14天可更改一次', usernameHint: '每90天可更改一次'
    }
};

let currentLanguage = 'en';

function updateLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });
}

const authScreen = document.querySelector('.auth-screen');
const app = document.getElementById('app');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authMessage = document.getElementById('authMessage');

document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(`${target}Form`).classList.add('active');
        authMessage.classList.remove('show');
    });
});

document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        target.type = target.type === 'password' ? 'text' : 'password';
    });
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!username || !password) {
        showAuthMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            if (rememberMe) localStorage.setItem('token', data.token);
            else sessionStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            showAuthMessage('Welcome back!', 'success');
            setTimeout(() => initApp(data.user), 500);
        } else {
            showAuthMessage(data.error, 'error');
        }
    } catch (error) {
        showAuthMessage('Connection error', 'error');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('regFullName').value;
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;
    
    if (!fullName || !username || !email || !password) {
        showAuthMessage('All fields required', 'error');
        return;
    }
    if (password !== confirm) {
        showAuthMessage('Passwords do not match', 'error');
        return;
    }
    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, username, email, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            showAuthMessage('Account created!', 'success');
            setTimeout(() => initApp(data.user), 500);
        } else {
            showAuthMessage(data.error, 'error');
        }
    } catch (error) {
        showAuthMessage('Connection error', 'error');
    }
});

function showAuthMessage(msg, type) {
    authMessage.textContent = msg;
    authMessage.className = `auth-message show ${type}`;
    setTimeout(() => authMessage.classList.remove('show'), 3000);
}

function showCustomAlert(message) {
    const alert = document.getElementById('customAlert');
    document.getElementById('alertMessage').textContent = message;
    alert.classList.add('active');
    document.getElementById('alertOkBtn').onclick = () => {
        alert.classList.remove('active');
    };
}

async function loadUserInteractions() {
    const res = await fetch(`${API_URL}/api/user/liked`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
    });
    const data = await res.json();
    userLikedPosts = new Set(data.liked);
    userRepostedPosts = new Set(data.reposted);
    userSavedPosts = new Set(data.saved);
}

async function initApp(user) {
    currentUser = user;
    authScreen.style.display = 'none';
    app.classList.add('active');
    
    document.getElementById('headerAvatar').src = user.avatar;
    document.getElementById('headerName').textContent = user.displayName || user.fullName || user.username;
    document.getElementById('composeAvatar').src = user.avatar;
    document.getElementById('profileAvatar').src = user.avatar;
    document.getElementById('profileName').textContent = user.displayName || user.fullName || user.username;
    document.getElementById('profileUsername').textContent = `@${user.username}`;
    document.getElementById('profileBio').textContent = user.bio || 'No bio yet';
    document.getElementById('userFollowerCount').textContent = user.followers || 0;
    document.getElementById('userFollowingCount').textContent = user.following || 0;
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    const savedLang = localStorage.getItem('language') || 'en';
    updateLanguage(savedLang);
    
    await loadUserInteractions();
    await loadPosts();
}

document.querySelectorAll('.nav-btn, .mobile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        switchPage(page);
    });
});

function switchPage(page) {
    currentPage = page;
    
    document.querySelectorAll('.nav-btn').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.mobile-btn').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-btn[data-page="${page}"]`)?.classList.add('active');
    document.querySelector(`.mobile-btn[data-page="${page}"]`)?.classList.add('active');
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}Page`).classList.add('active');
    
    const titles = {
        home: 'home', explore: 'explore', notifications: 'notifications',
        messages: 'messages', profile: 'profile', settings: 'settings'
    };
    const titleKey = titles[page] || 'home';
    document.getElementById('pageTitle').textContent = translations[currentLanguage][titleKey] || titleKey;
    
    if (page === 'home') loadPosts();
    if (page === 'profile') loadUserPosts();
}

document.getElementById('createPostBtn').addEventListener('click', async () => {
    const content = document.getElementById('postContent').value;
    if (!content.trim()) return;
    
    const btn = document.getElementById('createPostBtn');
    btn.disabled = true;
    btn.textContent = 'Posting...';
    
    const res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, content })
    });
    
    if (res.ok) {
        document.getElementById('postContent').value = '';
        await loadPosts();
    }
    
    btn.disabled = false;
    btn.textContent = translations[currentLanguage].post || 'Post';
});

async function loadPosts() {
    const res = await fetch(`${API_URL}/api/posts`);
    allPosts = await res.json();
    const feed = document.getElementById('postsList');
    
    if (allPosts.length === 0) {
        feed.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-tertiary)">No posts yet. Be the first!</div>';
        return;
    }
    
    feed.innerHTML = allPosts.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            <img class="post-avatar" src="${post.user?.avatar}" onerror="this.src='https://ui-avatars.com/api/?name=${post.user?.username}&background=1d9bf0&color=fff'">
            <div class="post-body">
                <div class="post-header">
                    <span class="post-name">${escapeHtml(post.user?.displayName || post.user?.username)}</span>
                    <span class="post-username">@${escapeHtml(post.user?.username)}</span>
                    <span class="post-time">${formatTime(post.createdAt)}</span>
                    ${post.userId === currentUser.id ? `
                        <div class="post-menu">
                            <button class="menu-btn" onclick="toggleMenu(event, '${post.id}')">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="1"/>
                                    <circle cx="12" cy="5" r="1"/>
                                    <circle cx="12" cy="19" r="1"/>
                                </svg>
                            </button>
                            <div class="post-menu-dropdown" id="menu-${post.id}">
                                <div class="dropdown-item" onclick="editPost('${post.id}', '${escapeHtml(post.content).replace(/'/g, "\\'")}')">${translations[currentLanguage].edit || 'Edit'}</div>
                                <div class="dropdown-item delete" onclick="deletePost('${post.id}')">${translations[currentLanguage].delete_ || 'Delete'}</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="post-text">${escapeHtml(post.content)}</div>
                <div class="post-actions">
                    <button class="action-btn like" onclick="likePost('${post.id}')" ${userLikedPosts.has(post.id) ? 'style="color:var(--error)"' : ''}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="${userLikedPosts.has(post.id) ? '#f4212e' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <span>${post.likes}</span>
                    </button>
                    <button class="action-btn comment" onclick="openCommentModal('${post.id}')">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>${post.comments?.length || 0}</span>
                    </button>
                    <button class="action-btn repost" onclick="repostPost('${post.id}')" ${userRepostedPosts.has(post.id) ? 'style="color:var(--success)"' : ''}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 1l4 4-4 4"/>
                            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                            <path d="M7 23l-4-4 4-4"/>
                            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                        </svg>
                        <span>${post.reposts || 0}</span>
                    </button>
                    <button class="action-btn save ${userSavedPosts.has(post.id) ? 'saved' : ''}" onclick="savePost('${post.id}')">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="${userSavedPosts.has(post.id) ? '#ffd700' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                    </button>
                </div>
                ${post.comments && post.comments.length > 0 ? `
                    <div class="post-comments" style="margin-top:12px;padding-top:8px;border-top:1px solid var(--border-color)">
                        ${post.comments.slice(0, 2).map(c => `
                            <div class="comment-item" style="font-size:13px;margin-bottom:8px">
                                <strong style="color:var(--text-primary)">${escapeHtml(c.displayName || c.username)}</strong>
                                <span style="color:var(--text-tertiary)"> ${escapeHtml(c.comment)}</span>
                            </div>
                        `).join('')}
                        ${post.comments.length > 2 ? `<div style="color:var(--text-tertiary);font-size:12px;cursor:pointer" onclick="openCommentModal('${post.id}')">+${post.comments.length - 2} more comments</div>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    const userPosts = allPosts.filter(p => p.userId === currentUser.id);
    document.getElementById('userPostCount').textContent = userPosts.length;
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
}

window.toggleMenu = function(event, postId) {
    event.stopPropagation();
    document.querySelectorAll('.post-menu-dropdown').forEach(menu => {
        if (menu.id !== `menu-${postId}`) {
            menu.classList.remove('show');
        }
    });
    const menu = document.getElementById(`menu-${postId}`);
    menu.classList.toggle('show');
};

document.addEventListener('click', function() {
    document.querySelectorAll('.post-menu-dropdown').forEach(menu => {
        menu.classList.remove('show');
    });
});

window.editPost = function(postId, currentContent) {
    currentEditPostId = postId;
    document.getElementById('editPostContent').value = currentContent;
    document.getElementById('editModal').classList.add('active');
};

window.deletePost = function(postId) {
    currentDeletePostId = postId;
    document.getElementById('deleteModal').classList.add('active');
};

window.likePost = async (postId) => {
    if (userLikedPosts.has(postId)) {
        showCustomAlert('You already liked this post');
        return;
    }
    const res = await fetch(`${API_URL}/api/posts/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: currentUser.id })
    });
    const data = await res.json();
    if (data.success) {
        userLikedPosts.add(postId);
        loadPosts();
    }
};

window.repostPost = async (postId) => {
    if (userRepostedPosts.has(postId)) {
        showCustomAlert('You already reposted this post');
        return;
    }
    const res = await fetch(`${API_URL}/api/posts/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: currentUser.id })
    });
    const data = await res.json();
    if (data.success) {
        userRepostedPosts.add(postId);
        loadPosts();
        showCustomAlert('Post reposted!');
    }
};

window.savePost = async (postId) => {
    const res = await fetch(`${API_URL}/api/posts/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: currentUser.id })
    });
    const data = await res.json();
    if (data.saved) {
        userSavedPosts.add(postId);
        showCustomAlert('Post saved!');
    } else {
        userSavedPosts.delete(postId);
        showCustomAlert('Post removed from saves');
    }
    loadPosts();
};

window.openCommentModal = function(postId) {
    currentCommentPostId = postId;
    document.getElementById('commentInput').value = '';
    document.getElementById('commentModal').classList.add('active');
};

document.getElementById('submitCommentBtn').addEventListener('click', async () => {
    const comment = document.getElementById('commentInput').value;
    if (!comment.trim()) return;
    
    await fetch(`${API_URL}/api/posts/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: currentCommentPostId, userId: currentUser.id, comment })
    });
    document.getElementById('commentModal').classList.remove('active');
    loadPosts();
});

document.getElementById('saveEditBtn').addEventListener('click', async () => {
    const newContent = document.getElementById('editPostContent').value;
    if (!newContent.trim()) return;
    
    await fetch(`${API_URL}/api/posts/${currentEditPostId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
    });
    document.getElementById('editModal').classList.remove('active');
    loadPosts();
    showCustomAlert('Post updated!');
});

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    await fetch(`${API_URL}/api/posts/${currentDeletePostId}`, {
        method: 'DELETE'
    });
    document.getElementById('deleteModal').classList.remove('active');
    loadPosts();
    showCustomAlert('Post deleted!');
});

document.getElementById('closeEditModal').addEventListener('click', () => {
    document.getElementById('editModal').classList.remove('active');
});

document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    document.getElementById('deleteModal').classList.remove('active');
});

document.getElementById('closeCommentModal').addEventListener('click', () => {
    document.getElementById('commentModal').classList.remove('active');
});

async function loadUserPosts() {
    const userPosts = allPosts.filter(p => p.userId === currentUser.id);
    const container = document.getElementById('userPostsList');
    if (container) {
        if (userPosts.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-tertiary)">No posts yet</div>';
            return;
        }
        container.innerHTML = userPosts.map(post => `
            <div class="post-card">
                <img class="post-avatar" src="${currentUser.avatar}">
                <div class="post-body">
                    <div class="post-text">${escapeHtml(post.content)}</div>
                    <div class="post-actions">
                        <span style="color:var(--text-tertiary);display:flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> ${post.likes}</span>
                        <span style="color:var(--text-tertiary);display:flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> ${post.comments?.length || 0}</span>
                        <span style="color:var(--text-tertiary);display:flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> ${post.reposts || 0}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
});

document.getElementById('editProfileBtn')?.addEventListener('click', () => {
    document.getElementById('editBioInput').value = currentUser.bio || '';
    document.getElementById('editProfileModal').classList.add('active');
});

document.getElementById('closeProfileModal')?.addEventListener('click', () => {
    document.getElementById('editProfileModal').classList.remove('active');
});

document.getElementById('saveProfileBtn')?.addEventListener('click', async () => {
    const bio = document.getElementById('editBioInput').value;
    const res = await fetch(`${API_URL}/api/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, bio })
    });
    if (res.ok) {
        const data = await res.json();
        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        document.getElementById('profileBio').textContent = bio || 'No bio yet';
        document.getElementById('editProfileModal').classList.remove('active');
        showCustomAlert('Profile updated!');
    }
});

document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
});

document.getElementById('saveProfileSettingsBtn')?.addEventListener('click', async () => {
    const newDisplayName = document.getElementById('displayNameInput').value;
    const newUsername = document.getElementById('usernameInput').value;
    const password = document.getElementById('confirmPasswordInput').value;
    const confirmPassword = document.getElementById('confirmNewPasswordInput').value;
    
    if (password !== confirmPassword) {
        showCustomAlert('Passwords do not match');
        return;
    }
    
    if (newDisplayName) {
        const res = await fetch(`${API_URL}/api/user/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, displayName: newDisplayName })
        });
        const data = await res.json();
        if (res.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            document.getElementById('displayNameStatus').textContent = 'Display name updated!';
            document.getElementById('displayNameStatus').className = 'settings-status success';
            document.getElementById('profileName').textContent = currentUser.displayName;
            document.getElementById('headerName').textContent = currentUser.displayName;
            setTimeout(() => {
                document.getElementById('displayNameStatus').textContent = '';
            }, 3000);
        } else {
            document.getElementById('displayNameStatus').textContent = data.error || 'Error';
            document.getElementById('displayNameStatus').className = 'settings-status error';
        }
    }
    
    if (newUsername && password) {
        const res = await fetch(`${API_URL}/api/user/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, username: newUsername, password: password })
        });
        const data = await res.json();
        if (res.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            document.getElementById('usernameStatus').textContent = 'Username updated!';
            document.getElementById('usernameStatus').className = 'settings-status success';
            document.getElementById('profileUsername').textContent = `@${currentUser.username}`;
            setTimeout(() => {
                document.getElementById('usernameStatus').textContent = '';
            }, 3000);
        } else {
            document.getElementById('usernameStatus').textContent = data.error || 'Error';
            document.getElementById('usernameStatus').className = 'settings-status error';
        }
    }
    
    document.getElementById('displayNameInput').value = '';
    document.getElementById('usernameInput').value = '';
    document.getElementById('confirmPasswordInput').value = '';
    document.getElementById('confirmNewPasswordInput').value = '';
});

document.getElementById('editAvatarBtn')?.addEventListener('click', () => {
    document.getElementById('avatarPreview').src = currentUser.avatar;
    document.getElementById('avatarModal').classList.add('active');
});

document.getElementById('closeAvatarModal')?.addEventListener('click', () => {
    document.getElementById('avatarModal').classList.remove('active');
});

let selectedAvatarColor = '1d9bf0';
let avatarText = '';

document.querySelectorAll('.avatar-color').forEach(colorBtn => {
    colorBtn.addEventListener('click', () => {
        document.querySelectorAll('.avatar-color').forEach(c => c.classList.remove('selected'));
        colorBtn.classList.add('selected');
        selectedAvatarColor = colorBtn.dataset.color;
        updateAvatarPreview();
    });
});

document.getElementById('avatarNameInput')?.addEventListener('input', (e) => {
    avatarText = e.target.value.toUpperCase().slice(0, 2);
    updateAvatarPreview();
});

function updateAvatarPreview() {
    const name = avatarText || (currentUser?.displayName?.[0] || currentUser?.username?.[0] || 'U');
    const preview = document.getElementById('avatarPreview');
    if (preview) {
        preview.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${selectedAvatarColor}&color=fff&bold=true&size=128&rounded=true`;
    }
}

document.getElementById('saveAvatarBtn')?.addEventListener('click', async () => {
    const name = avatarText || (currentUser.displayName || currentUser.username);
    const newAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.slice(0, 2))}&background=${selectedAvatarColor}&color=fff&bold=true&size=128&rounded=true`;
    
    const res = await fetch(`${API_URL}/api/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, avatar: newAvatar })
    });
    
    if (res.ok) {
        const data = await res.json();
        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        document.getElementById('headerAvatar').src = newAvatar;
        document.getElementById('composeAvatar').src = newAvatar;
        document.getElementById('profileAvatar').src = newAvatar;
        
        document.getElementById('avatarModal').classList.remove('active');
        showCustomAlert('Avatar updated!');
        loadPosts();
    }
});

document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const searchResults = document.getElementById('searchResults');
    const trendingCard = document.querySelector('.trending-card');
    
    if (query.length > 0) {
        const filteredPosts = allPosts.filter(post => 
            post.content.toLowerCase().includes(query) ||
            post.user?.displayName?.toLowerCase().includes(query) ||
            post.user?.username?.toLowerCase().includes(query)
        );
        
        if (filteredPosts.length > 0) {
            trendingCard.style.display = 'none';
            searchResults.style.display = 'block';
            searchResults.innerHTML = filteredPosts.map(post => `
                <div class="search-result-item" onclick="scrollToPost('${post.id}')">
                    <div style="font-weight:600">${escapeHtml(post.user?.displayName || post.user?.username)}</div>
                    <div style="color:var(--text-tertiary);font-size:13px">${escapeHtml(post.content.substring(0, 100))}${post.content.length > 100 ? '...' : ''}</div>
                </div>
            `).join('');
        } else {
            trendingCard.style.display = 'block';
            searchResults.style.display = 'none';
        }
    } else {
        trendingCard.style.display = 'block';
        searchResults.style.display = 'none';
    }
});

window.scrollToPost = function(postId) {
    const postElement = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        postElement.style.background = 'var(--bg-hover)';
        setTimeout(() => {
            postElement.style.background = '';
        }, 2000);
    }
    switchPage('home');
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function checkAuth() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
        currentUser = JSON.parse(user);
        initApp(currentUser);
    }
}

checkAuth();
