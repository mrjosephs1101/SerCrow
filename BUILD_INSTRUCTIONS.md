# SerCrow - Build Native Apps

## Ready-to-Build Setup Complete!

### Prerequisites
- Node.js ✓ (installed)
- Electron ✓ (installed) 
- Capacitor ✓ (installed)
- Android project ✓ (created)

### Build Commands (Fixed)

#### 1. Build Android APK
```bash
# Build web assets first
npm run build

# Copy to Android and open Android Studio
npx cap sync
npx cap open android
```

#### 2. Build Windows EXE
```bash
# Build web version
npm run build

# Create Windows installer
npx electron-builder
```

### Easy Build Scripts

#### One-Click Android Build
```bash
./BUILD_APK.sh
```

#### One-Click Windows Build  
```bash
./BUILD_EXE.sh
```

### Manual Steps

#### For Android APK
1. Run `vite build --outDir client/dist`
2. Run `npx cap sync` 
3. Run `npx cap open android`
4. In Android Studio: Build > Generate Signed Bundle/APK

#### For Windows EXE
1. Run `vite build --outDir client/dist`
2. Run `npx electron-builder --win`
3. Find installer in `dist/` folder

### Current Status
✅ Web assets built successfully in `client/dist/`
✅ Android project synced and ready
✅ Electron configuration complete
✅ Build scripts ready to use

Your SerCrow search engine is ready to become native apps!

### What You Get
- **Android**: Real APK file installable on any Android device
- **Windows**: NSIS installer (.exe) that installs SerCrow as a desktop app
- **Features**: Full search engine with Google API, offline capability, native feel

Both apps include the blue bird icon and work exactly like the web version but as native applications!

In Android Studio:
1. Wait for Gradle sync to complete
2. Go to Build → Generate Signed Bundle/APK
3. Choose APK and follow the wizard
4. Your APK will be in `android/app/build/outputs/apk/`

#### 2. Build Windows EXE
```bash
# Build web version and create executable
npm run build:electron
```

The EXE installer will be created in the `dist/` folder.

#### 3. Build for Development
```bash
# Run in Electron for testing
npm run electron:dev

# Test Android build
npx cap run android
```

### Manual Build Steps

#### Android APK (Manual)
1. Install Android Studio
2. Run: `npm run build:web`
3. Run: `npx cap add android`
4. Run: `npx cap sync android`
5. Run: `npx cap open android`
6. In Android Studio: Build → Generate Signed Bundle/APK

#### Windows EXE (Manual)
1. Run: `npm run build:web`
2. Run: `npm run build:electron`
3. Find your installer in `dist/SerCrow Setup.exe`

### File Locations
- Web build: `client/dist/`
- Android project: `android/`
- Windows installer: `dist/SerCrow Setup.exe`
- APK file: `android/app/build/outputs/apk/debug/app-debug.apk`

### App Details
- App Name: SerCrow
- Package ID: com.serqo.searchengine
- Version: Based on package.json
- Icon: Uses the blue bird favicon

The built apps will be fully functional search engines that can search the real web using the Google Search API!