// scripts/import-demo.js
/**
 * Import complete demo content into Storyblok
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

async function importDemo() {
  console.log(
    chalk.cyan.bold(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🎨 Demo Content Import                                ║
║                                                           ║
║     Creating a complete demo site...                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`)
  );

  const spinner = ora('Loading demo content...').start();

  try {
    // Load demo content
    const demoPath = path.join(projectRoot, '.storyblok/demo-content.json');
    const demoContent = JSON.parse(fs.readFileSync(demoPath, 'utf8'));

    spinner.succeed('Demo content loaded');

    // Import process would go here
    // For now, just show instructions

    console.log(chalk.yellow('\n📋 To import the demo:\n'));
    console.log('1. Run the Storyblok import:');
    console.log(chalk.gray('   npm run import:storyblok\n'));
    console.log('2. The demo includes:');
    console.log('   • Complete homepage with all components');
    console.log('   • Component showcase page');
    console.log('   • Multiple theme examples');
    console.log('   • Working navigation');
    console.log('   • Form examples\n');
    console.log('3. After import, start the dev server:');
    console.log(chalk.gray('   npm run dev\n'));
  } catch (error) {
    spinner.fail('Demo import failed');
    console.error(error);
  }
}

importDemo();
