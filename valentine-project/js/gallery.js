// Gallery Management
class Gallery {
    constructor() {
        this.currentIndex = 0;
        this.mediaItems = [];
        this.mediaDisplay = document.getElementById('media-display');
        this.mediaTitle = document.getElementById('media-title');
        this.mediaDate = document.getElementById('media-date');
        this.mediaDescription = document.getElementById('media-description');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        
        this.init();
    }
    
    init() {
        // Wait for media data to be loaded
        if (typeof window.mediaData !== 'undefined') {
            this.mediaItems = window.mediaData;
            this.setupNavigation();
        } else {
            console.error('Media data not loaded');
        }
    }
    
    setupNavigation() {
        // Button navigation
        this.prevBtn.addEventListener('click', () => this.previous());
        this.nextBtn.addEventListener('click', () => this.next());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('gallery-screen').classList.contains('active')) {
                if (e.key === 'ArrowLeft') this.previous();
                if (e.key === 'ArrowRight') this.next();
                if (e.key === ' ' && this.mediaItems[this.currentIndex].type === 'video') {
                    e.preventDefault();
                    this.toggleVideo();
                }
            }
        });
        
        // Load first media
        this.loadMedia(0);
    }
    
    loadMedia(index) {
        if (index < 0 || index >= this.mediaItems.length) return;
        
        this.currentIndex = index;
        const media = this.mediaItems[index];
        
        // Clear previous media
        this.mediaDisplay.innerHTML = '';
        
        // Create media element
        if (media.type === 'image') {
            const img = document.createElement('img');
            img.src = media.src;
            img.alt = media.title;
            img.style.animation = 'fadeIn 0.5s ease-in';
            this.mediaDisplay.appendChild(img);
        } else if (media.type === 'video') {
            const video = document.createElement('video');
            video.src = media.src;
            video.controls = true;
            video.style.animation = 'fadeIn 0.5s ease-in';
            this.mediaDisplay.appendChild(video);
        }
        
        // Update caption
        this.mediaTitle.textContent = media.title;
        this.mediaDate.textContent = media.date;
        this.mediaDescription.textContent = media.description || '';
    }
    
    next() {
        const nextIndex = (this.currentIndex + 1) % this.mediaItems.length;
        this.loadMedia(nextIndex);
    }
    
    previous() {
        const prevIndex = (this.currentIndex - 1 + this.mediaItems.length) % this.mediaItems.length;
        this.loadMedia(prevIndex);
    }
    
    goTo(index) {
        this.loadMedia(index);
    }
    
    toggleVideo() {
        const video = this.mediaDisplay.querySelector('video');
        if (video) {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
    }
    
    getCurrentMedia() {
        return this.mediaItems[this.currentIndex];
    }
}

// Initialize gallery (will be called when gallery screen is shown)
let gallery;
function initGallery() {
    if (!gallery) {
        gallery = new Gallery();
    }
}
