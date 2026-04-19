<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, viewport-fit=cover">
    <title>X</title>
    <link rel="icon" type="image/png" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E">
    <style>
        /* Twitter/X Official Font - Chirp */
        @font-face {
            font-family: 'Chirp';
            src: url('https://abs.twimg.com/fonts/chirp-regular-web.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Chirp';
            src: url('https://abs.twimg.com/fonts/chirp-bold-web.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
        @font-face {
            font-family: 'Chirp';
            src: url('https://abs.twimg.com/fonts/chirp-heavy-web.woff2') format('woff2');
            font-weight: 800;
            font-style: normal;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg-primary: #000000;
            --bg-secondary: #000000;
            --text-primary: #ffffff;
            --text-secondary: #71767b;
            --border-color: #2f3336;
            --hover-bg: rgba(255, 255, 255, 0.03);
            --accent: #1d9bf0;
            --accent-hover: #1a8cd8;
            --gold: #ffd700;
            --moderator: #23c55e;
            --admin: #f4212e;
            --online-green: #00ba7c;
            --offline-gray: #536471;
            --like-red: #f91880;
            --retweet-green: #00ba7c;
        }

        body.dark { --bg-primary: #000000; --bg-secondary: #000000; --text-primary: #ffffff; --border-color: #2f3336; --hover-bg: rgba(255, 255, 255, 0.03); }
        body.dark-gray { --bg-primary: #15202b; --bg-secondary: #1e2732; --text-primary: #ffffff; --border-color: #2f3336; --hover-bg: rgba(255, 255, 255, 0.03); }
        body.gray { --bg-primary: #1a1a1a; --bg-secondary: #222222; --text-primary: #ffffff; --border-color: #333333; --hover-bg: rgba(255, 255, 255, 0.03); }
        body.light { --bg-primary: #ffffff; --bg-secondary: #ffffff; --text-primary: #0f1419; --text-secondary: #536471; --border-color: #eff3f4; --hover-bg: rgba(0, 0, 0, 0.03); --accent: #1d9bf0; }

        body {
            font-family: 'Chirp', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            overflow-x: hidden;
        }

        /* Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        
        .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            transition: opacity 0.3s ease;
        }
        .loading-logo {
            font-size: 48px;
            font-weight: 800;
            color: var(--accent);
            animation: pulse 1s ease infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.98); } }

        /* Sidebar - Twitter style */
        .sidebar {
            width: 275px;
            position: fixed;
            height: 100vh;
            padding: 8px 12px;
            border-right: 1px solid var(--border-color);
            background: var(--bg-primary);
            overflow-y: auto;
        }
        
        .logo {
            padding: 12px;
            margin-bottom: 4px;
            display: inline-block;
            cursor: pointer;
            border-radius: 9999px;
            transition: background 0.2s ease;
        }
        .logo:hover {
            background: var(--hover-bg);
        }
        .logo svg {
            width: 28px;
            height: 28px;
            fill: var(--accent);
        }
        
        .nav-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 12px;
            margin: 4px 0;
            border-radius: 9999px;
            cursor: pointer;
            font-size: 20px;
            font-weight: 400;
            width: fit-content;
            color: var(--text-primary);
            background: transparent;
            transition: background 0.2s ease;
        }
        .nav-item:hover {
            background: var(--hover-bg);
        }
        .nav-item.active {
            font-weight: 700;
        }
        .nav-text {
            font-size: 20px;
            font-weight: 400;
        }
        .nav-item.active .nav-text {
            font-weight: 700;
        }
        
        /* Post button */
        .post-btn {
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 9999px;
            padding: 16px;
            font-size: 17px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 16px;
            width: 90%;
            transition: background 0.2s ease;
        }
        .post-btn:hover {
            background: var(--accent-hover);
        }
        
        /* Bottom nav mobile */
        .bottom-nav {
            display: none;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--bg-primary);
            border-top: 1px solid var(--border-color);
            padding: 8px 16px;
            z-index: 100;
            justify-content: space-around;
        }
        .bottom-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            padding: 8px;
            cursor: pointer;
            color: var(--text-secondary);
            font-size: 12px;
            border-radius: 9999px;
            transition: background 0.2s ease;
        }
        .bottom-nav-item:hover {
            background: var(--hover-bg);
        }
        .bottom-nav-item.active {
            color: var(--accent);
        }
        
        /* Main content */
        .main-content {
            margin-left: 275px;
            min-height: 100vh;
            border-right: 1px solid var(--border-color);
            max-width: 600px;
        }
        
        .header {
            position: sticky;
            top: 0;
            background: var(--bg-primary);
            backdrop-filter: blur(12px);
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
            font-size: 20px;
            font-weight: 800;
            z-index: 10;
        }
        
        /* Feed */
        .feed-container {
            max-width: 600px;
        }
        
        /* Create post */
        .create-post {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            gap: 12px;
        }
        .avatar-img, .avatar-placeholder {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
            cursor: pointer;
            flex-shrink: 0;
        }
        .avatar-placeholder {
            background: var(--accent);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
        }
        .post-input-area {
            flex: 1;
        }
        .post-input-area textarea {
            width: 100%;
            background: transparent;
            border: none;
            color: var(--text-primary);
            font-size: 18px;
            font-family: 'Chirp', sans-serif;
            resize: vertical;
            outline: none;
            min-height: 60px;
        }
        .post-input-area textarea::placeholder {
            color: var(--text-secondary);
            font-size: 18px;
        }
        .post-actions-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 12px;
        }
        .image-upload {
            color: var(--accent);
            cursor: pointer;
            font-size: 20px;
            padding: 8px;
            border-radius: 9999px;
            transition: background 0.2s ease;
        }
        .image-upload:hover {
            background: rgba(29, 155, 240, 0.1);
        }
        .publish-btn {
            background: var(--accent);
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        .publish-btn:hover {
            background: var(--accent-hover);
        }
        
        /* Post card - Twitter style */
        .post-card {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
            cursor: pointer;
            transition: background 0.2s ease;
        }
        .post-card:hover {
            background: var(--hover-bg);
        }
        .post-header {
            display: flex;
            gap: 12px;
        }
        .post-avatar-img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
            cursor: pointer;
            flex-shrink: 0;
        }
        .post-body {
            flex: 1;
        }
        .post-user {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 4px;
            margin-bottom: 4px;
        }
        .post-display-name {
            font-weight: 700;
            font-size: 15px;
        }
        .post-username {
            color: var(--text-secondary);
            font-size: 14px;
        }
        .post-time {
            color: var(--text-secondary);
            font-size: 13px;
        }
        .post-content {
            font-size: 15px;
            line-height: 1.4;
            margin: 4px 0 12px 0;
        }
        .post-image-container {
            position: relative;
            margin-top: 8px;
            border-radius: 16px;
            overflow: hidden;
        }
        .post-image {
            width: 100%;
            max-height: 400px;
            object-fit: cover;
            border-radius: 16px;
            border: 1px solid var(--border-color);
        }
        .post-image.blurred {
            filter: blur(20px);
        }
        .report-image-btn {
            position: absolute;
            bottom: 12px;
            left: 12px;
            background: rgba(0,0,0,0.7);
            color: white;
            border: none;
            border-radius: 9999px;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        .post-image-container:hover .report-image-btn {
            opacity: 1;
        }
        
        /* Post stats - Twitter style */
        .post-stats {
            display: flex;
            gap: 32px;
            margin-top: 12px;
        }
        .stat-btn {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px;
            border-radius: 9999px;
            transition: color 0.2s ease, background 0.2s ease;
        }
        .stat-btn:hover {
            background: rgba(29, 155, 240, 0.1);
            color: var(--accent);
        }
        .stat-btn.liked {
            color: var(--like-red);
        }
        .stat-btn.liked:hover {
            background: rgba(249, 24, 128, 0.1);
        }
        .delete-btn {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 13px;
            padding: 6px;
            border-radius: 9999px;
            margin-left: auto;
            transition: color 0.2s ease;
        }
        .delete-btn:hover {
            color: var(--admin);
            background: rgba(244, 33, 46, 0.1);
        }
        
        /* Comments section */
        .comments-section {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid var(--border-color);
        }
        .comment {
            display: flex;
            gap: 8px;
            padding: 8px 0;
        }
        .comment-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
        }
        .comment strong {
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
        }
        .comment-content {
            font-size: 14px;
            margin-top: 2px;
        }
        .delete-comment-btn {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 12px;
            margin-left: 8px;
        }
        .comment-input {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }
        .comment-input input {
            flex: 1;
            background: transparent;
            border: 1px solid var(--border-color);
            border-radius: 9999px;
            padding: 8px 16px;
            color: var(--text-primary);
            font-family: 'Chirp', sans-serif;
            outline: none;
        }
        .comment-input input:focus {
            border-color: var(--accent);
        }
        .comment-send-btn {
            background: none;
            border: none;
            color: var(--accent);
            cursor: pointer;
            font-size: 18px;
            padding: 0 12px;
        }
        
        /* Profile page */
        .profile-container {
            max-width: 600px;
        }
        .profile-header {
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid var(--border-color);
        }
        .profile-avatar {
            width: 112px;
            height: 112px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 12px;
            cursor: pointer;
        }
        .profile-stats {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin: 16px 0;
        }
        .stat-item {
            text-align: center;
            cursor: pointer;
        }
        .stat-number {
            font-weight: 700;
            font-size: 17px;
        }
        .stat-label {
            color: var(--text-secondary);
            font-size: 13px;
        }
        .follow-btn, .unfollow-btn {
            background: var(--accent);
            color: white;
            border: none;
            padding: 8px 24px;
            border-radius: 9999px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 12px;
        }
        .unfollow-btn {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-primary);
        }
        
        /* Badges */
        .verified-badge, .gold-badge, .moderator-badge, .admin-badge {
            display: inline-flex;
            align-items: center;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 9999px;
            margin-left: 4px;
        }
        .verified-badge { background: var(--accent); color: white; }
        .gold-badge { background: var(--gold); color: #000; }
        .moderator-badge { background: var(--moderator); color: #000; }
        .admin-badge { background: var(--admin); color: white; }
        
        /* Mentions & Hashtags */
        .mention, .hashtag {
            color: var(--accent);
            cursor: pointer;
        }
        .mention:hover, .hashtag:hover {
            text-decoration: underline;
        }
        
        /* Modals */
        .custom-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
        }
        .custom-modal-content {
            background: var(--bg-primary);
            border-radius: 28px;
            padding: 24px;
            width: 400px;
            max-width: 90%;
            border: 1px solid var(--border-color);
            animation: scaleIn 0.2s ease;
        }
        .custom-modal-content input, .custom-modal-content textarea {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            background: transparent;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            color: var(--text-primary);
            font-family: 'Chirp', sans-serif;
            outline: none;
        }
        .custom-modal-content input:focus, .custom-modal-content textarea:focus {
            border-color: var(--accent);
        }
        .custom-modal-buttons {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 16px;
        }
        .custom-modal-btn {
            padding: 8px 20px;
            border-radius: 9999px;
            font-weight: 700;
            cursor: pointer;
            border: none;
        }
        .custom-modal-btn-primary {
            background: var(--accent);
            color: white;
        }
        .custom-modal-btn-cancel {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-primary);
        }
        .custom-modal-btn-yes {
            background: var(--admin);
            color: white;
        }
        
        /* Auth card */
        .auth-card {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 28px;
            padding: 40px;
            width: 420px;
            max-width: 90%;
            text-align: center;
        }
        .auth-card input {
            width: 100%;
            padding: 16px;
            margin: 8px 0;
            background: transparent;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            color: var(--text-primary);
            font-family: 'Chirp', sans-serif;
        }
        .auth-card button {
            width: 100%;
            padding: 12px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 9999px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 8px;
        }
        .divider {
            margin: 16px 0;
            color: var(--text-secondary);
        }
        
        /* Messages */
        .messages-container {
            display: flex;
            height: calc(100vh - 60px);
        }
        .conversations-sidebar {
            width: 320px;
            border-right: 1px solid var(--border-color);
        }
        .conversation-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        .conversation-item:hover {
            background: var(--hover-bg);
        }
        .conversation-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
        }
        .conversation-name {
            font-weight: 700;
        }
        .conversation-last-message {
            font-size: 13px;
            color: var(--text-secondary);
        }
        .chat-area {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
        }
        .message-bubble.outgoing {
            background: var(--accent);
            color: white;
            border-radius: 18px 18px 4px 18px;
            padding: 8px 12px;
            max-width: 70%;
            margin-left: auto;
        }
        .message-bubble.incoming {
            background: var(--border-color);
            border-radius: 18px 18px 18px 4px;
            padding: 8px 12px;
            max-width: 70%;
        }
        .chat-input-area {
            padding: 16px;
            border-top: 1px solid var(--border-color);
            display: flex;
            gap: 12px;
        }
        .chat-input {
            flex: 1;
            background: transparent;
            border: 1px solid var(--border-color);
            border-radius: 9999px;
            padding: 12px 16px;
            color: var(--text-primary);
            font-family: 'Chirp', sans-serif;
        }
        
        /* Settings */
        .custom-select {
            position: relative;
            width: 100%;
            background: transparent;
            border: 1px solid var(--border-color);
            border-radius: 9999px;
            padding: 12px 16px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
        }
        .custom-select-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            margin-top: 8px;
            z-index: 100;
        }
        .custom-select-option {
            padding: 12px 16px;
            cursor: pointer;
        }
        .custom-select-option:hover {
            background: var(--hover-bg);
        }
        
        /* User preview */
        .user-preview {
            position: fixed;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 16px;
            width: 280px;
            z-index: 200;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: scaleIn 0.15s ease;
        }
        
        /* Responsive */
        @media (max-width: 1000px) {
            .sidebar { width: 88px; }
            .sidebar .nav-text { display: none; }
            .sidebar .post-btn { display: none; }
            .main-content { margin-left: 88px; }
        }
        @media (max-width: 768px) {
            .sidebar { display: none; }
            .main-content { margin-left: 0; padding-bottom: 70px; }
            .bottom-nav { display: flex; }
        }
        
        /* Crop modal */
        .crop-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1001;
        }
        .crop-modal-content {
            background: var(--bg-primary);
            border-radius: 28px;
            padding: 24px;
            width: 500px;
            max-width: 90%;
            text-align: center;
        }
        .crop-container {
            position: relative;
            width: 300px;
            height: 300px;
            margin: 16px auto;
            overflow: hidden;
            border-radius: 50%;
            border: 2px solid var(--accent);
            cursor: grab;
        }
        .crop-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: none;
            transform-origin: center;
        }
        .zoom-slider {
            width: 100%;
            margin: 16px 0;
        }
        
        .global-footer {
            text-align: center;
            padding: 20px;
            color: var(--text-secondary);
            font-size: 13px;
            border-top: 1px solid var(--border-color);
        }
    </style>
</head>
<body>
<div id="loading" class="loading-screen">
    <div class="loading-logo">𝕏</div>
</div>
<div id="root" style="display:none;"></div>

<script>
    let currentUser = null;
    let currentTab = 'feed';
    let feed = [];
    let conversationsList = [];
    let currentChatUser = null;
    let pendingImage = null;
    let searchQuery = '';
    let searchResults = [];
    let searchPosts = [];
    let allUsers = [];
    let currentProfileUser = null;
    let userFollows = [];
    let followersList = [];
    let followingList = [];
    let cropScale = 1;
    let cropTranslateX = 0;
    let cropTranslateY = 0;
    let unreadCount = 0;
    let currentChatMessages = [];
    let messageReactions = {};
    let feedOffset = 0;
    let feedHasMore = true;
    let feedLoading = false;
    let activePreviewPopup = null;
    let onlineUsers = new Set();
    let lastActivity = Date.now();
    let notificationSetting = localStorage.getItem('notificationSetting') || 'all';
    let nsfwEnabled = localStorage.getItem('nsfwEnabled') === 'true';
    let fakeOnlineCount = 15;
    let ws = null;
    let isDraggingCrop = false;
    let cropStartX, cropStartY, cropStartTranslateX, cropStartTranslateY;
    let currentLang = localStorage.getItem('language') || 'en';
    
    const translations = {
        en: { feed: 'Home', profile: 'Profile', messages: 'Messages', search: 'Explore', notifications: 'Notifications', create: 'Post', feedback: 'Feedback', more: 'More', logout: 'Logout', settings: 'Settings', follow: 'Follow', unfollow: 'Unfollow', likes: 'Likes', comments: 'Comments', reply: 'Reply', post: 'Post', whatsHappening: "What's happening?", publish: 'Post', login: 'Log in', register: 'Sign up', delete: 'Delete', cancel: 'Cancel', send: 'Send', joined: 'Joined', followers: 'Followers', following: 'Following', noPosts: 'No posts yet', viewProfile: 'View profile', reportImage: 'Report', cannotMessageSelf: 'You cannot message yourself' },
        ru: { feed: 'Главная', profile: 'Профиль', messages: 'Сообщения', search: 'Поиск', notifications: 'Уведомления', create: 'Пост', feedback: 'Отзывы', more: 'Ещё', logout: 'Выйти', settings: 'Настройки', follow: 'Читать', unfollow: 'Отписаться', likes: 'Нравится', comments: 'Ответы', reply: 'Ответить', post: 'Пост', whatsHappening: 'Что нового?', publish: 'Опубликовать', login: 'Войти', register: 'Зарегистрироваться', delete: 'Удалить', cancel: 'Отмена', send: 'Отправить', joined: 'Присоединился', followers: 'Читатели', following: 'Читаемые', noPosts: 'Нет постов', viewProfile: 'Посмотреть профиль', reportImage: 'Пожаловаться', cannotMessageSelf: 'Нельзя писать себе' }
    };
    
    function t(key) { return translations[currentLang]?.[key] || translations.en[key] || key; }
    function setLanguage(lang) { currentLang = lang; localStorage.setItem('language', lang); renderMain(); }
    function isAdmin() { return currentUser?.role === 'admin' || currentUser?.username === 'DevAlexPlay'; }
    function isModeratorOrAdmin() { return currentUser?.role === 'moderator' || currentUser?.role === 'admin' || currentUser?.username === 'DevAlexPlay'; }
    
    function renderCreatorBadge(user) {
        if (user?.role === 'admin') return '<span class="admin-badge">admin</span>';
        if (user?.role === 'moderator') return '<span class="moderator-badge">mod</span>';
        if (user?.is_official) return '<span class="gold-badge">⭐</span>';
        if (user?.is_creator) return '<span class="verified-badge">✓</span>';
        return '';
    }
    
    function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])); }
    function parseMentionsAndHashtags(text) { if (!text) return ''; let html = escapeHtml(text); html = html.replace(/@(\w+)/g, '<span class="mention">@$1</span>'); html = html.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>'); return html; }
    function showToast(msg, isErr) { const toast = document.createElement('div'); toast.style.cssText = `position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:${isErr ? '#f4212e' : '#1d9bf0'}; color:white; padding:12px 24px; border-radius:9999px; z-index:10002;`; toast.textContent = msg; document.body.appendChild(toast); setTimeout(() => toast.remove(), 3000); }
    
    async function api(url, options = {}) { const res = await fetch(url, { ...options, credentials: 'include' }); if (!res.ok) throw new Error(await res.text()); return res.json(); }
    
    async function loadFeed(reset = false) {
        if (reset) { feedOffset = 0; feedHasMore = true; feed = []; }
        if (!feedHasMore || feedLoading) return;
        feedLoading = true;
        try {
            const res = await api(`/api/feed?offset=${feedOffset}&limit=15`);
            if (reset) feed = res.posts; else feed = [...feed, ...res.posts];
            feedHasMore = res.hasMore; feedOffset += 15;
        } catch(e) { console.error(e); }
        feedLoading = false;
    }
    
    async function loadAllUsers() { try { allUsers = await api('/api/users'); } catch(e) { allUsers = []; } }
    async function loadFollows() { try { userFollows = await api('/api/follows'); } catch(e) { userFollows = []; } }
    function isFollowing(userId) { return userFollows.some(f => f.followee_id === userId); }
    
    async function followUser(userId) { await api(`/api/follow/${userId}`, { method: 'POST' }); await loadFollows(); renderMain(); }
    async function unfollowUser(userId) { await api(`/api/follow/${userId}`, { method: 'DELETE' }); await loadFollows(); renderMain(); }
    async function deletePost(postId) { await api(`/api/posts/${postId}`, { method: 'DELETE' }); await loadFeed(true); renderMain(); }
    async function toggleLike(postId) { const post = feed.find(p => p.id === postId); if (post.user_liked) await api(`/api/like/${postId}`, { method: 'DELETE' }); else await api(`/api/like/${postId}`, { method: 'POST' }); await loadFeed(true); renderMain(); }
    async function addComment(postId) { const input = document.getElementById(`commentInput-${postId}`); const content = input?.value.trim(); if (!content) return; await api(`/api/comment/${postId}`, { method: 'POST', body: JSON.stringify({ content }), headers: { 'Content-Type': 'application/json' } }); await loadFeed(true); renderMain(); }
    
    function renderPostCard(post) {
        const isOwnPost = post.user_id === currentUser.id;
        const canDelete = isOwnPost || isAdmin();
        const isNsfw = false; // Simplified
        const imageClass = isNsfw && !nsfwEnabled ? 'post-image blurred' : 'post-image';
        
        return `<div class="post-card"><div class="post-header"><img class="post-avatar-img" src="${post.avatar || ''}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2748%27 height=%2748%27%3E%3Crect width=%2748%27 height=%2748%27 fill=%27%231d9bf0%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27white%27 font-size=%2720%27%3E${(post.username?.[0] || 'U').toUpperCase()}%3C/text%3E%3C/svg%3E'"><div class="post-body"><div class="post-user"><span class="post-display-name">${escapeHtml(post.username)}</span>${renderCreatorBadge(post)}<span class="post-username">@${escapeHtml(post.username)}</span><span class="post-time">· ${new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><div class="post-content">${parseMentionsAndHashtags(post.content || '')}</div>${post.image ? `<div class="post-image-container"><img src="${post.image}" class="${imageClass}"><button class="report-image-btn" onclick="event.stopPropagation(); showToast('Reported')">${t('reportImage')}</button></div>` : ''}<div class="post-stats"><button class="stat-btn ${post.user_liked ? 'liked' : ''}" onclick="toggleLike(${post.id})">♥ ${post.likes_count || 0}</button><button class="stat-btn" onclick="document.getElementById('comments-${post.id}').style.display = document.getElementById('comments-${post.id}').style.display === 'none' ? 'block' : 'none'">💬 ${post.comments?.length || 0}</button>${canDelete ? `<button class="delete-btn" onclick="deletePost(${post.id})">🗑</button>` : ''}</div><div id="comments-${post.id}" style="display:none;" class="comments-section">${(post.comments || []).map(c => `<div class="comment"><img class="comment-avatar" src="${c.avatar || ''}" onerror="this.style.display='none'"><div><strong>${escapeHtml(c.username)}</strong>${renderCreatorBadge(c)}<div class="comment-content">${escapeHtml(c.content)}</div></div></div>`).join('')}<div class="comment-input"><input type="text" id="commentInput-${post.id}" placeholder="${t('reply')}"><button class="comment-send-btn" onclick="addComment(${post.id})">→</button></div></div></div></div></div>`;
    }
    
    function renderHome() {
        return `<div class="feed-container"><div class="create-post"><img class="avatar-img" src="${currentUser?.avatar || ''}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2748%27 height=%2748%27%3E%3Crect width=%2748%27 height=%2748%27 fill=%27%231d9bf0%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27white%27 font-size=%2720%27%3E${(currentUser?.username?.[0] || 'U').toUpperCase()}%3C/text%3E%3C/svg%3E'"><div class="post-input-area"><textarea id="postContent" rows="2" placeholder="${t('whatsHappening')}"></textarea><div class="post-actions-bar"><label class="image-upload">🖼️ <input type="file" id="postImage" accept="image/*" style="display:none;"></label><button class="publish-btn" onclick="publishPost()">${t('publish')}</button></div></div></div><div id="feedPosts">${feed.map(p => renderPostCard(p)).join('')}</div>${feedHasMore ? '<div style="text-align:center; padding:20px;">Loading...</div>' : ''}</div>`;
    }
    
    function renderProfilePage() {
        const user = currentProfileUser || currentUser;
        const isOwn = !currentProfileUser;
        const following = currentProfileUser ? isFollowing(currentProfileUser.id) : false;
        const userPosts = feed.filter(p => p.user_id === user.id);
        return `<div class="profile-container"><div class="profile-header"><img class="profile-avatar" src="${user.avatar || ''}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27112%27 height=%27112%27%3E%3Crect width=%27112%27 height=%27112%27 fill=%27%231d9bf0%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27white%27 font-size=%2740%27%3E${(user.username?.[0] || 'U').toUpperCase()}%3C/text%3E%3C/svg%3E'"><h2>${escapeHtml(user.username)}</h2><div class="profile-stats"><div class="stat-item"><div class="stat-number">${followersList.length}</div><div class="stat-label">${t('followers')}</div></div><div class="stat-item"><div class="stat-number">${followingList.length}</div><div class="stat-label">${t('following')}</div></div><div class="stat-item"><div class="stat-number">${userPosts.length}</div><div class="stat-label">Posts</div></div></div>${!isOwn ? (following ? `<button class="unfollow-btn" onclick="unfollowUser(${user.id})">${t('unfollow')}</button>` : `<button class="follow-btn" onclick="followUser(${user.id})">${t('follow')}</button>`) : ''}</div>${userPosts.map(p => renderPostCard(p)).join('')}</div>`;
    }
    
    function renderMessages() {
        return `<div class="messages-container"><div class="conversations-sidebar"><div class="conversations-list">${conversationsList.map(c => `<div class="conversation-item" onclick="openChat(${c.other_id}, '${escapeHtml(c.username)}')"><img class="conversation-avatar" src="${c.avatar || ''}" onerror="this.style.display='none'"><div><div class="conversation-name">${escapeHtml(c.username)}</div><div class="conversation-last-message">${escapeHtml(c.last_message || '')}</div></div></div>`).join('')}</div></div><div class="chat-area"><div class="chat-messages" id="chatMessages">${currentChatMessages.map(m => `<div class="${m.from_id === currentUser.id ? 'message-bubble outgoing' : 'message-bubble incoming'}">${escapeHtml(m.content || '')}</div>`).join('')}</div><div class="chat-input-area"><input type="text" id="chatInput" class="chat-input" placeholder="Message..."><button class="publish-btn" onclick="sendMessage()">Send</button></div></div></div>`;
    }
    
    function renderSearch() { return `<div class="feed-container" style="padding:16px;"><input type="text" id="searchInput" placeholder="Search..." style="width:100%; padding:12px; border-radius:9999px; background:transparent; border:1px solid var(--border-color); color:var(--text-primary);"><div id="searchResults"></div></div>`; }
    function renderInteresting() { return `<div class="feed-container">${feed.slice(0,5).map(p => renderPostCard(p)).join('')}</div>`; }
    function renderNotifications() { return `<div class="feed-container">${feed.filter(p => p.user_liked).slice(0,10).map(p => `<div class="post-card">❤️ @${escapeHtml(p.username)} liked your post</div>`).join('')}</div>`; }
    function renderCreate() { return `<div class="feed-container" style="padding:16px;"><div class="create-post" style="border:none;"><textarea id="postContent" rows="4" placeholder="${t('whatsHappening')}" style="width:100%; background:transparent; color:var(--text-primary); font-size:18px;"></textarea><button class="publish-btn" onclick="publishPost()">${t('publish')}</button></div></div>`; }
    function renderFeedback() { return `<div class="feed-container" style="padding:20px;"><div class="post-card" onclick="showFeedbackModal()" style="cursor:pointer;">📝 ${t('feedback')}</div></div>`; }
    function renderMore() { return `<div class="feed-container" style="padding:20px;"><div class="post-card" onclick="showStatsModal()">📊 Statistics</div><div class="post-card" onclick="showChangePasswordModal()">🔒 Change Password</div><div class="post-card" onclick="showDeleteAccountModal()" style="color:#f4212e;">🗑 Delete Account</div><div class="post-card" onclick="logout()">🚪 Logout</div></div>`; }
    
    function showStatsModal() { alert(`Posts: ${feed.filter(p => p.user_id === currentUser?.id).length}\nLikes: ${feed.reduce((a,p) => a + (p.likes_count || 0), 0)}`); }
    function showChangePasswordModal() { alert('Change password feature'); }
    function showDeleteAccountModal() { if(confirm('Delete account permanently?')) logout(); }
    function showFeedbackModal() { const content = prompt('Enter feedback or promo code:'); if(content) api('/api/feedback', { method: 'POST', body: JSON.stringify({ content }), headers: { 'Content-Type': 'application/json' } }).then(() => showToast('Sent!')); }
    function logout() { api('/api/logout', { method: 'POST' }).then(() => { currentUser = null; render(); }); }
    
    async function publishPost() { const content = document.getElementById('postContent')?.value; if(!content) return; const formData = new FormData(); formData.append('content', content); if(pendingImage) { const blob = await fetch(pendingImage).then(r => r.blob()); formData.append('image', blob); } await api('/api/posts', { method: 'POST', body: formData }); pendingImage = null; await loadFeed(true); renderMain(); }
    
    function openAvatarUpload() { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = (e) => { const file = e.target.files[0]; if(file) { const reader = new FileReader(); reader.onload = (ev) => { updateAvatar(ev.target.result); }; reader.readAsDataURL(file); } }; input.click(); }
    async function updateAvatar(dataUrl) { const blob = await fetch(dataUrl).then(r => r.blob()); const formData = new FormData(); formData.append('avatar', blob); await api('/api/avatar', { method: 'POST', body: formData }); const me = await api('/api/me'); currentUser = me.user; renderMain(); }
    
    async function loadConversationsList() { try { conversationsList = await api('/api/chat-users'); } catch(e) { conversationsList = []; } }
    async function openChat(userId, username) { currentChatUser = { id: userId, username }; const messages = await api(`/api/messages/${userId}`); currentChatMessages = messages; renderMain(); setTimeout(() => { const container = document.getElementById('chatMessages'); if(container) container.scrollTop = container.scrollHeight; }, 100); }
    async function sendMessage() { const input = document.getElementById('chatInput'); const content = input?.value.trim(); if(!content || !currentChatUser) return; await api(`/api/messages/${currentChatUser.id}`, { method: 'POST', body: JSON.stringify({ content }), headers: { 'Content-Type': 'application/json' } }); await openChat(currentChatUser.id, currentChatUser.username); }
    
    function setTheme(theme) { document.body.className = theme; localStorage.setItem('theme', theme); renderMain(); }
    
    async function renderMain() {
        await loadFeed(); await loadConversationsList();
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.className = savedTheme;
        const root = document.getElementById('root');
        const tabs = ['feed', 'profile', 'messages', 'search', 'interesting', 'notifications', 'create', 'feedback', 'more'];
        const tabNames = { feed: t('feed'), profile: t('profile'), messages: t('messages'), search: t('search'), interesting: 'Interesting', notifications: t('notifications'), create: t('create'), feedback: t('feedback'), more: t('more') };
        
        root.innerHTML = `<div class="app"><div class="sidebar"><div class="logo" onclick="switchTab('feed')"><svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></div>${tabs.map(tab => `<div class="nav-item ${currentTab === tab ? 'active' : ''}" onclick="switchTab('${tab}')"><span class="nav-text">${tabNames[tab]}</span></div>`).join('')}<button class="post-btn" onclick="switchTab('create')">Post</button></div><div class="bottom-nav">${tabs.slice(0,5).map(tab => `<div class="bottom-nav-item ${currentTab === tab ? 'active' : ''}" onclick="switchTab('${tab}')"><span>${tabNames[tab]}</span></div>`).join('')}</div><div class="main-content"><div class="header">${tabNames[currentTab]}</div>${currentTab === 'feed' ? renderHome() : currentTab === 'profile' ? renderProfilePage() : currentTab === 'messages' ? renderMessages() : currentTab === 'search' ? renderSearch() : currentTab === 'interesting' ? renderInteresting() : currentTab === 'notifications' ? renderNotifications() : currentTab === 'create' ? renderCreate() : currentTab === 'feedback' ? renderFeedback() : renderMore()}<div class="global-footer">© 2025 X</div></div></div>`;
        if(currentTab === 'feed') { const feedContainer = document.getElementById('feedContainer'); if(feedContainer) feedContainer.addEventListener('scroll', () => { if(feedContainer.scrollTop + feedContainer.clientHeight >= feedContainer.scrollHeight - 100) loadFeed(); }); }
    }
    
    window.switchTab = (tab) => { currentTab = tab; currentProfileUser = null; currentChatUser = null; renderMain(); };
    window.viewProfile = (username) => { loadProfileUser(username); currentTab = 'profile'; renderMain(); };
    async function loadProfileUser(username) { try { currentProfileUser = await api(`/api/user/${username}`); followersList = await api(`/api/followers/${currentProfileUser.id}`); followingList = await api(`/api/following/${currentProfileUser.id}`); await loadFeed(true); renderMain(); } catch(e) { currentProfileUser = null; } }
    
    async function renderAuth() {
        document.getElementById('root').innerHTML = `<div style="position:fixed; top:0; left:0; right:0; bottom:0; background:#000; display:flex; align-items:center; justify-content:center;"><div class="auth-card"><svg width="40" height="40" viewBox="0 0 24 24" fill="#1d9bf0" style="margin-bottom:20px;"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z"/></svg><h2 style="margin-bottom:20px;">Happening now</h2><div id="authForm"><input type="text" id="loginInput" placeholder="Username or email"><input type="password" id="loginPassword" placeholder="Password"><button onclick="login()">Log in</button><div class="divider">or</div><button onclick="showRegister()" style="background:transparent; border:1px solid #2f3336;">Create account</button></div></div></div>`;
    }
    
    window.showRegister = () => { document.getElementById('authForm').innerHTML = `<input type="text" id="regUsername" placeholder="Username"><input type="email" id="regEmail" placeholder="Email"><input type="password" id="regPassword" placeholder="Password"><button onclick="register()">Sign up</button><button onclick="renderAuth()" style="background:transparent; margin-top:10px;">Back</button><div id="registerMessage"></div>`; };
    window.register = async () => { const username = document.getElementById('regUsername').value; const email = document.getElementById('regEmail').value; const password = document.getElementById('regPassword').value; try { await api('/api/register', { method: 'POST', body: JSON.stringify({ username, email, password }), headers: { 'Content-Type': 'application/json' } }); showToast('Registered! Please login.'); renderAuth(); } catch(e) { showToast('Username taken', true); } };
    window.login = async () => { const login = document.getElementById('loginInput').value; const password = document.getElementById('loginPassword').value; try { await api('/api/login', { method: 'POST', body: JSON.stringify({ login, password }), headers: { 'Content-Type': 'application/json' } }); const me = await api('/api/me'); currentUser = me.user; await loadFeed(true); await loadConversationsList(); render(); } catch(e) { showToast('Invalid credentials', true); } };
    
    async function render() { if(!currentUser) { await renderAuth(); return; } await loadAllUsers(); await loadFollows(); await renderMain(); }
    
    function hideLoadingScreen() { const loading = document.getElementById('loading'); const root = document.getElementById('root'); if(loading) { loading.style.opacity = '0'; setTimeout(() => { loading.style.display = 'none'; if(root) root.style.display = 'block'; }, 300); } }
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hideLoadingScreen); else hideLoadingScreen();
    
    render();
</script>
</body>
</html>
