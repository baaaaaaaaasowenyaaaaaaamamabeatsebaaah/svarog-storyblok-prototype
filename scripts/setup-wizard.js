// scripts/setup-wizard.js
/**
 * Interactive setup wizard for Svarog-UI + Storyblok template
 * Guides users through initial configuration
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper to ask questions
const ask = question => new Promise(resolve => rl.question(question, resolve));

// Wizard state
const config = {
  projectName: '',
  storyblokToken: '',
  storyblokSpaceId: '',
  storyblokRegion: 'eu',
  theme: 'default',
  features: [],
  deployment: 'railway',
};

// Main wizard
async function runWizard() {
  console.clear();
  console.log(
    chalk.cyan.bold(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🚀 Svarog-UI + Storyblok Setup Wizard                ║
║                                                           ║
║     Let's get your website up and running!               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`)
  );

  // Step 1: Project Name
  console.log(chalk.yellow('\n📋 Step 1: Project Configuration\n'));

  config.projectName =
    (await ask(chalk.white('Project name (my-website): '))) || 'my-website';

  // Step 2: Storyblok Configuration
  console.log(chalk.yellow('\n🔗 Step 2: Storyblok Configuration\n'));
  console.log(
    chalk.gray('Need a Storyblok account? Visit https://app.storyblok.com\n')
  );

  config.storyblokToken = await ask(chalk.white('Storyblok preview token: '));

  while (!config.storyblokToken) {
    console.log(chalk.red('❌ Token is required!'));
    config.storyblokToken = await ask(chalk.white('Storyblok preview token: '));
  }

  config.storyblokSpaceId =
    (await ask(chalk.white('Storyblok space ID (optional): '))) || '';

  const region =
    (await ask(chalk.white('Storyblok region (eu/us/ca/ap) [eu]: '))) || 'eu';
  if (['eu', 'us', 'ca', 'ap'].includes(region)) {
    config.storyblokRegion = region;
  }

  // Step 3: Theme Selection
  console.log(chalk.yellow('\n🎨 Step 3: Theme Selection\n'));
  console.log('Available themes:');
  console.log('  1. Default - Clean and professional');
  console.log('  2. Cabalou - Modern and vibrant');
  console.log('  3. Muchandy - Warm and friendly');

  const themeChoice =
    (await ask(chalk.white('\nChoose theme (1-3) [1]: '))) || '1';
  const themes = { 1: 'default', 2: 'cabalou', 3: 'muchandy' };
  config.theme = themes[themeChoice] || 'default';

  // Step 4: Features
  console.log(chalk.yellow('\n✨ Step 4: Additional Features\n'));
  console.log('Select features (comma-separated numbers):');
  console.log('  1. Contact Form');
  console.log('  2. Blog');
  console.log('  3. E-commerce (Products)');
  console.log('  4. Multi-language');
  console.log('  5. Analytics');

  const featuresInput =
    (await ask(chalk.white('\nFeatures (e.g., 1,2,5): '))) || '';
  const featureMap = {
    1: 'contact-form',
    2: 'blog',
    3: 'ecommerce',
    4: 'i18n',
    5: 'analytics',
  };

  config.features = featuresInput
    .split(',')
    .map(f => featureMap[f.trim()])
    .filter(Boolean);

  // Step 5: Deployment
  console.log(chalk.yellow('\n🚀 Step 5: Deployment Target\n'));
  console.log('Where will you deploy?');
  console.log('  1. Railway (recommended)');
  console.log('  2. Vercel');
  console.log('  3. Netlify');
  console.log('  4. Other/Manual');

  const deployChoice =
    (await ask(chalk.white('\nDeployment (1-4) [1]: '))) || '1';
  const deployTargets = { 1: 'railway', 2: 'vercel', 3: 'netlify', 4: 'other' };
  config.deployment = deployTargets[deployChoice] || 'railway';

  // Show summary
  console.log(chalk.yellow('\n📊 Configuration Summary:\n'));
  console.log(chalk.white(`  Project:    ${config.projectName}`));
  console.log(chalk.white(`  Theme:      ${config.theme}`));
  console.log(
    chalk.white(`  Features:   ${config.features.join(', ') || 'none'}`)
  );
  console.log(chalk.white(`  Deployment: ${config.deployment}`));
  console.log(chalk.white(`  Region:     ${config.storyblokRegion}`));

  const confirm = await ask(chalk.green('\n✔️  Continue with setup? (Y/n): '));

  if (confirm.toLowerCase() === 'n') {
    console.log(chalk.red('\n❌ Setup cancelled'));
    process.exit(0);
  }

  // Run setup
  await runSetup();

  rl.close();
}

async function runSetup() {
  console.log(chalk.cyan('\n🔧 Running setup...\n'));

  // 1. Create .env file
  const spinner1 = ora('Creating environment file...').start();
  try {
    createEnvFile();
    spinner1.succeed('Environment file created');
  } catch (error) {
    spinner1.fail('Failed to create .env file');
    console.error(error);
  }

  // 2. Install dependencies
  const spinner2 = ora('Installing dependencies...').start();
  try {
    execSync('npm install', { stdio: 'ignore' });
    spinner2.succeed('Dependencies installed');
  } catch {
    spinner2.fail('Failed to install dependencies');
  }

  // 3. Create project structure
  const spinner3 = ora('Creating project structure...').start();
  try {
    await createProjectStructure();
    spinner3.succeed('Project structure created');
  } catch {
    spinner3.fail('Failed to create structure');
  }

  // 4. Test Storyblok connection
  const spinner4 = ora('Testing Storyblok connection...').start();
  try {
    await testStoryblokConnection();
    spinner4.succeed('Storyblok connection successful');
  } catch {
    spinner4.warn('Could not connect to Storyblok - check your token');
  }

  // 5. Create example components
  if (config.features.length > 0) {
    const spinner5 = ora('Setting up features...').start();
    try {
      await setupFeatures();
      spinner5.succeed('Features configured');
    } catch {
      spinner5.fail('Failed to setup features');
    }
  }

  // 6. Setup deployment files
  const spinner6 = ora('Configuring deployment...').start();
  try {
    await setupDeployment();
    spinner6.succeed('Deployment configured');
  } catch {
    spinner6.fail('Failed to configure deployment');
  }

  // Show next steps
  showNextSteps();
}

function createEnvFile() {
  const envContent = `# Storyblok Configuration
VITE_STORYBLOK_TOKEN=${config.storyblokToken}
VITE_STORYBLOK_VERSION=draft
VITE_STORYBLOK_SPACE_ID=${config.storyblokSpaceId}
VITE_STORYBLOK_REGION=${config.storyblokRegion}

# Application Settings
NODE_ENV=development
VITE_DEFAULT_THEME=${config.theme}

# Server Configuration
PORT=3000

# Features
${config.features.map(f => `FEATURE_${f.toUpperCase().replace('-', '_')}=true`).join('\n')}

# Production Settings (uncomment for production)
# NODE_ENV=production
# VITE_STORYBLOK_VERSION=published
`;

  fs.writeFileSync(path.join(projectRoot, '.env'), envContent);
}

async function createProjectStructure() {
  // Create custom component example
  if (config.features.includes('contact-form')) {
    const contactFormCode = `// src/components/custom/ContactForm.js
import { isValidEmail } from '../../utils/validation/index.js';

export const ContactForm = (props) => {
  const form = document.createElement('form');
  form.className = 'contact-form';
  form.innerHTML = \`
    <div class="form-group">
      <label for="name">Name</label>
      <input type="text" id="name" name="name" required>
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required>
    </div>
    <div class="form-group">
      <label for="message">Message</label>
      <textarea id="message" name="message" rows="5" required></textarea>
    </div>
    <button type="submit" class="button button-primary">Send Message</button>
  \`;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validate email
    if (!isValidEmail(data.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Handle form submission
    console.log('Form submitted:', data);
    
    // Show success message
    form.innerHTML = '<p class="success">Thank you! Your message has been sent.</p>';
  };
  
  form.addEventListener('submit', handleSubmit);
  
  return {
    getElement: () => form,
    update: (newProps) => {
      // Update logic if needed
      Object.assign(props, newProps);
    },
    destroy: () => {
      form.removeEventListener('submit', handleSubmit);
      form.remove();
    }
  };
};
`;

    const customDir = path.join(projectRoot, 'src/components/custom');
    if (!fs.existsSync(customDir)) {
      fs.mkdirSync(customDir, { recursive: true });
    }

    fs.writeFileSync(path.join(customDir, 'ContactForm.js'), contactFormCode);
  }

  // Update package.json with project name
  const packagePath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.name = config.projectName;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
}

async function testStoryblokConnection() {
  const response = await fetch(
    `https://api.storyblok.com/v2/cdn/spaces/me?token=${config.storyblokToken}`
  );

  if (!response.ok) {
    throw new Error('Invalid token');
  }

  return response.json();
}

async function setupFeatures() {
  // Create feature-specific files
  for (const feature of config.features) {
    switch (feature) {
      case 'blog': {
        createBlogFeature();
        break;
      }
      case 'ecommerce': {
        createEcommerceFeature();
        break;
      }
      case 'analytics': {
        createAnalyticsFeature();
        break;
      }
      case 'i18n': {
        createI18nFeature();
        break;
      }
      default: {
        // Handle unknown features
        console.warn(`Unknown feature: ${feature}`);
      }
    }
  }
}

function createBlogFeature() {
  const blogRouterCode = `// src/features/blog/router.js
export const setupBlogRoutes = (router) => {
  router.add('/blog', async (context) => {
    // Load blog listing
    const posts = await loadBlogPosts();
    renderBlogListing(posts, context.container);
  });
  
  router.add('/blog/:slug', async (context) => {
    // Load single blog post
    const post = await loadBlogPost(context.params.slug);
    renderBlogPost(post, context.container);
  });
};

async function loadBlogPosts() {
  // Implement blog post loading
  return [];
}

async function loadBlogPost(slug) {
  // Implement single post loading
  return { title: 'Blog Post', content: 'Content', slug };
}

function renderBlogListing(posts, container) {
  // Implement blog listing rendering
  container.innerHTML = \`
    <h1>Blog</h1>
    <div class="blog-posts">
      \${posts.map(post => \`
        <article class="blog-card">
          <h2>\${post.title}</h2>
          <p>\${post.excerpt}</p>
          <a href="/blog/\${post.slug}">Read more</a>
        </article>
      \`).join('')}
    </div>
  \`;
}

function renderBlogPost(post, container) {
  // Implement blog post rendering
  container.innerHTML = \`
    <article class="blog-post">
      <h1>\${post.title}</h1>
      <div class="blog-content">\${post.content}</div>
    </article>
  \`;
}
`;

  const dir = path.join(projectRoot, 'src/features/blog');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(path.join(dir, 'router.js'), blogRouterCode);
}

function createAnalyticsFeature() {
  const analyticsCode = `// src/features/analytics/index.js
export const initAnalytics = () => {
  // Google Analytics example
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: window.location.pathname,
    });
  }
  
  // Track page views
  window.addEventListener('routeChange', (event) => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: event.detail.path,
      });
    }
  });
};
`;

  const dir = path.join(projectRoot, 'src/features/analytics');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(path.join(dir, 'index.js'), analyticsCode);
}

function createEcommerceFeature() {
  // Create basic product components
  const productCode = `// src/features/ecommerce/ProductListing.js
export const ProductListing = (props) => {
  const container = document.createElement('div');
  container.className = 'product-listing';
  
  // Render products
  const products = props.products || [];
  container.innerHTML = \`
    <div class="products-grid">
      \${products.map(product => \`
        <div class="product-card">
          <img src="\${product.image}" alt="\${product.name}">
          <h3>\${product.name}</h3>
          <p class="price">$\${product.price}</p>
          <button class="button">Add to Cart</button>
        </div>
      \`).join('')}
    </div>
  \`;
  
  return {
    getElement: () => container,
    update: (newProps) => {
      // Re-render with new products
      Object.assign(props, newProps);
    },
    destroy: () => {
      container.remove();
    }
  };
};
`;

  const dir = path.join(projectRoot, 'src/features/ecommerce');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(path.join(dir, 'ProductListing.js'), productCode);
}

function createI18nFeature() {
  const i18nCode = `// src/features/i18n/index.js
export const i18n = {
  currentLanguage: 'en',
  translations: {
    en: {
      welcome: 'Welcome',
      about: 'About',
      contact: 'Contact',
    },
    de: {
      welcome: 'Willkommen',
      about: 'Über uns',
      contact: 'Kontakt',
    }
  },
  
  t: (key) => {
    return i18n.translations[i18n.currentLanguage]?.[key] || key;
  },
  
  setLanguage: (lang) => {
    i18n.currentLanguage = lang;
    document.documentElement.lang = lang;
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }));
  }
};
`;

  const dir = path.join(projectRoot, 'src/features/i18n');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(path.join(dir, 'index.js'), i18nCode);
}

async function setupDeployment() {
  switch (config.deployment) {
    case 'railway': {
      // Railway.json already exists
      break;
    }

    case 'vercel': {
      const vercelConfig = {
        version: 2,
        builds: [
          {
            src: 'package.json',
            use: '@vercel/static-build',
            config: {
              distDir: 'dist',
            },
          },
        ],
        routes: [
          {
            src: '/(.*)',
            dest: '/index.html',
          },
        ],
      };

      fs.writeFileSync(
        path.join(projectRoot, 'vercel.json'),
        JSON.stringify(vercelConfig, null, 2)
      );
      break;
    }

    case 'netlify': {
      const netlifyToml = `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
`;

      fs.writeFileSync(path.join(projectRoot, 'netlify.toml'), netlifyToml);
      break;
    }

    default: {
      // No specific deployment config needed
      break;
    }
  }
}

function showNextSteps() {
  console.log(
    chalk.green.bold(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     ✨ Setup Complete!                                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`)
  );

  console.log(chalk.yellow('📋 Next Steps:\n'));

  console.log(chalk.white('1. Start development server:'));
  console.log(chalk.gray('   npm run dev\n'));

  console.log(chalk.white('2. Open Storyblok and create components:'));
  console.log(chalk.gray('   https://app.storyblok.com\n'));

  console.log(chalk.white('3. Import component templates:'));
  console.log(chalk.gray('   See .storyblok/components.json\n'));

  if (config.features.length > 0) {
    console.log(chalk.white('4. Check your features:'));
    config.features.forEach(feature => {
      console.log(chalk.gray(`   ✓ ${feature} in src/features/${feature}/`));
    });
    console.log('');
  }

  console.log(
    chalk.white(`${config.features.length > 0 ? '5' : '4'}. Deploy when ready:`)
  );
  console.log(chalk.gray(`   npm run build`));
  console.log(chalk.gray(`   npm run deploy:${config.deployment}\n`));

  console.log(chalk.cyan('📚 Documentation: ') + chalk.white('docs/'));
  console.log(
    chalk.cyan('💬 Need help? ') +
      chalk.white('https://github.com/your-org/support\n')
  );

  console.log(chalk.green.bold('Happy building! 🚀\n'));
}

// Run the wizard
runWizard().catch(error => {
  console.error(chalk.red('\n❌ Setup failed:'), error);
  process.exit(1);
});
