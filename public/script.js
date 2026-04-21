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
let currentViewingUser = null;
let feedViewMode = 'card';
let profileTab = 'posts';
let settingsTab = 'general';

const ADMIN_USERNAME = 'devalexplay';

const translations = {
    en: {
        appName: 'FreedomNet', signIn: 'Sign in', signUp: 'Sign up',
        emailOrUsername: 'Email or username', password: 'Password',
        rememberMe: 'Remember me', forgotPassword: 'Forgot password?',
        signInBtn: 'Sign in', fullName: 'Display name', username: 'Username',
        email: 'Email', confirmPassword: 'Confirm password', createAccount: 'Create account',
        home: 'Home', explore: 'Explore', notifications: 'Notifications',
        messages: 'Messages', profile: 'Profile', settings: 'Settings', bookmarks: 'Bookmarks',
        logout: 'Logout', post: 'Post', trendingNow: 'Trending now',
        welcomeNotification: 'Welcome to FreedomNet!', noMessages: 'No messages yet',
        posts: 'Posts', followers: 'Followers', following: 'Following',
        editProfile: 'Edit profile', appearance: 'Appearance', theme: 'Theme',
        dark: 'Dark', light: 'Light', language: 'Language',
        notificationsSettings: 'Notifications', pushNotifications: 'Push notifications',
        emailUpdates: 'Email updates', saveChanges: 'Save changes',
        editPost: 'Edit post', cancel: 'Cancel', save: 'Save',
        deletePost: 'Delete post?', deleteConfirm: 'Are you sure you want to delete this post?',
        delete: 'Delete', addComment: 'Add comment', comment: 'Comment',
        edit: 'Edit', delete_: 'Delete', changeAvatar: 'Change avatar',
        profileSettings: 'Profile Settings', displayName: 'Display Name',
        displayNameHint: 'Can be changed every 14 days', usernameHint: 'Can be changed every 90 days',
        selectLanguage: 'Select language', search: 'Search', noResults: 'No results found',
        joined: 'Joined', showProfile: 'Show profile', posting: 'Posting...',
        postPublished: 'Post published!', failedToPost: 'Failed to post',
        errorPosting: 'Error posting', pleaseWriteSomething: 'Write something',
        postUpdated: 'Post updated!', postDeleted: 'Post deleted!',
        postReposted: 'Post reposted!', repostRemoved: 'Repost removed',
        postSaved: 'Post saved!', postRemovedFromSaves: 'Post removed from saves',
        commentDeleted: 'Comment deleted', profileUpdated: 'Profile updated!',
        avatarUpdated: 'Avatar updated!', displayNameUpdated: 'Display name updated!',
        usernameUpdated: 'Username updated!', settingsSaved: 'Settings saved!',
        passwordsDoNotMatch: 'Passwords do not match', pleaseFillAllFields: 'Fill all fields',
        connectionError: 'Connection error', invalidCredentials: 'Invalid credentials',
        accountCreated: 'Account created!', welcomeBack: 'Welcome back!',
        allFieldsRequired: 'All fields required', passwordTooShort: 'Password too short',
        noSavedPosts: 'No saved posts yet', savePostHint: 'Click the bookmark icon on any post to save it here',
        adminPanel: 'Admin Panel', addOfficialTitle: 'Add Official Title', removeOfficialTitle: 'Remove Official Title',
        official: '⭐Official', deleteAccount: 'Delete Account', deleteAccountWarning: 'WARNING: This action is permanent!', 
        deleteAccountConfirm: 'Are you absolutely sure? This will delete your account and all your data forever.',
        deleteAccountSuccess: 'Account deleted successfully', changeUsername: 'Change Username',
        changeDisplayName: 'Change Display Name', newUsername: 'New username', newDisplayName: 'New display name',
        currentPassword: 'Current password', confirmNewPassword: 'Confirm new password',
        usernameChanged: 'Username changed successfully!', displayNameChanged: 'Display name changed successfully!',
        matureContent: 'Mature Content', matureContentDesc: 'See Not Safe for Work mature and adult content in your feeds and search results.',
        blurMature: 'Blur mature (18+)', blurMatureDesc: 'Blur images and media that may be sensitive.',
        experience: 'Experience', defaultFeedView: 'Default feed view', cardMode: 'Card Mode', compactMode: 'Compact Mode',
        showMatureContent: 'Show mature content', blurMatureMedia: 'Blur mature media',
        displayNameChangeHint: 'You can change the display name only once every 14 days.',
        usernameChangeHint: 'You can change the username only once every 90 days.',
        dangerZone: 'Danger Zone', security: 'Security', privacy: 'Privacy', helpCenter: 'Help Center',
        changeEmail: 'Change Email', newEmail: 'New email', emailChanged: 'Email changed successfully!',
        changePassword: 'Change Password', newPassword: 'New password', passwordChanged: 'Password changed successfully!',
        currentPasswordRequired: 'Current password required', forgotPasswordHint: 'Forgot password? Hint:',
        askQuestion: 'Ask a question', typeQuestion: 'Type your question here...', aiResponse: 'AI Response',
        postsTab: 'Posts', repostsTab: 'Reposts', settingsTab: 'Settings', helpTab: 'Help',
        general: 'General', profileTabTitle: 'Profile', repostsTitle: 'Reposts', settingsTitle: 'Settings',
        helpTitle: 'Help Center', askAI: 'Ask AI Assistant', typeMessage: 'Type your message...',
        send: 'Send', aiThinking: 'AI is thinking...', noReposts: 'No reposts yet', cancel: 'Cancel', save: 'Save',
        changePasswordHint: 'Your password hint is:', enterNewPassword: 'Enter new password', confirmNewPassword: 'Confirm new password'
    },
    ru: {
        appName: 'FreedomNet', signIn: 'Войти', signUp: 'Регистрация',
        emailOrUsername: 'Email или имя', password: 'Пароль',
        rememberMe: 'Запомнить меня', forgotPassword: 'Забыли пароль?',
        signInBtn: 'Войти', fullName: 'Отображаемое имя', username: 'Имя пользователя',
        email: 'Email', confirmPassword: 'Подтвердите пароль', createAccount: 'Создать аккаунт',
        home: 'Главная', explore: 'Обзор', notifications: 'Уведомления',
        messages: 'Сообщения', profile: 'Профиль', settings: 'Настройки', bookmarks: 'Закладки',
        logout: 'Выйти', post: 'Опубликовать', trendingNow: 'В тренде',
        welcomeNotification: 'Добро пожаловать в FreedomNet!', noMessages: 'Нет сообщений',
        posts: 'Посты', followers: 'Подписчики', following: 'Подписки',
        editProfile: 'Редактировать', appearance: 'Внешний вид', theme: 'Тема',
        dark: 'Темная', light: 'Светлая', language: 'Язык',
        notificationsSettings: 'Уведомления', pushNotifications: 'Push уведомления',
        emailUpdates: 'Email рассылка', saveChanges: 'Сохранить',
        editPost: 'Редактировать', cancel: 'Отмена', save: 'Сохранить',
        deletePost: 'Удалить пост?', deleteConfirm: 'Вы уверены, что хотите удалить этот пост?',
        delete: 'Удалить', addComment: 'Добавить комментарий', comment: 'Комментировать',
        edit: 'Редактировать', delete_: 'Удалить', changeAvatar: 'Сменить аватар',
        profileSettings: 'Настройки профиля', displayName: 'Отображаемое имя',
        displayNameHint: 'Можно менять каждые 14 дней', usernameHint: 'Можно менять каждые 90 дней',
        selectLanguage: 'Выберите язык', search: 'Поиск', noResults: 'Ничего не найдено',
        joined: 'Присоединился', showProfile: 'Показать профиль', posting: 'Публикация...',
        postPublished: 'Пост опубликован!', failedToPost: 'Не удалось опубликовать',
        errorPosting: 'Ошибка публикации', pleaseWriteSomething: 'Напишите что-нибудь',
        postUpdated: 'Пост обновлен!', postDeleted: 'Пост удален!',
        postReposted: 'Пост репостнут!', repostRemoved: 'Репост удален',
        postSaved: 'Пост сохранен!', postRemovedFromSaves: 'Пост удален из сохраненных',
        commentDeleted: 'Комментарий удален', profileUpdated: 'Профиль обновлен!',
        avatarUpdated: 'Аватар обновлен!', displayNameUpdated: 'Имя обновлено!',
        usernameUpdated: 'Имя пользователя обновлено!', settingsSaved: 'Настройки сохранены!',
        passwordsDoNotMatch: 'Пароли не совпадают', pleaseFillAllFields: 'Заполните все поля',
        connectionError: 'Ошибка соединения', invalidCredentials: 'Неверные данные',
        accountCreated: 'Аккаунт создан!', welcomeBack: 'С возвращением!',
        allFieldsRequired: 'Все поля обязательны', passwordTooShort: 'Пароль должен быть не менее 6 символов',
        noSavedPosts: 'Нет сохраненных постов', savePostHint: 'Нажмите на значок закладки на любом посте, чтобы сохранить его здесь',
        adminPanel: 'Панель администратора', addOfficialTitle: 'Добавить статус Official', removeOfficialTitle: 'Удалить статус Official',
        official: '⭐Official', deleteAccount: 'Удалить аккаунт', deleteAccountWarning: 'ВНИМАНИЕ: Это действие необратимо!',
        deleteAccountConfirm: 'Вы абсолютно уверены? Это удалит ваш аккаунт и все данные навсегда.',
        deleteAccountSuccess: 'Аккаунт успешно удален', changeUsername: 'Изменить имя пользователя',
        changeDisplayName: 'Изменить отображаемое имя', newUsername: 'Новое имя пользователя', newDisplayName: 'Новое отображаемое имя',
        currentPassword: 'Текущий пароль', confirmNewPassword: 'Подтвердите новый пароль',
        usernameChanged: 'Имя пользователя успешно изменено!', displayNameChanged: 'Отображаемое имя успешно изменено!',
        matureContent: 'Контент для взрослых', matureContentDesc: 'Показывать контент для взрослых в ленте и результатах поиска.',
        blurMature: 'Размытие (18+)', blurMatureDesc: 'Размывать изображения и медиа, которые могут быть чувствительными.',
        experience: 'Опыт', defaultFeedView: 'Вид ленты по умолчанию', cardMode: 'Карточки', compactMode: 'Компактный',
        showMatureContent: 'Показывать контент для взрослых', blurMatureMedia: 'Размывать медиа для взрослых',
        displayNameChangeHint: 'Вы можете изменить отображаемое имя только раз в 14 дней.',
        usernameChangeHint: 'Вы можете изменить имя пользователя только раз в 90 дней.',
        dangerZone: 'Опасная зона', security: 'Безопасность', privacy: 'Конфиденциальность', helpCenter: 'Центр помощи',
        changeEmail: 'Изменить email', newEmail: 'Новый email', emailChanged: 'Email успешно изменен!',
        changePassword: 'Изменить пароль', newPassword: 'Новый пароль', passwordChanged: 'Пароль успешно изменен!',
        currentPasswordRequired: 'Требуется текущий пароль', forgotPasswordHint: 'Забыли пароль? Подсказка:',
        askQuestion: 'Задать вопрос', typeQuestion: 'Введите ваш вопрос...', aiResponse: 'Ответ ИИ',
        postsTab: 'Посты', repostsTab: 'Репосты', settingsTab: 'Настройки', helpTab: 'Помощь',
        general: 'Общие', profileTabTitle: 'Профиль', repostsTitle: 'Репосты', settingsTitle: 'Настройки',
        helpTitle: 'Центр помощи', askAI: 'Спросить ИИ помощника', typeMessage: 'Введите ваше сообщение...',
        send: 'Отправить', aiThinking: 'ИИ думает...', noReposts: 'Нет репостов', cancel: 'Отмена', save: 'Сохранить',
        changePasswordHint: 'Подсказка вашего пароля:', enterNewPassword: 'Введите новый пароль', confirmNewPassword: 'Подтвердите новый пароль'
    },
    es: {
        appName: 'FreedomNet', signIn: 'Iniciar sesión', signUp: 'Registrarse',
        emailOrUsername: 'Email o usuario', password: 'Contraseña',
        rememberMe: 'Recordarme', forgotPassword: '¿Olvidaste tu contraseña?',
        signInBtn: 'Iniciar sesión', fullName: 'Nombre mostrado', username: 'Usuario',
        email: 'Email', confirmPassword: 'Confirmar contraseña', createAccount: 'Crear cuenta',
        home: 'Inicio', explore: 'Explorar', notifications: 'Notificaciones',
        messages: 'Mensajes', profile: 'Perfil', settings: 'Ajustes', bookmarks: 'Marcadores',
        logout: 'Cerrar sesión', post: 'Publicar', trendingNow: 'Tendencias',
        welcomeNotification: '¡Bienvenido a FreedomNet!', noMessages: 'Sin mensajes',
        posts: 'Publicaciones', followers: 'Seguidores', following: 'Siguiendo',
        editProfile: 'Editar perfil', appearance: 'Apariencia', theme: 'Tema',
        dark: 'Oscuro', light: 'Claro', language: 'Idioma',
        notificationsSettings: 'Notificaciones', pushNotifications: 'Notificaciones push',
        emailUpdates: 'Actualizaciones por email', saveChanges: 'Guardar cambios',
        editPost: 'Editar publicación', cancel: 'Cancelar', save: 'Guardar',
        deletePost: '¿Eliminar publicación?', deleteConfirm: '¿Seguro que quieres eliminar esta publicación?',
        delete: 'Eliminar', addComment: 'Agregar comentario', comment: 'Comentar',
        edit: 'Editar', delete_: 'Eliminar', changeAvatar: 'Cambiar avatar',
        profileSettings: 'Configuración del perfil', displayName: 'Nombre mostrado',
        displayNameHint: 'Se puede cambiar cada 14 días', usernameHint: 'Se puede cambiar cada 90 días',
        selectLanguage: 'Seleccionar idioma', search: 'Buscar', noResults: 'No se encontraron resultados',
        joined: 'Se unió', showProfile: 'Mostrar perfil', posting: 'Publicando...',
        postPublished: '¡Publicación publicada!', failedToPost: 'Error al publicar',
        errorPosting: 'Error al publicar', pleaseWriteSomething: 'Escribe algo',
        postUpdated: '¡Publicación actualizada!', postDeleted: '¡Publicación eliminada!',
        postReposted: '¡Recompartido!', repostRemoved: 'Recompartido eliminado',
        postSaved: '¡Publicación guardada!', postRemovedFromSaves: 'Publicación eliminada de guardados',
        commentDeleted: 'Comentario eliminado', profileUpdated: '¡Perfil actualizado!',
        avatarUpdated: '¡Avatar actualizado!', displayNameUpdated: '¡Nombre actualizado!',
        usernameUpdated: '¡Usuario actualizado!', settingsSaved: '¡Configuración guardada!',
        passwordsDoNotMatch: 'Las contraseñas no coinciden', pleaseFillAllFields: 'Complete todos los campos',
        connectionError: 'Error de conexión', invalidCredentials: 'Credenciales inválidas',
        accountCreated: '¡Cuenta creada!', welcomeBack: '¡Bienvenido de nuevo!',
        allFieldsRequired: 'Todos los campos son obligatorios', passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
        noSavedPosts: 'No hay publicaciones guardadas', savePostHint: 'Haga clic en el icono de marcador en cualquier publicación para guardarla aquí',
        adminPanel: 'Panel de administración', addOfficialTitle: 'Agregar título Oficial', removeOfficialTitle: 'Eliminar título Oficial',
        official: '⭐Official', deleteAccount: 'Eliminar cuenta', deleteAccountWarning: '¡ADVERTENCIA! ¡Esta acción es permanente!',
        deleteAccountConfirm: '¿Estás absolutamente seguro? Esto eliminará tu cuenta y todos tus datos para siempre.',
        deleteAccountSuccess: 'Cuenta eliminada exitosamente', changeUsername: 'Cambiar nombre de usuario',
        changeDisplayName: 'Cambiar nombre mostrado', newUsername: 'Nuevo nombre de usuario', newDisplayName: 'Nuevo nombre mostrado',
        currentPassword: 'Contraseña actual', confirmNewPassword: 'Confirmar nueva contraseña',
        usernameChanged: '¡Nombre de usuario cambiado exitosamente!', displayNameChanged: '¡Nombre mostrado cambiado exitosamente!',
        matureContent: 'Contenido maduro', matureContentDesc: 'Ver contenido para adultos en tus feeds y resultados de búsqueda.',
        blurMature: 'Desenfocar maduro (18+)', blurMatureDesc: 'Desenfocar imágenes y medios que pueden ser sensibles.',
        experience: 'Experiencia', defaultFeedView: 'Vista de feed predeterminada', cardMode: 'Modo tarjeta', compactMode: 'Modo compacto',
        showMatureContent: 'Mostrar contenido maduro', blurMatureMedia: 'Desenfocar medios maduros',
        displayNameChangeHint: 'Puedes cambiar el nombre mostrado solo una vez cada 14 días.',
        usernameChangeHint: 'Puedes cambiar el nombre de usuario solo una vez cada 90 días.',
        dangerZone: 'Zona de peligro', security: 'Seguridad', privacy: 'Privacidad', helpCenter: 'Centro de ayuda',
        changeEmail: 'Cambiar email', newEmail: 'Nuevo email', emailChanged: '¡Email cambiado exitosamente!',
        changePassword: 'Cambiar contraseña', newPassword: 'Nueva contraseña', passwordChanged: '¡Contraseña cambiada exitosamente!',
        currentPasswordRequired: 'Se requiere contraseña actual', forgotPasswordHint: '¿Olvidaste tu contraseña? Pista:',
        askQuestion: 'Hacer una pregunta', typeQuestion: 'Escribe tu pregunta aquí...', aiResponse: 'Respuesta IA',
        postsTab: 'Publicaciones', repostsTab: 'Reposts', settingsTab: 'Configuración', helpTab: 'Ayuda',
        general: 'General', profileTabTitle: 'Perfil', repostsTitle: 'Reposts', settingsTitle: 'Configuración',
        helpTitle: 'Centro de ayuda', askAI: 'Preguntar al asistente IA', typeMessage: 'Escribe tu mensaje...',
        send: 'Enviar', aiThinking: 'IA está pensando...', noReposts: 'No hay reposts', cancel: 'Cancelar', save: 'Guardar',
        changePasswordHint: 'La pista de tu contraseña es:', enterNewPassword: 'Ingresa nueva contraseña', confirmNewPassword: 'Confirmar nueva contraseña'
    },
    fr: {
        appName: 'FreedomNet', signIn: 'Se connecter', signUp: "S'inscrire",
        emailOrUsername: 'Email ou nom', password: 'Mot de passe',
        rememberMe: 'Se souvenir', forgotPassword: 'Mot de passe oublié?',
        signInBtn: 'Se connecter', fullName: 'Nom affiché', username: "Nom d'utilisateur",
        email: 'Email', confirmPassword: 'Confirmer', createAccount: 'Créer',
        home: 'Accueil', explore: 'Explorer', notifications: 'Notifications',
        messages: 'Messages', profile: 'Profil', settings: 'Paramètres', bookmarks: 'Signets',
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
        edit: 'Modifier', delete_: 'Supprimer', changeAvatar: 'Changer avatar',
        profileSettings: 'Paramètres profil', displayName: 'Nom affiché',
        displayNameHint: 'Modifiable tous les 14 jours', usernameHint: 'Modifiable tous les 90 jours',
        selectLanguage: 'Choisir langue', search: 'Rechercher', noResults: 'Aucun résultat',
        joined: 'Inscrit le', showProfile: 'Voir profil', posting: 'Publication...',
        postPublished: 'Publié!', failedToPost: 'Échec publication',
        errorPosting: 'Erreur publication', pleaseWriteSomething: 'Écrivez quelque chose',
        postUpdated: 'Mis à jour!', postDeleted: 'Supprimé!',
        postReposted: 'Republié!', repostRemoved: 'Republié retiré',
        postSaved: 'Sauvegardé!', postRemovedFromSaves: 'Retiré des sauvegardes',
        commentDeleted: 'Commentaire supprimé', profileUpdated: 'Profil mis à jour!',
        avatarUpdated: 'Avatar mis à jour!', displayNameUpdated: 'Nom mis à jour!',
        usernameUpdated: 'Nom utilisateur mis à jour!', settingsSaved: 'Paramètres sauvegardés!',
        passwordsDoNotMatch: 'Mots de passe différents', pleaseFillAllFields: 'Remplissez tous les champs',
        connectionError: 'Erreur connexion', invalidCredentials: 'Identifiants invalides',
        accountCreated: 'Compte créé!', welcomeBack: 'Bon retour!',
        allFieldsRequired: 'Tous les champs requis', passwordTooShort: '6 caractères minimum',
        noSavedPosts: 'Aucune publication sauvegardée', savePostHint: 'Cliquez sur l\'icône de signet sur n\'importe quelle publication pour la sauvegarder ici',
        adminPanel: 'Panneau d\'administration', addOfficialTitle: 'Ajouter le titre Officiel', removeOfficialTitle: 'Supprimer le titre Officiel',
        official: '⭐Official', deleteAccount: 'Supprimer le compte', deleteAccountWarning: 'ATTENTION : Cette action est permanente !',
        deleteAccountConfirm: 'Êtes-vous absolument sûr ? Cela supprimera votre compte et toutes vos données pour toujours.',
        deleteAccountSuccess: 'Compte supprimé avec succès', changeUsername: 'Changer le nom d\'utilisateur',
        changeDisplayName: 'Changer le nom affiché', newUsername: 'Nouveau nom d\'utilisateur', newDisplayName: 'Nouveau nom affiché',
        currentPassword: 'Mot de passe actuel', confirmNewPassword: 'Confirmer le nouveau mot de passe',
        usernameChanged: 'Nom d\'utilisateur changé avec succès !', displayNameChanged: 'Nom affiché changé avec succès !',
        matureContent: 'Contenu mature', matureContentDesc: 'Voir le contenu pour adultes dans vos flux et résultats de recherche.',
        blurMature: 'Flouter mature (18+)', blurMatureDesc: 'Flouter les images et médias qui peuvent être sensibles.',
        experience: 'Expérience', defaultFeedView: 'Vue de flux par défaut', cardMode: 'Mode carte', compactMode: 'Mode compact',
        showMatureContent: 'Afficher le contenu mature', blurMatureMedia: 'Flouter les médias matures',
        displayNameChangeHint: 'Vous ne pouvez changer le nom affiché qu\'une fois tous les 14 jours.',
        usernameChangeHint: 'Vous ne pouvez changer le nom d\'utilisateur qu\'une fois tous les 90 jours.',
        dangerZone: 'Zone de danger', security: 'Sécurité', privacy: 'Confidentialité', helpCenter: 'Centre d\'aide',
        changeEmail: 'Changer l\'email', newEmail: 'Nouvel email', emailChanged: 'Email changé avec succès !',
        changePassword: 'Changer le mot de passe', newPassword: 'Nouveau mot de passe', passwordChanged: 'Mot de passe changé avec succès !',
        currentPasswordRequired: 'Mot de passe actuel requis', forgotPasswordHint: 'Mot de passe oublié ? Indice :',
        askQuestion: 'Poser une question', typeQuestion: 'Tapez votre question ici...', aiResponse: 'Réponse IA',
        postsTab: 'Publications', repostsTab: 'Reposts', settingsTab: 'Paramètres', helpTab: 'Aide',
        general: 'Général', profileTabTitle: 'Profil', repostsTitle: 'Reposts', settingsTitle: 'Paramètres',
        helpTitle: 'Centre d\'aide', askAI: 'Demander à l\'assistant IA', typeMessage: 'Tapez votre message...',
        send: 'Envoyer', aiThinking: 'L\'IA réfléchit...', noReposts: 'Aucun repost', cancel: 'Annuler', save: 'Enregistrer',
        changePasswordHint: 'L\'indice de votre mot de passe est :', enterNewPassword: 'Entrez le nouveau mot de passe', confirmNewPassword: 'Confirmez le nouveau mot de passe'
    },
    de: {
        appName: 'FreedomNet', signIn: 'Anmelden', signUp: 'Registrieren',
        emailOrUsername: 'Email oder Benutzername', password: 'Passwort',
        rememberMe: 'Merken', forgotPassword: 'Passwort vergessen?',
        signInBtn: 'Anmelden', fullName: 'Anzeigename', username: 'Benutzername',
        email: 'Email', confirmPassword: 'Passwort bestätigen', createAccount: 'Konto erstellen',
        home: 'Startseite', explore: 'Entdecken', notifications: 'Benachrichtigungen',
        messages: 'Nachrichten', profile: 'Profil', settings: 'Einstellungen', bookmarks: 'Lesezeichen',
        logout: 'Abmelden', post: 'Posten', trendingNow: 'Im Trend',
        welcomeNotification: 'Willkommen bei FreedomNet!', noMessages: 'Keine Nachrichten',
        posts: 'Beiträge', followers: 'Follower', following: 'Folgt',
        editProfile: 'Bearbeiten', appearance: 'Erscheinungsbild', theme: 'Design',
        dark: 'Dunkel', light: 'Hell', language: 'Sprache',
        notificationsSettings: 'Benachrichtigungen', pushNotifications: 'Push-Benachrichtigungen',
        emailUpdates: 'E-Mail-Updates', saveChanges: 'Speichern',
        editPost: 'Bearbeiten', cancel: 'Abbrechen', save: 'Speichern',
        deletePost: 'Löschen?', deleteConfirm: 'Wirklich löschen?',
        delete: 'Löschen', addComment: 'Kommentieren', comment: 'Kommentar',
        edit: 'Bearbeiten', delete_: 'Löschen', changeAvatar: 'Avatar ändern',
        profileSettings: 'Profileinstellungen', displayName: 'Anzeigename',
        displayNameHint: 'Alle 14 Tage änderbar', usernameHint: 'Alle 90 Tage änderbar',
        selectLanguage: 'Sprache wählen', search: 'Suchen', noResults: 'Keine Ergebnisse',
        joined: 'Beigetreten', showProfile: 'Profil anzeigen', posting: 'Wird gepostet...',
        postPublished: 'Beitrag veröffentlicht!', failedToPost: 'Fehler beim Posten',
        errorPosting: 'Fehler', pleaseWriteSomething: 'Schreib etwas',
        postUpdated: 'Aktualisiert!', postDeleted: 'Gelöscht!',
        postReposted: 'Repostet!', repostRemoved: 'Repost entfernt',
        postSaved: 'Gespeichert!', postRemovedFromSaves: 'Aus Speicherungen entfernt',
        commentDeleted: 'Kommentar gelöscht', profileUpdated: 'Profil aktualisiert!',
        avatarUpdated: 'Avatar aktualisiert!', displayNameUpdated: 'Name aktualisiert!',
        usernameUpdated: 'Benutzername aktualisiert!', settingsSaved: 'Einstellungen gespeichert!',
        passwordsDoNotMatch: 'Passwörter stimmen nicht überein', pleaseFillAllFields: 'Alle Felder ausfüllen',
        connectionError: 'Verbindungsfehler', invalidCredentials: 'Ungültige Anmeldedaten',
        accountCreated: 'Konto erstellt!', welcomeBack: 'Willkommen zurück!',
        allFieldsRequired: 'Alle Felder erforderlich', passwordTooShort: 'Passwort zu kurz',
        noSavedPosts: 'Keine gespeicherten Beiträge', savePostHint: 'Klicken Sie auf das Lesezeichen-Symbol auf einem beliebigen Beitrag, um ihn hier zu speichern',
        adminPanel: 'Admin-Panel', addOfficialTitle: 'Offiziellen Titel hinzufügen', removeOfficialTitle: 'Offiziellen Titel entfernen',
        official: '⭐Official', deleteAccount: 'Konto löschen', deleteAccountWarning: 'WARNUNG: Diese Aktion ist dauerhaft!',
        deleteAccountConfirm: 'Sind Sie absolut sicher? Dies wird Ihr Konto und alle Ihre Daten für immer löschen.',
        deleteAccountSuccess: 'Konto erfolgreich gelöscht', changeUsername: 'Benutzername ändern',
        changeDisplayName: 'Anzeigenamen ändern', newUsername: 'Neuer Benutzername', newDisplayName: 'Neuer Anzeigename',
        currentPassword: 'Aktuelles Passwort', confirmNewPassword: 'Neues Passwort bestätigen',
        usernameChanged: 'Benutzername erfolgreich geändert!', displayNameChanged: 'Anzeigename erfolgreich geändert!',
        matureContent: 'Erwachseneninhalte', matureContentDesc: 'Erwachseneninhalte in Ihren Feeds und Suchergebnissen anzeigen.',
        blurMature: 'Unschärfe (18+)', blurMatureDesc: 'Bilder und Medien, die möglicherweise sensibel sind, unschärfen.',
        experience: 'Erfahrung', defaultFeedView: 'Standard-Feed-Ansicht', cardMode: 'Kartenmodus', compactMode: 'Kompaktmodus',
        showMatureContent: 'Erwachseneninhalte anzeigen', blurMatureMedia: 'Erwachsenenmedien unschärfen',
        displayNameChangeHint: 'Sie können den Anzeigenamen nur einmal alle 14 Tage ändern.',
        usernameChangeHint: 'Sie können den Benutzernamen nur einmal alle 90 Tage ändern.',
        dangerZone: 'Gefahrenzone', security: 'Sicherheit', privacy: 'Datenschutz', helpCenter: 'Hilfezentrum',
        changeEmail: 'E-Mail ändern', newEmail: 'Neue E-Mail', emailChanged: 'E-Mail erfolgreich geändert!',
        changePassword: 'Passwort ändern', newPassword: 'Neues Passwort', passwordChanged: 'Passwort erfolgreich geändert!',
        currentPasswordRequired: 'Aktuelles Passwort erforderlich', forgotPasswordHint: 'Passwort vergessen? Hinweis:',
        askQuestion: 'Frage stellen', typeQuestion: 'Geben Sie Ihre Frage ein...', aiResponse: 'KI-Antwort',
        postsTab: 'Beiträge', repostsTab: 'Reposts', settingsTab: 'Einstellungen', helpTab: 'Hilfe',
        general: 'Allgemein', profileTabTitle: 'Profil', repostsTitle: 'Reposts', settingsTitle: 'Einstellungen',
        helpTitle: 'Hilfezentrum', askAI: 'KI-Assistent fragen', typeMessage: 'Geben Sie Ihre Nachricht ein...',
        send: 'Senden', aiThinking: 'KI denkt nach...', noReposts: 'Keine Reposts', cancel: 'Abbrechen', save: 'Speichern',
        changePasswordHint: 'Ihr Passworthinweis lautet:', enterNewPassword: 'Neues Passwort eingeben', confirmNewPassword: 'Neues Passwort bestätigen'
    }
};

let currentLanguage = 'en';
let officialUsers = new Set();
let matureContentEnabled = false;
let blurMatureEnabled = false;

const monthNames = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ru: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
    es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
    pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    hi: ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
    zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12月'],
    el: ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου']
};

function formatJoinDate(dateString) {
    if (!dateString) return 'Just joined';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just joined';
    const months = monthNames[currentLanguage] || monthNames.en;
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
}

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
    if (currentPage === 'bookmarks') displaySavedPosts();
    if (currentPage === 'profile') {
        document.querySelector('.profile-tabs .tab-btn.active')?.click();
    }
}

function showCustomAlert(message) {
    const alert = document.getElementById('customAlert');
    document.getElementById('alertMessage').textContent = message;
    alert.classList.add('active');
    document.getElementById('alertOkBtn').onclick = () => alert.classList.remove('active');
}

function displaySavedPosts() {
    const container = document.getElementById('savedPostsList');
    if (!container) return;
    const t = translations[currentLanguage];
    const savedPostIds = Array.from(userSavedPosts);
    const savedPosts = allPosts.filter(post => savedPostIds.includes(post.id));
    if (savedPosts.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--text-tertiary)">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:16px"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <p>${t.noSavedPosts}</p><small>${t.savePostHint}</small>
        </div>`;
        return;
    }
    container.innerHTML = savedPosts.map(post => {
        const postAvatar = post.user?.avatar || `https://ui-avatars.com/api/?name=${(post.user?.displayName || post.user?.username).slice(0,2)}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`;
        const isLiked = userLikedPosts.has(post.id);
        const isReposted = userRepostedPosts.has(post.id);
        const isSaved = userSavedPosts.has(post.id);
        const isOfficial = officialUsers.has(post.userId) || post.user?.username === ADMIN_USERNAME;
        return `
        <div class="post-card ${feedViewMode === 'compact' ? 'compact-mode' : ''}" data-post-id="${post.id}">
            <div class="avatar-container"><img class="post-avatar" src="${postAvatar}" onclick="showMiniProfile('${post.userId}')" style="cursor:pointer"></div>
            <div class="post-body">
                <div class="post-header">
                    <div class="post-name-container">
                        <span class="post-name" onclick="showMiniProfile('${post.userId}')" style="cursor:pointer">${escapeHtml(post.user?.displayName || post.user?.username)}</span>
                        ${isOfficial ? `<span class="official-badge">${t.official}</span>` : ''}
                    </div>
                    <span class="post-username">@${escapeHtml(post.user?.username)}</span>
                    <span class="post-time">${formatTime(post.createdAt)}</span>
                </div>
                <div class="post-text">${escapeHtml(post.content)}</div>
                ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image ${blurMatureEnabled ? 'blur-mature' : ''}" alt="Post image">` : ''}
                <div class="post-actions">
                    <button class="action-btn like" onclick="toggleLike('${post.id}')" style="color:${isLiked ? 'var(--error)' : ''}">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="${isLiked ? '#f4212e' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <span>${post.likes}</span>
                    </button>
                    <button class="action-btn comment" onclick="openCommentModal('${post.id}')">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <span>${post.comments?.length || 0}</span>
                    </button>
                    <button class="action-btn repost" onclick="toggleRepost('${post.id}')" style="color:${isReposted ? 'var(--success)' : ''}">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                        <span>${post.reposts || 0}</span>
                    </button>
                    <button class="action-btn save ${isSaved ? 'saved' : ''}" onclick="toggleSave('${post.id}')">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="${isSaved ? '#ffd700' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

document.addEventListener('contextmenu', function(e) {});
document.addEventListener('keydown', function(e) {});

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
    const displayName = document.getElementById('regFullName').value;
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;
    if (!displayName || !username || !email || !password) {
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
            body: JSON.stringify({ fullName: displayName, username, email, password })
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

async function loadOfficialUsers() {
    try {
        const res = await fetch(`${API_URL}/api/official/users`);
        const data = await res.json();
        officialUsers = new Set(data);
        if (currentUser && currentUser.username === ADMIN_USERNAME) {
            officialUsers.add(currentUser.id);
        }
    } catch (error) {}
}

async function addOfficialUser(userId) {
    try {
        const res = await fetch(`${API_URL}/api/official/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, adminId: currentUser.id })
        });
        if (res.ok) {
            officialUsers.add(userId);
            loadPosts();
            if (currentPage === 'profile') loadUserPosts();
            showCustomAlert('Official title added!');
        }
    } catch (error) {}
}

async function removeOfficialUser(userId) {
    try {
        const res = await fetch(`${API_URL}/api/official/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, adminId: currentUser.id })
        });
        if (res.ok) {
            officialUsers.delete(userId);
            loadPosts();
            if (currentPage === 'profile') loadUserPosts();
            showCustomAlert('Official title removed!');
        }
    } catch (error) {}
}

async function initApp(user) {
    currentUser = user;
    authScreen.style.display = 'none';
    app.classList.add('active');
    const savedMatureContent = localStorage.getItem('matureContentEnabled') === 'true';
    const savedBlurMature = localStorage.getItem('blurMatureEnabled') === 'true';
    const savedFeedView = localStorage.getItem('feedViewMode') || 'card';
    matureContentEnabled = savedMatureContent;
    blurMatureEnabled = savedBlurMature;
    feedViewMode = savedFeedView;
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
    const matureToggle = document.getElementById('matureContentToggle');
    const blurToggle = document.getElementById('blurMatureToggle');
    const cardModeBtn = document.getElementById('cardModeBtn');
    const compactModeBtn = document.getElementById('compactModeBtn');
    if (matureToggle) matureToggle.checked = matureContentEnabled;
    if (blurToggle) blurToggle.checked = blurMatureEnabled;
    if (cardModeBtn && feedViewMode === 'card') cardModeBtn.classList.add('active');
    if (compactModeBtn && feedViewMode === 'compact') compactModeBtn.classList.add('active');
    await loadAllUsers();
    await loadUserInteractions();
    await loadOfficialUsers();
    await loadPosts();
    if (user.username === ADMIN_USERNAME) showAdminPanel();
    setupSettingsTabs();
    setupProfileTabs();
}

function setupSettingsTabs() {
    const tabs = document.querySelectorAll('.settings-tab');
    const contents = document.querySelectorAll('.settings-tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.settingsTab;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`settings-${tabId}`).classList.add('active');
            settingsTab = tabId;
        });
    });
}

function setupProfileTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    const contents = document.querySelectorAll('.profile-tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.profileTab;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`profile-${tabId}`).classList.add('active');
            profileTab = tabId;
            if (tabId === 'posts') loadUserPosts();
            if (tabId === 'reposts') loadUserReposts();
        });
    });
}

async function loadUserReposts() {
    const userRepostIds = Array.from(userRepostedPosts);
    const repostedPosts = allPosts.filter(post => userRepostIds.includes(post.id));
    const container = document.getElementById('userRepostsList');
    const t = translations[currentLanguage];
    if (!container) return;
    if (repostedPosts.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-tertiary)">${t.noReposts}</div>`;
        return;
    }
    container.innerHTML = repostedPosts.map(post => {
        const postAvatar = post.user?.avatar || `https://ui-avatars.com/api/?name=${(post.user?.displayName || post.user?.username).slice(0,2)}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`;
        const isOfficial = officialUsers.has(post.userId) || post.user?.username === ADMIN_USERNAME;
        return `
        <div class="post-card ${feedViewMode === 'compact' ? 'compact-mode' : ''}">
            <div class="avatar-container"><img class="post-avatar" src="${postAvatar}" onclick="showMiniProfile('${post.userId}')" style="cursor:pointer"></div>
            <div class="post-body">
                <div class="post-header">
                    <div class="post-name-container">
                        <span class="post-name" onclick="showMiniProfile('${post.userId}')" style="cursor:pointer">${escapeHtml(post.user?.displayName || post.user?.username)}</span>
                        ${isOfficial ? `<span class="official-badge">${t.official}</span>` : ''}
                    </div>
                    <span class="post-username">@${escapeHtml(post.user?.username)}</span>
                    <span class="post-time">${formatTime(post.createdAt)}</span>
                </div>
                <div class="post-text">${escapeHtml(post.content)}</div>
                ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image ${blurMatureEnabled ? 'blur-mature' : ''}" alt="Post image">` : ''}
                <div class="post-actions">
                    <span>❤️ ${post.likes}</span>
                    <span>💬 ${post.comments?.length || 0}</span>
                    <span>🔄 ${post.reposts || 0}</span>
                </div>
            </div>
        </div>`;
    }).join('');
}

function showAdminPanel() {
    const sidebarBottom = document.querySelector('.sidebar-bottom');
    if (sidebarBottom && !document.getElementById('adminPanelBtn')) {
        const adminBtn = document.createElement('button');
        adminBtn.id = 'adminPanelBtn';
        adminBtn.className = 'admin-panel-btn';
        adminBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z"/></svg><span data-i18n="adminPanel">Admin Panel</span>`;
        adminBtn.onclick = () => openAdminPanel();
        sidebarBottom.insertBefore(adminBtn, sidebarBottom.firstChild);
    }
}

function openAdminPanel() {
    const t = translations[currentLanguage];
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.display = 'flex';
    modal.innerHTML = `<div class="modal-card admin-panel-card"><h3>${t.adminPanel}</h3><div class="admin-panel-search"><input type="text" id="adminUserSearch" class="settings-input" placeholder="Search users..."><div id="adminUserResults" class="admin-user-results"></div></div><div class="modal-buttons"><button id="closeAdminPanel" class="btn-outline">${t.cancel}</button></div></div>`;
    document.body.appendChild(modal);
    const searchInput = modal.querySelector('#adminUserSearch');
    const resultsDiv = modal.querySelector('#adminUserResults');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length > 0) {
            const filteredUsers = allUsers.filter(user => user.id !== currentUser.id && (user.displayName?.toLowerCase().includes(query) || user.username?.toLowerCase().includes(query)));
            if (filteredUsers.length > 0) {
                resultsDiv.style.display = 'block';
                resultsDiv.innerHTML = filteredUsers.map(user => {
                    const isOfficial = officialUsers.has(user.id);
                    return `<div class="admin-user-item"><div class="admin-user-info"><div class="admin-user-name">${escapeHtml(user.displayName || user.username)}</div><div class="admin-user-username">@${escapeHtml(user.username)}</div></div><button class="admin-action-btn ${isOfficial ? 'remove' : 'add'}" onclick="${isOfficial ? `removeOfficialUser('${user.id}')` : `addOfficialUser('${user.id}')`}; document.body.removeChild(modal);">${isOfficial ? t.removeOfficialTitle : t.addOfficialTitle}</button></div>`;
                }).join('');
            } else {
                resultsDiv.style.display = 'block';
                resultsDiv.innerHTML = `<div class="admin-no-results">${t.noResults}</div>`;
            }
        } else {
            resultsDiv.style.display = 'none';
        }
    });
    modal.querySelector('#closeAdminPanel').onclick = () => document.body.removeChild(modal);
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
    const titles = { home: t.home, explore: t.explore, notifications: t.notifications, messages: t.messages, profile: t.profile, settings: t.settings, bookmarks: t.bookmarks };
    document.getElementById('pageTitle').textContent = titles[page] || t.home;
    if (page === 'home') loadPosts();
    if (page === 'profile') { loadUserPosts(); loadUserReposts(); }
    if (page === 'bookmarks') displaySavedPosts();
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
            const res = await fetch(`${API_URL}/api/upload-image`, { method: 'POST', body: formData });
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
            body: JSON.stringify({ userId: currentUser.id, content: content, imageUrl: currentPostImageUrl })
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
    let filteredPosts = allPosts;
    if (!matureContentEnabled) filteredPosts = allPosts.filter(post => !post.isMature);
    if (filteredPosts.length === 0) {
        feed.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-tertiary)">${t.noResults}</div>`;
        return;
    }
    feed.innerHTML = filteredPosts.map(post => {
        const postAvatar = post.user?.avatar || `https://ui-avatars.com/api/?name=${(post.user?.displayName || post.user?.username).slice(0,2)}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`;
        const isLiked = userLikedPosts.has(post.id);
        const isReposted = userRepostedPosts.has(post.id);
        const isSaved = userSavedPosts.has(post.id);
        const isOfficial = officialUsers.has(post.userId) || post.user?.username === ADMIN_USERNAME;
        const isAdmin = currentUser?.username === ADMIN_USERNAME;
        const canDeletePost = isAdmin || post.userId === currentUser?.id;
        const imageBlurClass = (blurMatureEnabled && post.isMature) ? 'blur-mature' : '';
        return `<div class="post-card ${feedViewMode === 'compact' ? 'compact-mode' : ''}" data-post-id="${post.id}">
            <div class="avatar-container"><img class="post-avatar" src="${postAvatar}" onclick="showMiniProfile('${post.userId}')" style="cursor:pointer" onerror="this.src='https://ui-avatars.com/api/?name=${post.user?.username?.slice(0,2)}&background=1d9bf0&color=fff'"></div>
            <div class="post-body">
                <div class="post-header">
                    <div class="post-name-container"><span class="post-name" onclick="showMiniProfile('${post.userId}')" style="cursor:pointer">${escapeHtml(post.user?.displayName || post.user?.username)}</span>${isOfficial ? `<span class="official-badge">${t.official}</span>` : ''}</div>
                    <span class="post-username">@${escapeHtml(post.user?.username)}</span>
                    <span class="post-time">${formatTime(post.createdAt)}</span>
                    ${canDeletePost ? `<div class="post-menu"><button class="menu-btn" onclick="toggleMenu(event, '${post.id}')"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button><div class="post-menu-dropdown" id="menu-${post.id}">${post.userId === currentUser?.id ? `<div class="dropdown-item" onclick="editPost('${post.id}', '${escapeHtml(post.content).replace(/'/g, "\\'")}')">${t.edit}</div>` : ''}<div class="dropdown-item delete" onclick="deletePost('${post.id}')">${t.delete_}</div></div></div>` : ''}
                </div>
                <div class="post-text">${escapeHtml(post.content)}</div>
                ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image ${imageBlurClass}" alt="Post image">` : ''}
                <div class="post-actions">
                    <button class="action-btn like" onclick="toggleLike('${post.id}')" style="color:${isLiked ? 'var(--error)' : ''}"><svg viewBox="0 0 24 24" width="18" height="18" fill="${isLiked ? '#f4212e' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>${post.likes}</span></button>
                    <button class="action-btn comment" onclick="openCommentModal('${post.id}')"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>${post.comments?.length || 0}</span></button>
                    <button class="action-btn repost" onclick="toggleRepost('${post.id}')" style="color:${isReposted ? 'var(--success)' : ''}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg><span>${post.reposts || 0}</span></button>
                    <button class="action-btn save ${isSaved ? 'saved' : ''}" onclick="toggleSave('${post.id}')"><svg viewBox="0 0 24 24" width="18" height="18" fill="${isSaved ? '#ffd700' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
                </div>
                ${post.comments && post.comments.length > 0 ? `<div class="comments-section"><div class="comments-header"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>${post.comments.length} comments</span></div>${post.comments.slice(0, 2).map(c => {
                    const commentAvatar = `https://ui-avatars.com/api/?name=${(c.displayName || c.username).slice(0,2)}&background=1d9bf0&color=fff&bold=true&size=32&rounded=true`;
                    const canDeleteComment = isAdmin || c.userId === currentUser?.id;
                    const isCommentOfficial = officialUsers.has(c.userId) || c.username === ADMIN_USERNAME;
                    return `<div class="comment-item"><img class="comment-avatar-img" src="${commentAvatar}" onerror="this.src='https://ui-avatars.com/api/?name=${c.username?.slice(0,2)}&background=1d9bf0&color=fff'"><div class="comment-content"><div class="comment-header"><div class="comment-name-container"><span class="comment-name">${escapeHtml(c.displayName || c.username)}</span>${isCommentOfficial ? `<span class="official-badge small">${t.official}</span>` : ''}</div><span class="comment-username">@${escapeHtml(c.username)}</span><span class="comment-time">${formatTime(c.createdAt)}</span></div><div class="comment-text">${escapeHtml(c.comment)}</div></div>${canDeleteComment ? `<button class="comment-delete" onclick="deleteComment('${post.id}', '${c.id}')">×</button>` : ''}</div>`;
                }).join('')}${post.comments.length > 2 ? `<div class="more-comments" onclick="openCommentModal('${post.id}')">+${post.comments.length - 2} more comments</div>` : ''}</div>` : ''}
            </div>
        </div>`;
    }).join('');
    const userPosts = allPosts.filter(p => p.userId === currentUser.id);
    document.getElementById('userPostCount').textContent = userPosts.length;
    if (currentPage === 'bookmarks') displaySavedPosts();
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
    const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${(user.displayName || user.username).slice(0,2)}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`;
    const joinDateFormatted = formatJoinDate(user.joinDate);
    const t = translations[currentLanguage];
    const isOfficial = officialUsers.has(user.id) || user.username === ADMIN_USERNAME;
    const isAdmin = currentUser?.username === ADMIN_USERNAME;
    const modal = document.createElement('div');
    modal.className = 'mini-profile-modal';
    modal.innerHTML = `<div class="mini-profile-content"><div class="mini-profile-header"><img src="${avatarUrl}" class="mini-profile-avatar" onclick="closeMiniProfile()"><button class="mini-profile-close" onclick="closeMiniProfile()">×</button></div><div class="mini-profile-body"><div class="mini-profile-name-row"><h3>${escapeHtml(user.displayName || user.username)}</h3>${isOfficial ? `<span class="official-badge">${t.official}</span>` : ''}</div><p class="mini-profile-username">@${escapeHtml(user.username)}</p>${user.bio ? `<p class="mini-profile-bio">${escapeHtml(user.bio)}</p>` : ''}<p class="mini-profile-joined">${t.joined} ${joinDateFormatted}</p><div class="mini-profile-stats"><div><strong>${user.followers || 0}</strong> ${t.followers}</div><div><strong>${user.following || 0}</strong> ${t.following}</div></div><button class="mini-profile-btn" onclick="goToFullProfile('${userId}')">${t.showProfile}</button>${isAdmin && user.id !== currentUser.id ? `<button class="mini-profile-admin-btn" onclick="${isOfficial ? `removeOfficialUser('${user.id}')` : `addOfficialUser('${user.id}')`}; closeMiniProfile();">${isOfficial ? t.removeOfficialTitle : t.addOfficialTitle}</button>` : ''}</div></div>`;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    document.addEventListener('click', function closeOnClick(e) {
        if (!modal.contains(e.target) && !e.target.closest('.post-avatar') && !e.target.closest('.post-name')) {
            modal.remove();
            document.removeEventListener('click', closeOnClick);
        }
    });
};

window.closeMiniProfile = function() { const modal = document.querySelector('.mini-profile-modal'); if (modal) modal.remove(); };
window.goToFullProfile = function(userId) { closeMiniProfile(); if (userId === currentUser.id) switchPage('profile'); else showCustomAlert('Viewing other profiles coming soon!'); };
window.toggleMenu = function(event, postId) { event.stopPropagation(); document.querySelectorAll('.post-menu-dropdown').forEach(menu => { if (menu.id !== `menu-${postId}`) menu.classList.remove('show'); }); const menu = document.getElementById(`menu-${postId}`); menu.classList.toggle('show'); };
document.addEventListener('click', function() { document.querySelectorAll('.post-menu-dropdown').forEach(menu => menu.classList.remove('show')); });
window.editPost = function(postId, currentContent) { currentEditPostId = postId; document.getElementById('editPostContent').value = currentContent; document.getElementById('editModal').classList.add('active'); };
window.deletePost = async (postId) => { const res = await fetch(`${API_URL}/api/posts/${postId}`, { method: 'DELETE' }); if (res.ok) { loadPosts(); showCustomAlert(translations[currentLanguage].postDeleted); } };
window.toggleLike = async (postId) => { const res = await fetch(`${API_URL}/api/posts/like`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, userId: currentUser.id }) }); const data = await res.json(); if (data.success) { if (data.liked) userLikedPosts.add(postId); else userLikedPosts.delete(postId); loadPosts(); } };
window.toggleRepost = async (postId) => { const res = await fetch(`${API_URL}/api/posts/repost`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, userId: currentUser.id }) }); const data = await res.json(); if (data.success) { if (data.reposted) { userRepostedPosts.add(postId); showCustomAlert(translations[currentLanguage].postReposted); } else { userRepostedPosts.delete(postId); showCustomAlert(translations[currentLanguage].repostRemoved); } loadPosts(); } };
window.toggleSave = async (postId) => { const res = await fetch(`${API_URL}/api/posts/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, userId: currentUser.id }) }); const data = await res.json(); if (data.saved) { userSavedPosts.add(postId); showCustomAlert(translations[currentLanguage].postSaved); } else { userSavedPosts.delete(postId); showCustomAlert(translations[currentLanguage].postRemovedFromSaves); } loadPosts(); };
window.openCommentModal = function(postId) { currentCommentPostId = postId; document.getElementById('commentInput').value = ''; document.getElementById('commentModal').classList.add('active'); };
window.deleteComment = async (postId, commentId) => { const res = await fetch(`${API_URL}/api/posts/comment`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, commentId, userId: currentUser.id }) }); if (res.ok) { loadPosts(); showCustomAlert(translations[currentLanguage].commentDeleted); } };
document.getElementById('submitCommentBtn').addEventListener('click', async () => { const comment = document.getElementById('commentInput').value; if (!comment.trim()) return; await fetch(`${API_URL}/api/posts/comment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: currentCommentPostId, userId: currentUser.id, comment }) }); document.getElementById('commentModal').classList.remove('active'); loadPosts(); });
document.getElementById('saveEditBtn').addEventListener('click', async () => { const newContent = document.getElementById('editPostContent').value; if (!newContent.trim()) return; await fetch(`${API_URL}/api/posts/${currentEditPostId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: newContent }) }); document.getElementById('editModal').classList.remove('active'); loadPosts(); showCustomAlert(translations[currentLanguage].postUpdated); });
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => { await fetch(`${API_URL}/api/posts/${currentDeletePostId}`, { method: 'DELETE' }); document.getElementById('deleteModal').classList.remove('active'); loadPosts(); showCustomAlert(translations[currentLanguage].postDeleted); });
document.getElementById('closeEditModal').addEventListener('click', () => { document.getElementById('editModal').classList.remove('active'); });
document.getElementById('cancelDeleteBtn').addEventListener('click', () => { document.getElementById('deleteModal').classList.remove('active'); });
document.getElementById('closeCommentModal').addEventListener('click', () => { document.getElementById('commentModal').classList.remove('active'); });

async function loadUserPosts() {
    const userPosts = allPosts.filter(p => p.userId === currentUser.id);
    const container = document.getElementById('userPostsList');
    if (container) {
        if (userPosts.length === 0) { container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-tertiary)">${translations[currentLanguage].noResults}</div>`; return; }
        container.innerHTML = userPosts.map(post => {
            const postAvatar = currentUser.avatar || `https://ui-avatars.com/api/?name=${(currentUser.displayName || currentUser.username).slice(0,2)}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`;
            const isOfficial = officialUsers.has(currentUser.id) || currentUser.username === ADMIN_USERNAME;
            const imageBlurClass = (blurMatureEnabled && post.isMature) ? 'blur-mature' : '';
            return `<div class="post-card ${feedViewMode === 'compact' ? 'compact-mode' : ''}"><div class="avatar-container"><img class="post-avatar" src="${postAvatar}"></div><div class="post-body"><div class="post-header"><div class="post-name-container"><span class="post-name">${escapeHtml(currentUser.displayName || currentUser.username)}</span>${isOfficial ? `<span class="official-badge">${translations[currentLanguage].official}</span>` : ''}</div><span class="post-username">@${escapeHtml(currentUser.username)}</span><span class="post-time">${formatTime(post.createdAt)}</span></div><div class="post-text">${escapeHtml(post.content)}</div>${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image ${imageBlurClass}" alt="Post image">` : ''}<div class="post-actions"><span style="color:var(--text-tertiary);display:flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> ${post.likes}</span><span style="color:var(--text-tertiary);display:flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> ${post.comments?.length || 0}</span><span style="color:var(--text-tertiary);display:flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> ${post.reposts || 0}</span></div></div></div>`;
        }).join('');
    }
}

document.getElementById('logoutBtn').addEventListener('click', () => { localStorage.clear(); sessionStorage.clear(); location.reload(); });
document.getElementById('editProfileBtn')?.addEventListener('click', () => { document.getElementById('editBioInput').value = currentUser.bio || ''; document.getElementById('editProfileModal').classList.add('active'); });
document.getElementById('closeProfileModal')?.addEventListener('click', () => { document.getElementById('editProfileModal').classList.remove('active'); });
document.getElementById('saveProfileBtn')?.addEventListener('click', async () => { const bio = document.getElementById('editBioInput').value; const res = await fetch(`${API_URL}/api/user/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id, bio }) }); if (res.ok) { const data = await res.json(); currentUser = data.user; localStorage.setItem('user', JSON.stringify(currentUser)); document.getElementById('profileBio').textContent = bio || 'No bio yet'; document.getElementById('editProfileModal').classList.remove('active'); showCustomAlert(translations[currentLanguage].profileUpdated); } });
document.querySelectorAll('.theme-option').forEach(btn => { btn.addEventListener('click', () => { const theme = btn.dataset.theme; document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active')); btn.classList.add('active'); document.body.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); }); });
document.getElementById('languageSelect')?.addEventListener('change', (e) => { currentLanguage = e.target.value; localStorage.setItem('language', currentLanguage); updateLanguage(currentLanguage); loadPosts(); if (currentPage === 'bookmarks') displaySavedPosts(); });
document.getElementById('matureContentToggle')?.addEventListener('change', (e) => { matureContentEnabled = e.target.checked; localStorage.setItem('matureContentEnabled', matureContentEnabled); loadPosts(); });
document.getElementById('blurMatureToggle')?.addEventListener('change', (e) => { blurMatureEnabled = e.target.checked; localStorage.setItem('blurMatureEnabled', blurMatureEnabled); loadPosts(); });
document.getElementById('cardModeBtn')?.addEventListener('click', () => { feedViewMode = 'card'; localStorage.setItem('feedViewMode', 'card'); document.getElementById('cardModeBtn').classList.add('active'); document.getElementById('compactModeBtn').classList.remove('active'); loadPosts(); });
document.getElementById('compactModeBtn')?.addEventListener('click', () => { feedViewMode = 'compact'; localStorage.setItem('feedViewMode', 'compact'); document.getElementById('compactModeBtn').classList.add('active'); document.getElementById('cardModeBtn').classList.remove('active'); loadPosts(); });

document.getElementById('changeUsernameBtn')?.addEventListener('click', () => {
    const t = translations[currentLanguage];
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.display = 'flex';
    modal.innerHTML = `<div class="modal-card"><h3>${t.changeUsername}</h3><input type="text" id="newUsername" class="settings-input" placeholder="${t.newUsername}" style="width:100%;margin:10px 0"><input type="password" id="passwordConfirm" class="settings-input" placeholder="${t.currentPassword}" style="width:100%;margin:10px 0"><input type="password" id="passwordConfirm2" class="settings-input" placeholder="${t.confirmNewPassword}" style="width:100%;margin:10px 0"><div class="modal-buttons"><button id="modalCancelBtn" class="btn-outline">${t.cancel}</button><button id="modalConfirmBtn" class="btn-blue">${t.save}</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#modalCancelBtn').onclick = () => document.body.removeChild(modal);
    modal.querySelector('#modalConfirmBtn').onclick = async () => {
        const newUsername = modal.querySelector('#newUsername').value;
        const password = modal.querySelector('#passwordConfirm').value;
        const confirmPassword = modal.querySelector('#passwordConfirm2').value;
        if (!newUsername || !password) { showCustomAlert(t.pleaseFillAllFields); return; }
        if (password !== confirmPassword) { showCustomAlert(t.passwordsDoNotMatch); return; }
        const res = await fetch(`${API_URL}/api/user/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id, username: newUsername, password: password }) });
        const data = await res.json();
        if (res.ok) { currentUser = data.user; localStorage.setItem('user', JSON.stringify(currentUser)); showCustomAlert(t.usernameChanged); location.reload(); }
        else { showCustomAlert(data.error || t.invalidCredentials); }
        document.body.removeChild(modal);
    };
});

document.getElementById('changeDisplayNameBtn')?.addEventListener('click', () => {
    const t = translations[currentLanguage];
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.display = 'flex';
    modal.innerHTML = `<div class="modal-card"><h3>${t.changeDisplayName}</h3><input type="text" id="newDisplayName" class="settings-input" placeholder="${t.newDisplayName}" style="width:100%;margin:10px 0"><input type="password" id="passwordConfirm" class="settings-input" placeholder="${t.currentPassword}" style="width:100%;margin:10px 0"><div class="modal-buttons"><button id="modalCancelBtn" class="btn-outline">${t.cancel}</button><button id="modalConfirmBtn" class="btn-blue">${t.save}</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#modalCancelBtn').onclick = () => document.body.removeChild(modal);
    modal.querySelector('#modalConfirmBtn').onclick = async () => {
        const newDisplayName = modal.querySelector('#newDisplayName').value;
        const password = modal.querySelector('#passwordConfirm').value;
        if (!newDisplayName || !password) { showCustomAlert(t.pleaseFillAllFields); return; }
        const res = await fetch(`${API_URL}/api/user/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id, displayName: newDisplayName }) });
        const data = await res.json();
        if (res.ok) { currentUser = data.user; localStorage.setItem('user', JSON.stringify(currentUser)); showCustomAlert(t.displayNameChanged); location.reload(); }
        else { showCustomAlert(data.error || t.invalidCredentials); }
        document.body.removeChild(modal);
    };
});

document.getElementById('changeEmailBtn')?.addEventListener('click', () => {
    const t = translations[currentLanguage];
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.display = 'flex';
    modal.innerHTML = `<div class="modal-card"><h3>${t.changeEmail}</h3><input type="email" id="newEmail" class="settings-input" placeholder="${t.newEmail}" style="width:100%;margin:10px 0"><input type="password" id="passwordConfirm" class="settings-input" placeholder="${t.currentPassword}" style="width:100%;margin:10px 0"><div class="modal-buttons"><button id="modalCancelBtn" class="btn-outline">${t.cancel}</button><button id="modalConfirmBtn" class="btn-blue">${t.save}</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#modalCancelBtn').onclick = () => document.body.removeChild(modal);
    modal.querySelector('#modalConfirmBtn').onclick = async () => {
        const newEmail = modal.querySelector('#newEmail').value;
        const password = modal.querySelector('#passwordConfirm').value;
        if (!newEmail || !password) { showCustomAlert(t.pleaseFillAllFields); return; }
        const res = await fetch(`${API_URL}/api/user/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id, email: newEmail, password: password }) });
        const data = await res.json();
        if (res.ok) { currentUser = data.user; localStorage.setItem('user', JSON.stringify(currentUser)); showCustomAlert(t.emailChanged); }
        else { showCustomAlert(data.error || t.invalidCredentials); }
        document.body.removeChild(modal);
    };
});

document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
    const t = translations[currentLanguage];
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.display = 'flex';
    modal.innerHTML = `<div class="modal-card"><h3>${t.changePassword}</h3><p style="font-size:12px;color:var(--text-tertiary);margin-bottom:10px">${t.forgotPasswordHint} ${currentUser.passwordHint || '***'}</p><input type="password" id="currentPassword" class="settings-input" placeholder="${t.currentPassword}" style="width:100%;margin:10px 0"><input type="password" id="newPassword" class="settings-input" placeholder="${t.newPassword}" style="width:100%;margin:10px 0"><input type="password" id="confirmPassword" class="settings-input" placeholder="${t.confirmNewPassword}" style="width:100%;margin:10px 0"><div class="modal-buttons"><button id="modalCancelBtn" class="btn-outline">${t.cancel}</button><button id="modalConfirmBtn" class="btn-blue">${t.save}</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#modalCancelBtn').onclick = () => document.body.removeChild(modal);
    modal.querySelector('#modalConfirmBtn').onclick = async () => {
        const currentPassword = modal.querySelector('#currentPassword').value;
        const newPassword = modal.querySelector('#newPassword').value;
        const confirmPassword = modal.querySelector('#confirmPassword').value;
        if (!currentPassword || !newPassword || !confirmPassword) { showCustomAlert(t.pleaseFillAllFields); return; }
        if (newPassword !== confirmPassword) { showCustomAlert(t.passwordsDoNotMatch); return; }
        if (newPassword.length < 6) { showCustomAlert(t.passwordTooShort); return; }
        const res = await fetch(`${API_URL}/api/user/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id, password: currentPassword, newPassword: newPassword }) });
        const data = await res.json();
        if (res.ok) { currentUser = data.user; localStorage.setItem('user', JSON.stringify(currentUser)); showCustomAlert(t.passwordChanged); }
        else { showCustomAlert(data.error || t.invalidCredentials); }
        document.body.removeChild(modal);
    };
});

document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
    const t = translations[currentLanguage];
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.display = 'flex';
    modal.innerHTML = `<div class="modal-card"><h3 style="color:var(--error)">${t.deleteAccount}</h3><p style="color:var(--error);margin-bottom:16px"><strong>${t.deleteAccountWarning}</strong></p><p>${t.deleteAccountConfirm}</p><input type="email" id="deleteEmailInput" class="settings-input" placeholder="${t.email}" style="width:100%;margin:20px 0 10px 0"><input type="password" id="deletePasswordInput" class="settings-input" placeholder="${t.currentPassword}" style="width:100%;margin:10px 0"><input type="password" id="deleteConfirmPasswordInput" class="settings-input" placeholder="${t.confirmNewPassword}" style="width:100%;margin:10px 0"><div class="modal-buttons"><button id="modalCancelBtn" class="btn-outline">${t.cancel}</button><button id="modalConfirmBtn" class="btn-delete" style="background:var(--error)">${t.delete}</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#modalCancelBtn').onclick = () => document.body.removeChild(modal);
    modal.querySelector('#modalConfirmBtn').onclick = async () => {
        const email = modal.querySelector('#deleteEmailInput')?.value;
        const password = modal.querySelector('#deletePasswordInput')?.value;
        const confirmPassword = modal.querySelector('#deleteConfirmPasswordInput')?.value;
        if (!email || !password || !confirmPassword) { showCustomAlert(t.pleaseFillAllFields); return; }
        if (password !== confirmPassword) { showCustomAlert(t.passwordsDoNotMatch); return; }
        if (email !== currentUser.email) { showCustomAlert('Email does not match'); return; }
        const res = await fetch(`${API_URL}/api/user/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id, password: password, email: email }) });
        if (res.ok) { showCustomAlert(t.deleteAccountSuccess); localStorage.clear(); sessionStorage.clear(); setTimeout(() => location.reload(), 1500); }
        else { const data = await res.json(); showCustomAlert(data.error || t.invalidCredentials); }
        document.body.removeChild(modal);
    };
});

document.getElementById('helpAskBtn')?.addEventListener('click', async () => {
    const question = document.getElementById('helpQuestion').value;
    if (!question.trim()) return;
    const responseDiv = document.getElementById('helpResponse');
    responseDiv.innerHTML = `<div style="text-align:center;padding:20px">${translations[currentLanguage].aiThinking}</div>`;
    const res = await fetch(`${API_URL}/api/help/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: question }) });
    const data = await res.json();
    responseDiv.innerHTML = `<div class="help-response"><strong>${translations[currentLanguage].aiResponse}:</strong><p>${data.answer}</p></div>`;
});

let currentAvatarFile = null;
document.getElementById('editAvatarBtn')?.addEventListener('click', () => {
    const avatarUrl = currentUser.avatar || `https://ui-avatars.com/api/?name=${(currentUser.displayName || currentUser.username).slice(0,2)}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`;
    document.getElementById('avatarPreviewImg').src = avatarUrl;
    document.getElementById('avatarModal').classList.add('active');
    document.getElementById('avatarFileInput').value = '';
    currentAvatarFile = null;
});
document.getElementById('closeAvatarModal')?.addEventListener('click', () => { document.getElementById('avatarModal').classList.remove('active'); });
document.getElementById('uploadAvatarBtn')?.addEventListener('click', () => { document.getElementById('avatarFileInput').click(); });
document.getElementById('avatarFileInput')?.addEventListener('change', (e) => { const file = e.target.files[0]; if (file) { currentAvatarFile = file; const reader = new FileReader(); reader.onload = function(event) { document.getElementById('avatarPreviewImg').src = event.target.result; }; reader.readAsDataURL(file); } });
document.getElementById('saveAvatarBtn')?.addEventListener('click', async () => {
    if (!currentAvatarFile) { showCustomAlert('Please select an image first'); return; }
    const formData = new FormData(); formData.append('avatar', currentAvatarFile);
    const uploadRes = await fetch(`${API_URL}/api/upload-avatar`, { method: 'POST', body: formData });
    const uploadData = await uploadRes.json();
    if (uploadRes.ok) {
        const res = await fetch(`${API_URL}/api/user/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id, avatar: uploadData.avatarUrl }) });
        if (res.ok) { const data = await res.json(); currentUser = data.user; localStorage.setItem('user', JSON.stringify(currentUser)); const avatarUrl = currentUser.avatar; document.getElementById('headerAvatar').src = avatarUrl; document.getElementById('composeAvatar').src = avatarUrl; document.getElementById('profileAvatar').src = avatarUrl; document.getElementById('avatarModal').classList.remove('active'); showCustomAlert(translations[currentLanguage].avatarUpdated); loadPosts(); }
    } else { showCustomAlert('Failed to upload image'); }
});

document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const searchResults = document.getElementById('searchResults');
    const trendingCard = document.querySelector('.trending-card');
    if (query.length > 0) {
        let filteredPosts = allPosts.filter(post => post.content.toLowerCase().includes(query) || post.user?.displayName?.toLowerCase().includes(query) || post.user?.username?.toLowerCase().includes(query));
        if (!matureContentEnabled) filteredPosts = filteredPosts.filter(post => !post.isMature);
        if (filteredPosts.length > 0) {
            trendingCard.style.display = 'none';
            searchResults.style.display = 'block';
            searchResults.innerHTML = filteredPosts.map(post => `<div class="search-result-item" onclick="scrollToPost('${post.id}')"><div style="font-weight:600">${escapeHtml(post.user?.displayName || post.user?.username)}</div><div style="color:var(--text-tertiary);font-size:13px">${escapeHtml(post.content.substring(0, 100))}${post.content.length > 100 ? '...' : ''}</div></div>`).join('');
        } else { trendingCard.style.display = 'block'; searchResults.style.display = 'none'; }
    } else { trendingCard.style.display = 'block'; searchResults.style.display = 'none'; }
});

document.getElementById('userSearchInput')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const resultsDiv = document.getElementById('userSearchResults');
    if (query.length > 0) {
        const filteredUsers = allUsers.filter(user => user.id !== currentUser.id && (user.displayName?.toLowerCase().includes(query) || user.username?.toLowerCase().includes(query)));
        if (filteredUsers.length > 0) {
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = filteredUsers.map(user => { const userAvatar = user.avatar || `https://ui-avatars.com/api/?name=${(user.displayName || user.username).slice(0,2)}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`; const isOfficial = officialUsers.has(user.id) || user.username === ADMIN_USERNAME; return `<div class="user-search-item" onclick="startConversation('${user.id}')"><div class="avatar-container small"><img class="user-search-avatar" src="${userAvatar}"></div><div class="user-search-info"><div class="user-search-name">${escapeHtml(user.displayName || user.username)}${isOfficial ? ` <span class="official-badge small">${translations[currentLanguage].official}</span>` : ''}</div><div class="user-search-username">@${escapeHtml(user.username)}</div></div></div>`; }).join('');
        } else { resultsDiv.style.display = 'none'; }
    } else { resultsDiv.style.display = 'none'; }
});

window.startConversation = function(userId) { const user = allUsers.find(u => u.id === userId); if (user) { showCustomAlert(`Messaging ${user.displayName || user.username} coming soon!`); document.getElementById('userSearchResults').style.display = 'none'; document.getElementById('userSearchInput').value = ''; } };
window.scrollToPost = function(postId) { const postElement = document.querySelector(`.post-card[data-post-id="${postId}"]`); if (postElement) { postElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); postElement.style.background = 'var(--bg-hover)'; setTimeout(() => { postElement.style.background = ''; }, 2000); } switchPage('home'); };
function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
function checkAuth() { const token = localStorage.getItem('token') || sessionStorage.getItem('token'); const user = localStorage.getItem('user'); if (token && user) { currentUser = JSON.parse(user); initApp(currentUser); } }
checkAuth();
