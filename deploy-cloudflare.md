# SerCrow Cloudflare Deployment Guide

## Prerequisites
1. Cloudflare account
2. Cloudflare Pages and Workers enabled
3. Node.js and npm installed
4. Wrangler CLI installed: `npm install -g wrangler`

## Deployment Steps

### 1. Frontend Deployment (Cloudflare Pages)

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy to Cloudflare Pages:
   - Go to Cloudflare Dashboard > Pages
   - Create a new project
   - Connect your GitHub repository or upload the `dist/public` folder
   - Set build settings:
     - Build command: `npm run build`
     - Build output directory: `dist/public`
     - Root directory: `/`

3. Configure environment variables in Cloudflare Pages:
   - `VITE_AUTH0_DOMAIN`
   - `VITE_AUTH0_CLIENT_ID`
   - `VITE_AUTH0_AUDIENCE`

### 2. Backend Deployment (Cloudflare Workers)

1. Login to Cloudflare:
   ```bash
   wrangler login
   ```

2. Configure environment variables:
   ```bash
   wrangler secret put GOOGLE_SEARCH_API_KEY
   wrangler secret put GOOGLE_SEARCH_ENGINE_ID
   wrangler secret put DATABASE_URL
   wrangler secret put SESSION_SECRET
   wrangler secret put OPENROUTER_API_KEY
   ```

3. Deploy the worker:
   ```bash
   wrangler deploy
   ```

### 3. Update Frontend API URLs

After deploying the backend, update the `_redirects` file with your actual worker URL:
```
/api/* https://sercrow-api.your-subdomain.workers.dev/api/:splat 200
/* /index.html 200
```

### 4. Database Setup

Make sure your Neon PostgreSQL database is accessible from Cloudflare Workers:
1. Check connection string format
2. Ensure SSL is enabled
3. Test connection from Workers environment

## Environment Variables Summary

### Frontend (Cloudflare Pages)
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`

### Backend (Cloudflare Workers)
- `GOOGLE_SEARCH_API_KEY`
- `GOOGLE_SEARCH_ENGINE_ID`
- `DATABASE_URL`
- `SESSION_SECRET`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`

## Troubleshooting

### Common Issues:
1. **CORS errors**: Make sure your worker handles CORS properly
2. **Database connection**: Verify Neon DB allows connections from Cloudflare
3. **Environment variables**: Double-check all secrets are set correctly
4. **Build errors**: Ensure all dependencies are compatible with Workers runtime

### Testing:
1. Test API endpoints: `https://sercrow-api.your-subdomain.workers.dev/api/status`
2. Test frontend: `https://your-pages-url.pages.dev`
3. Check browser console for any errors