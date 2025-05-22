/**
 * Express server for Railway deployment
 * Serves the built Svarog-UI + Storyblok application
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CSP for Storyblok integration
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' app.storyblok.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: a.storyblok.com",
      "connect-src 'self' api.storyblok.com",
      'frame-src app.storyblok.com',
      "font-src 'self' data:",
    ].join('; ')
  );

  next();
});

// Compression for better performance
app.use((req, res, next) => {
  if (req.headers['accept-encoding']?.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API endpoint for cache invalidation (webhook from Storyblok)
app.post('/api/invalidate-cache', express.json(), (req, res) => {
  try {
    const { story_id, action } = req.body;

    console.log(
      `Cache invalidation requested for story ${story_id}, action: ${action}`
    );

    // In a real implementation, you might clear Redis cache or CDN cache here
    // For now, we just log the request

    res.json({
      success: true,
      message: 'Cache invalidation queued',
      story_id,
      action,
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    res.status(500).json({
      success: false,
      error: 'Cache invalidation failed',
    });
  }
});

// Sitemap generation (basic implementation)
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = req.protocol + '://' + req.get('host');

  // In a real implementation, you'd fetch all published stories from Storyblok
  const pages = [
    { url: '/', lastmod: new Date().toISOString(), priority: '1.0' },
    // Add more pages dynamically from Storyblok
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <priority>${page.priority}</priority>
  </url>
`
  )
  .join('')}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.send(sitemap);
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  const baseUrl = req.protocol + '://' + req.get('host');

  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`);
});

// Handle client-side routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);

  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      message: error.message,
      stack: error.stack,
    }),
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Svarog-UI + Storyblok server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);

  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 Local: http://localhost:${PORT}`);
  }
});

export default app;
