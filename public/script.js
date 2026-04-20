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
let currentViewingUser = null;

// Complete translations for EVERYTHING
const translations = {
    en: {
        appName: 'FreedomNet',
        signIn: 'Sign in',
        signUp: 'Sign up',
        emailOrUsername: 'Email or username',
        password: 'Password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        signInBtn: 'Sign in',
        fullName: 'Full name',
        username: 'Username',
        email: 'Email',
        confirmPassword: 'Confirm password',
        createAccount: 'Create account',
        home: 'Home',
        explore: 'Explore',
        notifications: 'Notifications',
        messages: 'Messages',
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Logout',
        post: 'Post',
        trendingNow: 'Trending now',
        welcomeNotification: 'Welcome to FreedomNet!',
        noMessages: 'No messages yet',
        posts: 'Posts',
        followers: 'Followers',
        following: 'Following',
        editProfile: 'Edit profile',
        appearance: 'Appearance',
        theme: 'Theme',
        dark: 'Dark',
        light: 'Light',
        language: 'Language',
        notificationsSettings: 'Notifications',
        pushNotifications: 'Push notifications',
        emailUpdates: 'Email updates',
        saveChanges: 'Save changes',
        editPost: 'Edit post',
        cancel: 'Cancel',
        save: 'Save',
        deletePost: 'Delete post?',
        deleteConfirm: 'Are you sure you want to delete this post? This action cannot be undone.',
        delete: 'Delete',
        addComment: 'Add comment',
        comment: 'Comment',
        edit: 'Edit',
        delete_: 'Delete',
        changeAvatar: 'Change avatar',
        profileSettings: 'Profile Settings',
        displayName: 'Display Name',
        displayNameHint: 'Can be changed every 14 days',
        usernameHint: 'Can be changed every 90 days',
        selectLanguage: 'Select language',
        search: 'Search',
        noResults: 'No results found',
        joined: 'Joined',
        showProfile: 'Show profile',
        edit: 'Edit',
        save: 'Save',
        cancel: 'Cancel',
        posting: 'Posting...',
        postPublished: 'Post published!',
        failedToPost: 'Failed to post',
        errorPosting: 'Error posting',
        pleaseWriteSomething: 'Please write something',
        postUpdated: 'Post updated!',
        postDeleted: 'Post deleted!',
        postReposted: 'Post reposted!',
        repostRemoved: 'Repost removed',
        postSaved: 'Post saved!',
        postRemovedFromSaves: 'Post removed from saves',
        commentDeleted: 'Comment deleted',
        profileUpdated: 'Profile updated!',
        avatarUpdated: 'Avatar updated!',
        displayNameUpdated: 'Display name updated!',
        usernameUpdated: 'Username updated!',
        settingsSaved: 'Settings saved!',
        passwordsDoNotMatch: 'Passwords do not match',
        pleaseFillAllFields: 'Please fill in all fields',
        connectionError: 'Connection error',
        invalidCredentials: 'Invalid credentials',
        accountCreated: 'Account created!',
        welcomeBack: 'Welcome back!',
        allFieldsRequired: 'All fields required',
        passwordTooShort: 'Password must be at least 6 characters'
    },
    ru: {
        appName: 'FreedomNet',
        signIn: 'Войти',
        signUp: 'Регистрация',
        emailOrUsername: 'Email или имя',
        password: 'Пароль',
        rememberMe: 'Запомнить меня',
        forgotPassword: 'Забыли пароль?',
        signInBtn: 'Войти',
        fullName: 'Полное имя',
        username: 'Имя пользователя',
        email: 'Email',
        confirmPassword: 'Подтвердите пароль',
        createAccount: 'Создать аккаунт',
        home: 'Главная',
        explore: 'Обзор',
        notifications: 'Уведомления',
        messages: 'Сообщения',
        profile: 'Профиль',
        settings: 'Настройки',
        logout: 'Выйти',
        post: 'Опубликовать',
        trendingNow: 'В тренде',
        welcomeNotification: 'Добро пожаловать в FreedomNet!',
        noMessages: 'Нет сообщений',
        posts: 'Посты',
        followers: 'Подписчики',
        following: 'Подписки',
        editProfile: 'Редактировать',
        appearance: 'Внешний вид',
        theme: 'Тема',
        dark: 'Темная',
        light: 'Светлая',
        language: 'Язык',
        notificationsSettings: 'Уведомления',
        pushNotifications: 'Push уведомления',
        emailUpdates: 'Email рассылка',
        saveChanges: 'Сохранить',
        editPost: 'Редактировать',
        cancel: 'Отмена',
        save: 'Сохранить',
        deletePost: 'Удалить пост?',
        deleteConfirm: 'Вы уверены, что хотите удалить этот пост?',
        delete: 'Удалить',
        addComment: 'Добавить комментарий',
        comment: 'Комментировать',
        edit: 'Редактировать',
        delete_: 'Удалить',
        changeAvatar: 'Сменить аватар',
        profileSettings: 'Настройки профиля',
        displayName: 'Отображаемое имя',
        displayNameHint: 'Можно менять каждые 14 дней',
        usernameHint: 'Можно менять каждые 90 дней',
        selectLanguage: 'Выберите язык',
        search: 'Поиск',
        noResults: 'Ничего не найдено',
        joined: 'Присоединился',
        showProfile: 'Показать профиль',
        posting: 'Публикация...',
        postPublished: 'Пост опубликован!',
        failedToPost: 'Не удалось опубликовать',
        errorPosting: 'Ошибка публикации',
        pleaseWriteSomething: 'Напишите что-нибудь',
        postUpdated: 'Пост обновлен!',
        postDeleted: 'Пост удален!',
        postReposted: 'Пост репостнут!',
        repostRemoved: 'Репост удален',
        postSaved: 'Пост сохранен!',
        postRemovedFromSaves: 'Пост удален из сохраненных',
        commentDeleted: 'Комментарий удален',
        profileUpdated: 'Профиль обновлен!',
        avatarUpdated: 'Аватар обновлен!',
        displayNameUpdated: 'Имя обновлено!',
        usernameUpdated: 'Имя пользователя обновлено!',
        settingsSaved: 'Настройки сохранены!',
        passwordsDoNotMatch: 'Пароли не совпадают',
        pleaseFillAllFields: 'Заполните все поля',
        connectionError: 'Ошибка соединения',
        invalidCredentials: 'Неверные данные',
        accountCreated: 'Аккаунт создан!',
        welcomeBack: 'С возвращением!',
        allFieldsRequired: 'Все поля обязательны',
        passwordTooShort: 'Пароль должен быть не менее 6 символов'
    },
    es: {
        appName: 'FreedomNet',
        signIn: 'Iniciar sesión',
        signUp: 'Registrarse',
        emailOrUsername: 'Email o usuario',
        password: 'Contraseña',
        rememberMe: 'Recordarme',
        forgotPassword: '¿Olvidaste tu contraseña?',
        signInBtn: 'Iniciar sesión',
        fullName: 'Nombre completo',
        username: 'Usuario',
        email: 'Email',
        confirmPassword: 'Confirmar contraseña',
        createAccount: 'Crear cuenta',
        home: 'Inicio',
        explore: 'Explorar',
        notifications: 'Notificaciones',
        messages: 'Mensajes',
        profile: 'Perfil',
        settings: 'Ajustes',
        logout: 'Cerrar sesión',
        post: 'Publicar',
        trendingNow: 'Tendencias',
        welcomeNotification: '¡Bienvenido a FreedomNet!',
        noMessages: 'Sin mensajes',
        posts: 'Publicaciones',
        followers: 'Seguidores',
        following: 'Siguiendo',
        editProfile: 'Editar perfil',
        appearance: 'Apariencia',
        theme: 'Tema',
        dark: 'Oscuro',
        light: 'Claro',
        language: 'Idioma',
        notificationsSettings: 'Notificaciones',
        pushNotifications: 'Notificaciones push',
        emailUpdates: 'Actualizaciones por email',
        saveChanges: 'Guardar cambios',
        editPost: 'Editar publicación',
        cancel: 'Cancelar',
        save: 'Guardar',
        deletePost: '¿Eliminar publicación?',
        deleteConfirm: '¿Seguro que quieres eliminar esta publicación?',
        delete: 'Eliminar',
        addComment: 'Agregar comentario',
        comment: 'Comentar',
        edit: 'Editar',
        delete_: 'Eliminar',
        changeAvatar: 'Cambiar avatar',
        profileSettings: 'Configuración del perfil',
        displayName: 'Nombre mostrado',
        displayNameHint: 'Se puede cambiar cada 14 días',
        usernameHint: 'Se puede cambiar cada 90 días',
        selectLanguage: 'Seleccionar idioma',
        search: 'Buscar',
        noResults: 'No se encontraron resultados',
        joined: 'Se unió',
        showProfile: 'Mostrar perfil',
        posting: 'Publicando...',
        postPublished: '¡Publicación publicada!',
        failedToPost: 'Error al publicar',
        errorPosting: 'Error al publicar',
        pleaseWriteSomething: 'Escribe algo',
        postUpdated: '¡Publicación actualizada!',
        postDeleted: '¡Publicación eliminada!',
        postReposted: '¡Recompartido!',
        repostRemoved: 'Recompartido eliminado',
        postSaved: '¡Publicación guardada!',
        postRemovedFromSaves: 'Publicación eliminada de guardados',
        commentDeleted: 'Comentario eliminado',
        profileUpdated: '¡Perfil actualizado!',
        avatarUpdated: '¡Avatar actualizado!',
        displayNameUpdated: '¡Nombre actualizado!',
        usernameUpdated: '¡Usuario actualizado!',
        settingsSaved: '¡Configuración guardada!',
        passwordsDoNotMatch: 'Las contraseñas no coinciden',
        pleaseFillAllFields: 'Complete todos los campos',
        connectionError: 'Error de conexión',
        invalidCredentials: 'Credenciales inválidas',
        accountCreated: '¡Cuenta creada!',
        welcomeBack: '¡Bienvenido de nuevo!',
        allFieldsRequired: 'Todos los campos son obligatorios',
        passwordTooShort: 'La contraseña debe tener al menos 6 caracteres'
    },
    fr: {
        appName: 'FreedomNet',
        signIn: 'Se connecter',
        signUp: "S'inscrire",
        emailOrUsername: 'Email ou nom',
        password: 'Mot de passe',
        rememberMe: 'Se souvenir',
        forgotPassword: 'Mot de passe oublié?',
        signInBtn: 'Se connecter',
        fullName: 'Nom complet',
        username: "Nom d'utilisateur",
        email: 'Email',
        confirmPassword: 'Confirmer',
        createAccount: 'Créer',
        home: 'Accueil',
        explore: 'Explorer',
        notifications: 'Notifications',
        messages: 'Messages',
        profile: 'Profil',
        settings: 'Paramètres',
        logout: 'Déconnexion',
        post: 'Publier',
        trendingNow: 'Tendances',
        welcomeNotification: 'Bienvenue sur FreedomNet!',
        noMessages: 'Aucun message',
        posts: 'Publications',
        followers: 'Abonnés',
        following: 'Abonnements',
        editProfile: 'Modifier',
        appearance: 'Apparence',
        theme: 'Thème',
        dark: 'Sombre',
        light: 'Clair',
        language: 'Langue',
        notificationsSettings: 'Notifications',
        pushNotifications: 'Notifications push',
        emailUpdates: 'Emails',
        saveChanges: 'Enregistrer',
        editPost: 'Modifier',
        cancel: 'Annuler',
        save: 'Enregistrer',
        deletePost: 'Supprimer?',
        deleteConfirm: 'Voulez-vous vraiment supprimer?',
        delete: 'Supprimer',
        addComment: 'Commenter',
        comment: 'Commentaire',
        edit: 'Modifier',
        delete_: 'Supprimer',
        changeAvatar: 'Changer avatar',
        profileSettings: 'Paramètres profil',
        displayName: 'Nom affiché',
        displayNameHint: 'Modifiable tous les 14 jours',
        usernameHint: 'Modifiable tous les 90 jours',
        selectLanguage: 'Choisir langue',
        search: 'Rechercher',
        noResults: 'Aucun résultat',
        joined: 'Inscrit le',
        showProfile: 'Voir profil',
        posting: 'Publication...',
        postPublished: 'Publié!',
        failedToPost: 'Échec publication',
        errorPosting: 'Erreur publication',
        pleaseWriteSomething: 'Écrivez quelque chose',
        postUpdated: 'Mis à jour!',
        postDeleted: 'Supprimé!',
        postReposted: 'Republié!',
        repostRemoved: 'Republié retiré',
        postSaved: 'Sauvegardé!',
        postRemovedFromSaves: 'Retiré des sauvegardes',
        commentDeleted: 'Commentaire supprimé',
        profileUpdated: 'Profil mis à jour!',
        avatarUpdated: 'Avatar mis à jour!',
        displayNameUpdated: 'Nom mis à jour!',
        usernameUpdated: 'Nom utilisateur mis à jour!',
        settingsSaved: 'Paramètres sauvegardés!',
        passwordsDoNotMatch: 'Mots de passe différents',
        pleaseFillAllFields: 'Remplissez tous les champs',
        connectionError: 'Erreur connexion',
        invalidCredentials: 'Identifiants invalides',
        accountCreated: 'Compte créé!',
        welcomeBack: 'Bon retour!',
        allFieldsRequired: 'Tous les champs requis',
        passwordTooShort: '6 caractères minimum'
    },
    de: {
        appName: 'FreedomNet',
        signIn: 'Anmelden',
        signUp: 'Registrieren',
        emailOrUsername: 'Email oder Benutzername',
        password: 'Passwort',
        rememberMe: 'Merken',
        forgotPassword: 'Passwort vergessen?',
        signInBtn: 'Anmelden',
        fullName: 'Vollständiger Name',
        username: 'Benutzername',
        email: 'Email',
        confirmPassword: 'Passwort bestätigen',
        createAccount: 'Konto erstellen',
        home: 'Startseite',
        explore: 'Entdecken',
        notifications: 'Benachrichtigungen',
        messages: 'Nachrichten',
        profile: 'Profil',
        settings: 'Einstellungen',
        logout: 'Abmelden',
        post: 'Posten',
        trendingNow: 'Im Trend',
        welcomeNotification: 'Willkommen bei FreedomNet!',
        noMessages: 'Keine Nachrichten',
        posts: 'Beiträge',
        followers: 'Follower',
        following: 'Folgt',
        editProfile: 'Bearbeiten',
        appearance: 'Erscheinungsbild',
        theme: 'Design',
        dark: 'Dunkel',
        light: 'Hell',
        language: 'Sprache',
        notificationsSettings: 'Benachrichtigungen',
        pushNotifications: 'Push-Benachrichtigungen',
        emailUpdates: 'E-Mail-Updates',
        saveChanges: 'Speichern',
        editPost: 'Bearbeiten',
        cancel: 'Abbrechen',
        save: 'Speichern',
        deletePost: 'Löschen?',
        deleteConfirm: 'Wirklich löschen?',
        delete: 'Löschen',
        addComment: 'Kommentieren',
        comment: 'Kommentar',
        edit: 'Bearbeiten',
        delete_: 'Löschen',
        changeAvatar: 'Avatar ändern',
        profileSettings: 'Profileinstellungen',
        displayName: 'Anzeigename',
        displayNameHint: 'Alle 14 Tage änderbar',
        usernameHint: 'Alle 90 Tage änderbar',
        selectLanguage: 'Sprache wählen',
        search: 'Suchen',
        noResults: 'Keine Ergebnisse',
        joined: 'Beigetreten',
        showProfile: 'Profil anzeigen',
        posting: 'Wird gepostet...',
        postPublished: 'Beitrag veröffentlicht!',
        failedToPost: 'Fehler beim Posten',
        errorPosting: 'Fehler',
        pleaseWriteSomething: 'Schreib etwas',
        postUpdated: 'Aktualisiert!',
        postDeleted: 'Gelöscht!',
        postReposted: 'Repostet!',
        repostRemoved: 'Repost entfernt',
        postSaved: 'Gespeichert!',
        postRemovedFromSaves: 'Aus Speicherungen entfernt',
        commentDeleted: 'Kommentar gelöscht',
        profileUpdated: 'Profil aktualisiert!',
        avatarUpdated: 'Avatar aktualisiert!',
        displayNameUpdated: 'Name aktualisiert!',
        usernameUpdated: 'Benutzername aktualisiert!',
        settingsSaved: 'Einstellungen gespeichert!',
        passwordsDoNotMatch: 'Passwörter stimmen nicht überein',
        pleaseFillAllFields: 'Alle Felder ausfüllen',
        connectionError: 'Verbindungsfehler',
        invalidCredentials: 'Ungültige Anmeldedaten',
        accountCreated: 'Konto erstellt!',
        welcomeBack: 'Willkommen zurück!',
        allFieldsRequired: 'Alle Felder erforderlich',
        passwordTooShort: 'Passwort zu kurz'
    }
};

let currentLanguage = 'en';

function updateLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    const t = translations[lang] || translations.en;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });
    
    document.getElementById('pageTitle').textContent = t[currentPage] || 'Home';
    const postBtn = document.getElementById('createPostBtn');
    if (postBtn) postBtn.textContent = t.post || 'Post';
    
    showCustomAlert('Language changed to ' + lang.toUpperCase());
}

// Disable right click and copy
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
    }
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }
});

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
        showAuthMessage(translations[currentLanguage].pleaseFillAllFields, 'error');
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
            showAuthMessage(translations[currentLanguage].welcomeBack, 'success');
            setTimeout(() => initApp(data.user), 500);
        } else {
            showAuthMessage(data.error || translations[currentLanguage].invalidCredentials, 'error');
        }
    } catch (error) {
        showAuthMessage(translations[currentLanguage].connectionError, 'error');
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
        showAuthMessage(translations[currentLanguage].allFieldsRequired, 'error');
        return;
    }
    if (password !== confirm) {
        showAuthMessage(translations[currentLanguage].passwordsDoNotMatch, 'error');
        return;
    }
    if (password.length < 6) {
        showAuthMessage(translations[currentLanguage].passwordTooShort, 'error');
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
            showAuthMessage(translations[currentLanguage].accountCreated, 'success');
            setTimeout(() => initApp(data.user), 500);
        } else {
            showAuthMessage(data.error, 'error');
        }
    } catch (error) {
        showAuthMessage(translations[currentLanguage].connectionError, 'error');
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
    
    const t = translations[currentLanguage];
    const titles = {
        home: t.home, explore: t.explore, notifications: t.notifications,
        messages: t.messages, profile: t.profile, settings: t.settings
    };
    document.getElementById('pageTitle').textContent = titles[page] || t.home;
    
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
        showCustomAlert(translations[currentLanguage].pleaseWriteSomething);
        return;
    }
    
    const btn = document.getElementById('createPostBtn');
    btn.disabled = true;
    btn.textContent = translations[currentLanguage].posting;
    
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
            showCustomAlert(translations[currentLanguage].postPublished);
        } else {
            showCustomAlert(translations[currentLanguage].failedToPost);
        }
    } catch (error) {
        showCustomAlert(translations[currentLanguage].errorPosting);
    }
    
    btn.disabled = false;
    btn.textContent = translations[currentLanguage].post;
});

async function loadPosts() {
    const res = await fetch(`${API_URL}/api/posts`);
    allPosts = await res.json();
    const feed = document.getElementById('postsList');
    const t = translations[currentLanguage];
    
    if (allPosts.length === 0) {
        feed.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-tertiary)">${t.noResults}</div>`;
        return;
    }
    
    feed.innerHTML = allPosts.map(post => {
        const postAvatar = post.user?.avatar || `https://ui-avatars.com/api/?name=${(post.user?.displayName || post.user?.username).slice(0,2)}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`;
        const isLiked = userLikedPosts.has(post.id);
        const isReposted = userRepostedPosts.has(post.id);
        const isSaved = userSavedPosts.has(post.id);
        const joinDate = post.user?.joinDate ? new Date(post.user.joinDate).toLocaleDateString() : '';
        return `
        <div class="post-card" data-post-id="${post.id}">
            <img class="post-avatar" src="${postAvatar}" onclick="showMiniProfile('${post.userId}')" style="cursor:pointer" onerror="this.src='https://ui-avatars.com/api/?name=${post.user?.username?.slice(0,2)}&background=1d9bf0&color=fff'">
            <div class="post-body">
                <div class="post-header">
                    <span class="post-name" onclick="showMiniProfile('${post.userId}')" style="cursor:pointer">${escapeHtml(post.user?.displayName || post.user?.username)}</span>
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
                                <div class="dropdown-item" onclick="editPost('${post.id}', '${escapeHtml(post.content).replace(/'/g, "\\'")}')">${t.edit}</div>
                                <div class="dropdown-item delete" onclick="deletePost('${post.id}')">${t.delete_}</div>
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

window.showMiniProfile = function(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    currentViewingUser = user;
    const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${(user.displayName || user.username).slice(0,2)}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`;
    const joinDate = new Date(user.joinDate).toLocaleDateString();
    const t = translations[currentLanguage];
    
    const modal = document.createElement('div');
    modal.className = 'mini-profile-modal';
    modal.innerHTML = `
        <div class="mini-profile-content">
            <div class="mini-profile-header">
                <img src="${avatarUrl}" class="mini-profile-avatar" onclick="closeMiniProfile()">
                <button class="mini-profile-close" onclick="closeMiniProfile()">×</button>
            </div>
            <div class="mini-profile-body">
                <h3>${escapeHtml(user.displayName || user.username)}</h3>
                <p class="mini-profile-username">@${escapeHtml(user.username)}</p>
                ${user.bio ? `<p class="mini-profile-bio">${escapeHtml(user.bio)}</p>` : ''}
                <p class="mini-profile-joined">${t.joined} ${joinDate}</p>
                <div class="mini-profile-stats">
                    <div><strong>${user.followers || 0}</strong> ${t.followers}</div>
                    <div><strong>${user.following || 0}</strong> ${t.following}</div>
                </div>
                <button class="mini-profile-btn" onclick="goToFullProfile('${userId}')">${t.showProfile}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
    document.addEventListener('click', function closeOnClick(e) {
        if (!modal.contains(e.target) && !e.target.closest('.post-avatar') && !e.target.closest('.post-name')) {
            modal.remove();
            document.removeEventListener('click', closeOnClick);
        }
    });
};

window.closeMiniProfile = function() {
    const modal = document.querySelector('.mini-profile-modal');
    if (modal) modal.remove();
};

window.goToFullProfile = function(userId) {
    closeMiniProfile();
    if (userId === currentUser.id) {
        switchPage('profile');
    } else {
        showCustomAlert('Viewing other profiles coming soon!');
    }
};

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
            showCustomAlert(translations[currentLanguage].postReposted);
        } else {
            userRepostedPosts.delete(postId);
            showCustomAlert(translations[currentLanguage].repostRemoved);
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
        showCustomAlert(translations[currentLanguage].postSaved);
    } else {
        userSavedPosts.delete(postId);
        showCustomAlert(translations[currentLanguage].postRemovedFromSaves);
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
        showCustomAlert(translations[currentLanguage].commentDeleted);
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
    showCustomAlert(translations[currentLanguage].postUpdated);
});

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    await fetch(`${API_URL}/api/posts/${currentDeletePostId}`, {
        method: 'DELETE'
    });
    document.getElementById('deleteModal').classList.remove('active');
    loadPosts();
    showCustomAlert(translations[currentLanguage].postDeleted);
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
            container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-tertiary)">${translations[currentLanguage].noResults}</div>`;
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
        showCustomAlert(translations[currentLanguage].profileUpdated);
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
    location.reload();
});

document.getElementById('saveProfileSettingsBtn')?.addEventListener('click', async () => {
    const newDisplayName = document.getElementById('displayNameInput').value;
    const newUsername = document.getElementById('usernameInput').value;
    const password = document.getElementById('confirmPasswordInput').value;
    const confirmPassword = document.getElementById('confirmNewPasswordInput').value;
    const t = translations[currentLanguage];
    
    if (password !== confirmPassword) {
        showCustomAlert(t.passwordsDoNotMatch);
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
            document.getElementById('displayNameStatus').textContent = t.displayNameUpdated;
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
            document.getElementById('usernameStatus').textContent = t.usernameUpdated;
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
    document.getElementById('confirmNewPasswordInput').value = ();
});

// Avatar Editor
let currentAvatarFile = null;
let currentAvatarCropper = null;

document.getElementById('editAvatarBtn')?.addEventListener('click', () => {
    document.getElementById('avatarStep1').style.display = 'flex';
    document.getElementById('avatarStep2').style.display = 'none';
    document.getElementById('avatarModalTitle').textContent = translations[currentLanguage].changeAvatar;
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
    document.getElementById('avatarModalTitle').textContent = translations[currentLanguage].changeAvatar;
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
                showCustomAlert(translations[currentLanguage].avatarUpdated);
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
    const t = translations[currentLanguage];
    
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
            searchResults.innerHTML = `<div style="text-align:center;padding:20px">${t.noResults}</div>`;
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
    const t = translations[currentLanguage];
    
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
