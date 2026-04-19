const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 100;

for (let i = 0; i < particleCount; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.5
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`;
        ctx.fill();
        
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }
    
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const API_URL = window.location.origin;

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const dashboard = document.getElementById('dashboard');
const container = document.querySelector('.container');
const messageDiv = document.getElementById('message');
const userNameSpan = document.getElementById('userName');

document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tab}Form`).classList.add('active');
        
        messageDiv.className = 'message';
        messageDiv.textContent = '';
    });
});

document.querySelectorAll('.eye').forEach(btn => {
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
        showMessage('please fill in all fields', 'error');
        return;
    }
    
    showMessage('authenticating...', 'success');
    
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
            showMessage('login successful!', 'success');
            
            setTimeout(() => {
                showDashboard(data.user);
            }, 500);
        } else {
            showMessage(data.error || 'login failed', 'error');
        }
    } catch (error) {
        showMessage('network error', 'error');
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
        showMessage('please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('password must be at least 6 characters', 'error');
        return;
    }
    
    showMessage('creating account...', 'success');
    
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
            showMessage('registration successful!', 'success');
            
            setTimeout(() => {
                showDashboard(data.user);
            }, 500);
        } else {
            showMessage(data.error || 'registration failed', 'error');
        }
    } catch (error) {
        showMessage('network error', 'error');
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    
    dashboard.classList.remove('active');
    container.style.display = 'flex';
    
    loginForm.reset();
    registerForm.reset();
    
    showMessage('logged out successfully', 'success');
});

function showDashboard(user) {
    userNameSpan.textContent = user.fullName || user.username;
    container.style.display = 'none';
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
            messageDiv.className = 'message';
            messageDiv.textContent = '';
        }, 3000);
    }
}

checkAuth();
