/**
 * Express server for Railway deployment
 * Serves the built Svarog-UI + Storyblok application
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Compression middleware
app.use(compression());

// Request logging
app.use(morgan('combined'));

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Health check rate limiting (more permissive)
const healthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 health checks per minute
});

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

// Enhanced health check endpoint
app.get('/health', healthLimiter, async (req, res) => {
  try {
    // Check Storyblok API connectivity
    const storyblokHealthy = await checkStoryblokHealth();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        storyblok: storyblokHealthy ? 'healthy' : 'degraded',
      },
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// API endpoint for cache invalidation (webhook from Storyblok)
app.post('/api/invalidate-cache', express.json(), async (req, res) => {
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
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    res.status(500).json({
      success: false,
      error: 'Cache invalidation failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Sitemap generation (basic implementation)
app.get('/sitemap.xml', async (req, res) => {
  try {
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
    page => `
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
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
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
let server;

const shutdown = signal => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error(
      'Could not close connections in time, forcefully shutting down'
    );
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Helper function to check Storyblok health
async function checkStoryblokHealth() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch('https://api.storyblok.com/v2/cdn/spaces/me', {
      headers: {
        Authorization: process.env.VITE_STORYBLOK_TOKEN || '',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok;
  } catch (error) {
    console.error('Storyblok health check failed:', error);
    return false;
  }
}

// Start server
server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Svarog-UI + Storyblok server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(
    `📊 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
  );

  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 Local: http://localhost:${PORT}`);
  }
});

export default app;
