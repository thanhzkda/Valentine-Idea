# 🚀 Quick Start Checklist - Valentine's Day Project

## ⏰ Timeline (12 Days to Valentine's Day)

### Day 1-2: Setup & Media (TODAY!)
- [ ] Download/extract project files
- [ ] Collect 10-20 best photos from your relationship
- [ ] Find 3-5 short video clips
- [ ] Optimize media:
  - [ ] Resize photos to max 1920px width
  - [ ] Compress photos to <500KB each (use tinypng.com)
  - [ ] Compress videos to <10MB each (use handbrake)
- [ ] Place files in `media/photos/` and `media/videos/`
- [ ] Update `js/media-data.js` with your file names and captions

### Day 3-4: MediaPipe Integration
- [ ] Add MediaPipe scripts to `index.html` (see README line 89-93)
- [ ] Uncomment MediaPipe code in `js/gestures.js` (line 54-76)
- [ ] Test locally using `python -m http.server 8000`
- [ ] Open `http://localhost:8000` in Chrome
- [ ] Allow camera access when prompted
- [ ] Test each gesture type

### Day 5-6: Testing
- [ ] Test in good lighting
- [ ] Test in dim lighting
- [ ] Test gesture sensitivity
- [ ] Adjust threshold values if needed (`js/gestures.js` line 21-22)
- [ ] Test keyboard controls as fallback
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Have a friend test without instructions

### Day 7-8: Polish
- [ ] Customize colors in `css/styles.css` if desired
- [ ] Add background music (optional)
- [ ] Create final "message" photo with love note
- [ ] Double-check all captions for typos
- [ ] Test the entire flow start to finish

### Day 9-10: Deploy
- [ ] Choose hosting: Netlify (easiest), GitHub Pages, or Vercel
- [ ] Deploy your project
- [ ] Test the live URL on HTTPS
- [ ] Test camera permissions on live site
- [ ] Bookmark the URL

### Day 11-12: Final Prep
- [ ] Test one more time on her device (if possible)
- [ ] Prepare how you'll present it (QR code? Card? Text?)
- [ ] Have backup plan (printed photos if tech fails)
- [ ] Get excited! 🎉

### Day 13 (Feb 13): Last Check
- [ ] Verify site is still live
- [ ] Check all media loads correctly
- [ ] Practice explaining the controls (just in case)
- [ ] Relax and be confident!

### Day 14 (Valentine's Day): SHOW TIME! ❤️
- [ ] Present your gift
- [ ] Help her navigate if needed
- [ ] Enjoy her reaction
- [ ] Celebrate your love!

---

## 🔧 Essential Commands

### Start Local Server
```bash
# Python 3
cd valentine-project
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server
```

### Deploy to Netlify
1. Go to app.netlify.com
2. Drag & drop `valentine-project` folder
3. Copy the URL
4. Done! 🎉

### Deploy to GitHub Pages
```bash
cd valentine-project
git init
git add .
git commit -m "My Valentine's gift 💕"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
# Then enable Pages in repo settings → Pages → Source: main branch
```

---

## 🐛 Common Issues & Fixes

### Issue: Images not showing
**Fix:** Check file names match exactly in `media-data.js` (case-sensitive!)

### Issue: Camera not working
**Fix:** Must use HTTPS (localhost or deployed site)

### Issue: Gestures not detecting
**Fix:** 
1. Better lighting
2. Slower hand movements
3. Check MediaPipe scripts loaded (F12 → Console)

### Issue: Can't win the game
**Fix:** Try this strategy - Start with a corner, then center if available

---

## 💡 Pro Tips

1. **Test Early**: Don't wait until Feb 13!
2. **Good Lighting**: Essential for gestures
3. **HTTPS Required**: For camera access
4. **Backup Plan**: Have photos ready to show manually if tech fails
5. **Personal Touch**: Add a handwritten card with the URL

---

## 📞 Need Help?

Check the README.md for detailed troubleshooting.

---

**You've got this! She's going to love it! ❤️**
