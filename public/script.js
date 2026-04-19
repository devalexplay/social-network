const API_URL = window.location.origin;
let currentUser = null;
let currentPage = 'home';
let allPosts = [];
let currentEditPostId = null;
let currentDeletePostId = null;
let currentCommentPostId = null;

const translations = {
    en: {
        appName: 'FreedomNet', signIn: 'Sign in', signUp: 'Sign up',
        emailOrUsername: 'Email or username', password: 'Password',
        rememberMe: 'Remember me', forgotPassword: 'Forgot password?',
        signInBtn: 'Sign in', fullName: 'Full name', username: 'Username',
        email: 'Email', confirmPassword: 'Confirm password', createAccount: 'Create account',
        home: 'Home', explore: 'Explore', notifications: 'Notifications',
        messages: 'Messages', profile: 'Profile', settings: 'Settings',
        logout: 'Logout', post: 'Post', trendingNow: 'Trending now',
        welcomeNotification: 'Welcome to FreedomNet!', noMessages: 'No messages yet',
        posts: 'Posts', followers: 'Followers', following: 'Following',
        editProfile: 'Edit profile', appearance: 'Appearance', theme: 'Theme',
        dark: 'Dark', light: 'Light', language: 'Language',
        notificationsSettings: 'Notifications', pushNotifications: 'Push notifications',
        emailUpdates: 'Email updates', saveChanges: 'Save changes',
        editPost: 'Edit post', cancel: 'Cancel', save: 'Save',
        deletePost: 'Delete post?', deleteConfirm: 'Are you sure you want to delete this post? This action cannot be undone.',
        delete: 'Delete', addComment: 'Add comment', comment: 'Comment',
        edit: 'Edit', delete_: 'Delete'
    },
    zh: {
        appName: '自由网', signIn: '登录', signUp: '注册',
        emailOrUsername: '邮箱或用户名', password: '密码',
        rememberMe: '记住我', forgotPassword: '忘记密码？',
        signInBtn: '登录', fullName: '全名', username: '用户名',
        email: '邮箱', confirmPassword: '确认密码', createAccount: '创建账户',
        home: '首页', explore: '探索', notifications: '通知',
        messages: '消息', profile: '个人资料', settings: '设置',
        logout: '退出', post: '发布', trendingNow: '热门趋势',
        welcomeNotification: '欢迎来到自由网！', noMessages: '暂无消息',
        posts: '帖子', followers: '粉丝', following: '关注',
        editProfile: '编辑资料', appearance: '外观', theme: '主题',
        dark: '深色', light: '浅色', language: '语言',
        notificationsSettings: '通知设置', pushNotifications: '推送通知',
        emailUpdates: '邮件更新', saveChanges: '保存更改',
        editPost: '编辑帖子', cancel: '取消', save: '保存',
        deletePost: '删除帖子？', deleteConfirm: '确定要删除此帖子吗？此操作无法撤销。',
        delete: '删除', addComment: '添加评论', comment: '评论',
        edit: '编辑', delete_: '删除'
    },
    hi: {
        appName: 'फ्रीडमनेट', signIn: 'साइन इन', signUp: 'साइन अप',
        emailOrUsername: 'ईमेल या उपयोगकर्ता नाम', password: 'पासवर्ड',
        rememberMe: 'मुझे याद रखें', forgotPassword: 'पासवर्ड भूल गए?',
        signInBtn: 'साइन इन', fullName: 'पूरा नाम', username: 'उपयोगकर्ता नाम',
        email: 'ईमेल', confirmPassword: 'पासवर्ड पुष्टि करें', createAccount: 'खाता बनाएं',
        home: 'होम', explore: 'एक्सप्लोर', notifications: 'सूचनाएं',
        messages: 'संदेश', profile: 'प्रोफाइल', settings: 'सेटिंग्स',
        logout: 'लॉगआउट', post: 'पोस्ट', trendingNow: 'ट्रेंडिंग',
        welcomeNotification: 'फ्रीडमनेट में आपका स्वागत है!', noMessages: 'कोई संदेश नहीं',
        posts: 'पोस्ट', followers: 'फॉलोअर्स', following: 'फॉलोइंग',
        editProfile: 'प्रोफाइल संपादित करें', appearance: 'दिखावट', theme: 'थीम',
        dark: 'डार्क', light: 'लाइट', language: 'भाषा',
        notificationsSettings: 'सूचनाएं', pushNotifications: 'पुश सूचनाएं',
        emailUpdates: 'ईमेल अपडेट', saveChanges: 'बदलाव सहेजें',
        editPost: 'पोस्ट संपादित करें', cancel: 'रद्द करें', save: 'सहेजें',
        deletePost: 'पोस्ट हटाएं?', deleteConfirm: 'क्या आप यह पोस्ट हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
        delete: 'हटाएं', addComment: 'टिप्पणी जोड़ें', comment: 'टिप्पणी',
        edit: 'संपादित करें', delete_: 'हटाएं'
    },
    es: {
        appName: 'FreedomNet', signIn: 'Iniciar sesión', signUp: 'Registrarse',
        emailOrUsername: 'Correo o usuario', password: 'Contraseña',
        rememberMe: 'Recordarme', forgotPassword: '¿Olvidaste tu contraseña?',
        signInBtn: 'Iniciar sesión', fullName: 'Nombre completo', username: 'Usuario',
        email: 'Correo', confirmPassword: 'Confirmar contraseña', createAccount: 'Crear cuenta',
        home: 'Inicio', explore: 'Explorar', notifications: 'Notificaciones',
        messages: 'Mensajes', profile: 'Perfil', settings: 'Ajustes',
        logout: 'Cerrar sesión', post: 'Publicar', trendingNow: 'Tendencias',
        welcomeNotification: '¡Bienvenido a FreedomNet!', noMessages: 'Sin mensajes',
        posts: 'Publicaciones', followers: 'Seguidores', following: 'Siguiendo',
        editProfile: 'Editar perfil', appearance: 'Apariencia', theme: 'Tema',
        dark: 'Oscuro', light: 'Claro', language: 'Idioma',
        notificationsSettings: 'Notificaciones', pushNotifications: 'Notificaciones push',
        emailUpdates: 'Actualizaciones por correo', saveChanges: 'Guardar cambios',
        editPost: 'Editar publicación', cancel: 'Cancelar', save: 'Guardar',
        deletePost: '¿Eliminar publicación?', deleteConfirm: '¿Seguro que quieres eliminar esta publicación? Esta acción no se puede deshacer.',
        delete: 'Eliminar', addComment: 'Agregar comentario', comment: 'Comentar',
        edit: 'Editar', delete_: 'Eliminar'
    },
    fr: {
        appName: 'FreedomNet', signIn: 'Connexion', signUp: 'Inscription',
        emailOrUsername: 'Email ou nom', password: 'Mot de passe',
        rememberMe: 'Se souvenir', forgotPassword: 'Mot de passe oublié?',
        signInBtn: 'Se connecter', fullName: 'Nom complet', username: 'Nom',
        email: 'Email', confirmPassword: 'Confirmer', createAccount: 'Créer',
        home: 'Accueil', explore: 'Explorer', notifications: 'Notifications',
        messages: 'Messages', profile: 'Profil', settings: 'Paramètres',
        logout: 'Déconnexion', post: 'Publier', trendingNow: 'Tendances',
        welcomeNotification: 'Bienvenue sur FreedomNet!', noMessages: 'Aucun message',
        posts: 'Publications', followers: 'Abonnés', following: 'Abonnements',
        editProfile: 'Modifier', appearance: 'Apparence', theme: 'Thème',
        dark: 'Sombre', light: 'Clair', language: 'Langue',
        notificationsSettings: 'Notifications', pushNotifications: 'Notifications push',
        emailUpdates: 'Emails', saveChanges: 'Enregistrer',
        editPost: 'Modifier', cancel: 'Annuler', save: 'Enregistrer',
        deletePost: 'Supprimer?', deleteConfirm: 'Voulez-vous vraiment supprimer?',
        delete: 'Supprimer', addComment: 'Commenter', comment: 'Commentaire',
        edit: 'Modifier', delete_: 'Supprimer'
    },
    ar: {
        appName: 'فريدوم نت', signIn: 'تسجيل الدخول', signUp: 'اشتراك',
        emailOrUsername: 'البريد الإلكتروني أو اسم المستخدم', password: 'كلمة المرور',
        rememberMe: 'تذكرني', forgotPassword: 'نسيت كلمة المرور؟',
        signInBtn: 'تسجيل الدخول', fullName: 'الاسم الكامل', username: 'اسم المستخدم',
        email: 'البريد الإلكتروني', confirmPassword: 'تأكيد كلمة المرور', createAccount: 'إنشاء حساب',
        home: 'الرئيسية', explore: 'استكشاف', notifications: 'الإشعارات',
        messages: 'الرسائل', profile: 'الملف الشخصي', settings: 'الإعدادات',
        logout: 'تسجيل الخروج', post: 'نشر', trendingNow: 'الأكثر تداولا',
        welcomeNotification: 'مرحبا بك في فريدوم نت!', noMessages: 'لا توجد رسائل',
        posts: 'المنشورات', followers: 'المتابعون', following: 'يتابع',
        editProfile: 'تعديل الملف', appearance: 'المظهر', theme: 'الثيم',
        dark: 'داكن', light: 'فاتح', language: 'اللغة',
        notificationsSettings: 'الإشعارات', pushNotifications: 'إشعارات فورية',
        emailUpdates: 'تحديثات البريد', saveChanges: 'حفظ التغييرات',
        editPost: 'تعديل المنشور', cancel: 'إلغاء', save: 'حفظ',
        deletePost: 'حذف المنشور؟', deleteConfirm: 'هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.',
        delete: 'حذف', addComment: 'إضافة تعليق', comment: 'تعليق',
        edit: 'تعديل', delete_: 'حذف'
    },
    bn: {
        appName: 'ফ্রিডমনেট', signIn: 'সাইন ইন', signUp: 'সাইন আপ',
        emailOrUsername: 'ইমেইল বা ইউজারনেম', password: 'পাসওয়ার্ড',
        rememberMe: 'মনে রাখুন', forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
        signInBtn: 'সাইন ইন', fullName: 'পুরো নাম', username: 'ইউজারনেম',
        email: 'ইমেইল', confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন', createAccount: 'অ্যাকাউন্ট তৈরি করুন',
        home: 'হোম', explore: 'এক্সপ্লোর', notifications: 'নোটিফিকেশন',
        messages: 'মেসেজ', profile: 'প্রোফাইল', settings: 'সেটিংস',
        logout: 'লগআউট', post: 'পোস্ট', trendingNow: 'ট্রেন্ডিং',
        welcomeNotification: 'ফ্রিডমনেটে স্বাগতম!', noMessages: 'কোনো মেসেজ নেই',
        posts: 'পোস্ট', followers: 'ফলোয়ার', following: 'ফলোইং',
        editProfile: 'প্রোফাইল এডিট', appearance: 'আবির্ভাব', theme: 'থিম',
        dark: 'ডার্ক', light: 'লাইট', language: 'ভাষা',
        notificationsSettings: 'নোটিফিকেশন', pushNotifications: 'পুশ নোটিফিকেশন',
        emailUpdates: 'ইমেইল আপডেট', saveChanges: 'সংরক্ষণ করুন',
        editPost: 'পোস্ট এডিট', cancel: 'বাতিল', save: 'সংরক্ষণ',
        deletePost: 'পোস্ট মুছবেন?', deleteConfirm: 'আপনি কি এই পোস্ট মুছতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
        delete: 'মুছুন', addComment: 'মন্তব্য যোগ করুন', comment: 'মন্তব্য',
        edit: 'এডিট', delete_: 'মুছুন'
    },
    pt: {
        appName: 'FreedomNet', signIn: 'Entrar', signUp: 'Cadastrar',
        emailOrUsername: 'Email ou usuário', password: 'Senha',
        rememberMe: 'Lembrar', forgotPassword: 'Esqueceu a senha?',
        signInBtn: 'Entrar', fullName: 'Nome completo', username: 'Usuário',
        email: 'Email', confirmPassword: 'Confirmar senha', createAccount: 'Criar conta',
        home: 'Início', explore: 'Explorar', notifications: 'Notificações',
        messages: 'Mensagens', profile: 'Perfil', settings: 'Configurações',
        logout: 'Sair', post: 'Publicar', trendingNow: 'Tendências',
        welcomeNotification: 'Bem-vindo ao FreedomNet!', noMessages: 'Sem mensagens',
        posts: 'Publicações', followers: 'Seguidores', following: 'Seguindo',
        editProfile: 'Editar perfil', appearance: 'Aparência', theme: 'Tema',
        dark: 'Escuro', light: 'Claro', language: 'Idioma',
        notificationsSettings: 'Notificações', pushNotifications: 'Notificações push',
        emailUpdates: 'Atualizações por email', saveChanges: 'Salvar',
        editPost: 'Editar post', cancel: 'Cancelar', save: 'Salvar',
        deletePost: 'Excluir post?', deleteConfirm: 'Tem certeza que deseja excluir?',
        delete: 'Excluir', addComment: 'Comentar', comment: 'Comentário',
        edit: 'Editar', delete_: 'Excluir'
    },
    ru: {
        appName: 'ФридомНет', signIn: 'Войти', signUp: 'Регистрация',
        emailOrUsername: 'Email или имя', password: 'Пароль',
        rememberMe: 'Запомнить', forgotPassword: 'Забыли пароль?',
        signInBtn: 'Войти', fullName: 'Полное имя', username: 'Имя',
        email: 'Email', confirmPassword: 'Подтвердить', createAccount: 'Создать',
        home: 'Главная', explore: 'Обзор', notifications: 'Уведомления',
        messages: 'Сообщения', profile: 'Профиль', settings: 'Настройки',
        logout: 'Выйти', post: 'Опубликовать', trendingNow: 'Тренды',
        welcomeNotification: 'Добро пожаловать!', noMessages: 'Нет сообщений',
        posts: 'Посты', followers: 'Подписчики', following: 'Подписки',
        editProfile: 'Редактировать', appearance: 'Внешний вид', theme: 'Тема',
        dark: 'Темная', light: 'Светлая', language: 'Язык',
        notificationsSettings: 'Уведомления', pushNotifications: 'Push уведомления',
        emailUpdates: 'Email рассылка', saveChanges: 'Сохранить',
        editPost: 'Редактировать', cancel: 'Отмена', save: 'Сохранить',
        deletePost: 'Удалить?', deleteConfirm: 'Вы уверены?',
        delete: 'Удалить', addComment: 'Комментировать', comment: 'Комментарий',
        edit: 'Редактировать', delete_: 'Удалить'
    },
    ur: {
        appName: 'فریڈم نیٹ', signIn: 'سائن ان', signUp: 'سائن اپ',
        emailOrUsername: 'ای میل یا صارف نام', password: 'پاس ورڈ',
        rememberMe: 'مجھے یاد رکھیں', forgotPassword: 'پاس ورڈ بھول گئے؟',
        signInBtn: 'سائن ان', fullName: 'پورا نام', username: 'صارف نام',
        email: 'ای میل', confirmPassword: 'پاس ورڈ کی تصدیق', createAccount: 'اکاؤنٹ بنائیں',
        home: 'ہوم', explore: 'ایکسپلور', notifications: 'اطلاعات',
        messages: 'پیغامات', profile: 'پروفائل', settings: 'ترتیبات',
        logout: 'لاگ آؤٹ', post: 'پوسٹ کریں', trendingNow: 'ٹرینڈنگ',
        welcomeNotification: 'فریڈم نیٹ میں خوش آمدید!', noMessages: 'کوئی پیغام نہیں',
        posts: 'پوسٹیں', followers: 'فالوورز', following: 'فالو کر رہے ہیں',
        editProfile: 'پروفائل ترمیم کریں', appearance: 'ظاہری شکل', theme: 'تھیم',
        dark: 'ڈارک', light: 'لائٹ', language: 'زبان',
        notificationsSettings: 'اطلاعات', pushNotifications: 'پش اطلاعات',
        emailUpdates: 'ای میل اپڈیٹس', saveChanges: 'تبدیلیاں محفوظ کریں',
        editPost: 'پوسٹ ترمیم کریں', cancel: 'منسوخ', save: 'محفوظ کریں',
        deletePost: 'پوسٹ حذف کریں؟', deleteConfirm: 'کیا آپ واقعی اس پوسٹ کو حذف کرنا چاہتے ہیں؟',
        delete: 'حذف کریں', addComment: 'تبصرہ شامل کریں', comment: 'تبصرہ',
        edit: 'ترمیم', delete_: 'حذف'
    },
    el: {
        appName: 'FreedomNet', signIn: 'Σύνδεση', signUp: 'Εγγραφή',
        emailOrUsername: 'Email ή όνομα', password: 'Κωδικός',
        rememberMe: 'Θυμήσου με', forgotPassword: 'Ξεχάσατε τον κωδικό;',
        signInBtn: 'Σύνδεση', fullName: 'Πλήρες όνομα', username: 'Όνομα',
        email: 'Email', confirmPassword: 'Επιβεβαίωση', createAccount: 'Δημιουργία',
        home: 'Αρχική', explore: 'Εξερεύνηση', notifications: 'Ειδοποιήσεις',
        messages: 'Μηνύματα', profile: 'Προφίλ', settings: 'Ρυθμίσεις',
        logout: 'Αποσύνδεση', post: 'Δημοσίευση', trendingNow: 'Τάσεις',
        welcomeNotification: 'Καλώς ήρθατε!', noMessages: 'Κανένα μήνυμα',
        posts: 'Δημοσιεύσεις', followers: 'Ακόλουθοι', following: 'Ακολουθεί',
        editProfile: 'Επεξεργασία', appearance: 'Εμφάνιση', theme: 'Θέμα',
        dark: 'Σκοτεινό', light: 'Φωτεινό', language: 'Γλώσσα',
        notificationsSettings: 'Ειδοποιήσεις', pushNotifications: 'Push ειδοποιήσεις',
        emailUpdates: 'Email ενημερώσεις', saveChanges: 'Αποθήκευση',
        editPost: 'Επεξεργασία', cancel: 'Ακύρωση', save: 'Αποθήκευση',
        deletePost: 'Διαγραφή;', deleteConfirm: 'Είστε σίγουροι;',
        delete: 'Διαγραφή', addComment: 'Σχόλιο', comment: 'Σχόλιο',
        edit: 'Επεξεργασία', delete_: 'Διαγραφή'
    }
};

let currentLanguage = 'en';

function updateLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });
    document.getElementById('languageSelect').value = lang;
    document.getElementById('settingsLanguageSelect').value = lang;
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
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    const savedLang = localStorage.getItem('language') || 'en';
    updateLanguage(savedLang);
    
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
        home: 'home', explore: 'explore', notifications: 'notifications',
        messages: 'messages', profile: 'profile', settings: 'settings'
    };
    const titleKey = titles[page] || 'home';
    document.getElementById('pageTitle').textContent = translations[currentLanguage][titleKey] || titleKey;
    
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
    btn.textContent = translations[currentLanguage].post || 'Post';
});

async function loadPosts() {
    const res = await fetch(`${API_URL}/api/posts`);
    allPosts = await res.json();
    const feed = document.getElementById('postsList');
    
    if (allPosts.length === 0) {
        feed.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-tertiary)">No posts yet. Be the first!</div>';
        return;
    }
    
    feed.innerHTML = allPosts.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            <img class="post-avatar" src="${post.user?.avatar}" onerror="this.src='https://ui-avatars.com/api/?name=${post.user?.username}&background=1d9bf0&color=fff'">
            <div class="post-body">
                <div class="post-header">
                    <span class="post-name">${escapeHtml(post.user?.fullName || post.user?.username)}</span>
                    <span class="post-username">@${escapeHtml(post.user?.username)}</span>
                    <span class="post-time">${formatTime(post.createdAt)}</span>
                    ${post.userId === currentUser.id ? `
                        <div class="post-menu">
                            <button class="menu-btn" onclick="toggleMenu(event, '${post.id}')">•••</button>
                            <div class="post-menu-dropdown" id="menu-${post.id}">
                                <div class="dropdown-item" onclick="editPost('${post.id}', '${escapeHtml(post.content).replace(/'/g, "\\'")}')">${translations[currentLanguage].edit || 'Edit'}</div>
                                <div class="dropdown-item delete" onclick="deletePost('${post.id}')">${translations[currentLanguage].delete_ || 'Delete'}</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="post-text">${escapeHtml(post.content)}</div>
                <div class="post-actions">
                    <button class="action-btn like" onclick="likePost('${post.id}')">❤️ <span>${post.likes}</span></button>
                    <button class="action-btn comment" onclick="openCommentModal('${post.id}')">💬 <span>${post.comments?.length || 0}</span></button>
                    <button class="action-btn repost" onclick="repostPost('${post.id}')">🔄 <span>${post.reposts || 0}</span></button>
                    <button class="action-btn save" onclick="savePost('${post.id}')">🔖</button>
                </div>
                ${post.comments && post.comments.length > 0 ? `
                    <div class="post-comments">
                        ${post.comments.slice(0, 2).map(c => `
                            <div class="comment-item">
                                <strong>${escapeHtml(c.fullName || c.username)}</strong> ${escapeHtml(c.comment)}
                            </div>
                        `).join('')}
                        ${post.comments.length > 2 ? `<div class="more-comments">+${post.comments.length - 2} more comments</div>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
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

window.likePost = async (postId) => {
    await fetch(`${API_URL}/api/posts/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
    });
    loadPosts();
};

window.repostPost = async (postId) => {
    await fetch(`${API_URL}/api/posts/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
    });
    loadPosts();
    showCustomAlert('Post reposted!');
};

window.savePost = async (postId) => {
    await fetch(`${API_URL}/api/posts/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
    });
    showCustomAlert('Post saved!');
};

window.openCommentModal = function(postId) {
    currentCommentPostId = postId;
    document.getElementById('commentInput').value = '';
    document.getElementById('commentModal').classList.add('active');
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
        container.innerHTML = userPosts.map(post => `
            <div class="post-card">
                <img class="post-avatar" src="${currentUser.avatar}">
                <div class="post-body">
                    <div class="post-text">${escapeHtml(post.content)}</div>
                    <div class="post-actions">
                        <span>❤️ ${post.likes}</span>
                        <span>💬 ${post.comments?.length || 0}</span>
                        <span>🔄 ${post.reposts || 0}</span>
                    </div>
                </div>
            </div>
        `).join('');
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
    updateLanguage(e.target.value);
});

document.getElementById('settingsLanguageSelect')?.addEventListener('change', (e) => {
    updateLanguage(e.target.value);
});

document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    showCustomAlert('Settings saved!');
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
