const API_URL = window.location.origin;
let currentUser = null;
let currentPage = 'home';
let allPosts = [];
let allUsers = [];
let currentEditPostId = null;
let currentDeletePostId = null;
let currentCommentPostId = null;
let userLikedPosts = new Set();
let userRepostedPosts = new Set();
let userSavedPosts = new Set();
let selectedImageFile = null;
let currentPostImageUrl = null;
let cropper = null;
let selectedAvatarFile = null;

const translations = {
    en: {
        home: 'Home', explore: 'Explore', notifications: 'Notifications',
        messages: 'Messages', profile: 'Profile', settings: 'Settings',
        post: 'Post', save: 'Save', cancel: 'Cancel', delete: 'Delete',
        edit: 'Edit', comment: 'Comment', saveChanges: 'Save changes'
    },
    ru: {
        home: 'Главная', explore: 'Обзор', notifications: 'Уведомления',
        messages: 'Сообщения', profile: 'Профиль', settings: 'Настройки',
        post: 'Опубликовать', save: 'Сохранить', cancel: 'Отмена', delete: 'Удалить',
        edit: 'Редактировать', comment: 'Комментировать', saveChanges: 'Сохранить'
    },
    es: {
        home: 'Inicio', explore: 'Explorar', notifications: 'Notificaciones',
        messages: 'Mensajes', profile: 'Perfil', settings: 'Ajustes',
        post: 'Publicar', save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar',
        edit: 'Editar', comment: 'Comentar', saveChanges: 'Guardar cambios'
    }
};

let currentLanguage = 'en';

function updateLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    const t = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    document.getElementById('pageTitle').textContent = t[currentPage] || 'Home';
    if (document.getElementById('createPostBtn')) {
        document.getElementById('createPostBtn').textContent = t.post || 'Post';
    }
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

async function loadAllUsers() {
    const res = await fetch(`${API_URL}/api/users`);
    allUsers = await res.json();
}

async function initApp(user) {
    currentUser = user;
    authScreen.style.display = 'none';
    app.classList.add('active');
    
    const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.displayName || user.username).slice(0,2))}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`;
    
    document.getElementById('headerAvatar').src = avatarUrl;
    document.getElementById('headerName').textContent = user.displayName || user.username;
    document.getElementById('composeAvatar').src = avatarUrl;
    document.getElementById('profileAvatar').src = avatarUrl;
    document.getElementById('profileName').textContent = user.displayName || user.username;
    document.getElementById('profileUsername').textContent = `@${user.username}`;
    document.getElementById('profileBio').textContent = user.bio || 'No bio yet';
    document.getElementById('userPostCount').textContent = '0';
    document.getElementById('userFollowerCount').textContent = user.followers || 0;
    document.getElementById('userFollowingCount').textContent = user.following || 0;
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    const savedLang = localStorage.getItem('language') || 'en';
    currentLanguage = savedLang;
    document.getElementById('languageSelect').value = savedLang;
    updateLanguage(savedLang);
    
    await loadAllUsers();
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
        home: 'Home', explore: 'Explore', notifications: 'Notifications',
        messages: 'Messages', profile: 'Profile', settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Home';
    
    if (page === 'home') loadPosts();
    if (page === 'profile') loadUserPosts();
}

document.getElementById('addImageBtn')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch(`${API_URL}/api/upload-image`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                currentPostImageUrl = data.imageUrl;
                document.getElementById('previewImg').src = currentPostImageUrl;
                document.getElementById('imagePreview').style.display = 'block';
            }
        }
    };
    input.click();
});

document.getElementById('removeImageBtn')?.addEventListener('click', () => {
    currentPostImageUrl = null;
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('previewImg').src = '';
});

document.getElementById('createPostBtn').addEventListener('click', async () => {
    const content = document.getElementById('postContent').value;
    if (!content.trim() && !currentPostImageUrl) {
        showCustomAlert('Please write something or add an image');
        return;
    }
    
    const btn = document.getElementById('createPostBtn');
    btn.disabled = true;
    btn.textContent = 'Posting...';
    
    try {
        const res = await fetch(`${API_URL}/api/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: currentUser.id, 
                content: content,
                imageUrl: currentPostImageUrl
            })
        });
        
        if (res.ok) {
            document.getElementById('postContent').value = '';
            currentPostImageUrl = null;
            document.getElementById('imagePreview').style.display = 'none';
            await loadPosts();
            showCustomAlert('Post published!');
        } else {
            showCustomAlert('Failed to post');
        }
    } catch (error) {
        showCustomAlert('Error posting');
    }
    
    btn.disabled = false;
    btn.textContent = 'Post';
});

async function loadPosts() {
    const res = await fetch(`${API_URL}/api/posts`);
    allPosts = await res.json();
    const feed = document.getElementById('postsList');
    
    if (allPosts.length === 0) {
        feed.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-tertiary)">No posts yet. Be the first!</div>';
        return;
    }
    
    feed.innerHTML = allPosts.map(post => {
        const postAvatar = post.user?.avatar || `https://ui-avatars.com/api/?name=${(post.user?.displayName || post.user?.username).slice(0,2)}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`;
        const isLiked = userLikedPosts.has(post.id);
        const isReposted = userRepostedPosts.has(post.id);
        const isSaved = userSavedPosts.has(post.id);
        return `
        <div class="post-card" data-post-id="${post.id}">
            <img class="post-avatar" src="${postAvatar}" onerror="this.src='https://ui-avatars.com/api/?name=${post.user?.username?.slice(0,2)}&background=1d9bf0&color=fff'">
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
                                <div class="dropdown-item" onclick="editPost('${post.id}', '${escapeHtml(post.content).replace(/'/g, "\\'")}')">Edit</div>
                                <div class="dropdown-item delete" onclick="deletePost('${post.id}')">Delete</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="post-text">${escapeHtml(post.content)}</div>
                ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="Post image">` : ''}
                <div class="post-actions">
                    <button class="action-btn like" onclick="toggleLike('${post.id}')" style="color:${isLiked ? 'var(--error)' : ''}">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="${isLiked ? '#f4212e' : 'none'}" stroke="currentColor" stroke-width="2">
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
                    <button class="action-btn repost" onclick="toggleRepost('${post.id}')" style="color:${isReposted ? 'var(--success)' : ''}">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 1l4 4-4 4"/>
                            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                            <path d="M7 23l-4-4 4-4"/>
                            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                        </svg>
                        <span>${post.reposts || 0}</span>
                    </button>
                    <button class="action-btn save ${isSaved ? 'saved' : ''}" onclick="toggleSave('${post.id}')">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="${isSaved ? '#ffd700' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                    </button>
                </div>
                ${post.comments && post.comments.length > 0 ? `
                    <div class="post-comments" style="margin-top:12px;padding-top:8px;border-top:1px solid var(--border-color)">
                        ${post.comments.slice(0, 2).map(c => `
                            <div class="comment-item" style="font-size:13px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">
                                <div>
                                    <strong style="color:var(--text-primary)">${escapeHtml(c.displayName || c.username)}</strong>
                                    <span style="color:var(--text-tertiary)"> ${escapeHtml(c.comment)}</span>
                                </div>
                                ${c.userId === currentUser.id ? `
                                    <button class="comment-delete" onclick="deleteComment('${post.id}', '${c.id}')">×</button>
                                ` : ''}
                            </div>
                        `).join('')}
                        ${post.comments.length > 2 ? `<div style="color:var(--text-tertiary);font-size:12px;cursor:pointer" onclick="openCommentModal('${post.id}')">+${post.comments.length - 2} more comments</div>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `}).join('');
    
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

window.toggleLike = async (postId) => {
    const res = await fetch(`${API_URL}/api/posts/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: currentUser.id })
    });
    const data = await res.json();
    if (data.success) {
        if (data.liked) {
            userLikedPosts.add(postId);
        } else {
            userLikedPosts.delete(postId);
        }
        loadPosts();
    }
};

window.toggleRepost = async (postId) => {
    const res = await fetch(`${API_URL}/api/posts/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: currentUser.id })
    });
    const data = await res.json();
    if (data.success) {
        if (data.reposted) {
            userRepostedPosts.add(postId);
            showCustomAlert('Post reposted!');
        } else {
            userRepostedPosts.delete(postId);
            showCustomAlert('Repost removed');
        }
        loadPosts();
    }
};

window.toggleSave = async (postId) => {
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

window.deleteComment = async (postId, commentId) => {
    const res = await fetch(`${API_URL}/api/posts/comment`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, commentId, userId: currentUser.id })
    });
    if (res.ok) {
        loadPosts();
        showCustomAlert('Comment deleted');
    }
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
        container.innerHTML = userPosts.map(post => {
            const postAvatar = currentUser.avatar || `https://ui-avatars.com/api/?name=${(currentUser.displayName || currentUser.username).slice(0,2)}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`;
            return `
            <div class="post-card">
                <img class="post-avatar" src="${postAvatar}">
                <div class="post-body">
                    <div class="post-text">${escapeHtml(post.content)}</div>
                    ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="Post image">` : ''}
                    <div class="post-actions">
                        <span style="color:var(--text-tertiary);display:flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> ${post.likes}</span>
                        <span style="color:var(--text-tertiary);display:flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> ${post.comments?.length || 0}</span>
                        <span style="color:var(--text-tertiary);display:flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> ${post.reposts || 0}</span>
                    </div>
                </div>
            </div>
        `}).join('');
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

document.getElementById('languageSelect')?.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    localStorage.setItem('language', currentLanguage);
    updateLanguage(currentLanguage);
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

// Avatar Editor
let currentAvatarFile = null;
let currentAvatarCropper = null;

document.getElementById('editAvatarBtn')?.addEventListener('click', () => {
    document.getElementById('avatarStep1').style.display = 'flex';
    document.getElementById('avatarStep2').style.display = 'none';
    document.getElementById('avatarModalTitle').textContent = 'Change avatar';
    document.getElementById('avatarModal').classList.add('active');
    document.getElementById('avatarPreviewContainer').style.display = 'none';
    document.getElementById('nextAvatarBtn').style.display = 'none';
    document.getElementById('uploadAvatarBtn').style.display = 'block';
    document.getElementById('avatarFileInput').value = '';
    if (currentAvatarCropper) {
        currentAvatarCropper.destroy();
        currentAvatarCropper = null;
    }
});

document.getElementById('closeAvatarModal')?.addEventListener('click', () => {
    document.getElementById('avatarModal').classList.remove('active');
    if (currentAvatarCropper) {
        currentAvatarCropper.destroy();
        currentAvatarCropper = null;
    }
});

document.getElementById('uploadAvatarBtn')?.addEventListener('click', () => {
    document.getElementById('avatarFileInput').click();
});

document.getElementById('avatarFileInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        currentAvatarFile = file;
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = document.getElementById('cropImage');
            img.src = event.target.result;
            document.getElementById('avatarPreviewContainer').style.display = 'block';
            document.getElementById('avatarPreviewImg').src = event.target.result;
            document.getElementById('nextAvatarBtn').style.display = 'block';
            document.getElementById('uploadAvatarBtn').style.display = 'none';
            
            if (currentAvatarCropper) {
                currentAvatarCropper.destroy();
            }
            
            img.onload = () => {
                currentAvatarCropper = new Cropper(img, {
                    aspectRatio: 1,
                    viewMode: 1,
                    dragMode: 'move',
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    zoomable: true,
                    zoomOnWheel: true,
                    autoCropArea: 0.9,
                    background: false,
                    ready: function() {
                        const container = document.querySelector('.crop-area');
                        container.style.overflow = 'hidden';
                    }
                });
                
                const zoomRange = document.getElementById('zoomRange');
                zoomRange.value = 0.5;
                zoomRange.oninput = (e) => {
                    if (currentAvatarCropper) {
                        currentAvatarCropper.zoomTo(parseFloat(e.target.value));
                    }
                };
            };
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('nextAvatarBtn')?.addEventListener('click', () => {
    if (currentAvatarFile) {
        document.getElementById('avatarStep1').style.display = 'none';
        document.getElementById('avatarStep2').style.display = 'flex';
        document.getElementById('avatarModalTitle').textContent = 'Crop avatar';
        
        setTimeout(() => {
            if (currentAvatarCropper) {
                currentAvatarCropper.reset();
                currentAvatarCropper.crop();
            }
        }, 100);
    }
});

document.getElementById('backAvatarBtn')?.addEventListener('click', () => {
    document.getElementById('avatarStep1').style.display = 'flex';
    document.getElementById('avatarStep2').style.display = 'none';
    document.getElementById('avatarModalTitle').textContent = 'Change avatar';
});

document.querySelectorAll('.grid-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.grid-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const grid = btn.dataset.grid;
        const cropContainer = document.querySelector('.crop-container');
        cropContainer.setAttribute('data-grid', grid);
    });
});

document.getElementById('saveAvatarBtn')?.addEventListener('click', async () => {
    if (!currentAvatarCropper) return;
    
    const canvas = currentAvatarCropper.getCroppedCanvas({
        width: 512,
        height: 512,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });
    
    canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.png');
        
        const uploadRes = await fetch(`${API_URL}/api/upload-avatar`, {
            method: 'POST',
            body: formData
        });
        
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
            const res = await fetch(`${API_URL}/api/user/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, avatar: uploadData.avatarUrl })
            });
            
            if (res.ok) {
                const data = await res.json();
                currentUser = data.user;
                localStorage.setItem('user', JSON.stringify(currentUser));
                
                const avatarUrl = currentUser.avatar;
                document.getElementById('headerAvatar').src = avatarUrl;
                document.getElementById('composeAvatar').src = avatarUrl;
                document.getElementById('profileAvatar').src = avatarUrl;
                
                document.getElementById('avatarModal').classList.remove('active');
                showCustomAlert('Avatar updated!');
                loadPosts();
                
                if (currentAvatarCropper) {
                    currentAvatarCropper.destroy();
                    currentAvatarCropper = null;
                }
            }
        } else {
            showCustomAlert('Failed to upload image');
        }
    }, 'image/png');
});

// Search functionality
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

// User search for messages
document.getElementById('userSearchInput')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const resultsDiv = document.getElementById('userSearchResults');
    
    if (query.length > 0) {
        const filteredUsers = allUsers.filter(user => 
            user.id !== currentUser.id && (
                user.displayName?.toLowerCase().includes(query) ||
                user.username?.toLowerCase().includes(query)
            )
        );
        
        if (filteredUsers.length > 0) {
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = filteredUsers.map(user => {
                const userAvatar = user.avatar || `https://ui-avatars.com/api/?name=${(user.displayName || user.username).slice(0,2)}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`;
                return `
                    <div class="user-search-item" onclick="startConversation('${user.id}')">
                        <img class="user-search-avatar" src="${userAvatar}">
                        <div class="user-search-info">
                            <div class="user-search-name">${escapeHtml(user.displayName || user.username)}</div>
                            <div class="user-search-username">@${escapeHtml(user.username)}</div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            resultsDiv.style.display = 'none';
        }
    } else {
        resultsDiv.style.display = 'none';
    }
});

window.startConversation = function(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        showCustomAlert(`Messaging ${user.displayName || user.username} coming soon!`);
        document.getElementById('userSearchResults').style.display = 'none';
        document.getElementById('userSearchInput').value = '';
    }
};

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
