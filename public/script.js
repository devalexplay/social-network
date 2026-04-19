const API_URL = window.location.origin;
let currentUser = null;
let currentView = 'home';
let allPosts = [];

const authContainer = document.querySelector('.auth-wrapper');
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
            showAuthMessage('Welcome to FreedomNet!', 'success');
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
        showAuthMessage('Password too short', 'error');
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

function initApp(user) {
    currentUser = user;
    authContainer.style.display = 'none';
    app.classList.add('active');
    
    document.getElementById('headerAvatar').src = user.avatar;
    document.getElementById('headerName').textContent = user.fullName || user.username;
    document.getElementById('composerAvatar').src = user.avatar;
    document.getElementById('profileAvatar').src = user.avatar;
    document.getElementById('profileName').textContent = user.fullName || user.username;
    document.getElementById('profileUsername').textContent = `@${user.username}`;
    document.getElementById('profileBio').textContent = user.bio || 'Welcome to FreedomNet!';
    document.getElementById('followerCount').textContent = user.followers || 0;
    document.getElementById('followingCount').textContent = user.following || 0;
    
    loadPosts();
}

document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.dataset.nav;
        switchView(view);
    });
});

function switchView(view) {
    currentView = view;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-nav="${view}"]`).classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${view}View`).classList.add('active');
    
    const titles = {
        home: 'Home', explore: 'Explore', notifications: 'Notifications',
        messages: 'Messages', profile: 'Profile', settings: 'Settings',
        about: 'About', help: 'Help Center'
    };
    document.getElementById('pageTitle').textContent = titles[view] || 'FreedomNet';
    
    if (view === 'home') loadPosts();
    if (view === 'profile') loadUserPosts();
}

document.getElementById('postBtn').addEventListener('click', async () => {
    const content = document.getElementById('postInput').value;
    if (!content.trim()) return;
    
    const res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, content })
    });
    
    if (res.ok) {
        document.getElementById('postInput').value = '';
        loadPosts();
    }
});

async function loadPosts() {
    const res = await fetch(`${API_URL}/api/posts`);
    allPosts = await res.json();
    const feed = document.getElementById('postsFeed');
    
    feed.innerHTML = allPosts.map(post => `
        <div class="post-card">
            <img class="post-avatar" src="${post.user?.avatar}" onerror="this.src='https://ui-avatars.com/api/?name=${post.user?.username}&background=1d9bf0&color=fff'">
            <div class="post-content">
                <div class="post-header">
                    <span class="post-name">${post.user?.fullName || post.user?.username}</span>
                    <span class="post-username">@${post.user?.username}</span>
                </div>
                <div class="post-text">${escapeHtml(post.content)}</div>
                <div class="post-actions">
                    <button class="like-button" onclick="likePost('${post.id}')">❤️ <span>${post.likes}</span></button>
                </div>
            </div>
        </div>
    `).join('');
    
    if (document.getElementById('postCount')) {
        const userPosts = allPosts.filter(p => p.userId === currentUser.id);
        document.getElementById('postCount').textContent = userPosts.length;
    }
}

async function loadUserPosts() {
    const userPosts = allPosts.filter(p => p.userId === currentUser.id);
    const container = document.getElementById('profilePosts');
    if (container) {
        container.innerHTML = userPosts.map(post => `
            <div class="post-card">
                <img class="post-avatar" src="${currentUser.avatar}">
                <div class="post-content">
                    <div class="post-text">${escapeHtml(post.content)}</div>
                    <div class="post-actions">
                        <span>❤️ ${post.likes}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

window.likePost = async (postId) => {
    await fetch(`${API_URL}/api/posts/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
    });
    loadPosts();
};

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
});

document.getElementById('editProfileBtn')?.addEventListener('click', () => {
    document.getElementById('editBio').value = currentUser.bio || '';
    document.getElementById('editProfileModal').classList.add('active');
});

document.getElementById('closeModal')?.addEventListener('click', () => {
    document.getElementById('editProfileModal').classList.remove('active');
});

document.getElementById('saveProfile')?.addEventListener('click', async () => {
    const bio = document.getElementById('editBio').value;
    const res = await fetch(`${API_URL}/api/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, bio })
    });
    if (res.ok) {
        const data = await res.json();
        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        document.getElementById('profileBio').textContent = bio || 'Welcome to FreedomNet!';
        document.getElementById('editProfileModal').classList.remove('active');
        showAuthMessage('Profile updated!', 'success');
    }
});

document.getElementById('saveSettings')?.addEventListener('click', () => {
    showAuthMessage('Settings saved!', 'success');
});

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
