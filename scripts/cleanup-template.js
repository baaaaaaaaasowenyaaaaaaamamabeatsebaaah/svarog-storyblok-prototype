// scripts/cleanup-template.js
/**
 * Cleanup script to prepare the template for production use
 * Removes development files, examples, and unnecessary code
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Files and directories to remove
const TO_REMOVE = {
  // Development files
  files: [
    'docker-compose.yml', // Empty file
    '.prettierignore',
    '.eslintignore',
    'CONTRIBUTING.md',
    'CHANGELOG.md',
    '.github/workflows/*',
    'scripts/setup-example.js', // Old setup script
    'scripts/storyblok-setup.js', // Old setup script
  ],

  // Development directories
  directories: [
    '.github',
    'coverage',
    '.nyc_output',
    'docs/generated', // Generated docs
    'node_modules/.cache',
    '.parcel-cache',
    'dist', // Build artifacts
    'build',
    '.next',
    '.nuxt',
    'out',
  ],

  // Test files (optional removal)
  testFiles: [
    '**/*.test.js',
    '**/*.spec.js',
    '**/__tests__/**',
    '**/__mocks__/**',
    'tests/setup.js',
    'vitest.config.js',
  ],

  // Example/demo files
  exampleFiles: [
    'src/components/examples/**/*',
    'docs/examples/**/*',
    '.storyblok/stories/**/*', // Keep components.json
  ],

  // Debug files
  debugFiles: ['src/utils/debug/**/*', '**/*.map', '**/*.log'],
};

// Files to clean up (remove comments and console.logs)
const FILES_TO_CLEAN = [
  'src/**/*.js',
  '!src/**/*.test.js',
  '!src/**/*.spec.js',
];

// Configuration options
const config = {
  removeTests: false,
  removeExamples: true,
  removeDebug: true,
  removeComments: true,
  removeConsoleLogs: true,
  minify: false,
};

async function runCleanup() {
  console.log(
    chalk.cyan.bold(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🧹 Template Cleanup Script                            ║
║                                                           ║
║     Preparing your template for production use...         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`)
  );

  // Ask for confirmation
  console.log(
    chalk.yellow(
      '\n⚠️  This will remove development files and clean up the codebase.\n'
    )
  );
  console.log('The following will be removed:');
  console.log('  • Development configuration files');
  console.log('  • Example components and stories');
  console.log('  • Debug utilities');
  console.log('  • Console.log statements');
  console.log('  • Extensive comments\n');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise(resolve => {
    readline.question(chalk.yellow('Continue with cleanup? (y/N): '), resolve);
  });

  readline.close();

  if (answer.toLowerCase() !== 'y') {
    console.log(chalk.red('\n❌ Cleanup cancelled'));
    process.exit(0);
  }

  console.log(chalk.cyan('\n🔧 Starting cleanup...\n'));

  // 1. Remove files
  await removeFiles();

  // 2. Remove directories
  await removeDirectories();

  // 3. Clean up code files
  await cleanupCodeFiles();

  // 4. Update package.json
  await updatePackageJson();

  // 5. Create production README
  await createProductionReadme();

  // 6. Optimize assets
  await optimizeAssets();

  // 7. Final verification
  await verifyCleanup();

  console.log(
    chalk.green.bold('\n✨ Cleanup complete! Your template is ready for use.\n')
  );

  showNextSteps();
}

async function removeFiles() {
  const spinner = ora('Removing development files...').start();

  let removed = 0;

  // Remove specific files
  for (const file of TO_REMOVE.files) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      removed++;
    }
  }

  // Remove test files (if enabled)
  if (config.removeTests) {
    const { globSync } = await import('glob');
    for (const pattern of TO_REMOVE.testFiles) {
      const files = globSync(pattern, { cwd: projectRoot });
      for (const file of files) {
        fs.unlinkSync(path.join(projectRoot, file));
        removed++;
      }
    }
  }

  // Remove example files
  if (config.removeExamples) {
    const { globSync } = await import('glob');
    for (const pattern of TO_REMOVE.exampleFiles) {
      const files = globSync(pattern, { cwd: projectRoot });
      for (const file of files) {
        fs.unlinkSync(path.join(projectRoot, file));
        removed++;
      }
    }
  }

  // Remove debug files
  if (config.removeDebug) {
    const { globSync } = await import('glob');
    for (const pattern of TO_REMOVE.debugFiles) {
      const files = globSync(pattern, { cwd: projectRoot });
      for (const file of files) {
        fs.unlinkSync(path.join(projectRoot, file));
        removed++;
      }
    }
  }

  spinner.succeed(`Removed ${removed} development files`);
}

async function removeDirectories() {
  const spinner = ora('Removing development directories...').start();

  let removed = 0;

  for (const dir of TO_REMOVE.directories) {
    const dirPath = path.join(projectRoot, dir);
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      removed++;
    }
  }

  spinner.succeed(`Removed ${removed} development directories`);
}

async function cleanupCodeFiles() {
  const spinner = ora('Cleaning up code files...').start();

  const { globSync } = await import('glob');
  const files = globSync(FILES_TO_CLEAN[0], {
    cwd: projectRoot,
    ignore: FILES_TO_CLEAN.slice(1).map(p => p.replace('!', '')),
  });

  let cleaned = 0;

  for (const file of files) {
    const filePath = path.join(projectRoot, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Remove console.log statements
    if (config.removeConsoleLogs) {
      content = removeConsoleLogs(content);
    }

    // Remove extensive comments
    if (config.removeComments) {
      content = removeExcessiveComments(content);
    }

    // Remove development-only code
    content = removeDevelopmentCode(content);

    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      cleaned++;
    }
  }

  spinner.succeed(`Cleaned ${cleaned} code files`);
}

function removeConsoleLogs(content) {
  // Remove console.log, console.warn, console.info, console.debug
  // But keep console.error
  return content
    .replace(/console\.(log|warn|info|debug)\([^)]*\);?\n?/g, '')
    .replace(/console\.(log|warn|info|debug)\([^{]*{[^}]*}\);?\n?/g, '');
}

function removeExcessiveComments(content) {
  // Keep JSDoc comments but remove verbose inline comments
  return (
    content
      // Remove single-line comments that are just explanations
      .replace(/\/\/ [A-Z][^@\n]{50,}\n/g, '')
      // Remove comment blocks that aren't JSDoc
      .replace(/\/\*[^*][\s\S]*?\*\/\n?/g, match => {
        if (match.includes('/**') || match.includes('@')) {
          return match; // Keep JSDoc
        }
        return '';
      })
      // Remove trailing comments
      .replace(/\s*\/\/ .{20,}$/gm, '')
  );
}

function removeDevelopmentCode(content) {
  // Remove development-only blocks
  return (
    content
      // Remove isDevelopment blocks
      .replace(/if\s*\(isDevelopment\(\)\)\s*{[\s\S]*?}\n?/g, '')
      // Remove development indicators
      .replace(/.*development\s+mode\s+indicator.*\n?/gi, '')
      // Remove debug utilities
      .replace(/window\.app\s*=\s*app;?\n?/g, '')
      .replace(/window\.\w+\s*=\s*\w+;?\s*\/\/\s*debug/gi, '')
  );
}

async function updatePackageJson() {
  const spinner = ora('Updating package.json...').start();

  const packagePath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Update metadata
  packageJson.name = 'my-svarog-storyblok-site';
  packageJson.version = '1.0.0';
  packageJson.description = 'Website built with Svarog-UI and Storyblok';
  packageJson.author = '';
  packageJson.license = 'MIT';

  // Remove development scripts
  const scriptsToKeep = [
    'dev',
    'build',
    'start',
    'preview',
    'setup',
    'create:component',
    'import:storyblok',
  ];

  const newScripts = {};
  scriptsToKeep.forEach(script => {
    if (packageJson.scripts[script]) {
      newScripts[script] = packageJson.scripts[script];
    }
  });
  packageJson.scripts = newScripts;

  // Remove test dependencies
  if (config.removeTests) {
    delete packageJson.devDependencies['vitest'];
    delete packageJson.devDependencies['@vitest/coverage-v8'];
    delete packageJson.devDependencies['@vitest/ui'];
    delete packageJson.devDependencies['happy-dom'];
    delete packageJson.devDependencies['jsdom'];
  }

  // Remove documentation dependencies
  delete packageJson.devDependencies['marked'];
  delete packageJson.devDependencies['highlight.js'];
  delete packageJson.devDependencies['nodemon'];

  // Clean up other fields
  delete packageJson.bugs;
  delete packageJson.homepage;
  delete packageJson.repository;

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

  spinner.succeed('Updated package.json');
}

async function createProductionReadme() {
  const spinner = ora('Creating production README...').start();

  const readmeContent = `# ${config.projectName || 'My Svarog-UI + Storyblok Website'}

Built with [Svarog-UI](https://npmjs.com/package/svarog-ui) and [Storyblok CMS](https://storyblok.com).

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## 📝 Configuration

1. Copy \`.env.example\` to \`.env\`
2. Add your Storyblok preview token
3. Configure your Storyblok space

## 🛠️ Development

### Create a new component
\`\`\`bash
npm run create:component MyComponent
\`\`\`

### Import Storyblok components
\`\`\`bash
npm run import:storyblok
\`\`\`

## 📦 Deployment

### Railway
\`\`\`bash
railway up
\`\`\`

### Vercel
\`\`\`bash
vercel --prod
\`\`\`

### Netlify
\`\`\`bash
netlify deploy --prod
\`\`\`

## 📄 License

MIT
`;

  fs.writeFileSync(path.join(projectRoot, 'README.md'), readmeContent);

  spinner.succeed('Created production README');
}

async function optimizeAssets() {
  const spinner = ora('Optimizing assets...').start();

  // Remove unused images
  const publicDir = path.join(projectRoot, 'public');
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    files.forEach(file => {
      // Keep only essential files
      if (
        !['favicon.svg', 'robots.txt', 'offline.html', 'sw.js'].includes(file)
      ) {
        const filePath = path.join(publicDir, file);
        if (fs.statSync(filePath).isFile() && file.startsWith('example-')) {
          fs.unlinkSync(filePath);
        }
      }
    });
  }

  spinner.succeed('Optimized assets');
}

async function verifyCleanup() {
  const spinner = ora('Verifying cleanup...').start();

  // Check file sizes
  const checkSize = dir => {
    const { execSync } = require('child_process');
    try {
      const size = execSync(`du -sh ${dir} 2>/dev/null || echo "0"`, {
        encoding: 'utf8',
      });
      return size.trim();
    } catch {
      return 'N/A';
    }
  };

  const srcSize = checkSize(path.join(projectRoot, 'src'));
  const totalSize = checkSize(projectRoot);

  spinner.succeed('Cleanup verified');

  console.log(chalk.cyan('\n📊 Cleanup Summary:'));
  console.log(`   Source code size: ${srcSize}`);
  console.log(`   Total project size: ${totalSize}`);
}

function showNextSteps() {
  console.log(chalk.yellow('📋 Next Steps:\n'));
  console.log('1. Review the cleaned codebase');
  console.log('2. Test that everything still works:');
  console.log(chalk.gray('   npm run dev'));
  console.log('3. Commit the cleaned template:');
  console.log(chalk.gray('   git add .'));
  console.log(
    chalk.gray('   git commit -m "Clean template for production use"')
  );
  console.log('4. Use as a template for new projects!');
  console.log(
    chalk.cyan('\n🎉 Your template is now clean and ready for use!\n')
  );
}

// Run the cleanup
runCleanup().catch(error => {
  console.error(chalk.red('\n❌ Cleanup failed:'), error);
  process.exit(1);
});
