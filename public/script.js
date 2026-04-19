(function() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  
  const particles = [];
  const particleCount = 150;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.3
    });
  }
  
  function drawParticles() {
    ctx.clearRect(0, 0, width, height);
    
    for (let p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`;
      ctx.fill();
      
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    }
    
    requestAnimationFrame(drawParticles);
  }
  
  drawParticles();
  
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });
  
  const cursor = document.querySelector('.cursor');
  const cursorFollower = document.querySelector('.cursor-follower');
  
  document.addEventListener('mousemove', (e) => {
    cursor.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
    cursorFollower.style.transform = `translate(${e.clientX - 16}px, ${e.clientY - 16}px)`;
  });
  
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorFollower.style.opacity = '1';
  });
})();

const API_URL = window.location.origin;

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const dashboard = document.getElementById('dashboard');
const container = document.querySelector('.container');
const notification = document.getElementById('notification');
const displayNameSpan = document.getElementById('displayName');
const switchContainer = document.querySelector('.switch-container');

let activeMode = 'login';

document.querySelectorAll('.switch-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeMode = btn.dataset.mode;
    switchContainer.setAttribute('data-active', activeMode);
    
    document.querySelectorAll('.switch-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.form-panel').forEach(form => form.classList.remove('active'));
    document.getElementById(`${activeMode}Form`).classList.add('active');
    
    hideNotification();
  });
});

document.querySelectorAll('.toggle-visibility').forEach(btn => {
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
    showNotification('authentication failed: missing credentials', 'error');
    return;
  }
  
  showNotification('establishing secure channel...', 'success');
  
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
      showNotification('access granted. redirecting...', 'success');
      
      setTimeout(() => {
        activateDashboard(data.user);
      }, 800);
    } else {
      showNotification(data.error || 'authentication failed', 'error');
    }
  } catch (error) {
    showNotification('connection error. retry sequence.', 'error');
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
    showNotification('all fields required for identity creation', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showNotification('secret key mismatch', 'error');
    return;
  }
  
  if (password.length < 6) {
    showNotification('security key insufficient length', 'error');
    return;
  }
  
  showNotification('generating secure identity...', 'success');
  
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
      showNotification('identity established. access granted.', 'success');
      
      setTimeout(() => {
        activateDashboard(data.user);
      }, 800);
    } else {
      showNotification(data.error || 'identity creation failed', 'error');
    }
  } catch (error) {
    showNotification('system error. retry sequence.', 'error');
  }
});

document.getElementById('terminateBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('user');
  
  dashboard.classList.remove('active');
  container.style.display = 'flex';
  
  loginForm.reset();
  registerForm.reset();
  
  showNotification('session terminated', 'success');
  
  setTimeout(() => {
    hideNotification();
  }, 2000);
});

function activateDashboard(user) {
  displayNameSpan.textContent = user.fullName || user.username;
  container.style.display = 'none';
  dashboard.classList.add('active');
}

function checkExistingSession() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    activateDashboard(JSON.parse(user));
  }
}

function showNotification(msg, type) {
  notification.textContent = msg;
  notification.className = `notification ${type} show`;
}

function hideNotification() {
  notification.className = 'notification';
}

checkExistingSession();
