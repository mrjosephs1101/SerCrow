# SerCrow - Private Search Engine with Built-in Browser

SerCrow is a privacy-focused search engine with an integrated browser, similar to DuckDuckGo but with enhanced features for desktop and mobile platforms.

## 🚀 Features

### 🔒 Privacy First
- **No Tracking**: We don't store your personal information or search history
- **Tracker Blocking**: Automatically blocks ads, trackers, and malicious scripts
- **HTTPS Everywhere**: Automatically upgrades HTTP connections to HTTPS
- **No Third-party Cookies**: Enhanced privacy protection on mobile and desktop

### 🌐 Integrated Browser
- **Built-in Browser**: Browse search results without leaving the app
- **Privacy Protection**: Real-time blocking of trackers and ads
- **Mobile Optimized**: Touch-friendly interface for mobile devices
- **Desktop App**: Native desktop experience with Electron

### 📱 Cross-Platform
- **Web App**: Works in any modern browser
- **Desktop App**: Native Windows, macOS, and Linux applications
- **Mobile App**: Android app with Capacitor (iOS coming soon)
- **Progressive Web App**: Install directly from your browser

## 🛠 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- For mobile development: Android Studio
- For desktop development: Electron

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/sercrow.git
cd sercrow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Development Scripts

#### Web Development
```bash
# Start development server
npm run dev

# Start client only (for frontend development)
npm run dev:client

# Build for production
npm run build
```

#### Desktop App Development
```bash
# Start desktop app in development mode
npm run electron:dev

# Build desktop app
npm run electron:build

# Create distributable packages
npm run electron:dist
```

#### Mobile App Development
```bash
# Sync with mobile platforms
npm run mobile:sync

# Run on Android device/emulator
npm run mobile:dev

# Build Android APK
npm run mobile:build
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Search API
GOOGLE_SEARCH_API_KEY=your-google-search-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id

# AI Integration
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openai/gpt-4-turbo-preview

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-session-secret

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Speech-to-Text
DEEPGRAM_STT_API=your-deepgram-api-key
```

## 🏗 Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Query** for data fetching
- **React Router** for navigation

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **Redis** for caching
- **Passport.js** for authentication

### Desktop
- **Electron** for native desktop apps
- **Enhanced privacy features** with built-in ad/tracker blocking
- **Native menu integration**

### Mobile
- **Capacitor** for cross-platform mobile apps
- **Privacy-focused WebView settings**
- **Touch-optimized interface**

## 🎯 Usage

### Basic Search
1. Open SerCrow
2. Enter your search query in the search bar
3. View results in the integrated search results panel
4. Click any result to open it in the built-in browser

### Privacy Features
- **Privacy Mode**: Toggle on/off in the header
- **Tracker Blocking**: View blocked trackers in real-time
- **Settings**: Access privacy settings via the menu button

### Desktop App Features
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + T`: New search
  - `Ctrl/Cmd + ,`: Open settings
  - `Ctrl/Cmd + Shift + Delete`: Clear browsing data
- **Native Menus**: Access all features through native OS menus

### Mobile App Features
- **Touch Navigation**: Swipe-friendly interface
- **Share Integration**: Share pages using native share sheet
- **Favorites**: Save frequently visited pages
- **Offline Support**: Basic offline functionality

## 🔧 Configuration

### Search Engine Configuration
Edit `client/src/lib/search-api.ts` to configure search providers:

```typescript
const SEARCH_PROVIDERS = {
  duckduckgo: 'https://api.duckduckgo.com/',
  google: 'https://www.googleapis.com/customsearch/v1',
  // Add more providers
};
```

### Privacy Settings
Configure privacy features in `client/src/components/PrivacySettings.tsx`:

```typescript
const PRIVACY_FEATURES = {
  blockTrackers: true,
  blockAds: true,
  httpsEverywhere: true,
  blockThirdPartyCookies: true,
};
```

## 📦 Building for Production

### Web App
```bash
npm run build
npm run deploy
```

### Desktop App
```bash
# Build for current platform
npm run electron:build

# Build for all platforms (requires additional setup)
npm run electron:dist
```

### Mobile App
```bash
# Android
npm run mobile:build

# The APK will be generated in android/app/build/outputs/apk/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [DuckDuckGo](https://duckduckgo.com) for privacy inspiration
- [Electron](https://electronjs.org) for desktop app framework
- [Capacitor](https://capacitorjs.com) for mobile app framework
- [React](https://reactjs.org) for the frontend framework

## 🔮 Roadmap

- [ ] iOS app support
- [ ] Custom search engine integration
- [ ] VPN integration
- [ ] Tor browser support
- [ ] Advanced privacy analytics
- [ ] Multi-language support
- [ ] Dark web search capabilities
- [ ] Blockchain-based privacy features

---

**SerCrow** - Search privately, browse securely. 🔒🔍