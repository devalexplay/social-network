const API_URL = window.location.origin;

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const dashboard = document.getElementById('dashboard');
const authContainer = document.querySelector('.auth-container');
const messageDiv = document.getElementById('message');
const userNameSpan = document.getElementById('userName');

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active form
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tab}Form`).classList.add('active');
        
        // Clear messages
        clearMessage();
    });
});

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
    });
});

// Login handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!username || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    showMessage('Authenticating...', 'info');
    
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
            showMessage('Login successful!', 'success');
            
            setTimeout(() => {
                showDashboard(data.user);
            }, 500);
        } else {
            showMessage(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
});

// Register handler
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
    
    showMessage('Creating account...', 'info');
    
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
            showMessage('Registration successful!', 'success');
            
            setTimeout(() => {
                showDashboard(data.user);
            }, 500);
        } else {
            showMessage(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
});

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    
    dashboard.classList.remove('active');
    authContainer.style.display = 'flex';
    
    // Reset forms
    loginForm.reset();
    registerForm.reset();
    
    showMessage('Logged out successfully', 'success');
});

// Show dashboard
function showDashboard(user) {
    userNameSpan.textContent = user.fullName || user.username;
    authContainer.style.display = 'none';
    dashboard.classList.add('active');
}

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        showDashboard(JSON.parse(user));
    }
}

// Show message
function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = `message-container ${type}`;
    
    if (type !== 'info') {
        setTimeout(() => {
            clearMessage();
        }, 3000);
    }
}

function clearMessage() {
    messageDiv.textContent = '';
    messageDiv.className = 'message-container';
}

// Initialize
checkAuth();
