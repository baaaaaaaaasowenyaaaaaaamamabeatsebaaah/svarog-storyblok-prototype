# Svarog-UI + Storyblok Integration Template

A production-ready template for building modern websites using
[Svarog-UI Component Library](https://www.npmjs.com/package/svarog-ui) and
[Storyblok CMS](https://www.storyblok.com/). Create beautiful, maintainable websites in minutes with
live preview functionality and seamless component integration.

## 🚀 Quick Start

Get your website running in under 5 minutes:

```bash
# 1. Clone the template
git clone <template-repo> my-website
cd my-website

# 2. Run the setup wizard
npm install
npm run setup

# 3. Start development
npm run dev
```

The setup wizard will guide you through:

- 🔧 Project configuration
- 🔑 Storyblok token setup
- 🎨 Theme selection
- ✨ Feature selection
- 🚀 Deployment configuration

## 🎯 Features

- **🧩 40+ Pre-built Components** - Hero sections, cards, forms, navigation, and more
- **🎨 Multiple Themes** - Default, Cabalou (modern purple), Muchandy (warm tones)
- **👁️ Live Preview** - Real-time content updates in Storyblok Visual Editor
- **📱 Fully Responsive** - Mobile-first design that works on all devices
- **⚡ Performance Optimized** - Lazy loading, code splitting, and caching
- **🔧 Developer Friendly** - Clean code, comprehensive docs, and helpful tooling
- **🚢 Production Ready** - SEO, security headers, and deployment configs included

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- Storyblok account (free tier works)
- Basic knowledge of JavaScript and HTML

## 🛠️ Project Structure

```
svarog-storyblok-template/
├── .storyblok/              # Storyblok component templates
│   ├── components.json      # Import-ready component definitions
│   └── stories/            # Example story templates
├── src/
│   ├── app.js              # Main application logic
│   ├── components/         # Component extensions
│   │   ├── custom/        # Your custom components
│   │   └── examples/      # Example implementations
│   ├── features/          # Feature modules (blog, e-commerce, etc.)
│   ├── integration/       # Storyblok integration layer
│   ├── config/           # Configuration files
│   ├── theme/            # Theme customizations
│   └── utils/            # Utility functions
├── docs/                  # Documentation
├── scripts/              # Build and setup scripts
└── tests/                # Integration tests
```

## 🎨 Available Components

### Layout Components

- **Grid** - Responsive grid system (1-12 columns)
- **Section** - Content sections with padding and themes
- **Page** - Page wrapper with metadata

### Content Components

- **Hero Section** - Eye-catching headers with CTA
- **Text Block** - Rich text with formatting
- **Card** - Feature/content cards with variants
- **Image** - Responsive images with lazy loading

### Navigation

- **Header** - Site header with logo and nav
- **Navigation** - Horizontal/vertical menus
- **Footer** - Site footer with links

### Forms

- **Form** - Form wrapper with validation
- **Input** - Text, email, number inputs
- **Select** - Dropdown selections
- **Button** - Interactive buttons

### UI Elements

- **Tabs** - Tabbed content
- **Rating** - Star ratings
- **Price Display** - Product pricing

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Storyblok Configuration
VITE_STORYBLOK_TOKEN=your_preview_token_here
VITE_STORYBLOK_VERSION=draft
VITE_STORYBLOK_SPACE_ID=your_space_id
VITE_STORYBLOK_REGION=eu

# Application Settings
NODE_ENV=development
VITE_DEFAULT_THEME=default
PORT=3000
```

### Storyblok Setup

1. **Create a Storyblok Space**

   ```
   1. Go to https://app.storyblok.com
   2. Create a new space
   3. Get your preview token from Settings → Access Tokens
   ```

2. **Import Components**

   ```bash
   npm run import:storyblok
   ```

3. **Create Your First Story**
   - Name: "Home"
   - Slug: "home"
   - Content type: "Page"

## 🏗️ Development

### Creating Custom Components

Use the component generator:

```bash
npm run create:component MyComponent
```

This creates:

- Component file with Svarog-UI integration
- Test file with basic tests
- Storyblok component definition
- Automatic registration

### Manual Component Creation

```javascript
// src/components/custom/MyComponent.js
export const MyComponent = props => {
  const element = document.createElement('div');
  element.className = 'my-component';
  element.innerHTML = `<h2>${props.title}</h2>`;

  return {
    getElement: () => element,
    update: newProps => {
      element.querySelector('h2').textContent = newProps.title;
    },
    destroy: () => {
      element.remove();
    },
  };
};
```

### Adding Features

The template supports modular features:

- **Blog** - Full blogging system
- **E-commerce** - Product listings and cart
- **Multi-language** - i18n support
- **Analytics** - Google Analytics integration
- **Contact Forms** - Form handling

Enable features during setup or add them manually in `src/features/`.

## 🎨 Theming

### Using Built-in Themes

```javascript
// Change theme programmatically
import { switchTheme } from 'svarog-ui';

switchTheme('cabalou'); // or 'default', 'muchandy'
```

### Creating Custom Themes

```javascript
// src/theme/custom-theme.js
export const customTheme = {
  name: 'custom',
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    // ... more colors
  },
  apply: () => {
    // Apply CSS variables
  },
};
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📦 Building for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

The build process:

- Optimizes bundle size
- Minifies code
- Generates source maps
- Copies static assets

## 🚀 Deployment

### Railway (Recommended)

```bash
# Deploy to Railway
railway up
```

### Vercel

```bash
# Deploy to Vercel
vercel --prod
```

### Netlify

```bash
# Deploy to Netlify
netlify deploy --prod
```

### Environment Variables for Production

```env
NODE_ENV=production
VITE_STORYBLOK_TOKEN=your_public_token
VITE_STORYBLOK_VERSION=published
```

## 📚 Documentation

- **[Customization Guide](docs/CUSTOMIZATION.md)** - Add components and features
- **[Component Reference](docs/COMPONENTS.md)** - All available components
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment
- **[API Reference](docs/API.md)** - Integration APIs

## 🐛 Troubleshooting

### Common Issues

**Components not rendering?**

- Check component is registered in `src/config/components.js`
- Verify Storyblok component names match exactly
- Look for console errors

**Live preview not working?**

- Ensure HTTPS is enabled in dev server
- Check Storyblok Visual Editor settings
- Verify preview token permissions

**Build errors?**

- Clear `node_modules` and reinstall
- Check Node.js version (18+)
- Verify all environment variables

### Debug Mode

Enable detailed logging:

```javascript
// In development
localStorage.setItem('debug', 'true');
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Philosophy

1. **Concise Code** - Write the shortest code that works correctly
2. **Component-Based** - Everything is a reusable component
3. **Performance First** - Optimize for speed and efficiency
4. **Developer Experience** - Make it easy and enjoyable

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Svarog-UI](https://github.com/your-org/svarog-ui) - The component library
- [Storyblok](https://www.storyblok.com) - The headless CMS
- All our contributors and users

## 🆘 Support

- 📖 [Documentation](https://your-docs-site.com)
- 💬 [Discord Community](https://discord.gg/your-invite)
- 🐛 [Issue Tracker](https://github.com/your-org/template/issues)
- 📧 [Email Support](mailto:support@your-domain.com)

---

Built with ❤️ using Svarog-UI + Storyblok

**Ready to build something amazing? Let's go! 🚀**
