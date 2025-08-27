import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import path from "path";
import fs from "fs";
// @ts-ignore - memorystore has no types
import MemoryStoreFactory from "memorystore";

// Load environment variables from .env file
dotenv.config();

const app = express();
app.set('trust proxy', 1); // trust first proxy for dev tunnels
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS: allow GitHub Pages (FRONTEND_ORIGIN) and local dev
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
const allowedOrigins = [FRONTEND_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean) as string[];
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});

const MemoryStore = MemoryStoreFactory(session);
const SESSION_SECRET = process.env.SESSION_SECRET || 'sercrow-dev-secret';

app.use(
  session({
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: !!(FRONTEND_ORIGIN && FRONTEND_ORIGIN.startsWith('https://')), // required for cross-site cookies
      httpOnly: true,
      sameSite: (FRONTEND_ORIGIN && FRONTEND_ORIGIN.startsWith('https://')) ? 'none' : 'lax',
    },
    name: 'sercrow.sid',
    resave: false,
    saveUninitialized: false,
    secret: SESSION_SECRET,
    store: new MemoryStore({ checkPeriod: 1000 * 60 * 60 }),
  })
);

// Initialize Passport (used for Google OAuth)
app.use(passport.initialize());

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

registerRoutes(app);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  throw err;
});

export default app;

// Serve static files from the dist directory
try {
  // Get the correct path for the dist directory
  const rootDir = process.cwd();
  const distPath = path.join(rootDir, 'dist');
  
  console.log('Looking for dist directory at:', distPath);
  
  if (fs.existsSync(distPath)) {
    console.log('Found dist directory at:', distPath);
    
    // Serve static files from dist directory with proper caching headers
    app.use(express.static(distPath, {
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        // Cache static assets for 1 year
        if (express.static.mime.lookup(path) !== 'text/html') {
          res.setHeader('Cache-Control', 'public, max-age=31536000');
        } else {
          // Don't cache HTML files
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      }
    }));
    
    // Also serve assets from /assets path
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        res.set('Cache-Control', 'public, max-age=31536000');
        res.set('Access-Control-Allow-Origin', '*');
      }
    }));
    
    // Handle SPA routing - return index.html for all other routes
    app.get('*', (req, res) => {
      // If the request is for an asset that doesn't exist, return 404
      if (req.path.startsWith('/assets/')) {
        const assetPath = path.join(distPath, req.path);
        if (!fs.existsSync(assetPath)) {
          return res.status(404).send('Asset not found');
        }
      }
      // Otherwise, serve index.html for SPA routing
      res.sendFile(path.join(distPath, 'index.html'));
    });
    
    console.log('Serving static files from', distPath);
  } else {
    console.warn('Dist directory not found at', distPath, '. Only API routes will be available.');
    console.log('Current working directory:', process.cwd());
    console.log('Directory contents:', fs.readdirSync(rootDir));
  }
} catch (error) {
  console.error('Error setting up static file serving:', error);
}

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
