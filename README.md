# 🔍 SerCrow - AI-Powered Search Engine

<div align="center">
  <img src="client/public/20250620_150619_1750447628914.png" alt="SerCrow Logo" width="120" height="120">
  
  **A modern, AI-enhanced search engine built with React, TypeScript, and Express**
  
  [![Deploy to Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare-orange)](https://pages.cloudflare.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
</div>

## ✨ Features

### 🔍 **Powerful Search**
- Google Custom Search API integration
- Multiple search filters (All, News, Images, Videos)
- Real-time search suggestions
- Advanced search options
- Search history and popular searches

### 🤖 **WingMan AI Assistant**
- Query enhancement and suggestions
- Search result summarization
- Direct question answering
- Content analysis and categorization
- Conversational chat interface

### 🎨 **Modern UI/UX**
- Beautiful, responsive design
- Dark/Light theme support
- Accessibility features
- Mobile-friendly interface
- Chrome-inspired search results

### 🔐 **Authentication & Security**
- Auth0 integration ready
- Secure session management
- CORS protection
- Security headers

### 📱 **Multi-Platform**
- Web application
- Electron desktop app support
- PWA capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon recommended)
- Google Custom Search API key
- OpenRouter API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mrjosephs1101/SerCrow.git
   cd SerCrow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="your-neon-database-url"
   
   # Google Search API
   GOOGLE_SEARCH_API_KEY="your-google-api-key"
   GOOGLE_SEARCH_ENGINE_ID="your-search-engine-id"
   
   # AI Features (OpenRouter)
   OPENROUTER_API_KEY="your-openrouter-api-key"
   OPENROUTER_MODEL="openai/gpt-4-turbo-preview"
   
   # Auth0 (Optional)
   VITE_AUTH0_DOMAIN="your-auth0-domain"
   VITE_AUTH0_CLIENT_ID="your-auth0-client-id"
   VITE_AUTH0_AUDIENCE="your-auth0-audience"
   
   # Session
   SESSION_SECRET="your-session-secret"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5000` to see SerCrow in action!

## 🌐 Deployment

### Cloudflare (Recommended)

SerCrow is optimized for Cloudflare deployment with Workers and Pages.

#### Backend (Cloudflare Workers)
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set environment variables
wrangler secret put GOOGLE_SEARCH_API_KEY
wrangler secret put GOOGLE_SEARCH_ENGINE_ID
wrangler secret put DATABASE_URL
wrangler secret put SESSION_SECRET
wrangler secret put OPENROUTER_API_KEY

# Deploy
npm run deploy:cloudflare
```

#### Frontend (Cloudflare Pages)
1. Build the project: `npm run build:cloudflare`
2. Upload `dist/public` to Cloudflare Pages
3. Set environment variables in Pages dashboard
4. Update `_redirects` with your Worker URL

See [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md) for detailed instructions.

## 🛠️ Development

### Project Structure
```
SerCrow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── wingman.ts         # AI assistant
│   ├── storage.ts         # Database layer
│   └── search.ts          # Search functionality
├── shared/                # Shared types and schemas
└── migrations/            # Database migrations
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run check           # TypeScript type checking

# Building
npm run build           # Build for production
npm run build:cloudflare # Build for Cloudflare

# Database
npm run db:push         # Push database schema

# Testing
npm run test            # Run tests
npm run test:ui         # Run tests with UI

# Deployment
npm run deploy:cloudflare # Deploy to Cloudflare
```

## 🔧 Configuration

### Google Custom Search Setup
1. Go to [Google Custom Search](https://cse.google.com/)
2. Create a new search engine
3. Get your API key from [Google Cloud Console](https://console.cloud.google.com/)
4. Enable Custom Search API

### OpenRouter Setup
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key
3. Choose your preferred AI model

### Database Setup (Neon)
1. Create account at [Neon](https://neon.tech/)
2. Create a new database
3. Copy the connection string

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Custom Search API for search functionality
- OpenRouter for AI capabilities
- Cloudflare for hosting and deployment
- The open-source community for amazing tools and libraries

## 📞 Support

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/mrjosephs1101/SerCrow/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/mrjosephs1101/SerCrow/discussions)

---

<div align="center">
  <strong>Built with ❤️ by the SerCrow team</strong>
</div>