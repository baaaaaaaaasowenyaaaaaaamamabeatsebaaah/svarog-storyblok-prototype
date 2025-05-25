# Svarog-UI + Storyblok Integration Example

A complete working example demonstrating seamless integration between the
[Svarog-UI Component Library](https://www.npmjs.com/package/svarog-ui) and
[Storyblok CMS](https://www.storyblok.com/), featuring **live preview functionality** and real-time
content editing.

## 🎯 What This Example Shows

- ✅ **Component Mapping** - Automatic mapping between Storyblok components and Svarog-UI
- ✅ **Live Preview** - Real-time content updates in Storyblok Visual Editor
- ✅ **Theme Switching** - Dynamic theme changes with Svarog-UI's theme system
- ✅ **Error Handling** - Graceful fallbacks and helpful error messages
- ✅ **Performance** - Optimized rendering with caching and DOM efficiency
- ✅ **Production Ready** - Express server setup for Railway deployment

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd svarog-storyblok-integration
npm install
```

### 2. Automatic Setup

```bash
npm run setup
```

This creates your `.env` file and checks your environment.

### 3. Configure Storyblok

1. **Create a Storyblok space** at [storyblok.com](https://app.storyblok.com)
2. **Get your preview token** from Settings > Access Tokens
3. **Add it to `.env`**:
   ```env
   VITE_STORYBLOK_TOKEN=your_preview_token_here
   VITE_STORYBLOK_VERSION=draft
   ```

### 4. Set Up Components in Storyblok

Follow the **[Storyblok Setup Guide](#storyblok-setup)** below to create the required component
types.

### 5. Start Development

```bash
npm run dev
```

Your example will open at `http://localhost:3000` with:

- 🎨 Theme switcher (top-right)
- 🔄 Live preview indicator
- 📝 Example content or setup instructions

## 🎨 Live Preview in Action

1. **Open Storyblok Visual Editor** for your 'home' story
2. **Edit content** - Change text, switch themes, add components
3. **See instant updates** in your browser without refresh!

![Live Preview Demo](docs/live-preview-demo.gif)

## 🧱 Component Architecture

### Available Components

The example includes these Storyblok → Svarog-UI mappings:

| Storyblok Component | Svarog-UI Component | Description                     |
| ------------------- | ------------------- | ------------------------------- |
| `hero_section`      | `Hero`              | Page headers with CTA buttons   |
| `text_block`        | `Typography`        | Rich text content with variants |
| `button`            | `Button`            | Interactive buttons with themes |
| `card`              | `Card`              | Content cards with images/links |
| `grid`              | `Grid`              | Responsive grid layouts         |
| `section`           | `Section`           | Content sections with variants  |
| `header`            | `Header`            | Site header with navigation     |
| `footer`            | `Footer`            | Site footer with links          |
| `navigation`        | `Navigation`        | Navigation menus                |

### Component Factory Pattern

Each component uses Svarog-UI's factory pattern:

```javascript
// CMS data gets transformed into Svarog-UI props
const hero = Hero({
  title: 'Welcome to Svarog-UI',
  subtitle: 'Integrated with Storyblok',
  theme: 'cabalou',
  ctaButton: {
    text: 'Get Started',
    href: '#features',
    variant: 'primary',
  },
});

// Automatic style injection - no CSS imports needed!
document.body.appendChild(hero.getElement());
```

## 📁 Project Structure

```
svarog-storyblok-integration/
├── src/
│   ├── app.js                    # Main application with live preview
│   ├── index.js                  # Entry point
│   ├── index.html                # HTML template with Storyblok bridge
│   ├── integration/              # Core integration layer
│   │   ├── componentMapper.js    # Maps Storyblok → Svarog-UI
│   │   └── storyblokClient.js    # Enhanced Storyblok client
│   ├── config/
│   │   ├── components.js         # Component registry & schemas
│   │   └── environment.js        # Environment configuration
│   ├── utils/                    # Utility functions
│   ├── styles/                   # Integration-specific styles
│   └── types/                    # JSDoc type definitions
├── server/
│   └── index.js                  # Express server for production
├── scripts/
│   └── setup-example.js          # Setup helper script
├── tests/                        # Integration tests
├── docs/                         # Documentation
└── .env.example                  # Environment template
```

## 🔧 Development Features

### Theme System Integration

```javascript
import { switchTheme, getCurrentTheme } from 'svarog-ui';

// Programmatic theme switching
switchTheme('cabalou');

// Theme persistence
localStorage.setItem('svarog-theme', 'muchandy');

// Available themes: 'default', 'cabalou', 'muchandy'
```

### Live Preview Events

```javascript
// Listen for Storyblok changes
window.storyblok.on(['input', 'published', 'change'], event => {
  if (event.action === 'input') {
    // Content updated in editor
    refreshContent();
  }
});
```

### Error Handling

- **Graceful fallbacks** for missing components
- **Helpful error messages** with setup instructions
- **Development debugging** with detailed console logs
- **Component validation** with clear error reporting

## 🎯 Storyblok Setup

<details>
<summary><strong>📋 Complete Storyblok Configuration Guide</strong></summary>

### Step 1: Create Component Types

In your Storyblok space, go to **Components > Block Library** and create:

#### Hero Section (`hero_section`)

```json
{
  "title": { "type": "text", "required": true },
  "subtitle": { "type": "text" },
  "background_image": { "type": "asset", "filetypes": ["images"] },
  "cta_button": {
    "type": "bloks",
    "restrict_type": true,
    "component_whitelist": ["button"],
    "maximum": 1
  },
  "theme": {
    "type": "option",
    "options": [
      { "name": "Default", "value": "default" },
      { "name": "Cabalou", "value": "cabalou" },
      { "name": "Muchandy", "value": "muchandy" }
    ]
  }
}
```

#### Text Block (`text_block`)

```json
{
  "content": { "type": "richtext", "required": true },
  "variant": {
    "type": "option",
    "options": [
      { "name": "Body", "value": "body" },
      { "name": "Heading", "value": "heading" },
      { "name": "Caption", "value": "caption" }
    ]
  },
  "alignment": {
    "type": "option",
    "options": [
      { "name": "Left", "value": "left" },
      { "name": "Center", "value": "center" },
      { "name": "Right", "value": "right" }
    ]
  }
}
```

#### Button (`button`)

```json
{
  "text": { "type": "text", "required": true },
  "url": { "type": "text", "required": true },
  "variant": {
    "type": "option",
    "options": [
      { "name": "Primary", "value": "primary" },
      { "name": "Secondary", "value": "secondary" },
      { "name": "Outline", "value": "outline" }
    ]
  },
  "size": {
    "type": "option",
    "options": [
      { "name": "Small", "value": "small" },
      { "name": "Medium", "value": "medium" },
      { "name": "Large", "value": "large" }
    ]
  }
}
```

#### Card (`card`)

```json
{
  "title": { "type": "text", "required": true },
  "content": { "type": "textarea" },
  "image": { "type": "asset", "filetypes": ["images"] },
  "link": {
    "type": "bloks",
    "component_whitelist": ["button"],
    "maximum": 1
  },
  "variant": {
    "type": "option",
    "options": [
      { "name": "Default", "value": "default" },
      { "name": "Elevated", "value": "elevated" },
      { "name": "Outlined", "value": "outlined" }
    ]
  }
}
```

### Step 2: Create Page Template

Create a **Content Type** called `page`:

```json
{
  "title": { "type": "text", "required": true },
  "description": { "type": "textarea" },
  "body": { "type": "bloks", "required": true }
}
```

### Step 3: Create Example Story

1. Create a story called `home`
2. Use the `page` content type
3. Add example content with the components above

### Step 4: Enable Live Preview

1. Go to **Settings > Visual Editor**
2. Set preview URL: `http://localhost:3000/`
3. Enable "Use 'https' for the real-time API"
4. Save settings

</details>

## 🌐 Production Deployment

### Railway Deployment

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Set environment variables** in Railway:

   ```env
   NODE_ENV=production
   VITE_STORYBLOK_TOKEN=your_public_token
   VITE_STORYBLOK_VERSION=published
   ```

3. **Deploy**:
   ```bash
   railway up
   ```

### Server Features

- ✅ **Static file serving** from `dist/`
- ✅ **Client-side routing** support
- ✅ **Health check** endpoint: `/health`
- ✅ **Cache invalidation** webhook: `/api/invalidate-cache`
- ✅ **SEO-friendly** robots.txt and sitemap

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Integration tests only
npm run test:integration

# Coverage report
npm run test:coverage
```

Tests cover:

- Component mapping functionality
- Storyblok client integration
- Error handling scenarios
- Theme switching
- Live preview features

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server with live preview
npm run dev:debug    # Development with extra debugging
npm run example      # Alias for npm run dev
npm run setup        # Initial project setup
npm run build        # Production build
npm run start        # Start production server
npm test             # Run tests
npm run lint         # Code linting
npm run format       # Code formatting
```

## 🔍 Debugging

### Development Tools

- **Browser Console** - Detailed logging of component creation and updates
- **Live Preview Indicator** - Shows when Storyblok bridge is active
- **Theme Switcher** - Test theme changes in real-time
- **Error Boundaries** - Helpful error messages with setup guidance

### Common Issues

**Live Preview Not Working?**

- Check Storyblok token in `.env`
- Verify preview URL in Storyblok settings
- Look for Storyblok bridge errors in console

**Components Not Rendering?**

- Verify component names match your Storyblok setup
- Check browser console for mapping errors
- Ensure all required props are provided

**Theme Not Switching?**

- Check if Svarog-UI themes are properly loaded
- Verify theme names in component props
- Look for CSS variable updates in DevTools

## 🤝 Contributing

This example follows the same standards as the main Svarog-UI library:

1. **Concise Code** - Write the shortest code that works correctly
2. **Factory Functions** - Use Svarog-UI's component pattern
3. **Error Handling** - Provide helpful error messages
4. **Documentation** - Update both code comments and README
5. **Testing** - Add tests for new functionality

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/svarog-storyblok-integration/issues)
- **Discussions**:
  [GitHub Discussions](https://github.com/your-org/svarog-storyblok-integration/discussions)
- **Storyblok Docs**: [storyblok.com/docs](https://www.storyblok.com/docs)
- **Svarog-UI Docs**: Check your svarog-ui library documentation

---

**Built with ❤️ using Svarog-UI + Storyblok**

_This example demonstrates the power of combining a modern component library with a headless CMS for
rapid, maintainable web development._
