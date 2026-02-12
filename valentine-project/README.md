# Valentine's Day Interactive Memory Gallery 💕

A special Valentine's Day gift combining a tic-tac-toe game with a gesture-controlled photo gallery.

## 🎯 Features

- **Tic-Tac-Toe Game**: Win to unlock the surprise
- **Photo & Video Gallery**: Display your relationship memories
- **Hand Gesture Control**: Navigate using MediaPipe hand tracking
- **Keyboard Fallback**: Works without camera too
- **Beautiful Animations**: Romantic Valentine's theme

## 📁 Project Structure

```
valentine-project/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── main.js            # Main app controller
│   ├── game.js            # Tic-tac-toe logic
│   ├── gallery.js         # Gallery navigation
│   ├── gestures.js        # Hand gesture recognition
│   └── media-data.js      # Your photos/videos data
├── media/
│   ├── photos/            # Put your photos here
│   └── videos/            # Put your videos here
└── README.md              # This file
```

## 🚀 Quick Start (5 Steps)

### Step 1: Add Your Media Files

1. **Photos**: Place your photos in `media/photos/`
   - Resize images to max 1920px width
   - Compress to under 500KB each
   - Supported: JPG, PNG

2. **Videos**: Place your videos in `media/videos/`
   - Use H.264 codec, 720p resolution
   - Keep under 10MB each
   - Supported: MP4

### Step 2: Update Media Data

Edit `js/media-data.js`:

```javascript
window.mediaData = [
    {
        type: 'image',
        src: 'media/photos/your-photo-name.jpg',  // Update this
        title: 'Your Title',                       // Update this
        date: 'February 14, 2026',                 // Update this
        description: 'Your description'            // Update this
    },
    // Add more items...
];
```

### Step 3: Add MediaPipe (for Gesture Control)

Add this script to your `<head>` in `index.html` (before the closing `</head>` tag):

```html
<!-- MediaPipe Hands -->
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
```

Then uncomment the MediaPipe integration code in `js/gestures.js` (look for the `setupMediaPipe()` function).

### Step 4: Test Locally

**Option A: Using Python**
```bash
cd valentine-project
python -m http.server 8000
# Open: http://localhost:8000
```

**Option B: Using Node.js**
```bash
npm install -g http-server
cd valentine-project
http-server
# Open: http://localhost:8080
```

**Option C: Using VS Code**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

### Step 5: Deploy (Before Feb 14!)

**Free Hosting Options:**

1. **Netlify** (Recommended - Easiest)
   - Drag & drop your folder at netlify.com
   - Get instant HTTPS link
   - Free forever

2. **GitHub Pages**
   ```bash
   # Create repo, then:
   git init
   git add .
   git commit -m "Valentine's surprise"
   git branch -M main
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   # Enable Pages in repo settings
   ```

3. **Vercel**
   - Install: `npm i -g vercel`
   - Run: `vercel` in project folder
   - Follow prompts

## 🎮 How to Use

### For You (Before Giving):
1. Win the tic-tac-toe game to test the flow
2. Make sure all photos/videos load correctly
3. Test gesture controls with good lighting
4. Try keyboard controls (← → Space)

### For Your Girlfriend:
1. Open the website you send her
2. Play and win the tic-tac-toe game
3. Click "Open Your Gift"
4. Allow camera access for gestures (optional)
5. Browse through your memories together!

## 🎯 Controls

### Keyboard Controls
- `←` Left Arrow: Previous photo
- `→` Right Arrow: Next photo
- `Space`: Play/Pause video

### Gesture Controls (with camera enabled)
- **Swipe Right** →: Next photo
- **Swipe Left** ←: Previous photo
- **Pinch/Fist** ✊: Play/Pause video
- **Thumbs Up** 👍: Show gesture guide

## 🔧 Customization

### Change Colors
Edit `css/styles.css`:
```css
:root {
    --primary-red: #C41E3A;    /* Main red color */
    --light-pink: #FFB6C1;     /* Light pink */
    --soft-pink: #FFE4E1;      /* Very light pink */
}
```

### Change Tic-Tac-Toe Difficulty
Edit `js/game.js` → `findBestMove()` function to make AI easier/harder.

### Add More Gestures
Edit `js/gestures.js` → Add new detection functions.

## 🐛 Troubleshooting

### Images Not Loading?
- Check file paths in `media-data.js`
- Ensure files are in correct folders
- Check file extensions (case-sensitive on some servers)

### Camera Not Working?
- Use HTTPS (required for camera access)
- Check browser permissions
- Try different browser (Chrome works best)
- Ensure good lighting

### Gestures Not Detecting?
- Ensure MediaPipe scripts are loaded
- Check browser console for errors
- Improve lighting conditions
- Move hand slower and more deliberately

### Game Not Winning?
- The AI is beatable! Try corner strategy
- Or temporarily disable AI in `game.js` for testing

## 📱 Browser Support

- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (not supported)

## 💡 Tips for Best Experience

1. **Good Lighting**: Essential for gesture recognition
2. **Solid Background**: Helps hand detection
3. **Slow Movements**: Deliberate gestures work better
4. **Desktop/Laptop**: Better than mobile for gestures
5. **HTTPS**: Required for camera access

## 🎁 Making It Extra Special

### Ideas to Enhance:
- Add background music (your song)
- Include a final "message" slide
- Add a slideshow mode
- Create a custom domain name
- Print the URL on a card

## 📝 Current Status

- ✅ Tic-tac-toe game (working)
- ✅ Gallery structure (working)
- ✅ Keyboard navigation (working)
- ⚠️ Gesture recognition (needs MediaPipe integration)
- ⏳ Your media files (need to be added)

## 🚀 Next Steps for You

1. **Today**: Add your photos/videos
2. **Tomorrow**: Integrate MediaPipe and test gestures
3. **Day 3**: Fine-tune gesture sensitivity
4. **Day 4**: Deploy to hosting
5. **Before Feb 14**: Test with different lighting conditions

## ❤️ Final Touch

Consider adding a personal message at the end of the gallery. Edit the last item in `media-data.js`:

```javascript
{
    type: 'image',
    src: 'media/photos/final-message.jpg',  // Create image with text
    title: 'I Love You',
    date: 'Every Day',
    description: 'Thank you for being my everything. Happy Valentine\'s Day! 💕'
}
```

---

**Made with ❤️ for Valentine's Day 2026**

Good luck! Your girlfriend is going to love this! 🎉
