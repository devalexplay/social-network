const API_URL = window.location.origin;
let currentUser = null;
let currentPage = 'home';
let allPosts = [];

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

function initApp(user) {
    currentUser = user;
    authScreen.style.display = 'none';
    app.classList.add('active');
    
    document.getElementById('headerAvatar').src = user.avatar;
    document.getElementById('headerName').textContent = user.fullName || user.username;
    document.getElementById('composeAvatar').src = user.avatar;
    document.getElementById('profileAvatar').src = user.avatar;
    document.getElementById('profileName').textContent = user.fullName || user.username;
    document.getElementById('profileUsername').textContent = `@${user.username}`;
    document.getElementById('profileBio').textContent = user.bio || 'No bio yet';
    document.getElementById('userFollowerCount').textContent = user.followers || 0;
    document.getElementById('userFollowingCount').textContent = user.following || 0;
    
    loadPosts();
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
        home: 'Home', explore: 'Explore', notifications: 'Notifications',
        messages: 'Messages', profile: 'Profile', settings: 'Settings', about: 'About'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'FreedomNet';
    
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
    btn.textContent = 'Post';
});

async function loadPosts() {
    const res = await fetch(`${API_URL}/api/posts`);
    allPosts = await res.json();
    const feed = document.getElementById('postsList');
    
    if (allPosts.length === 0) {
        feed.innerHTML = '<div style="text-align:center;padding:40px;color:#71767b">No posts yet. Be the first!</div>';
        return;
    }
    
    feed.innerHTML = allPosts.map(post => `
        <div class="post-card">
            <img class="post-avatar" src="${post.user?.avatar}" onerror="this.src='https://ui-avatars.com/api/?name=${post.user?.username}&background=1d9bf0&color=fff'">
            <div class="post-body">
                <div class="post-header">
                    <span class="post-name">${escapeHtml(post.user?.fullName || post.user?.username)}</span>
                    <span class="post-username">@${escapeHtml(post.user?.username)}</span>
                </div>
                <div class="post-text">${escapeHtml(post.content)}</div>
                <div class="post-actions">
                    <button class="like-btn" onclick="likePost('${post.id}')">❤️ <span>${post.likes}</span></button>
                </div>
            </div>
        </div>
    `).join('');
    
    const userPosts = allPosts.filter(p => p.userId === currentUser.id);
    document.getElementById('userPostCount').textContent = userPosts.length;
}

async function loadUserPosts() {
    const userPosts = allPosts.filter(p => p.userId === currentUser.id);
    const container = document.getElementById('userPostsList');
    if (container) {
        if (userPosts.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:40px;color:#71767b">No posts yet</div>';
            return;
        }
        container.innerHTML = userPosts.map(post => `
            <div class="post-card">
                <img class="post-avatar" src="${currentUser.avatar}">
                <div class="post-body">
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
    document.getElementById('editBioInput').value = currentUser.bio || '';
    document.getElementById('editModal').classList.add('active');
});

document.getElementById('closeModalBtn')?.addEventListener('click', () => {
    document.getElementById('editModal').classList.remove('active');
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
        document.getElementById('editModal').classList.remove('active');
        showAuthMessage('Profile updated', 'success');
    }
});

document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    showAuthMessage('Settings saved', 'success');
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
