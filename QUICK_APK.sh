#!/bin/bash
echo "Quick APK build for SerCrow..."

# Check if assets are already built
if [ ! -f "client/dist/index.html" ]; then
    echo "Building web assets..."
    vite build
    mkdir -p client/dist
    cp -r dist/public/* client/dist/
    npx cap sync
fi

# Build APK with minimal output
echo "Creating APK..."
cd android
./gradlew assembleDebug -q

# Check if APK was created
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    cd ..
    cp "android/$APK_PATH" "serqo.apk"
    echo "SUCCESS: serqo.apk created!"
    echo "File size: $(du -h serqo.apk | cut -f1)"
else
    echo "APK build failed"
    cd ..
fi