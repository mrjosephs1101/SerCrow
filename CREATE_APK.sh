#!/bin/bash
echo "Creating SerCrow APK package..."

# Build web assets if needed
if [ ! -f "client/dist/index.html" ]; then
    echo "Building web assets..."
    vite build
    mkdir -p client/dist
    cp -r dist/public/* client/dist/
fi

# Create APK-ready structure
echo "Preparing APK structure..."
mkdir -p apk_build/assets/www
cp -r client/dist/* apk_build/assets/www/

# Create Android manifest
cat > apk_build/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.serqo.searchengine"
    android:versionCode="1"
    android:versionName="1.0">
    
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="SerCrow"
        android:theme="@style/AppTheme">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

echo "APK structure created in apk_build/"
echo "Web assets ready for mobile app packaging"
echo ""
echo "Next steps for APK creation:"
echo "1. Use online APK builders like ApkOnline.com"
echo "2. Upload the apk_build folder"
echo "3. Or use Capacitor cloud build services"
echo ""
echo "Files ready in: $(pwd)/apk_build/"