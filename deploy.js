#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const target = args[0] || 'local';

console.log(`🚀 Deploying SerCrow to ${target}...`);

try {
  switch (target) {
    case 'local':
      console.log('📦 Building client...');
      execSync('npm run build:client', { stdio: 'inherit' });
      console.log('✅ Client built successfully!');
      console.log('🌐 You can now serve the dist/ folder with any static server');
      console.log('💡 Try: npx serve dist');
      break;

    case 'cloudflare':
      console.log('📦 Building for Cloudflare Pages...');
      execSync('npm run build:client', { stdio: 'inherit' });
      console.log('🚀 Deploying to Cloudflare Pages...');
      execSync('npx wrangler pages deploy dist', { stdio: 'inherit' });
      break;

    case 'desktop':
      console.log('📦 Building desktop app...');
      execSync('npm run electron:build', { stdio: 'inherit' });
      console.log('✅ Desktop app built successfully!');
      break;

    case 'mobile':
      console.log('📦 Building mobile app...');
      execSync('npm run mobile:build', { stdio: 'inherit' });
      console.log('✅ Mobile app built successfully!');
      break;

    default:
      console.log('❌ Unknown target. Use: local, cloudflare, desktop, or mobile');
      process.exit(1);
  }

  console.log('🎉 Deployment completed successfully!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}