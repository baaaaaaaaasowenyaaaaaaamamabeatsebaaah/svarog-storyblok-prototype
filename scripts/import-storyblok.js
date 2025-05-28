// scripts/import-storyblok.js
/**
 * Import components and stories into Storyblok
 * Helps users quickly set up their Storyblok space
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import StoryblokClient from 'storyblok-js-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Load environment variables
const envPath = path.join(projectRoot, '.env');
if (!fs.existsSync(envPath)) {
  console.error(chalk.red('❌ .env file not found. Run setup first.'));
  process.exit(1);
}

// Parse .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const STORYBLOK_TOKEN = envVars.VITE_STORYBLOK_TOKEN;
const STORYBLOK_SPACE_ID = envVars.VITE_STORYBLOK_SPACE_ID;

if (!STORYBLOK_TOKEN || STORYBLOK_TOKEN === 'your_preview_token_here') {
  console.error(chalk.red('❌ Valid Storyblok token not found in .env'));
  process.exit(1);
}

// Initialize Storyblok Management API client
const Storyblok = new StoryblokClient({
  oauthToken: STORYBLOK_TOKEN, // This needs to be a management API token
});

async function importComponents() {
  console.log(chalk.cyan.bold('\n🚀 Storyblok Component Import\n'));

  const spinner = ora('Loading component definitions...').start();

  try {
    // Load component definitions
    const componentsPath = path.join(projectRoot, '.storyblok/components.json');
    const componentsData = JSON.parse(fs.readFileSync(componentsPath, 'utf8'));

    spinner.succeed('Component definitions loaded');

    console.log(
      chalk.yellow(
        `\nFound ${componentsData.components.length} components to import\n`
      )
    );

    // Import each component
    for (const component of componentsData.components) {
      const componentSpinner = ora(
        `Importing ${component.display_name}...`
      ).start();

      try {
        // Check if component already exists
        const existing = await checkComponentExists(component.name);

        if (existing) {
          componentSpinner.warn(
            `${component.display_name} already exists - skipping`
          );
        } else {
          // Create component
          await createComponent(component);
          componentSpinner.succeed(`${component.display_name} imported`);
        }
      } catch (error) {
        componentSpinner.fail(
          `Failed to import ${component.display_name}: ${error.message}`
        );
      }
    }

    console.log(chalk.green('\n✅ Component import complete!\n'));

    // Create example stories
    const createStories = await askQuestion('Create example stories? (Y/n): ');
    if (createStories.toLowerCase() !== 'n') {
      await createExampleStories();
    }
  } catch (error) {
    spinner.fail('Import failed');
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}

async function checkComponentExists(name) {
  try {
    const response = await Storyblok.get(
      `spaces/${STORYBLOK_SPACE_ID}/components`,
      {
        search: name,
      }
    );

    return response.data.components.some(c => c.name === name);
  } catch {
    return false;
  }
}

async function createComponent(component) {
  try {
    await Storyblok.post(`spaces/${STORYBLOK_SPACE_ID}/components`, {
      component: {
        name: component.name,
        display_name: component.display_name,
        schema: component.schema,
        is_root: component.is_root || false,
        is_nestable: component.is_nestable !== false,
        preview_field: component.preview_field,
      },
    });
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
}

async function createExampleStories() {
  console.log(chalk.cyan('\n📄 Creating Example Stories\n'));

  const stories = [
    {
      name: 'Home',
      slug: 'home',
      content: {
        component: 'page',
        body: [
          {
            component: 'hero_section',
            title: 'Welcome to Your New Website',
            subtitle:
              'Built with Svarog-UI and Storyblok - The perfect combination for modern web development',
            theme: 'default',
            cta_button: [
              {
                component: 'button',
                text: 'Get Started',
                url: '#features',
                variant: 'primary',
                size: 'large',
              },
            ],
          },
          {
            component: 'section',
            variant: 'default',
            padding: 'large',
            children: [
              {
                component: 'text_block',
                content: {
                  type: 'doc',
                  content: [
                    {
                      type: 'heading',
                      attrs: { level: 2 },
                      content: [
                        { type: 'text', text: 'Why Choose This Stack?' },
                      ],
                    },
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Combine the power of Svarog-UI components with Storyblok CMS for a perfect development experience.',
                        },
                      ],
                    },
                  ],
                },
                alignment: 'center',
              },
              {
                component: 'grid',
                columns: 12,
                gap: 'medium',
                children: [
                  {
                    component: 'card',
                    title: 'Easy to Use',
                    content:
                      'Get started in minutes with our intuitive setup wizard and pre-built components.',
                    variant: 'elevated',
                  },
                  {
                    component: 'card',
                    title: 'Fully Customizable',
                    content:
                      'Extend and customize every aspect of your website with clean, modular code.',
                    variant: 'elevated',
                  },
                  {
                    component: 'card',
                    title: 'Production Ready',
                    content:
                      'Built-in performance optimizations, SEO, and deployment configurations.',
                    variant: 'elevated',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      name: 'About',
      slug: 'about',
      content: {
        component: 'page',
        body: [
          {
            component: 'hero_section',
            title: 'About Us',
            subtitle: 'Learn more about our story',
            theme: 'cabalou',
          },
          {
            component: 'section',
            padding: 'large',
            children: [
              {
                component: 'text_block',
                content: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'This is an example about page. Replace this content with your own story.',
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    },
  ];

  for (const story of stories) {
    const spinner = ora(`Creating ${story.name} story...`).start();

    try {
      await Storyblok.post(`spaces/${STORYBLOK_SPACE_ID}/stories`, {
        story: {
          name: story.name,
          slug: story.slug,
          content: story.content,
          is_startpage: story.slug === 'home',
        },
      });

      spinner.succeed(`${story.name} story created`);
    } catch (error) {
      if (error.response?.status === 422) {
        spinner.warn(`${story.name} story already exists`);
      } else {
        spinner.fail(`Failed to create ${story.name}: ${error.message}`);
      }
    }
  }
}

function askQuestion(question) {
  return new Promise(resolve => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question(chalk.yellow(question), answer => {
      readline.close();
      resolve(answer);
    });
  });
}

// Show instructions
console.log(
  chalk.cyan.bold(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     📦 Storyblok Component Import Tool                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`)
);

console.log(
  chalk.yellow('⚠️  Important: This requires a Management API token\n')
);
console.log('To get a Management API token:');
console.log('1. Go to https://app.storyblok.com');
console.log('2. Click on your avatar → "My Account"');
console.log('3. Go to "Account Settings" → "Personal Access Tokens"');
console.log('4. Generate a new token with component write access\n');

console.log(chalk.red('🔒 Security Note:'));
console.log(
  'The preview token in your .env file may not have write permissions.'
);
console.log(
  'You might need to temporarily update VITE_STORYBLOK_TOKEN with a management token.\n'
);

const proceed = await askQuestion('Continue with import? (Y/n): ');

if (proceed.toLowerCase() !== 'n') {
  importComponents();
} else {
  console.log(chalk.red('\nImport cancelled'));
  process.exit(0);
}
