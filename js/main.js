// Main Application Controller
class App {
    constructor() {
        this.currentScreen = 'game';
        this.screens = {
            game: document.getElementById('game-screen'),
            transition: document.getElementById('transition-screen'),
            gallery: document.getElementById('gallery-screen')
        };
        
        this.init();
    }
    
    init() {
        // Listen for game victory
        document.addEventListener('gameWon', () => {
            this.showTransition();
        });
        
        // Unlock button
        const unlockBtn = document.getElementById('unlock-btn');
        unlockBtn.addEventListener('click', () => {
            this.showGallery();
        });
        
        // Camera permission buttons
        const enableCameraBtn = document.getElementById('enable-camera-btn');
        const skipCameraBtn = document.getElementById('skip-camera-btn');
        
        enableCameraBtn.addEventListener('click', () => {
            this.enableGestureControl();
        });
        
        skipCameraBtn.addEventListener('click', () => {
            this.skipGestureControl();
        });
        
        // Gesture guide close button
        const closeGuideBtn = document.getElementById('close-guide-btn');
        closeGuideBtn.addEventListener('click', () => {
            this.closeGestureGuide();
        });
        
        // Show initial screen
        this.showScreen('game');
        
        console.log('Valentine\'s Day Experience initialized! 💕');
        console.log('Win the game to unlock the special surprise...');
    }
    
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show requested screen
        this.screens[screenName].classList.add('active');
        this.currentScreen = screenName;
    }
    
    showTransition() {
        this.showScreen('transition');
        
        // Add extra sparkle effects
        this.addSparkles();
    }
    
    showGallery() {
        this.showScreen('gallery');
        
        // Initialize gallery if not already done
        initGallery();
        
        // Show camera permission notice
        const cameraNotice = document.getElementById('camera-notice');
        cameraNotice.classList.remove('hidden');
    }
    
    async enableGestureControl() {
        const cameraNotice = document.getElementById('camera-notice');
        cameraNotice.classList.add('hidden');
        
        // Initialize gesture recognizer
        if (!gestureRecognizer) {
            gestureRecognizer = new GestureRecognizer(gallery);
        }
        
        const success = await gestureRecognizer.initialize();
        
        if (success) {
            // Show gesture guide
            setTimeout(() => {
                this.showGestureGuide();
            }, 1000);
        }
    }
    
    skipGestureControl() {
        const cameraNotice = document.getElementById('camera-notice');
        cameraNotice.classList.add('hidden');
        
        // Show brief tutorial for keyboard controls
        alert('Keyboard Controls:\n\n← Left Arrow: Previous photo\n→ Right Arrow: Next photo\nSpace: Play/Pause video\n\nEnjoy the memories! ❤️');
    }
    
    showGestureGuide() {
        const guide = document.getElementById('gesture-guide');
        guide.classList.remove('hidden');
    }
    
    closeGestureGuide() {
        const guide = document.getElementById('gesture-guide');
        guide.classList.add('hidden');
    }
    
    addSparkles() {
        // Add floating hearts animation
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
        
        // Add CSS animation if not already present
        if (!document.getElementById('float-animation')) {
            const style = document.createElement('style');
            style.id = 'float-animation';
            style.textContent = `
                @keyframes floatUp {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100vh) rotate(360deg);
                        opacity: 0;
                    }
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
