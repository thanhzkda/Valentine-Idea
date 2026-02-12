// Hand Gesture Recognition using MediaPipe Hands
class GestureRecognizer {
    constructor(gallery) {
        this.gallery = gallery;
        this.hands = null;
        this.camera = null;
        this.videoElement = document.getElementById('hidden-webcam');
        this.isActive = false;
        this.gestureIndicator = document.getElementById('gesture-indicator');
        
        // Gesture detection parameters
        this.previousHandX = null;
        this.swipeThreshold = 0.15; // 15% of screen width
        this.gestureDebounceTime = 500; // 1 second between gestures
        this.lastGestureTime = 500;
        
        // Hand state tracking
        this.isPinched = false;
        this.isThumbsUp = false;
    }
    
    async initialize() {
        try {
            // Request camera permission
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            
            this.videoElement.srcObject = stream;
            this.videoElement.play();
            
            // Show gesture indicator
            this.gestureIndicator.classList.remove('hidden');
            
            // Initialize MediaPipe Hands
            console.log('Camera initialized. Initializing MediaPipe...');
            const success = await this.setupMediaPipe();
            
            if (success) {
                console.log('MediaPipe Hands initialized successfully!');
                this.isActive = true;
                return true;
            } else {
                console.error('Failed to initialize MediaPipe');
                return false;
            }
        } catch (error) {
            console.error('Failed to initialize camera:', error);
            alert('Camera access denied. You can still use keyboard controls (← → arrows, Space for video)');
            return false;
        }
    }

    // Initialize MediaPipe Hand Detection
    async setupMediaPipe() {
        try {
            // Check if MediaPipe Hands is loaded
            if (!window.Hands) {
                console.error('MediaPipe Hands not loaded. Check your script tags in index.html');
                return false;
            }
            
            // Initialize Hands detector
            this.hands = new window.Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });
            
            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7
            });
            
            this.hands.onResults((results) => this.onHandsDetected(results));
            
            // Check if Camera is loaded
            if (!window.Camera) {
                console.error('MediaPipe Camera utils not loaded. Check your script tags in index.html');
                return false;
            }
            
            // Initialize Camera
            this.camera = new window.Camera(this.videoElement, {
                onFrame: async () => {
                    await this.hands.send({ image: this.videoElement });
                },
                width: 640,
                height: 480
            });
            
            this.camera.start();
            return true;
        } catch (error) {
            console.error('Error setting up MediaPipe:', error);
            return false;
        }
    }
    
    onHandsDetected(results) {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            this.previousHandX = null;
            return;
        }
        
        const landmarks = results.multiHandLandmarks[0];
        
        // Detect gestures
        this.detectSwipe(landmarks);
        this.detectPinch(landmarks);
        this.detectThumbsUp(landmarks);
    }
    
    detectSwipe(landmarks) {
        const currentTime = Date.now();
        
        // Use index finger tip (landmark 8)
        const indexTip = landmarks[8];
        
        if (this.previousHandX !== null) {
            const deltaX = indexTip.x - this.previousHandX;
            
            // Check if enough time has passed since last gesture
            if (currentTime - this.lastGestureTime > this.gestureDebounceTime) {
                if (deltaX > this.swipeThreshold) {
                    console.log('Swipe Right detected');
                    this.gallery.next();
                    this.lastGestureTime = currentTime;
                    this.showGestureFeedback('Swipe Right →');
                } else if (deltaX < -this.swipeThreshold) {
                    console.log('Swipe Left detected');
                    this.gallery.previous();
                    this.lastGestureTime = currentTime;
                    this.showGestureFeedback('Swipe Left ←');
                }
            }
        }
        
        this.previousHandX = indexTip.x;
    }
    
    detectPinch(landmarks) {
        // Calculate distance between thumb tip (4) and index finger tip (8)
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        
        const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + 
            Math.pow(thumbTip.y - indexTip.y, 2)
        );
        
        const pinchThreshold = 0.05;
        
        if (distance < pinchThreshold && !this.isPinched) {
            this.isPinched = true;
            console.log('Pinch detected - Toggle video');
            this.gallery.toggleVideo();
            this.showGestureFeedback('Video Toggle ⏯');
        } else if (distance > pinchThreshold + 0.02) {
            this.isPinched = false;
        }
    }
    
    detectThumbsUp(landmarks) {
        // Simplified thumbs up detection
        const thumbTip = landmarks[4];
        const thumbIP = landmarks[3];
        const indexMCP = landmarks[5];
        
        // Thumb is up if thumb tip is higher than thumb IP and other fingers are down
        const isThumbUp = thumbTip.y < thumbIP.y && thumbTip.y < indexMCP.y;
        
        if (isThumbUp && !this.isThumbsUp) {
            this.isThumbsUp = true;
            console.log('Thumbs up detected');
            this.showGestureGuide();
            this.showGestureFeedback('Thumbs Up 👍');
        } else if (!isThumbUp) {
            this.isThumbsUp = false;
        }
    }
    
    showGestureFeedback(gesture) {
        // Visual feedback for detected gesture
        const indicator = this.gestureIndicator.querySelector('.indicator-text');
        const originalText = indicator.textContent;
        
        indicator.textContent = gesture;
        
        setTimeout(() => {
            indicator.textContent = originalText;
        }, 1500);
    }
    
    showGestureGuide() {
        const guide = document.getElementById('gesture-guide');
        guide.classList.remove('hidden');
    }
    
    stop() {
        this.isActive = false;
        this.gestureIndicator.classList.add('hidden');
        
        if (this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
    }
}

// Global gesture recognizer instance
let gestureRecognizer;
