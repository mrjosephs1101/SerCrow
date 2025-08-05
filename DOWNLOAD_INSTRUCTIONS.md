# Download SerCrow for Native App Building

## What You're Getting:
- Complete Android Studio project ready to build APK
- Windows Electron app ready to build EXE
- Progressive Web App (PWA) that installs like a native app

## Download Steps:
1. **In Replit**: Click the three dots (⋯) in the file explorer
2. **Select**: "Download as ZIP" 
3. **Extract** the ZIP file on a computer with development tools

## What's Inside the Download:
```
serqo-project/
├── android/                 # Complete Android Studio project
├── client/dist/             # Built web app 
├── electron.js              # Desktop app configuration
├── BUILD_APK.sh            # Android build script
├── BUILD_EXE.sh            # Windows build script
├── MOBILE_BUILD_GUIDE.md   # This guide
└── ... (all source code)
```

## Building Native Apps:

### Android APK:
1. Install Android Studio
2. Open the `android/` folder as a project
3. Build → Generate Signed Bundle/APK
4. Choose APK, follow the wizard

### Windows EXE:
1. Install Node.js
2. Run: `npm install`
3. Run: `./BUILD_EXE.sh`
4. Find installer in `dist/` folder

### Instant PWA (No Download Needed):
Visit the SerCrow web app on your phone and tap "Add to Home Screen" to install it like a native app instantly!

## Features in All Versions:
- Real web search using Google Search API
- Dark/light mode with accessibility settings
- Multi-tab browsing with search history
- Beautiful blue bird branding
- Offline capability and native feel

The search engine works exactly the same across all platforms!