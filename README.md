# Svarog-UI + Storyblok Integration

A seamless integration between the
[Svarog-UI Component Library](https://github.com/your-org/svarog-ui) and
[Storyblok CMS](https://www.storyblok.com/), enabling content-driven web applications with powerful
theming and component reusability.

## 🚀 Features

- **Native Svarog-UI Integration** - Uses the complete Svarog-UI component library
- **Seamless CMS Mapping** - Direct mapping between Storyblok components and Svarog-UI
- **Dynamic Theming** - Real-time theme switching with Svarog-UI's theme system
- **Live Preview** - Storyblok Visual Editor integration for real-time content editing
- **Performance Optimized** - Intelligent caching and component reuse
- **JSDoc Type Safety** - Full IntelliSense support without build complexity
- **Railway Deployment** - Production-ready Express server for Railway hosting

## 🏗️ Architecture

```
src/
├── integration/           # Core integration layer
│   ├── componentMapper.js # Maps Storyblok → Svarog-UI components
│   └── storyblokClient.js # Enhanced Storyblok client
├── app.js                # Main application logic
├── index.js             # Entry point
└── index.html           # HTML template

server/
└── index.js             # Express server for Railway

tests/
├── setup.js             # Vitest configuration
└── integration/         # Integration tests
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- Storyblok account with content
- Svarog-UI library available in npm

### Installation

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd svarog-storyblok-integration
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your Storyblok credentials:

   ```env
   VITE_STORYBLOK_TOKEN=your_preview_token_here
   VITE_STORYBLOK_VERSION=draft
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

## 📝 Storyblok Setup

### Required Components

Create these components in your Storyblok space:

#### Hero Section

```json
{
  "title": { "type": "text", "required": true },
  "subtitle": { "type": "text" },
  "background_image": { "type": "asset" },
  "cta_button": {
    "type": "bloks",
    "restrict_components": true,
    "component_whitelist": ["button"]
  },
  "theme": {
    "type": "option",
    "options": ["default", "cabalou", "muchandy"],
    "default": "default"
  }
}
```

#### Text Block

```json
{
  "content": { "type": "richtext", "required": true },
  "variant": {
    "type": "option",
    "options": ["body", "heading", "caption"],
    "default": "body"
  },
  "alignment": {
    "type": "option",
    "options": ["left", "center", "right"],
    "default": "left"
  }
}
```

#### Button

```json
{
  "text": { "type": "text", "required": true },
  "url": { "type": "text", "required": true },
  "variant": {
    "type": "option",
    "options": ["primary", "secondary", "outline"],
    "default": "primary"
  },
  "size": {
    "type": "option",
    "options": ["small", "medium", "large"],
    "default": "medium"
  }
}
```

### Page Structure

Create pages with this structure:

```json
{
  "title": { "type": "text", "required": true },
  "description": { "type": "text" },
  "body": { "type": "bloks", "required": true }
}
```

## 🎨 Component Mapping

The integration automatically maps Storyblok components to Svarog-UI:

| Storyblok Component | Svarog-UI Component | Description           |
| ------------------- | ------------------- | --------------------- |
| `hero_section`      | `Hero`              | Page headers with CTA |
| `text_block`        | `Typography`        | Rich text content     |
| `button`            | `Button`            | Interactive buttons   |
| `card`              | `Card`              | Content cards         |
| `grid`              | `Grid`              | Layout grid system    |
| `section`           | `Section`           | Content sections      |
| `header`            | `Header`            | Site header           |
| `footer`            | `Footer`            | Site footer           |
| `navigation`        | `Navigation`        | Navigation menus      |

### Adding New Components

1. **Create the mapping function:**

   ```javascript
   // src/integration/componentMapper.js
   function createMyComponentFromCMS(cmsData) {
     const { prop1, prop2, theme = 'default' } = cmsData;

     return MyComponent({
       prop1,
       prop2,
       theme,
     });
   }
   ```

2. **Register the component:**

   ```javascript
   const COMPONENT_MAP = new Map([
     ['my_component', createMyComponentFromCMS],
     // ... existing mappings
   ]);
   ```

3. **Create the Storyblok component** with matching name `my_component`

## 🎨 Theme System

Uses Svarog-UI's powerful theming system:

```javascript
import { switchTheme, getCurrentTheme, setThemeVariable } from 'svarog-ui';

// Switch themes
switchTheme('cabalou');

// Get current theme
const theme = getCurrentTheme();

// Override specific variables
setThemeVariable('--button-bg', '#custom-color');
```

Available themes: `default`, `cabalou`, `muchandy`

## 🧪 Testing

Using Vitest for modern, fast testing:

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Structure

```javascript
// tests/integration/myComponent.test.js
import { describe, test, expect } from 'vitest';
import { createComponent } from '@/integration/componentMapper.js';

describe('My Component Integration', () => {
  test('creates component from CMS data', () => {
    const cmsData = { component: 'my_component', prop: 'value' };
    const component = createComponent(cmsData);

    expect(component).toBeDefined();
    expect(component.getElement()).toBeInstanceOf(HTMLElement);
  });
});
```

## 🚀 Deployment

### Railway Deployment

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Set environment variables in Railway:**

   ```env
   NODE_ENV=production
   VITE_STORYBLOK_TOKEN=your_public_token
   VITE_STORYBLOK_VERSION=published
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

### Server Features

- Static file serving from `dist/`
- Client-side routing support
- Health check endpoint: `/health`
- Cache invalidation webhook: `/api/invalidate-cache`
- Automatic sitemap generation: `/sitemap.xml`
- SEO-friendly robots.txt: `/robots.txt`

## 📊 Performance

### Optimization Features

- **Component Caching** - Intelligent component instance caching
- **Bundle Splitting** - Webpack code splitting for optimal loading
- **Theme CSS Variables** - Efficient theme switching without re-render
- **Lazy Loading** - Components load on demand
- **CDN Integration** - Optimized asset delivery via Storyblok CDN

### Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Component Render Time**: < 50ms

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Webpack dev server
npm run build        # Production build
npm run start:server # Start Express server
npm test             # Run tests
npm run test:watch   # Test watch mode
npm run lint         # ESLint check
npm run lint:fix     # Fix ESLint issues
```

### Development Features

- **Hot Module Replacement** - Instant updates during development
- **Live Preview** - Real-time Storyblok Visual Editor integration
- **Theme Switcher** - Runtime theme switching for testing
- **Error Overlay** - Detailed error information in development
- **Performance Monitoring** - Built-in performance metrics

## 🔒 Security

### Content Security Policy

Configured for Storyblok integration:

- Scripts from `app.storyblok.com`
- Images from `a.storyblok.com`
- API connections to `api.storyblok.com`

### Input Sanitization

- Rich text content sanitization
- XSS prevention
- Safe HTML rendering
- Asset URL validation

## 📚 API Reference

### StoryblokClient

```javascript
const client = createStoryblokClient();

// Get story with rendered components
const story = await client.getStoryWithComponents('home');

// Render to container
const rendered = await client.renderStoryToContainer('home', container);

// Enable live preview
client.enableLivePreview(story => {
  console.log('Story updated:', story);
});
```

### Component Mapper

```javascript
import { createComponent, registerComponent } from './integration/componentMapper.js';

// Create component from CMS data
const component = createComponent(storyblokBlock);

// Register new component type
registerComponent('custom_component', createCustomComponent);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow Svarog-UI coding standards
4. Write tests for new functionality
5. Ensure all tests pass: `npm test`
6. Submit a pull request

### Coding Standards

- Use Svarog-UI component patterns
- Follow the factory function approach
- Write comprehensive tests
- Document new component mappings
- Ensure accessibility compliance

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Storyblok Help**: [Storyblok Documentation](https://www.storyblok.com/docs)
- **Svarog-UI Help**: [Svarog-UI Documentation](https://github.com/your-org/svarog-ui)

---

**Built with ❤️ using Svarog-UI + Storyblok**
