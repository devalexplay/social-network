const API_URL = window.location.origin;

// Check if user is logged in
if (window.location.pathname === '/dashboard') {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
    } else {
        // Load user info
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        document.getElementById('userInfo').innerHTML = `
            <h3>User Information:</h3>
            <p><strong>Name:</strong> ${user.fullName || 'N/A'}</p>
            <p><strong>Username:</strong> ${user.username || 'N/A'}</p>
            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
            <p><strong>Role:</strong> ${user.role || 'N/A'}</p>
            <p><strong>Status:</strong> ✅ Logged in successfully!</p>
        `;
    }
}

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        showMessage('Logging in...', 'info');
        
        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                showMessage(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }
    });
}

// Register form handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('role').value;
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match!', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters!', 'error');
            return;
        }
        
        showMessage('Creating account...', 'info');
        
        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, username, email, password, role })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showMessage('Registration successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                showMessage(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }
    });
}

// Logout handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    });
}

// Show message function
function showMessage(msg, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 3000);
    }
}

// Remember me functionality
const rememberCheckbox = document.getElementById('remember');
if (rememberCheckbox && localStorage.getItem('rememberedUser')) {
    const remembered = JSON.parse(localStorage.getItem('rememberedUser'));
    document.getElementById('username').value = remembered.username;
    rememberCheckbox.checked = true;
}

if (rememberCheckbox) {
    rememberCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            const username = document.getElementById('username').value;
            localStorage.setItem('rememberedUser', JSON.stringify({ username }));
        } else {
            localStorage.removeItem('rememberedUser');
        }
    });
}
