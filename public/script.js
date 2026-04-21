const API_URL = window.location.origin;
let currentUser = null;
let currentPage = 'home';
let allPosts = [];
let allUsers = [];
let allMessages = [];
let currentEditPostId = null;
let currentDeletePostId = null;
let currentCommentPostId = null;
let currentEditCommentId = null;
let currentEditCommentPostId = null;
let userLikedPosts = new Set();
let userRepostedPosts = new Set();
let userSavedPosts = new Set();
let userLikedComments = new Set();
let selectedImageFile = null;
let currentPostImageUrl = null;
let currentViewingUser = null;
let currentChatUser = null;
let messageInterval = null;

const ADMIN_USERNAME = 'devalexplay';

// ========== ПЕРЕВОДЫ НА 14 ЯЗЫКОВ ==========
const translations = {
    en: {
        appName: 'FreedomNet', signIn: 'Sign in', signUp: 'Sign up',
        emailOrUsername: 'Email or username', password: 'Password',
        rememberMe: 'Remember me', forgotPassword: 'Forgot password?',
        signInBtn: 'Sign in', fullName: 'Display name', username: 'Username',
        email: 'Email', confirmPassword: 'Confirm password', createAccount: 'Create account',
        home: 'Home', explore: 'Explore', notifications: 'Notifications',
        messages: 'Messages', profile: 'Profile', settings: 'Settings', bookmarks: 'Bookmarks', helpCenter: 'Help Center',
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
        allFieldsRequired: 'All fields required', passwordTooShort: 'Password too short (min 6 chars)',
        noSavedPosts: 'No saved posts yet', savePostHint: 'Click bookmark icon on any post to save it here',
        adminPanel: 'Admin Panel', addOfficialTitle: 'Add Verified', removeOfficialTitle: 'Remove Verified',
        official: '✓ Verified', deleteAccount: 'Delete Account', deleteAccountWarning: 'WARNING: This action is permanent!',
        deleteAccountConfirm: 'Are you absolutely sure? This will delete your account forever.',
        deleteAccountSuccess: 'Account deleted successfully', changeUsername: 'Change Username',
        changeDisplayName: 'Change Display Name', newUsername: 'New username', newDisplayName: 'New display name',
        currentPassword: 'Current password', confirmNewPassword: 'Confirm new password',
        usernameChanged: 'Username changed successfully!', displayNameChanged: 'Display name changed successfully!',
        matureContent: 'Mature Content', matureContentDesc: 'Show adult content in your feeds.',
        blurMature: 'Blur mature (18+)', blurMatureDesc: 'Blur sensitive images and media.',
        showMatureContent: 'Show mature content', blurMatureMedia: 'Blur mature media',
        displayNameChangeHint: 'You can change display name once every 14 days.',
        usernameChangeHint: 'You can change username once every 90 days.',
        accountPrivacy: 'Account Privacy', changeEmail: 'Change Email', changePassword: 'Change Password',
        newEmail: 'New email', emailChanged: 'Email changed successfully!', newPassword: 'New password',
        passwordChanged: 'Password changed successfully!', currentPasswordRequired: 'Current password required',
        forgotPasswordHint: 'Forgot password? Hint:', askQuestion: 'Ask a question', typeQuestion: 'Type your question here...',
        aiResponse: 'AI Response', postsTab: 'Posts', helpTab: 'Help', general: 'General',
        profileTabTitle: 'Profile', settingsTitle: 'Settings', helpTitle: 'Help Center',
        askAI: 'Ask AI Assistant', typeMessage: 'Type a message...', send: 'Send',
        aiThinking: 'AI is thinking...', noReposts: 'No posts yet', reply: 'Reply',
        editComment: 'Edit comment', deleteComment: 'Delete comment', commentLiked: 'Comment liked',
        commentUnliked: 'Comment unliked', commentUpdated: 'Comment updated!',
        noMessagesYet: 'No messages yet', startConversation: 'Start a conversation',
        selectConversation: 'Select a conversation', typeMessageHere: 'Type a message...',
        sending: 'Sending...', coverColorSelect: 'Select cover color',
        presetColors: 'Preset colors', customColor: 'Custom color'
    },
    ru: {
        appName: 'FreedomNet', signIn: 'Войти', signUp: 'Регистрация',
        emailOrUsername: 'Email или имя', password: 'Пароль',
        rememberMe: 'Запомнить меня', forgotPassword: 'Забыли пароль?',
        signInBtn: 'Войти', fullName: 'Отображаемое имя', username: 'Имя пользователя',
        email: 'Email', confirmPassword: 'Подтвердите пароль', createAccount: 'Создать аккаунт',
        home: 'Главная', explore: 'Обзор', notifications: 'Уведомления',
        messages: 'Сообщения', profile: 'Профиль', settings: 'Настройки', bookmarks: 'Закладки', helpCenter: 'Центр помощи',
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
        allFieldsRequired: 'Все поля обязательны', passwordTooShort: 'Пароль слишком короткий (мин 6 символов)',
        noSavedPosts: 'Нет сохраненных постов', savePostHint: 'Нажмите на значок закладки на любом посте, чтобы сохранить его здесь',
        adminPanel: 'Панель администратора', addOfficialTitle: 'Добавить Verified', removeOfficialTitle: 'Удалить Verified',
        official: '✓ Verified', deleteAccount: 'Удалить аккаунт', deleteAccountWarning: 'ВНИМАНИЕ: Это действие необратимо!',
        deleteAccountConfirm: 'Вы абсолютно уверены? Это удалит ваш аккаунт навсегда.',
        deleteAccountSuccess: 'Аккаунт успешно удален', changeUsername: 'Изменить имя пользователя',
        changeDisplayName: 'Изменить отображаемое имя', newUsername: 'Новое имя пользователя', newDisplayName: 'Новое отображаемое имя',
        currentPassword: 'Текущий пароль', confirmNewPassword: 'Подтвердите новый пароль',
        usernameChanged: 'Имя пользователя успешно изменено!', displayNameChanged: 'Отображаемое имя успешно изменено!',
        matureContent: 'Контент для взрослых', matureContentDesc: 'Показывать контент для взрослых в ленте.',
        blurMature: 'Размытие (18+)', blurMatureDesc: 'Размывать изображения, которые могут быть чувствительными.',
        showMatureContent: 'Показывать контент для взрослых', blurMatureMedia: 'Размывать медиа для взрослых',
        displayNameChangeHint: 'Вы можете изменить отображаемое имя только раз в 14 дней.',
        usernameChangeHint: 'Вы можете изменить имя пользователя только раз в 90 дней.',
        accountPrivacy: 'Конфиденциальность аккаунта', changeEmail: 'Изменить email', changePassword: 'Изменить пароль',
        newEmail: 'Новый email', emailChanged: 'Email успешно изменен!', newPassword: 'Новый пароль',
        passwordChanged: 'Пароль успешно изменен!', currentPasswordRequired: 'Требуется текущий пароль',
        forgotPasswordHint: 'Забыли пароль? Подсказка:', askQuestion: 'Задать вопрос', typeQuestion: 'Введите ваш вопрос...',
        aiResponse: 'Ответ ИИ', postsTab: 'Посты', helpTab: 'Помощь', general: 'Общие',
        profileTabTitle: 'Профиль', settingsTitle: 'Настройки', helpTitle: 'Центр помощи',
        askAI: 'Спросить ИИ помощника', typeMessage: 'Введите сообщение...', send: 'Отправить',
        aiThinking: 'ИИ думает...', noReposts: 'Нет постов', reply: 'Ответить',
        editComment: 'Редактировать', deleteComment: 'Удалить', commentLiked: 'Лайк поставлен',
        commentUnliked: 'Лайк убран', commentUpdated: 'Комментарий обновлен!',
        noMessagesYet: 'Нет сообщений', startConversation: 'Начать разговор',
        selectConversation: 'Выберите разговор', typeMessageHere: 'Введите сообщение...',
        sending: 'Отправка...', coverColorSelect: 'Выберите цвет обложки',
        presetColors: 'Готовые цвета', customColor: 'Свой цвет'
    },
    es: {
        appName: 'FreedomNet', signIn: 'Iniciar sesión', signUp: 'Registrarse',
        emailOrUsername: 'Email o usuario', password: 'Contraseña',
        rememberMe: 'Recordarme', forgotPassword: '¿Olvidaste tu contraseña?',
        signInBtn: 'Iniciar sesión', fullName: 'Nombre mostrado', username: 'Usuario',
        email: 'Email', confirmPassword: 'Confirmar contraseña', createAccount: 'Crear cuenta',
        home: 'Inicio', explore: 'Explorar', notifications: 'Notificaciones',
        messages: 'Mensajes', profile: 'Perfil', settings: 'Ajustes', bookmarks: 'Marcadores', helpCenter: 'Centro de ayuda',
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
        allFieldsRequired: 'Todos los campos son obligatorios', passwordTooShort: 'La contraseña es muy corta (mínimo 6 caracteres)',
        noSavedPosts: 'No hay publicaciones guardadas', savePostHint: 'Haga clic en el icono de marcador en cualquier publicación para guardarla aquí',
        adminPanel: 'Panel de administración', addOfficialTitle: 'Agregar Verified', removeOfficialTitle: 'Eliminar Verified',
        official: '✓ Verified', deleteAccount: 'Eliminar cuenta', deleteAccountWarning: '¡ADVERTENCIA! ¡Esta acción es permanente!',
        deleteAccountConfirm: '¿Estás absolutamente seguro? Esto eliminará tu cuenta para siempre.',
        deleteAccountSuccess: 'Cuenta eliminada exitosamente', changeUsername: 'Cambiar nombre de usuario',
        changeDisplayName: 'Cambiar nombre mostrado', newUsername: 'Nuevo nombre de usuario', newDisplayName: 'Nuevo nombre mostrado',
        currentPassword: 'Contraseña actual', confirmNewPassword: 'Confirmar nueva contraseña',
        usernameChanged: '¡Nombre de usuario cambiado exitosamente!', displayNameChanged: '¡Nombre mostrado cambiado exitosamente!',
        matureContent: 'Contenido maduro', matureContentDesc: 'Mostrar contenido para adultos en tu feed.',
        blurMature: 'Desenfocar maduro (18+)', blurMatureDesc: 'Desenfocar imágenes y medios sensibles.',
        showMatureContent: 'Mostrar contenido maduro', blurMatureMedia: 'Desenfocar medios maduros',
        displayNameChangeHint: 'Puedes cambiar el nombre mostrado solo una vez cada 14 días.',
        usernameChangeHint: 'Puedes cambiar el nombre de usuario solo una vez cada 90 días.',
        accountPrivacy: 'Privacidad de la cuenta', changeEmail: 'Cambiar email', changePassword: 'Cambiar contraseña',
        newEmail: 'Nuevo email', emailChanged: '¡Email cambiado exitosamente!', newPassword: 'Nueva contraseña',
        passwordChanged: '¡Contraseña cambiada exitosamente!', currentPasswordRequired: 'Se requiere contraseña actual',
        forgotPasswordHint: '¿Olvidaste tu contraseña? Pista:', askQuestion: 'Hacer una pregunta', typeQuestion: 'Escribe tu pregunta aquí...',
        aiResponse: 'Respuesta IA', postsTab: 'Publicaciones', helpTab: 'Ayuda', general: 'General',
        profileTabTitle: 'Perfil', settingsTitle: 'Configuración', helpTitle: 'Centro de ayuda',
        askAI: 'Preguntar al asistente IA', typeMessage: 'Escribe tu mensaje...', send: 'Enviar',
        aiThinking: 'IA está pensando...', noReposts: 'No hay publicaciones', reply: 'Responder',
        editComment: 'Editar comentario', deleteComment: 'Eliminar comentario', commentLiked: 'Comentario liked',
        commentUnliked: 'Comentario unliked', commentUpdated: '¡Comentario actualizado!',
        noMessagesYet: 'No hay mensajes', startConversation: 'Iniciar una conversación',
        selectConversation: 'Selecciona una conversación', typeMessageHere: 'Escribe un mensaje...',
        sending: 'Enviando...', coverColorSelect: 'Seleccionar color de portada',
        presetColors: 'Colores preestablecidos', customColor: 'Color personalizado'
    },
    fr: {
        appName: 'FreedomNet', signIn: 'Se connecter', signUp: "S'inscrire",
        emailOrUsername: 'Email ou nom', password: 'Mot de passe',
        rememberMe: 'Se souvenir', forgotPassword: 'Mot de passe oublié?',
        signInBtn: 'Se connecter', fullName: 'Nom affiché', username: "Nom d'utilisateur",
        email: 'Email', confirmPassword: 'Confirmer', createAccount: 'Créer',
        home: 'Accueil', explore: 'Explorer', notifications: 'Notifications',
        messages: 'Messages', profile: 'Profil', settings: 'Paramètres', bookmarks: 'Signets', helpCenter: "Centre d'aide",
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
        usernameUpdated: "Nom d'utilisateur mis à jour!", settingsSaved: 'Paramètres sauvegardés!',
        passwordsDoNotMatch: 'Mots de passe différents', pleaseFillAllFields: 'Remplissez tous les champs',
        connectionError: 'Erreur connexion', invalidCredentials: 'Identifiants invalides',
        accountCreated: 'Compte créé!', welcomeBack: 'Bon retour!',
        allFieldsRequired: 'Tous les champs requis', passwordTooShort: 'Mot de passe trop court (min 6 caractères)',
        noSavedPosts: 'Aucune publication sauvegardée', savePostHint: "Cliquez sur l'icône de signet sur n'importe quelle publication pour la sauvegarder ici",
        adminPanel: "Panneau d'administration", addOfficialTitle: 'Ajouter Verified', removeOfficialTitle: 'Supprimer Verified',
        official: '✓ Verified', deleteAccount: 'Supprimer le compte', deleteAccountWarning: 'ATTENTION : Cette action est permanente !',
        deleteAccountConfirm: 'Êtes-vous absolument sûr ? Cela supprimera votre compte pour toujours.',
        deleteAccountSuccess: 'Compte supprimé avec succès', changeUsername: "Changer le nom d'utilisateur",
        changeDisplayName: 'Changer le nom affiché', newUsername: "Nouveau nom d'utilisateur", newDisplayName: 'Nouveau nom affiché',
        currentPassword: 'Mot de passe actuel', confirmNewPassword: 'Confirmer le nouveau mot de passe',
        usernameChanged: "Nom d'utilisateur changé avec succès !", displayNameChanged: 'Nom affiché changé avec succès !',
        matureContent: 'Contenu mature', matureContentDesc: 'Afficher le contenu pour adultes dans votre flux.',
        blurMature: 'Flouter mature (18+)', blurMatureDesc: 'Flouter les images et médias sensibles.',
        showMatureContent: 'Afficher le contenu mature', blurMatureMedia: 'Flouter les médias matures',
        displayNameChangeHint: 'Vous ne pouvez changer le nom affiché qu\'une fois tous les 14 jours.',
        usernameChangeHint: 'Vous ne pouvez changer le nom d\'utilisateur qu\'une fois tous les 90 jours.',
        accountPrivacy: 'Confidentialité du compte', changeEmail: "Changer l'email", changePassword: 'Changer le mot de passe',
        newEmail: 'Nouvel email', emailChanged: 'Email changé avec succès !', newPassword: 'Nouveau mot de passe',
        passwordChanged: 'Mot de passe changé avec succès !', currentPasswordRequired: 'Mot de passe actuel requis',
        forgotPasswordHint: 'Mot de passe oublié ? Indice :', askQuestion: 'Poser une question', typeQuestion: 'Tapez votre question ici...',
        aiResponse: 'Réponse IA', postsTab: 'Publications', helpTab: 'Aide', general: 'Général',
        profileTabTitle: 'Profil', settingsTitle: 'Paramètres', helpTitle: "Centre d'aide",
        askAI: "Demander à l'assistant IA", typeMessage: 'Tapez votre message...', send: 'Envoyer',
        aiThinking: "L'IA réfléchit...", noReposts: 'Aucune publication', reply: 'Répondre',
        editComment: 'Modifier', deleteComment: 'Supprimer', commentLiked: 'Commentaire aimé',
        commentUnliked: 'Commentaire non aimé', commentUpdated: 'Commentaire mis à jour !',
        noMessagesYet: 'Aucun message', startConversation: 'Commencer une conversation',
        selectConversation: 'Sélectionnez une conversation', typeMessageHere: 'Tapez un message...',
        sending: 'Envoi...', coverColorSelect: 'Choisir la couleur de couverture',
        presetColors: 'Couleurs prédéfinies', customColor: 'Couleur personnalisée'
    },
    de: {
        appName: 'FreedomNet', signIn: 'Anmelden', signUp: 'Registrieren',
        emailOrUsername: 'Email oder Benutzername', password: 'Passwort',
        rememberMe: 'Merken', forgotPassword: 'Passwort vergessen?',
        signInBtn: 'Anmelden', fullName: 'Anzeigename', username: 'Benutzername',
        email: 'Email', confirmPassword: 'Passwort bestätigen', createAccount: 'Konto erstellen',
        home: 'Startseite', explore: 'Entdecken', notifications: 'Benachrichtigungen',
        messages: 'Nachrichten', profile: 'Profil', settings: 'Einstellungen', bookmarks: 'Lesezeichen', helpCenter: 'Hilfezentrum',
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
        allFieldsRequired: 'Alle Felder erforderlich', passwordTooShort: 'Passwort zu kurz (min. 6 Zeichen)',
        noSavedPosts: 'Keine gespeicherten Beiträge', savePostHint: 'Klicken Sie auf das Lesezeichen-Symbol auf einem beliebigen Beitrag, um ihn hier zu speichern',
        adminPanel: 'Admin-Panel', addOfficialTitle: 'Verified hinzufügen', removeOfficialTitle: 'Verified entfernen',
        official: '✓ Verified', deleteAccount: 'Konto löschen', deleteAccountWarning: 'WARNUNG: Diese Aktion ist dauerhaft!',
        deleteAccountConfirm: 'Sind Sie absolut sicher? Dies wird Ihr Konto für immer löschen.',
        deleteAccountSuccess: 'Konto erfolgreich gelöscht', changeUsername: 'Benutzername ändern',
        changeDisplayName: 'Anzeigenamen ändern', newUsername: 'Neuer Benutzername', newDisplayName: 'Neuer Anzeigename',
        currentPassword: 'Aktuelles Passwort', confirmNewPassword: 'Neues Passwort bestätigen',
        usernameChanged: 'Benutzername erfolgreich geändert!', displayNameChanged: 'Anzeigename erfolgreich geändert!',
        matureContent: 'Erwachseneninhalte', matureContentDesc: 'Erwachseneninhalte in Ihrem Feed anzeigen.',
        blurMature: 'Unschärfe (18+)', blurMatureDesc: 'Bilder und Medien, die sensibel sein könnten, unscharf machen.',
        showMatureContent: 'Erwachseneninhalte anzeigen', blurMatureMedia: 'Erwachsenenmedien unscharf machen',
        displayNameChangeHint: 'Sie können den Anzeigenamen nur einmal alle 14 Tage ändern.',
        usernameChangeHint: 'Sie können den Benutzernamen nur einmal alle 90 Tage ändern.',
        accountPrivacy: 'Kontodatenschutz', changeEmail: 'E-Mail ändern', changePassword: 'Passwort ändern',
        newEmail: 'Neue E-Mail', emailChanged: 'E-Mail erfolgreich geändert!', newPassword: 'Neues Passwort',
        passwordChanged: 'Passwort erfolgreich geändert!', currentPasswordRequired: 'Aktuelles Passwort erforderlich',
        forgotPasswordHint: 'Passwort vergessen? Hinweis:', askQuestion: 'Frage stellen', typeQuestion: 'Geben Sie Ihre Frage ein...',
        aiResponse: 'KI-Antwort', postsTab: 'Beiträge', helpTab: 'Hilfe', general: 'Allgemein',
        profileTabTitle: 'Profil', settingsTitle: 'Einstellungen', helpTitle: 'Hilfezentrum',
        askAI: 'KI-Assistent fragen', typeMessage: 'Geben Sie Ihre Nachricht ein...', send: 'Senden',
        aiThinking: 'KI denkt nach...', noReposts: 'Keine Beiträge', reply: 'Antworten',
        editComment: 'Bearbeiten', deleteComment: 'Löschen', commentLiked: 'Kommentar gefällt',
        commentUnliked: 'Kommentar nicht mehr gefällt', commentUpdated: 'Kommentar aktualisiert!',
        noMessagesYet: 'Keine Nachrichten', startConversation: 'Gespräch beginnen',
        selectConversation: 'Wählen Sie ein Gespräch aus', typeMessageHere: 'Nachricht eingeben...',
        sending: 'Senden...', coverColorSelect: 'Titelfarbe auswählen',
        presetColors: 'Voreingestellte Farben', customColor: 'Benutzerdefinierte Farbe'
    },
    it: {
        appName: 'FreedomNet', signIn: 'Accedi', signUp: 'Registrati',
        emailOrUsername: 'Email o username', password: 'Password',
        rememberMe: 'Ricordami', forgotPassword: 'Password dimenticata?',
        signInBtn: 'Accedi', fullName: 'Nome visualizzato', username: 'Username',
        email: 'Email', confirmPassword: 'Conferma password', createAccount: 'Crea account',
        home: 'Home', explore: 'Esplora', notifications: 'Notifiche',
        messages: 'Messaggi', profile: 'Profilo', settings: 'Impostazioni', bookmarks: 'Segnalibri', helpCenter: 'Centro assistenza',
        logout: 'Esci', post: 'Pubblica', trendingNow: 'Tendenze',
        welcomeNotification: 'Benvenuto su FreedomNet!', noMessages: 'Nessun messaggio',
        posts: 'Post', followers: 'Follower', following: 'Seguiti',
        editProfile: 'Modifica profilo', appearance: 'Aspetto', theme: 'Tema',
        dark: 'Scuro', light: 'Chiaro', language: 'Lingua',
        notificationsSettings: 'Notifiche', pushNotifications: 'Notifiche push',
        emailUpdates: 'Aggiornamenti email', saveChanges: 'Salva modifiche',
        editPost: 'Modifica post', cancel: 'Annulla', save: 'Salva',
        deletePost: 'Eliminare il post?', deleteConfirm: 'Sei sicuro di voler eliminare questo post?',
        delete: 'Elimina', addComment: 'Aggiungi commento', comment: 'Commenta',
        edit: 'Modifica', delete_: 'Elimina', changeAvatar: 'Cambia avatar',
        profileSettings: 'Impostazioni profilo', displayName: 'Nome visualizzato',
        displayNameHint: 'Modificabile ogni 14 giorni', usernameHint: 'Modificabile ogni 90 giorni',
        selectLanguage: 'Seleziona lingua', search: 'Cerca', noResults: 'Nessun risultato',
        joined: 'Iscritto il', showProfile: 'Mostra profilo', posting: 'Pubblicazione...',
        postPublished: 'Post pubblicato!', failedToPost: 'Impossibile pubblicare',
        errorPosting: 'Errore', pleaseWriteSomething: 'Scrivi qualcosa',
        postUpdated: 'Post aggiornato!', postDeleted: 'Post eliminato!',
        postReposted: 'Post ripubblicato!', repostRemoved: 'Ripubblicazione rimossa',
        postSaved: 'Post salvato!', postRemovedFromSaves: 'Post rimosso dai salvati',
        commentDeleted: 'Commento eliminato', profileUpdated: 'Profilo aggiornato!',
        avatarUpdated: 'Avatar aggiornato!', displayNameUpdated: 'Nome aggiornato!',
        usernameUpdated: 'Username aggiornato!', settingsSaved: 'Impostazioni salvate!',
        passwordsDoNotMatch: 'Le password non corrispondono', pleaseFillAllFields: 'Compila tutti i campi',
        connectionError: 'Errore di connessione', invalidCredentials: 'Credenziali non valide',
        accountCreated: 'Account creato!', welcomeBack: 'Bentornato!',
        allFieldsRequired: 'Tutti i campi sono obbligatori', passwordTooShort: 'Password troppo corta (min 6 caratteri)',
        noSavedPosts: 'Nessun post salvato', savePostHint: 'Clicca sull\'icona del segnalibro su qualsiasi post per salvarlo qui',
        adminPanel: 'Pannello di controllo', addOfficialTitle: 'Aggiungi Verified', removeOfficialTitle: 'Rimuovi Verified',
        official: '✓ Verified', deleteAccount: 'Elimina account', deleteAccountWarning: 'ATTENZIONE: Questa azione è permanente!',
        deleteAccountConfirm: 'Sei assolutamente sicuro? Questo eliminerà il tuo account per sempre.',
        deleteAccountSuccess: 'Account eliminato con successo', changeUsername: 'Cambia username',
        changeDisplayName: 'Cambia nome visualizzato', newUsername: 'Nuovo username', newDisplayName: 'Nuovo nome visualizzato',
        currentPassword: 'Password attuale', confirmNewPassword: 'Conferma nuova password',
        usernameChanged: 'Username cambiato con successo!', displayNameChanged: 'Nome visualizzato cambiato con successo!',
        matureContent: 'Contenuti maturi', matureContentDesc: 'Mostra contenuti per adulti nel tuo feed.',
        blurMature: 'Sfoca maturi (18+)', blurMatureDesc: 'Sfoca immagini e media sensibili.',
        showMatureContent: 'Mostra contenuti maturi', blurMatureMedia: 'Sfoca media maturi',
        displayNameChangeHint: 'Puoi cambiare il nome visualizzato solo una volta ogni 14 giorni.',
        usernameChangeHint: 'Puoi cambiare il nome utente solo una volta ogni 90 giorni.',
        accountPrivacy: 'Privacy dell\'account', changeEmail: 'Cambia email', changePassword: 'Cambia password',
        newEmail: 'Nuova email', emailChanged: 'Email cambiata con successo!', newPassword: 'Nuova password',
        passwordChanged: 'Password cambiata con successo!', currentPasswordRequired: 'Password attuale richiesta',
        forgotPasswordHint: 'Password dimenticata? Suggerimento:', askQuestion: 'Fai una domanda', typeQuestion: 'Scrivi la tua domanda qui...',
        aiResponse: 'Risposta AI', postsTab: 'Post', helpTab: 'Aiuto', general: 'Generale',
        profileTabTitle: 'Profilo', settingsTitle: 'Impostazioni', helpTitle: 'Centro assistenza',
        askAI: 'Chiedi all\'assistente AI', typeMessage: 'Scrivi il tuo messaggio...', send: 'Invia',
        aiThinking: 'L\'AI sta pensando...', noReposts: 'Nessun post', reply: 'Rispondi',
        editComment: 'Modifica commento', deleteComment: 'Elimina commento', commentLiked: 'Commento apprezzato',
        commentUnliked: 'Apprezzamento rimosso', commentUpdated: 'Commento aggiornato!',
        noMessagesYet: 'Nessun messaggio', startConversation: 'Inizia una conversazione',
        selectConversation: 'Seleziona una conversazione', typeMessageHere: 'Scrivi un messaggio...',
        sending: 'Invio...', coverColorSelect: 'Seleziona colore copertina',
        presetColors: 'Colori preimpostati', customColor: 'Colore personalizzato'
    },
    pt: {
        appName: 'FreedomNet', signIn: 'Entrar', signUp: 'Cadastrar',
        emailOrUsername: 'Email ou usuário', password: 'Senha',
        rememberMe: 'Lembrar-me', forgotPassword: 'Esqueceu a senha?',
        signInBtn: 'Entrar', fullName: 'Nome de exibição', username: 'Usuário',
        email: 'Email', confirmPassword: 'Confirmar senha', createAccount: 'Criar conta',
        home: 'Início', explore: 'Explorar', notifications: 'Notificações',
        messages: 'Mensagens', profile: 'Perfil', settings: 'Configurações', bookmarks: 'Favoritos', helpCenter: 'Central de ajuda',
        logout: 'Sair', post: 'Publicar', trendingNow: 'Tendências',
        welcomeNotification: 'Bem-vindo ao FreedomNet!', noMessages: 'Sem mensagens',
        posts: 'Publicações', followers: 'Seguidores', following: 'Seguindo',
        editProfile: 'Editar perfil', appearance: 'Aparência', theme: 'Tema',
        dark: 'Escuro', light: 'Claro', language: 'Idioma',
        notificationsSettings: 'Notificações', pushNotifications: 'Notificações push',
        emailUpdates: 'Atualizações por email', saveChanges: 'Salvar alterações',
        editPost: 'Editar publicação', cancel: 'Cancelar', save: 'Salvar',
        deletePost: 'Excluir publicação?', deleteConfirm: 'Tem certeza que deseja excluir esta publicação?',
        delete: 'Excluir', addComment: 'Adicionar comentário', comment: 'Comentar',
        edit: 'Editar', delete_: 'Excluir', changeAvatar: 'Alterar avatar',
        profileSettings: 'Configurações do perfil', displayName: 'Nome de exibição',
        displayNameHint: 'Pode ser alterado a cada 14 dias', usernameHint: 'Pode ser alterado a cada 90 dias',
        selectLanguage: 'Selecionar idioma', search: 'Buscar', noResults: 'Nenhum resultado encontrado',
        joined: 'Entrou em', showProfile: 'Mostrar perfil', posting: 'Publicando...',
        postPublished: 'Publicação publicada!', failedToPost: 'Falha ao publicar',
        errorPosting: 'Erro ao publicar', pleaseWriteSomething: 'Escreva algo',
        postUpdated: 'Publicação atualizada!', postDeleted: 'Publicação excluída!',
        postReposted: 'Publicação repostada!', repostRemoved: 'Repost removido',
        postSaved: 'Publicação salva!', postRemovedFromSaves: 'Publicação removida dos salvos',
        commentDeleted: 'Comentário excluído', profileUpdated: 'Perfil atualizado!',
        avatarUpdated: 'Avatar atualizado!', displayNameUpdated: 'Nome atualizado!',
        usernameUpdated: 'Usuário atualizado!', settingsSaved: 'Configurações salvas!',
        passwordsDoNotMatch: 'As senhas não coincidem', pleaseFillAllFields: 'Preencha todos os campos',
        connectionError: 'Erro de conexão', invalidCredentials: 'Credenciais inválidas',
        accountCreated: 'Conta criada!', welcomeBack: 'Bem-vindo de volta!',
        allFieldsRequired: 'Todos os campos são obrigatórios', passwordTooShort: 'Senha muito curta (mínimo 6 caracteres)',
        noSavedPosts: 'Nenhuma publicação salva', savePostHint: 'Clique no ícone de favorito em qualquer publicação para salvá-la aqui',
        adminPanel: 'Painel de administração', addOfficialTitle: 'Adicionar Verified', removeOfficialTitle: 'Remover Verified',
        official: '✓ Verified', deleteAccount: 'Excluir conta', deleteAccountWarning: 'ATENÇÃO: Esta ação é permanente!',
        deleteAccountConfirm: 'Você tem certeza absoluta? Isso excluirá sua conta para sempre.',
        deleteAccountSuccess: 'Conta excluída com sucesso', changeUsername: 'Alterar nome de usuário',
        changeDisplayName: 'Alterar nome de exibição', newUsername: 'Novo nome de usuário', newDisplayName: 'Novo nome de exibição',
        currentPassword: 'Senha atual', confirmNewPassword: 'Confirmar nova senha',
        usernameChanged: 'Nome de usuário alterado com sucesso!', displayNameChanged: 'Nome de exibição alterado com sucesso!',
        matureContent: 'Conteúdo adulto', matureContentDesc: 'Mostrar conteúdo adulto no seu feed.',
        blurMature: 'Desfocar adulto (18+)', blurMatureDesc: 'Desfocar imagens e mídias sensíveis.',
        showMatureContent: 'Mostrar conteúdo adulto', blurMatureMedia: 'Desfocar mídia adulta',
        displayNameChangeHint: 'Você pode alterar o nome de exibição apenas uma vez a cada 14 dias.',
        usernameChangeHint: 'Você pode alterar o nome de usuário apenas uma vez a cada 90 dias.',
        accountPrivacy: 'Privacidade da conta', changeEmail: 'Alterar email', changePassword: 'Alterar senha',
        newEmail: 'Novo email', emailChanged: 'Email alterado com sucesso!', newPassword: 'Nova senha',
        passwordChanged: 'Senha alterada com sucesso!', currentPasswordRequired: 'Senha atual necessária',
        forgotPasswordHint: 'Esqueceu a senha? Dica:', askQuestion: 'Fazer uma pergunta', typeQuestion: 'Digite sua pergunta aqui...',
        aiResponse: 'Resposta da IA', postsTab: 'Publicações', helpTab: 'Ajuda', general: 'Geral',
        profileTabTitle: 'Perfil', settingsTitle: 'Configurações', helpTitle: 'Central de ajuda',
        askAI: 'Perguntar ao assistente IA', typeMessage: 'Digite sua mensagem...', send: 'Enviar',
        aiThinking: 'IA está pensando...', noReposts: 'Nenhuma publicação', reply: 'Responder',
        editComment: 'Editar comentário', deleteComment: 'Excluir comentário', commentLiked: 'Comentário curtido',
        commentUnliked: 'Curtida removida', commentUpdated: 'Comentário atualizado!',
        noMessagesYet: 'Nenhuma mensagem', startConversation: 'Iniciar uma conversa',
        selectConversation: 'Selecione uma conversa', typeMessageHere: 'Digite uma mensagem...',
        sending: 'Enviando...', coverColorSelect: 'Selecionar cor da capa',
        presetColors: 'Cores predefinidas', customColor: 'Cor personalizada'
    },
    // ========== НОВЫЕ ЯЗЫКИ ==========
    ja: {
        appName: 'フリーダムネット', signIn: 'ログイン', signUp: '登録',
        emailOrUsername: 'メールまたはユーザー名', password: 'パスワード',
        rememberMe: '記憶する', forgotPassword: 'パスワードをお忘れですか？',
        signInBtn: 'ログイン', fullName: '表示名', username: 'ユーザー名',
        email: 'メール', confirmPassword: 'パスワード確認', createAccount: 'アカウント作成',
        home: 'ホーム', explore: '探索', notifications: '通知',
        messages: 'メッセージ', profile: 'プロフィール', settings: '設定', bookmarks: 'ブックマーク', helpCenter: 'ヘルプセンター',
        logout: 'ログアウト', post: '投稿', trendingNow: 'トレンド',
        welcomeNotification: 'FreedomNetへようこそ！', noMessages: 'メッセージはありません',
        posts: '投稿', followers: 'フォロワー', following: 'フォロー中',
        editProfile: 'プロフィール編集', appearance: '外観', theme: 'テーマ',
        dark: 'ダーク', light: 'ライト', language: '言語',
        notificationsSettings: '通知設定', pushNotifications: 'プッシュ通知',
        emailUpdates: 'メール更新', saveChanges: '変更を保存',
        editPost: '投稿を編集', cancel: 'キャンセル', save: '保存',
        deletePost: '投稿を削除しますか？', deleteConfirm: 'この投稿を削除してもよろしいですか？',
        delete: '削除', addComment: 'コメント追加', comment: 'コメント',
        edit: '編集', delete_: '削除', changeAvatar: 'アバター変更',
        profileSettings: 'プロフィール設定', displayName: '表示名',
        displayNameHint: '14日ごとに変更可能', usernameHint: '90日ごとに変更可能',
        selectLanguage: '言語選択', search: '検索', noResults: '結果が見つかりません',
        joined: '参加日', showProfile: 'プロフィール表示', posting: '投稿中...',
        postPublished: '投稿されました！', failedToPost: '投稿に失敗しました',
        errorPosting: '投稿エラー', pleaseWriteSomething: '何か書いてください',
        postUpdated: '投稿を更新しました！', postDeleted: '投稿を削除しました！',
        postReposted: 'リポストしました！', repostRemoved: 'リポストを解除しました',
        postSaved: '投稿を保存しました！', postRemovedFromSaves: '保存から削除しました',
        commentDeleted: 'コメントを削除しました', profileUpdated: 'プロフィールを更新しました！',
        avatarUpdated: 'アバターを更新しました！', displayNameUpdated: '表示名を更新しました！',
        usernameUpdated: 'ユーザー名を更新しました！', settingsSaved: '設定を保存しました！',
        passwordsDoNotMatch: 'パスワードが一致しません', pleaseFillAllFields: 'すべてのフィールドを入力してください',
        connectionError: '接続エラー', invalidCredentials: '認証情報が無効です',
        accountCreated: 'アカウントを作成しました！', welcomeBack: 'おかえりなさい！',
        allFieldsRequired: 'すべてのフィールドは必須です', passwordTooShort: 'パスワードが短すぎます（最小6文字）',
        noSavedPosts: '保存された投稿はありません', savePostHint: '任意の投稿のブックマークアイコンをクリックしてここに保存します',
        adminPanel: '管理パネル', addOfficialTitle: '認証済みを追加', removeOfficialTitle: '認証済みを削除',
        official: '✓ 認証済み', deleteAccount: 'アカウント削除', deleteAccountWarning: '警告：この操作は元に戻せません！',
        deleteAccountConfirm: '本当によろしいですか？アカウントとすべてのデータが完全に削除されます。',
        deleteAccountSuccess: 'アカウントを削除しました', changeUsername: 'ユーザー名変更',
        changeDisplayName: '表示名変更', newUsername: '新しいユーザー名', newDisplayName: '新しい表示名',
        currentPassword: '現在のパスワード', confirmNewPassword: '新しいパスワード確認',
        usernameChanged: 'ユーザー名を変更しました！', displayNameChanged: '表示名を変更しました！',
        matureContent: '成人向けコンテンツ', matureContentDesc: 'フィードに成人向けコンテンツを表示します。',
        blurMature: 'ぼかし（18+）', blurMatureDesc: 'センシティブな画像やメディアをぼかします。',
        showMatureContent: '成人向けコンテンツを表示', blurMatureMedia: '成人向けメディアをぼかす',
        displayNameChangeHint: '表示名は14日に1回のみ変更できます。',
        usernameChangeHint: 'ユーザー名は90日に1回のみ変更できます。',
        accountPrivacy: 'アカウントプライバシー', changeEmail: 'メール変更', changePassword: 'パスワード変更',
        newEmail: '新しいメール', emailChanged: 'メールを変更しました！', newPassword: '新しいパスワード',
        passwordChanged: 'パスワードを変更しました！', currentPasswordRequired: '現在のパスワードが必要です',
        forgotPasswordHint: 'パスワードをお忘れですか？ヒント：', askQuestion: '質問する', typeQuestion: 'ここに質問を入力...',
        aiResponse: 'AI回答', postsTab: '投稿', helpTab: 'ヘルプ', general: '一般',
        profileTabTitle: 'プロフィール', settingsTitle: '設定', helpTitle: 'ヘルプセンター',
        askAI: 'AIアシスタントに質問', typeMessage: 'メッセージを入力...', send: '送信',
        aiThinking: 'AIが考え中...', noReposts: '投稿はありません', reply: '返信',
        editComment: 'コメント編集', deleteComment: 'コメント削除', commentLiked: 'いいね！',
        commentUnliked: 'いいね解除', commentUpdated: 'コメントを更新しました！',
        noMessagesYet: 'メッセージはありません', startConversation: '会話を開始',
        selectConversation: '会話を選択', typeMessageHere: 'メッセージを入力...',
        sending: '送信中...', coverColorSelect: 'カバー色選択',
        presetColors: 'プリセット色', customColor: 'カスタム色'
    },
    zh: {
        appName: '自由网', signIn: '登录', signUp: '注册',
        emailOrUsername: '邮箱或用户名', password: '密码',
        rememberMe: '记住我', forgotPassword: '忘记密码？',
        signInBtn: '登录', fullName: '显示名称', username: '用户名',
        email: '邮箱', confirmPassword: '确认密码', createAccount: '创建账户',
        home: '首页', explore: '探索', notifications: '通知',
        messages: '消息', profile: '个人资料', settings: '设置', bookmarks: '书签', helpCenter: '帮助中心',
        logout: '退出', post: '发布', trendingNow: '热门趋势',
        welcomeNotification: '欢迎来到自由网！', noMessages: '暂无消息',
        posts: '帖子', followers: '粉丝', following: '关注',
        editProfile: '编辑资料', appearance: '外观', theme: '主题',
        dark: '深色', light: '浅色', language: '语言',
        notificationsSettings: '通知设置', pushNotifications: '推送通知',
        emailUpdates: '邮件更新', saveChanges: '保存更改',
        editPost: '编辑帖子', cancel: '取消', save: '保存',
        deletePost: '删除帖子？', deleteConfirm: '确定要删除此帖子吗？',
        delete: '删除', addComment: '添加评论', comment: '评论',
        edit: '编辑', delete_: '删除', changeAvatar: '更换头像',
        profileSettings: '个人资料设置', displayName: '显示名称',
        displayNameHint: '每14天可更改一次', usernameHint: '每90天可更改一次',
        selectLanguage: '选择语言', search: '搜索', noResults: '未找到结果',
        joined: '加入于', showProfile: '查看资料', posting: '发布中...',
        postPublished: '帖子已发布！', failedToPost: '发布失败',
        errorPosting: '发布错误', pleaseWriteSomething: '写点什么',
        postUpdated: '帖子已更新！', postDeleted: '帖子已删除！',
        postReposted: '转发了！', repostRemoved: '已取消转发',
        postSaved: '帖子已保存！', postRemovedFromSaves: '已从收藏中移除',
        commentDeleted: '评论已删除', profileUpdated: '资料已更新！',
        avatarUpdated: '头像已更新！', displayNameUpdated: '显示名称已更新！',
        usernameUpdated: '用户名已更新！', settingsSaved: '设置已保存！',
        passwordsDoNotMatch: '密码不匹配', pleaseFillAllFields: '请填写所有字段',
        connectionError: '连接错误', invalidCredentials: '无效的凭据',
        accountCreated: '账户已创建！', welcomeBack: '欢迎回来！',
        allFieldsRequired: '所有字段都是必填的', passwordTooShort: '密码太短（最少6个字符）',
        noSavedPosts: '暂无收藏的帖子', savePostHint: '点击任何帖子上的书签图标可在此保存',
        adminPanel: '管理面板', addOfficialTitle: '添加认证', removeOfficialTitle: '移除认证',
        official: '✓ 认证', deleteAccount: '删除账户', deleteAccountWarning: '警告：此操作不可逆！',
        deleteAccountConfirm: '您确定吗？这将永久删除您的账户和所有数据。',
        deleteAccountSuccess: '账户已成功删除', changeUsername: '更改用户名',
        changeDisplayName: '更改显示名称', newUsername: '新用户名', newDisplayName: '新显示名称',
        currentPassword: '当前密码', confirmNewPassword: '确认新密码',
        usernameChanged: '用户名已成功更改！', displayNameChanged: '显示名称已成功更改！',
        matureContent: '成人内容', matureContentDesc: '在信息流中显示成人内容。',
        blurMature: '模糊处理（18+）', blurMatureDesc: '模糊可能敏感的图片和媒体。',
        showMatureContent: '显示成人内容', blurMatureMedia: '模糊成人媒体',
        displayNameChangeHint: '您每14天只能更改一次显示名称。',
        usernameChangeHint: '您每90天只能更改一次用户名。',
        accountPrivacy: '账户隐私', changeEmail: '更改邮箱', changePassword: '更改密码',
        newEmail: '新邮箱', emailChanged: '邮箱已成功更改！', newPassword: '新密码',
        passwordChanged: '密码已成功更改！', currentPasswordRequired: '需要当前密码',
        forgotPasswordHint: '忘记密码？提示：', askQuestion: '提问', typeQuestion: '在此输入您的问题...',
        aiResponse: 'AI回答', postsTab: '帖子', helpTab: '帮助', general: '常规',
        profileTabTitle: '个人资料', settingsTitle: '设置', helpTitle: '帮助中心',
        askAI: '询问AI助手', typeMessage: '输入消息...', send: '发送',
        aiThinking: 'AI正在思考...', noReposts: '暂无帖子', reply: '回复',
        editComment: '编辑评论', deleteComment: '删除评论', commentLiked: '点赞了评论',
        commentUnliked: '取消点赞', commentUpdated: '评论已更新！',
        noMessagesYet: '暂无消息', startConversation: '开始对话',
        selectConversation: '选择对话', typeMessageHere: '输入消息...',
        sending: '发送中...', coverColorSelect: '选择封面颜色',
        presetColors: '预设颜色', customColor: '自定义颜色'
    },
    el: {
        appName: 'FreedomNet', signIn: 'Σύνδεση', signUp: 'Εγγραφή',
        emailOrUsername: 'Email ή όνομα χρήστη', password: 'Κωδικός',
        rememberMe: 'Να με θυμάσαι', forgotPassword: 'Ξεχάσατε τον κωδικό;',
        signInBtn: 'Σύνδεση', fullName: 'Εμφανιζόμενο όνομα', username: 'Όνομα χρήστη',
        email: 'Email', confirmPassword: 'Επιβεβαίωση κωδικού', createAccount: 'Δημιουργία λογαριασμού',
        home: 'Αρχική', explore: 'Εξερεύνηση', notifications: 'Ειδοποιήσεις',
        messages: 'Μηνύματα', profile: 'Προφίλ', settings: 'Ρυθμίσεις', bookmarks: 'Σελιδοδείκτες', helpCenter: 'Κέντρο βοήθειας',
        logout: 'Αποσύνδεση', post: 'Δημοσίευση', trendingNow: 'Τάσεις',
        welcomeNotification: 'Καλώς ήρθατε στο FreedomNet!', noMessages: 'Δεν υπάρχουν μηνύματα',
        posts: 'Δημοσιεύσεις', followers: 'Ακόλουθοι', following: 'Ακολουθεί',
        editProfile: 'Επεξεργασία προφίλ', appearance: 'Εμφάνιση', theme: 'Θέμα',
        dark: 'Σκοτεινό', light: 'Φωτεινό', language: 'Γλώσσα',
        notificationsSettings: 'Ειδοποιήσεις', pushNotifications: 'Push ειδοποιήσεις',
        emailUpdates: 'Ενημερώσεις email', saveChanges: 'Αποθήκευση',
        editPost: 'Επεξεργασία', cancel: 'Ακύρωση', save: 'Αποθήκευση',
        deletePost: 'Διαγραφή;', deleteConfirm: 'Σίγουρα θέλετε να διαγράψετε;',
        delete: 'Διαγραφή', addComment: 'Σχόλιο', comment: 'Σχολιασμός',
        edit: 'Επεξεργασία', delete_: 'Διαγραφή', changeAvatar: 'Αλλαγή avatar',
        profileSettings: 'Ρυθμίσεις προφίλ', displayName: 'Εμφανιζόμενο όνομα',
        displayNameHint: 'Αλλάζει κάθε 14 ημέρες', usernameHint: 'Αλλάζει κάθε 90 ημέρες',
        selectLanguage: 'Επιλογή γλώσσας', search: 'Αναζήτηση', noResults: 'Δεν βρέθηκαν αποτελέσματα',
        joined: 'Εγγράφηκε', showProfile: 'Προβολή προφίλ', posting: 'Δημοσίευση...',
        postPublished: 'Δημοσιεύθηκε!', failedToPost: 'Αποτυχία δημοσίευσης',
        errorPosting: 'Σφάλμα', pleaseWriteSomething: 'Γράψτε κάτι',
        postUpdated: 'Ενημερώθηκε!', postDeleted: 'Διαγράφηκε!',
        postReposted: 'Αναδημοσίευση!', repostRemoved: 'Αφαιρέθηκε αναδημοσίευση',
        postSaved: 'Αποθηκεύτηκε!', postRemovedFromSaves: 'Αφαιρέθηκε από αποθηκευμένα',
        commentDeleted: 'Σχόλιο διαγράφηκε', profileUpdated: 'Το προφίλ ενημερώθηκε!',
        avatarUpdated: 'Το avatar ενημερώθηκε!', displayNameUpdated: 'Το όνομα ενημερώθηκε!',
        usernameUpdated: 'Το όνομα χρήστη ενημερώθηκε!', settingsSaved: 'Οι ρυθμίσεις αποθηκεύτηκαν!',
        passwordsDoNotMatch: 'Οι κωδικοί δεν ταιριάζουν', pleaseFillAllFields: 'Συμπληρώστε όλα τα πεδία',
        connectionError: 'Σφάλμα σύνδεσης', invalidCredentials: 'Μη έγκυρα στοιχεία',
        accountCreated: 'Ο λογαριασμός δημιουργήθηκε!', welcomeBack: 'Καλώς ήρθατε πίσω!',
        allFieldsRequired: 'Όλα τα πεδία είναι υποχρεωτικά', passwordTooShort: 'Πολύ μικρός κωδικός (ελάχιστο 6 χαρακτήρες)',
        noSavedPosts: 'Δεν υπάρχουν αποθηκευμένες δημοσιεύσεις', savePostHint: 'Κάντε κλικ στο εικονίδιο σελιδοδείκτη σε οποιαδήποτε δημοσίευση για να την αποθηκεύσετε εδώ',
        adminPanel: 'Πίνακας διαχειριστή', addOfficialTitle: 'Προσθήκη Verified', removeOfficialTitle: 'Κατάργηση Verified',
        official: '✓ Verified', deleteAccount: 'Διαγραφή λογαριασμού', deleteAccountWarning: 'ΠΡΟΕΙΔΟΠΟΙΗΣΗ: Αυτή η ενέργεια είναι μόνιμη!',
        deleteAccountConfirm: 'Είστε απολύτως σίγουροι; Αυτό θα διαγράψει το λογαριασμό σας για πάντα.',
        deleteAccountSuccess: 'Ο λογαριασμός διαγράφηκε επιτυχώς', changeUsername: 'Αλλαγή ονόματος χρήστη',
        changeDisplayName: 'Αλλαγή εμφανιζόμενου ονόματος', newUsername: 'Νέο όνομα χρήστη', newDisplayName: 'Νέο εμφανιζόμενο όνομα',
        currentPassword: 'Τρέχων κωδικός', confirmNewPassword: 'Επιβεβαίωση νέου κωδικού',
        usernameChanged: 'Το όνομα χρήστη άλλαξε επιτυχώς!', displayNameChanged: 'Το εμφανιζόμενο όνομα άλλαξε επιτυχώς!',
        matureContent: 'Περιεχόμενο για ενήλικες', matureContentDesc: 'Εμφάνιση περιεχομένου για ενήλικες στη ροή σας.',
        blurMature: 'Θόλωμα (18+)', blurMatureDesc: 'Θόλωμα ευαίσθητων εικόνων και μέσων.',
        showMatureContent: 'Εμφάνιση περιεχομένου για ενήλικες', blurMatureMedia: 'Θόλωμα μέσων για ενήλικες',
        displayNameChangeHint: 'Μπορείτε να αλλάξετε το εμφανιζόμενο όνομα μία φορά κάθε 14 ημέρες.',
        usernameChangeHint: 'Μπορείτε να αλλάξετε το όνομα χρήστη μία φορά κάθε 90 ημέρες.',
        accountPrivacy: 'Απόρρητο λογαριασμού', changeEmail: 'Αλλαγή email', changePassword: 'Αλλαγή κωδικού',
        newEmail: 'Νέο email', emailChanged: 'Το email άλλαξε επιτυχώς!', newPassword: 'Νέος κωδικός',
        passwordChanged: 'Ο κωδικός άλλαξε επιτυχώς!', currentPasswordRequired: 'Απαιτείται τρέχων κωδικός',
        forgotPasswordHint: 'Ξεχάσατε τον κωδικό; Υπόδειξη:', askQuestion: 'Κάντε μια ερώτηση', typeQuestion: 'Γράψτε την ερώτησή σας εδώ...',
        aiResponse: 'Απάντηση AI', postsTab: 'Δημοσιεύσεις', helpTab: 'Βοήθεια', general: 'Γενικά',
        profileTabTitle: 'Προφίλ', settingsTitle: 'Ρυθμίσεις', helpTitle: 'Κέντρο βοήθειας',
        askAI: 'Ρωτήστε τον βοηθό AI', typeMessage: 'Γράψτε το μήνυμά σας...', send: 'Αποστολή',
        aiThinking: 'Το AI σκέφτεται...', noReposts: 'Δεν υπάρχουν δημοσιεύσεις', reply: 'Απάντηση',
        editComment: 'Επεξεργασία σχολίου', deleteComment: 'Διαγραφή σχολίου', commentLiked: 'Το σχόλιο άρεσε',
        commentUnliked: 'Αφαίρεση like', commentUpdated: 'Το σχόλιο ενημερώθηκε!',
        noMessagesYet: 'Δεν υπάρχουν μηνύματα', startConversation: 'Ξεκινήστε μια συνομιλία',
        selectConversation: 'Επιλέξτε μια συνομιλία', typeMessageHere: 'Γράψτε ένα μήνυμα...',
        sending: 'Αποστολή...', coverColorSelect: 'Επιλογή χρώματος εξωφύλλου',
        presetColors: 'Προκαθορισμένα χρώματα', customColor: 'Προσαρμοσμένο χρώμα'
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
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    el: ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος']
};

function formatJoinDate(dateString) {
    if (!dateString) return 'Just joined';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just joined';
    const months = monthNames[currentLanguage] || monthNames.en;
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function updateLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    const t = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = t[key];
            else el.textContent = t[key];
        }
    });
    document.getElementById('pageTitle').textContent = t[currentPage] || 'Home';
    const postBtn = document.getElementById('createPostBtn');
    if (postBtn) postBtn.textContent = t.post || 'Post';
    if (currentPage === 'bookmarks') displaySavedPosts();
}

function showCustomAlert(message) {
    const alert = document.getElementById('customAlert');
    document.getElementById('alertMessage').textContent = message;
    alert.classList.add('active');
    document.getElementById('alertOkBtn').onclick = () => alert.classList.remove('active');
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function displaySavedPosts() {
    const container = document.getElementById('savedPostsList');
    if (!container) return;
    const t = translations[currentLanguage];
    const savedPostIds = Array.from(userSavedPosts);
    const savedPosts = allPosts.filter(post => savedPostIds.includes(post.id));
    if (savedPosts.length === 0) {
        container.innerHTML = `<div class="profile-empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg><p>${t.noSavedPosts}</p><small>${t.savePostHint}</small></div>`;
        return;
    }
    container.innerHTML = savedPosts.map(post => {
        const postAvatar = post.user?.avatar || `https://ui-avatars.com/api/?name=${(post.user?.displayName || post.user?.username).slice(0,2)}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`;
        const isLiked = userLikedPosts.has(post.id);
        const isReposted = userRepostedPosts.has(post.id);
        const isSaved = userSavedPosts.has(post.id);
        const isOfficial = officialUsers.has(post.userId) || post.user?.username === ADMIN_USERNAME;
        return `<div class="post-card"><div class="avatar-container"><img class="post-avatar" src="${postAvatar}" onclick="showMiniProfile('${post.userId}')" style="cursor:pointer"></div><div class="post-body"><div class="post-header"><div class="post-name-container"><span class="post-name" onclick="showMiniProfile('${post.userId}')" style="cursor:pointer">${escapeHtml(post.user?.displayName || post.user?.username)}</span>${isOfficial ? `<span class="official-badge">${t.official}</span>` : ''}</div><span class="post-username">@${escapeHtml(post.user?.username)}</span><span class="post-time">${formatTime(post.createdAt)}</span></div><div class="post-text">${escapeHtml(post.content)}</div>${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image ${blurMatureEnabled ? 'blur-mature' : ''}" alt="Post image">` : ''}<div class="post-actions"><button class="action-btn like" onclick="toggleLike('${post.id}')" style="color:${isLiked ? 'var(--error)' : ''}"><svg viewBox="0 0 24 24" width="18" height="18" fill="${isLiked ? '#f4212e' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>${post.likes}</span></button><button class="action-btn comment" onclick="openCommentModal('${post.id}')"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>${post.comments?.length || 0}</span></button><button class="action-btn repost" onclick="toggleRepost('${post.id}')" style="color:${isReposted ? 'var(--success)' : ''}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg><span>${post.reposts || 0}</span></button><button class="action-btn save ${isSaved ? 'saved' : ''}" onclick="toggleSave('${post.id}')"><svg viewBox="0 0 24 24" width="18" height="18" fill="${isSaved ? '#ffd700' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button></div></div></div>`;
    }).join('');
}

// Auth elements
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

async function loadMessages() {
    const res = await fetch(`${API_URL}/api/messages/${currentUser.id}`);
    allMessages = await res.json();
    if (currentChatUser) displayMessages(currentChatUser);
    displayChatList();
}

async function sendMessage(receiverId, content) {
    const res = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser.id, receiverId, content })
    });
    if (res.ok) await loadMessages();
}

function displayChatList() {
    const container = document.getElementById('messagesList');
    if (!container) return;
    const t = translations[currentLanguage];
    const conversations = new Map();
    allMessages.forEach(msg => {
        const otherId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
        if (!conversations.has(otherId) || new Date(msg.createdAt) > new Date(conversations.get(otherId).createdAt)) {
            const otherUser = allUsers.find(u => u.id === otherId);
            if (otherUser) conversations.set(otherId, { ...msg, otherUser });
        }
    });
    if (conversations.size === 0) {
        container.innerHTML = `<div class="profile-empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><p>${t.noMessagesYet}</p></div>`;
        return;
    }
    container.innerHTML = Array.from(conversations.values()).map(conv => {
        const avatar = conv.otherUser?.avatar || `https://ui-avatars.com/api/?name=${(conv.otherUser?.displayName || conv.otherUser?.username).slice(0,2)}&background=1d9bf0&color=fff`;
        return `<div class="message-thread ${currentChatUser === conv.otherUser?.id ? 'active' : ''}" onclick="openChat('${conv.otherUser?.id}')"><img class="message-thread-avatar" src="${avatar}"><div class="message-thread-info"><span class="message-thread-name">${escapeHtml(conv.otherUser?.displayName || conv.otherUser?.username)}</span><span class="message-thread-preview">${escapeHtml(conv.content?.substring(0, 50) || '')}</span></div><div class="message-thread-time">${formatTime(conv.createdAt)}</div></div>`;
    }).join('');
}

function displayMessages(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    currentChatUser = userId;
    const container = document.getElementById('messagesContent');
    const t = translations[currentLanguage];
    const userMessages = allMessages.filter(msg => (msg.senderId === currentUser.id && msg.receiverId === userId) || (msg.senderId === userId && msg.receiverId === currentUser.id));
    userMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    container.innerHTML = userMessages.map(msg => `<div class="message-bubble ${msg.senderId === currentUser.id ? 'sent' : 'received'}">${escapeHtml(msg.content)}<span class="message-time">${formatTime(msg.createdAt)}</span></div>`).join('');
    if (container.children.length === 0) container.innerHTML = `<div class="messages-empty"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><p>${t.noMessagesYet}</p><small>${t.startConversation}</small></div>`;
    document.getElementById('messagesHeaderName').textContent = user.displayName || user.username;
    const avatar = user.avatar || `https://ui-avatars.com/api/?name=${(user.displayName || user.username).slice(0,2)}&background=1d9bf0&color=fff`;
    document.getElementById('messagesHeaderAvatar').src = avatar;
    container.scrollTop = container.scrollHeight;
}

window.openChat = function(userId) { displayMessages(userId); displayChatList(); };
document.getElementById('sendMessageBtn')?.addEventListener('click', async () => {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    if (!content || !currentChatUser) return;
    input.value = '';
    await sendMessage(currentChatUser, content);
    await loadMessages();
    displayMessages(currentChatUser);
});

async function loadOfficialUsers() {
    try {
        const res = await fetch(`${API_URL}/api/official/users`);
        const data = await res.json();
        officialUsers = new Set(data);
        if (currentUser && currentUser.username === ADMIN_USERNAME) officialUsers.add(currentUser.id);
    } catch (error) {}
}

async function addOfficialUser(userId) {
    const res = await fetch(`${API_URL}/api/official/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, adminId: currentUser.id }) });
    if (res.ok) { officialUsers.add(userId); loadPosts(); if (currentPage === 'profile') loadUserPosts(); showCustomAlert('Verified title added!'); }
}

async function removeOfficialUser(userId) {
    const res = await fetch(`${API_URL}/api/official/remove`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, adminId: currentUser.id }) });
    if (res.ok) { officialUsers.delete(userId); loadPosts(); if (currentPage === 'profile') loadUserPosts(); showCustomAlert('Verified title removed!'); }
}

async function initApp(user) {
    currentUser = user;
    authScreen.style.display = 'none';
    app.classList.add('active');
    const savedMatureContent = localStorage.getItem('matureContentEnabled') === 'true';
    const savedBlurMature = localStorage.getItem('blurMatureEnabled') === 'true';
    matureContentEnabled = savedMatureContent;
    blurMatureEnabled = savedBlurMature;
    const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.username)}&background=1d9bf0&color=fff&bold=true&size=128&rounded=true`;
    document.getElementById('userAvatar').src = avatarUrl;
    document.getElementById('sidebarUsername').textContent = user.displayName || user.username;
    document.getElementById('sidebarUserHandle').textContent = `@${user.username}`;
    
    await loadOfficialUsers();
    await loadAllUsers();
    await loadPosts();
    await loadUserInteractions();
    await loadMessages();
    if (messageInterval) clearInterval(messageInterval);
    messageInterval = setInterval(async () => { if (currentUser) await loadMessages(); }, 5000);
    changePage('home');
    updateLanguage(localStorage.getItem('language') || 'en');
    document.getElementById('createPostModal').style.display = 'none';
    document.getElementById('editPostModal').style.display = 'none';
    document.getElementById('commentModal').style.display = 'none';
    document.getElementById('editCommentModal').style.display = 'none';
    document.getElementById('deleteConfirmModal').style.display = 'none';
}

// Продолжение следует... (остальные функции: loadPosts, displayPosts, toggleLike, createPost и т.д.)
