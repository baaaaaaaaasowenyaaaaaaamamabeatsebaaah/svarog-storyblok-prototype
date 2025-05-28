// scripts/optimize-build.js
/**
 * Post-build optimization script
 * Further optimizes the production build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gzip } from 'zlib';
import { promisify } from 'util';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const gzipAsync = promisify(gzip);

async function optimizeBuild() {
  console.log('🔧 Running post-build optimizations...\n');

  // 1. Generate build manifest
  await generateBuildManifest();

  // 2. Create critical CSS
  await extractCriticalCSS();

  // 3. Generate security headers file
  await generateSecurityHeaders();

  // 4. Create resource hints
  await generateResourceHints();

  // 5. Generate sitemap
  await generateSitemap();

  console.log('\n✅ Build optimization complete!');
}

async function generateBuildManifest() {
  console.log('📋 Generating build manifest...');

  const manifest = {
    version: process.env.npm_package_version,
    buildTime: new Date().toISOString(),
    files: {},
  };

  // Get all JS and CSS files
  const files = fs
    .readdirSync(path.join(distPath, 'js'))
    .filter(file => file.endsWith('.js') || file.endsWith('.css'));

  for (const file of files) {
    const filePath = path.join(distPath, 'js', file);
    const content = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    const stats = fs.statSync(filePath);

    manifest.files[file] = {
      size: stats.size,
      hash: hash.substring(0, 8),
      gzipSize: (await gzipAsync(content)).length,
    };
  }

  fs.writeFileSync(
    path.join(distPath, 'build-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('✅ Build manifest generated');
}

async function extractCriticalCSS() {
  console.log('🎨 Extracting critical CSS...');

  // This is a simplified version - in production, use a tool like critical
  const criticalCSS = `
    /* Critical CSS for above-the-fold content */
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .hero { min-height: 50vh; display: flex; align-items: center; justify-content: center; }
    .loading { text-align: center; padding: 2rem; }
  `;

  // Update index.html with critical CSS
  const indexPath = path.join(distPath, 'index.html');
  let indexContent = fs.readFileSync(indexPath, 'utf8');

  indexContent = indexContent.replace(
    '</head>',
    `<style>${criticalCSS.replace(/\s+/g, ' ').trim()}</style>\n</head>`
  );

  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Critical CSS extracted');
}

async function generateSecurityHeaders() {
  console.log('🔒 Generating security headers...');

  const headers = {
    '/*': {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' app.storyblok.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: a.storyblok.com; connect-src 'self' api.storyblok.com; frame-src app.storyblok.com",
    },
  };

  fs.writeFileSync(
    path.join(distPath, '_headers'),
    Object.entries(headers)
      .map(([path, headers]) => {
        return `${path}\n${Object.entries(headers)
          .map(([key, value]) => `  ${key}: ${value}`)
          .join('\n')}`;
      })
      .join('\n\n')
  );

  console.log('✅ Security headers generated');
}

async function generateResourceHints() {
  console.log('🔗 Generating resource hints...');

  const hints = [
    '<link rel="preconnect" href="https://api.storyblok.com">',
    '<link rel="dns-prefetch" href="https://a.storyblok.com">',
    '<link rel="preload" href="/js/vendors.js" as="script">',
    '<link rel="preload" href="/js/svarog-ui.js" as="script">',
  ];

  // Update index.html
  const indexPath = path.join(distPath, 'index.html');
  let indexContent = fs.readFileSync(indexPath, 'utf8');

  indexContent = indexContent.replace(
    '<link rel="preconnect"',
    `${hints.join('\n  ')}\n  <link rel="preconnect"`
  );

  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Resource hints generated');
}

async function generateSitemap() {
  console.log('🗺️ Generating sitemap...');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>`;

  fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemap);
  console.log('✅ Sitemap generated');
}

// Run optimizations
optimizeBuild().catch(console.error);
