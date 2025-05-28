# Deployment Guide

Deploy your Svarog-UI + Storyblok website to production.

## Supported Platforms

### Railway (Recommended)
```bash
npm run build
railway up
```

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod
```

## Environment Variables

Set these in your deployment platform:
- `NODE_ENV=production`
- `VITE_STORYBLOK_TOKEN=your_public_token`
- `VITE_STORYBLOK_VERSION=published`

## Performance Optimization

1. Enable caching
2. Use CDN
3. Optimize images
4. Enable compression

## Security

1. Use public token in production
2. Enable CORS properly
3. Set security headers
4. Monitor for vulnerabilities
