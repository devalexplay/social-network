const API_URL = window.location.origin;
let currentUser = null;
let currentPage = 'home';

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const dashboard = document.getElementById('dashboard');
const authContainer = document.querySelector('.auth-container');
const messageDiv = document.getElementById('message');
const userNameSpan = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const postAvatar = document.getElementById('postAvatar');
const profileAvatar = document.getElementById('profileAvatar');
const profileName = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const postCount = document.getElementById('postCount');

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tab}Form`).classList.add('active');
        
        messageDiv.className = 'message';
        messageDiv.textContent = '';
    });
});

document.querySelectorAll('.show-password').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        input.type = input.type === 'password' ? 'text' : 'password';
    });
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!username || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    showMessage('Signing in...', 'success');
    
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            if (rememberMe) {
                localStorage.setItem('token', data.token);
            } else {
                sessionStorage.setItem('token', data.token);
            }
            
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            showMessage('Welcome to FreedomNet!', 'success');
            
            setTimeout(() => {
                showDashboard(data.user);
            }, 500);
        } else {
            showMessage(data.error || 'Invalid credentials', 'error');
        }
    } catch (error) {
        showMessage('Connection error. Please try again.', 'error');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('regFullName').value;
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (!fullName || !username || !email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    showMessage('Creating your account...', 'success');
    
    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            showMessage('Welcome to FreedomNet!', 'success');
            
            setTimeout(() => {
                showDashboard(data.user);
            }, 500);
        } else {
            showMessage(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Connection error. Please try again.', 'error');
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    
    dashboard.classList.remove('active');
    authContainer.style.display = 'flex';
    currentUser = null;
    
    loginForm.reset();
    registerForm.reset();
    
    showMessage('Logged out successfully', 'success');
});

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        switchPage(page);
    });
});

document.getElementById('createPostBtn').addEventListener('click', async () => {
    const content = document.getElementById('postContent').value;
    if (!content.trim()) return;
    
    const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, content })
    });
    
    if (response.ok) {
        document.getElementById('postContent').value = '';
        loadPosts();
    }
});

async function loadPosts() {
    const response = await fetch(`${API_URL}/api/posts`);
    const posts = await response.json();
    const feed = document.getElementById('postsFeed');
    
    feed.innerHTML = posts.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            <img class="avatar-small" src="${post.user?.avatar || `https://ui-avatars.com/api/?name=${post.user?.username}&background=1d9bf0&color=fff`}" alt="Avatar">
            <div class="post-content">
                <div class="post-header">
                    <span class="post-name">${post.user?.fullName || post.user?.username}</span>
                    <span class="post-username">@${post.user?.username}</span>
                </div>
                <div class="post-text">${post.content}</div>
                <div class="post-actions">
                    <button class="like-btn" onclick="likePost('${post.id}')">
                        ❤️ <span>${post.likes}</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    if (postCount) {
        postCount.textContent = posts.filter(p => p.userId === currentUser.id).length;
    }
}

async function likePost(postId) {
    const response = await fetch(`${API_URL}/api/posts/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
    });
    
    if (response.ok) {
        loadPosts();
    }
}

function switchPage(page) {
    currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}Page`).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) {
            btn.classList.add('active');
        }
    });
    
    const titles = {
        home: 'Home',
        explore: 'Explore',
        notifications: 'Notifications',
        messages: 'Messages',
        profile: 'Profile',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'FreedomNet';
    
    if (page === 'home') {
        loadPosts();
    }
}

document.getElementById('saveSettingsBtn')?.addEventListener('click', async () => {
    const preferences = {
        theme: document.querySelector('.theme-btn.active')?.dataset.theme || 'dark',
        animations: document.getElementById('animationsToggle').checked,
        notifications: document.getElementById('notificationsToggle').checked
    };
    
    const response = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, preferences })
    });
    
    if (response.ok) {
        showMessage('Settings saved!', 'success');
    }
});

document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

function showDashboard(user) {
    currentUser = user;
    userNameSpan.textContent = user.fullName || user.username;
    userAvatar.src = user.avatar;
    postAvatar.src = user.avatar;
    profileAvatar.src = user.avatar;
    profileName.textContent = user.fullName || user.username;
    profileUsername.textContent = `@${user.username}`;
    
    authContainer.style.display = 'none';
    dashboard.classList.add('active');
    loadPosts();
}

function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = `message ${type}`;
    
    if (type !== 'success') {
        setTimeout(() => {
            if (messageDiv.textContent === msg) {
                messageDiv.className = 'message';
                messageDiv.textContent = '';
            }
        }, 3000);
    }
}

function checkAuth() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        showDashboard(currentUser);
    }
}

checkAuth();
