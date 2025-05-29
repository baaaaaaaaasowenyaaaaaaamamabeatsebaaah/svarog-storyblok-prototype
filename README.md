# Svarog-UI + Storyblok Customer Website Template

My personal template for building customer websites with Svarog-UI and Storyblok.

## 🚀 New Customer Project Setup

### 1. Clone and Initialize

```bash
# Clone template
git clone [this-repo] customer-name
cd customer-name

# Remove template git history
rm -rf .git

# Initialize new git repo
git init

# Install dependencies
npm install
```

### 2. Configure Environment

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Customer's Storyblok token
VITE_STORYBLOK_TOKEN=their_preview_token_here
VITE_STORYBLOK_VERSION=draft
VITE_STORYBLOK_SPACE_ID=their_space_id

# Customer's brand colors
VITE_PRIMARY_COLOR=#007bff

# Enable features as needed
FEATURE_CONTACT_FORM=true
FEATURE_BLOG=false
FEATURE_ECOMMERCE=false
```

### 3. Update Project Info

Edit `package.json`:

```json
{
  "name": "customer-name-website",
  "version": "1.0.0"
}
```

### 4. Import Storyblok Components

```bash
npm run import:storyblok
```

### 5. Start Development

```bash
npm run dev
```

### 6. Initial Git Commit

```bash
git add .
git commit -m "Initial setup for [Customer Name]"

# If you have a remote repo
git remote add origin [customer-repo-url]
git push -u origin main
```

## 📋 Common Tasks

### Components

- Create component: `npm run create:component ComponentName`
- Import from Storyblok: `npm run import:storyblok`

### Development

- Start dev server: `npm run dev`
- Build production: `npm run build`
- Run tests: `npm test`
- Check code: `npm run lint`

### Deployment

- Railway: `railway up` or `npm run deploy:railway`
- Vercel: `vercel --prod` or `npm run deploy:vercel`
- Generic Node.js: `npm start`

## 🎨 Customer Customization Points

### Theme Colors

Edit `src/integration/themeManager.js` or use CSS variables:

```css
:root {
  --color-primary: #customer-brand-color;
  --color-secondary: #secondary-color;
  --color-text: #333333;
  --color-bg: #ffffff;
}
```

### Custom Components

Add to `src/components/custom/`:

```javascript
// src/components/custom/CustomerHero.js
export const CustomerHero = props => {
  const element = document.createElement('div');
  element.className = 'customer-hero';
  element.innerHTML = `<h1>${props.title}</h1>`;

  return {
    getElement: () => element,
    update: newProps => {
      /* update logic */
    },
    destroy: () => element.remove(),
  };
};
```

### Features

Add business logic to `src/features/`:

- Contact forms
- Newsletter signup
- Custom integrations
- Analytics
- Chat widgets

### Storyblok Components

Component templates in `.storyblok/customer-components/`:

- `base-components.json` - Essential components
- `e-commerce.json` - Shop components
- `blog.json` - Blog components
- `landing-page.json` - Marketing components

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   └── custom/          # Customer-specific components
│   ├── features/            # Customer features (forms, etc)
│   ├── integration/         # Storyblok integration (core)
│   ├── config/              # Component mappings
│   ├── styles/              # Custom styles
│   └── utils/               # Utilities
├── scripts/
│   ├── new-customer.js      # Customer setup wizard
│   ├── import-storyblok.js  # Component importer
│   └── create-component.js  # Component generator
├── .storyblok/
│   └── customer-components/ # Storyblok templates
├── public/                  # Static assets
│   ├── favicon.svg
│   └── robots.txt
└── server/                  # Production server
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Storyblok
VITE_STORYBLOK_TOKEN=your_preview_token
VITE_STORYBLOK_VERSION=draft           # draft or published
VITE_STORYBLOK_SPACE_ID=your_space_id
VITE_STORYBLOK_REGION=eu              # eu, us, ca, ap

# Theme
VITE_PRIMARY_COLOR=#007bff
VITE_DEFAULT_THEME=default            # default, cabalou, muchandy

# Features
FEATURE_CONTACT_FORM=true
FEATURE_BLOG=false
FEATURE_ECOMMERCE=false

# Environment
NODE_ENV=development                  # development or production
PORT=3000
```

### Storyblok Setup

1. Create space in Storyblok
2. Get preview token from Settings > Access Tokens
3. Run `npm run import:storyblok` to import components
4. Create "home" story with slug "home"

## 🐛 Debug Mode

Enable debug panel in development:

```javascript
// In browser console
localStorage.setItem('debug', 'true');
location.reload();
// Press Ctrl+Shift+D to toggle panel
```

Features:

- Component inspector
- Performance metrics
- Cache statistics
- Network requests
- Theme switcher

## 🚀 Deployment

### Pre-Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use Storyblok public token
- [ ] Optimize images
- [ ] Test all forms
- [ ] Check SEO meta tags
- [ ] Verify analytics
- [ ] Run Lighthouse audit

### Railway

```bash
# First time
railway login
railway link
railway up

# Updates
railway up
```

### Vercel

```bash
# First time
vercel

# Production
vercel --prod
```

### Generic Node.js

```bash
npm run build
NODE_ENV=production npm start
```

## 📊 Performance

### Bundle Analysis

```bash
npm run analyze
# Opens visual bundle analyzer
```

### Web Vitals Monitoring

Automatically tracks:

- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

### Image Optimization

All Storyblok images are automatically:

- Converted to WebP
- Lazy loaded
- Responsive with srcset
- Optimized with focal points

## 🎯 Common Patterns

### Contact Form

```javascript
// In your component
import { setupContactForm } from '@/features/contact-form.js';

const form = document.querySelector('#contact-form');
setupContactForm(form, {
  endpoint: '/api/contact',
  successMessage: "Thanks! We'll be in touch.",
  errorMessage: 'Oops! Please try again.',
});
```

### Multi-language Setup

```javascript
// Add to router
app.navigateToRoute(`/${language}/home`);

// In Storyblok
// Create folders: en/, de/, fr/
// Duplicate stories per language
```

### Analytics Integration

```javascript
// src/features/analytics.js
// Add GA4, Plausible, or other analytics
if (window.gtag) {
  gtag('event', 'form_submit', {
    form_name: 'contact',
  });
}
```

## 🔐 Security

### Headers (automatically set)

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Content Security Policy

Configured for Storyblok integration in `server/index.js`

### Rate Limiting

API endpoints limited to 100 requests per 15 minutes

## 📝 Notes & Tips

### Component Best Practices

1. Always provide `getElement()`, `update()`, and `destroy()`
2. Clean up event listeners in `destroy()`
3. Use semantic HTML
4. Keep components focused (single responsibility)

### Storyblok Tips

1. Use draft version for development
2. Use published version for production
3. Enable live preview in Visual Editor
4. Keep component names consistent

### Performance Tips

1. Use code splitting for large features
2. Lazy load below-the-fold images
3. Minimize third-party scripts
4. Use Storyblok's CDN for assets

### Customer Handoff

1. Document custom components
2. Provide Storyblok training
3. Set up error monitoring
4. Create maintenance plan

## 🆘 Troubleshooting

### Component not rendering?

- Check component is registered in `src/config/components.js`
- Verify Storyblok component name matches
- Look for console errors

### Storyblok connection issues?

- Verify token in `.env`
- Check token permissions
- Ensure correct version (draft/published)

### Build errors?

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear caches
rm -rf dist/
```

### Debug production issues

```javascript
// Temporarily enable debug in production
localStorage.setItem('debug', 'true');
```

---

**Remember:** This is your master template. Always clone it for new customers, never commit
customer-specific code back to this template.
