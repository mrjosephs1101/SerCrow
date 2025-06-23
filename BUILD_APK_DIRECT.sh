#!/bin/bash
echo "Building SerCrow APK directly (no Android Studio needed)..."

# Build web assets
echo "Building web assets..."
vite build
mkdir -p client/dist
cp -r dist/public/* client/dist/

# Sync with Capacitor
echo "Syncing with Android project..."
npx cap sync

# Build APK using Gradle
echo "Building APK with Gradle..."
cd android
./gradlew assembleDebug

# Copy APK to root for easy access
echo "Copying APK to project root..."
cd ..
cp android/app/build/outputs/apk/debug/app-debug.apk serqo-debug.apk

echo "✅ SUCCESS! APK created: serqo-debug.apk"
echo "📱 You can now install this APK on any Android device"
echo "📁 File location: $(pwd)/serqo-debug.apk"