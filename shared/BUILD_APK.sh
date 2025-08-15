#!/bin/bash
echo "Building SerCrow APK..."

# Build web assets
echo "Building web assets..."
vite build
mkdir -p client/dist
cp -r dist/public/* client/dist/

# Sync with Capacitor
echo "Syncing with Android project..."
npx cap sync

# Open Android Studio
echo "Opening Android Studio..."
npx cap open android

echo "Android Studio will open. Build APK with: Build > Generate Signed Bundle/APK"