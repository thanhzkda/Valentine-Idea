// Main Application Controller
class App {
    constructor() {
        this.currentScreen = 'game';
        this.screens = {
            game: document.getElementById('game-screen'),
            transition: document.getElementById('transition-screen'),
            heart: document.getElementById('heart-screen'),
            gallery: document.getElementById('gallery-screen')
        };

        this.init();
    }

    init() {
        // Listen for game victory
        document.addEventListener('gameWon', () => {
            this.showTransition();
        });

        // Unlock button → show 3D heart scene
        const unlockBtn = document.getElementById('unlock-btn');
        unlockBtn.addEventListener('click', () => {
            this.showHeartScene();
        });

        // Legacy camera permission buttons (for gallery fallback)
        const enableCameraBtn = document.getElementById('enable-camera-btn');
        const skipCameraBtn = document.getElementById('skip-camera-btn');

        if (enableCameraBtn) {
            enableCameraBtn.addEventListener('click', () => {
                this.enableGestureControl();
            });
        }

        if (skipCameraBtn) {
            skipCameraBtn.addEventListener('click', () => {
                this.skipGestureControl();
            });
        }

        // Gesture guide close button
        const closeGuideBtn = document.getElementById('close-guide-btn');
        if (closeGuideBtn) {
            closeGuideBtn.addEventListener('click', () => {
                this.closeGestureGuide();
            });
        }

        // Show initial screen
        this.showScreen('game');

        console.log('Valentine\'s Day Lil gift for Bae 💕');
        console.log('Ráng chơi thắng đi rồi anh tặng quà cho nha, quà thiệt luôn, hứa á..');
    }

    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });

        // Show requested screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
        this.currentScreen = screenName;
    }

    showTransition() {
        this.showScreen('transition');
        this.addSparkles();
    }

    showHeartScene() {
        this.showScreen('heart');

        // Initialize the 3D heart scene (defined in heart-scene.js)
        if (typeof window.initHeartScene === 'function') {
            window.initHeartScene();
        }

        // Play background music
        const audio = document.getElementById('bg-music');
        if (audio) {
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Audio autoplay prevented:', e));
        }
    }

    // Legacy gallery methods (kept as fallback)
    showGallery() {
        this.showScreen('gallery');
        initGallery();
        const cameraNotice = document.getElementById('camera-notice');
        if (cameraNotice) cameraNotice.classList.remove('hidden');
    }

    async enableGestureControl() {
        const cameraNotice = document.getElementById('camera-notice');
        if (cameraNotice) cameraNotice.classList.add('hidden');

        if (!gestureRecognizer) {
            gestureRecognizer = new GestureRecognizer(gallery);
        }

        const success = await gestureRecognizer.initialize();
        if (success) {
            setTimeout(() => this.showGestureGuide(), 1000);
        }
    }

    skipGestureControl() {
        const cameraNotice = document.getElementById('camera-notice');
        if (cameraNotice) cameraNotice.classList.add('hidden');
        alert('Keyboard Controls:\n\n← Left Arrow: Previous photo\n→ Right Arrow: Next photo\nSpace: Play/Pause video\n\nEnjoy the memories! ❤️');
    }

    showGestureGuide() {
        const guide = document.getElementById('gesture-guide');
        if (guide) guide.classList.remove('hidden');
    }

    closeGestureGuide() {
        const guide = document.getElementById('gesture-guide');
        if (guide) guide.classList.add('hidden');
    }

    addSparkles() {
        const transitionScreen = this.screens.transition;

        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.textContent = '❤️';
                heart.style.position = 'absolute';
                heart.style.left = Math.random() * 100 + '%';
                heart.style.top = '100%';
                heart.style.fontSize = (Math.random() * 20 + 20) + 'px';
                heart.style.opacity = '0';
                heart.style.animation = `floatUp ${3 + Math.random() * 2}s ease-out`;
                heart.style.pointerEvents = 'none';

                transitionScreen.appendChild(heart);
                setTimeout(() => heart.remove(), 5000);
            }, i * 100);
        }

        if (!document.getElementById('float-animation')) {
            const style = document.createElement('style');
            style.id = 'float-animation';
            style.textContent = `
                @keyframes floatUp {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});
