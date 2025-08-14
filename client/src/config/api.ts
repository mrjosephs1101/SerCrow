// API Configuration for different environments
export const getApiBaseUrl = (): string => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  }
  
  // For production (GitHub Pages), use the environment variable or a default backend URL
  return import.meta.env.VITE_API_BASE_URL || 'https://your-backend-api-url.com';
};

export const API_BASE = getApiBaseUrl();

// Check if we're running in a static environment (like GitHub Pages)
export const isStaticDeployment = (): boolean => {
  return !import.meta.env.DEV && window.location.hostname.includes('github.io');
};

// For static deployments, we might want to show different UI or disable certain features
export const getFeatureFlags = () => {
  const isStatic = isStaticDeployment();
  
  return {
    enableAuth: !isStatic, // Disable auth for static deployments unless backend is available
    enableSearch: true, // Search can work with external APIs
    enableWingman: !isStatic, // AI features require backend
    showOfflineMessage: isStatic,
  };
};