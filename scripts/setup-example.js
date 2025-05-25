// File: scripts/setup-example.js
/**
 * Setup script to help developers get started with the example
 * Checks environment and provides helpful guidance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🚀 Setting up Svarog-UI + Storyblok Integration Example\n');

// Check if .env file exists
const envPath = path.join(projectRoot, '.env');
const envExamplePath = path.join(projectRoot, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📋 Creating .env file from template...');

  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created');
  } else {
    // Create basic .env file
    const envContent = `# Storyblok Configuration
# Get your tokens from Storyblok Space Settings > Access Tokens

# Preview token (for development - allows draft content)
VITE_STORYBLOK_TOKEN=your_preview_token_here

# Version to fetch (draft for development, published for production)
VITE_STORYBLOK_VERSION=draft

# Space ID (optional, for some API calls)
VITE_STORYBLOK_SPACE_ID=your_space_id_here

# Application Settings
NODE_ENV=development

# Server Configuration (for Railway deployment)
PORT=3000
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created with template');
  }
} else {
  console.log('✅ .env file already exists');
}

// Check if Storyblok token is configured
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasToken =
    envContent.includes('VITE_STORYBLOK_TOKEN=') &&
    !envContent.includes('your_preview_token_here');

  if (!hasToken) {
    console.log('\n⚠️  Storyblok token not configured');
    console.log('📝 To complete setup:');
    console.log('   1. Go to https://app.storyblok.com');
    console.log('   2. Create a free space or use existing one');
    console.log('   3. Go to Settings > Access Tokens');
    console.log('   4. Copy the Preview token');
    console.log('   5. Replace "your_preview_token_here" in .env file');
  } else {
    console.log('✅ Storyblok token configured');
  }
} catch (error) {
  console.log('⚠️  Could not read .env file', error);
}

// Check if node_modules exists
const nodeModulesPath = path.join(projectRoot, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('\n📦 Dependencies not installed');
  console.log('💡 Run: npm install');
} else {
  console.log('✅ Dependencies installed');
}

// Check if svarog-ui is available
try {
  const svarogPath = path.join(nodeModulesPath, 'svarog-ui');
  if (fs.existsSync(svarogPath)) {
    console.log('✅ Svarog-UI library found');
  } else {
    console.log('⚠️  Svarog-UI library not found');
    console.log("💡 Make sure it's properly installed");
  }
} catch (error) {
  console.log('⚠️  Could not check Svarog-UI installation', error);
}

console.log('\n🎯 Next Steps:');
console.log('   1. Configure your Storyblok token in .env');
console.log('   2. Set up components in Storyblok (see README.md)');
console.log('   3. Create a "home" story with example content');
console.log('   4. Run: npm run dev');
console.log('   5. Open Storyblok Visual Editor to see live preview!');

console.log('\n📚 Helpful Commands:');
console.log('   npm run dev          - Start development server');
console.log('   npm run dev:debug    - Start with extra debug info');
console.log('   npm run example      - Same as npm run dev');
console.log('   npm run build        - Build for production');
console.log('   npm run start        - Start production server');

console.log('\n🔗 Resources:');
console.log('   📖 Storyblok setup guide: See Storyblok Setup Guide artifact');
console.log('   🎨 Svarog-UI docs: Check your svarog-ui README');
console.log('   🐛 Debug tools: Open browser console for detailed logs');

console.log('\n✨ Happy building with Svarog-UI + Storyblok!\n');
