const API_URL = window.location.origin;

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const dashboard = document.getElementById('dashboard');
const authContainer = document.querySelector('.auth-container');
const messageDiv = document.getElementById('message');
const userNameSpan = document.getElementById('userName');

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
            showMessage('Welcome back!', 'success');
            
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
            showMessage('Account created successfully!', 'success');
            
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
    
    loginForm.reset();
    registerForm.reset();
    
    showMessage('Logged out successfully', 'success');
    
    setTimeout(() => {
        messageDiv.className = 'message';
        messageDiv.textContent = '';
    }, 2000);
});

function showDashboard(user) {
    userNameSpan.textContent = user.fullName || user.username;
    authContainer.style.display = 'none';
    dashboard.classList.add('active');
}

function checkAuth() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        showDashboard(JSON.parse(user));
    }
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

checkAuth();
