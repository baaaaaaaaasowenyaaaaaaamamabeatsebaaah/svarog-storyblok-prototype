// scripts/verify-template.js
/**
 * Verify the template is ready for use
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

function verifyTemplate() {
  console.log(chalk.cyan.bold('\n🔍 Verifying Template\n'));

  const checks = [];

  // Check required files exist
  const requiredFiles = [
    'package.json',
    'README.md',
    '.env.example',
    'src/index.js',
    'src/app.js',
    'webpack.config.js',
  ];

  requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(projectRoot, file));
    checks.push({
      name: `File: ${file}`,
      passed: exists,
      error: exists ? null : 'File missing',
    });
  });

  // Check no development files remain
  const devFiles = ['docker-compose.yml', '.prettierignore', 'CONTRIBUTING.md'];

  devFiles.forEach(file => {
    const exists = fs.existsSync(path.join(projectRoot, file));
    checks.push({
      name: `No dev file: ${file}`,
      passed: !exists,
      error: exists ? 'Development file still exists' : null,
    });
  });

  // Check package.json is clean
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
  );

  checks.push({
    name: 'Clean package.json',
    passed: !packageJson.scripts['test'],
    error: packageJson.scripts['test'] ? 'Test scripts still present' : null,
  });

  // Check for console.logs
  const srcFiles = walkSync(path.join(projectRoot, 'src'), '.js');
  let consoleLogsFound = 0;

  srcFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/console\.(log|warn|info|debug)/g);
    if (matches) {
      consoleLogsFound += matches.length;
    }
  });

  checks.push({
    name: 'No console.logs',
    passed: consoleLogsFound === 0,
    error:
      consoleLogsFound > 0
        ? `Found ${consoleLogsFound} console statements`
        : null,
  });

  // Display results
  console.log(chalk.yellow('Verification Results:\n'));

  let passed = 0;
  let failed = 0;

  checks.forEach(check => {
    if (check.passed) {
      console.log(chalk.green(`  ✅ ${check.name}`));
      passed++;
    } else {
      console.log(chalk.red(`  ❌ ${check.name} - ${check.error}`));
      failed++;
    }
  });

  console.log(chalk.cyan(`\n📊 Summary: ${passed} passed, ${failed} failed\n`));

  if (failed > 0) {
    console.log(chalk.red('❌ Template verification failed!'));
    console.log(chalk.yellow('   Run npm run cleanup to fix issues\n'));
    process.exit(1);
  } else {
    console.log(chalk.green('✅ Template is clean and ready for use!\n'));
  }
}

function walkSync(dir, ext) {
  const files = [];
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...walkSync(fullPath, ext));
    } else if (item.endsWith(ext)) {
      files.push(fullPath);
    }
  });

  return files;
}

verifyTemplate();
