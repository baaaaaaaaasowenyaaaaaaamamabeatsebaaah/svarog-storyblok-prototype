// scripts/generate-docs.js
/**
 * Automated documentation generator
 * Generates documentation from JSDoc comments and component metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { getAllComponentsForShowcase } from '../src/config/components.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Configure marked with syntax highlighting
marked.setOptions({
  highlight: (code, lang) => {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
});

class DocumentationGenerator {
  constructor() {
    this.components = [];
    this.customComponents = [];
    this.features = [];
    this.utils = [];
  }

  async generate() {
    console.log(chalk.cyan.bold('\n📚 Generating Documentation\n'));

    // 1. Scan for components
    await this.scanComponents();

    // 2. Scan for utilities
    await this.scanUtilities();

    // 3. Scan for features
    await this.scanFeatures();

    // 4. Generate component pages
    await this.generateComponentDocs();

    // 5. Generate API documentation
    await this.generateAPIDocs();

    // 6. Generate index page
    await this.generateIndexPage();

    // 7. Generate search index
    await this.generateSearchIndex();

    // 8. Copy static assets
    await this.copyStaticAssets();

    console.log(chalk.green('\n✅ Documentation generated successfully!\n'));
    console.log(chalk.yellow('📁 Output: docs/generated/\n'));
  }

  async scanComponents() {
    console.log(chalk.blue('🔍 Scanning components...'));

    // Get registered components
    this.components = getAllComponentsForShowcase();

    // Scan custom components
    const customDir = path.join(projectRoot, 'src/components/custom');
    if (fs.existsSync(customDir)) {
      const files = fs
        .readdirSync(customDir)
        .filter(f => f.endsWith('.js') && !f.startsWith('.'));

      for (const file of files) {
        const content = fs.readFileSync(path.join(customDir, file), 'utf8');
        const componentInfo = this.parseComponent(content, file);
        if (componentInfo) {
          this.customComponents.push(componentInfo);
        }
      }
    }

    console.log(
      chalk.green(`  ✓ Found ${this.components.length} built-in components`)
    );
    console.log(
      chalk.green(`  ✓ Found ${this.customComponents.length} custom components`)
    );
  }

  parseComponent(content, filename) {
    const componentName = filename.replace('.js', '');

    // Extract JSDoc
    const jsdocMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    const jsdoc = jsdocMatch ? this.parseJSDoc(jsdocMatch[0]) : {};

    // Extract props from JSDoc or code
    const props = this.extractProps(content, jsdoc);

    // Extract examples
    const examples = this.extractExamples(content, jsdoc);

    return {
      name: componentName,
      description: jsdoc.description || 'No description available',
      props,
      examples,
      category: jsdoc.category || 'Custom',
      filename,
    };
  }

  parseJSDoc(jsdocString) {
    const result = {
      description: '',
      params: [],
      returns: '',
      examples: [],
      category: '',
    };

    // Extract description
    const descMatch = jsdocString.match(/\/\*\*\s*\n\s*\*\s*([^@\n]+)/);
    if (descMatch) {
      result.description = descMatch[1].trim();
    }

    // Extract params
    const paramMatches = jsdocString.matchAll(
      /@param\s+{([^}]+)}\s+(\w+)(?:\s+-\s+(.+))?/g
    );
    for (const match of paramMatches) {
      result.params.push({
        type: match[1],
        name: match[2],
        description: match[3] || '',
      });
    }

    // Extract category
    const categoryMatch = jsdocString.match(/@category\s+(.+)/);
    if (categoryMatch) {
      result.category = categoryMatch[1].trim();
    }

    // Extract examples
    const exampleMatches = jsdocString.matchAll(
      /@example\s*\n([\s\S]+?)(?=@|\*\/)/g
    );
    for (const match of exampleMatches) {
      result.examples.push(match[1].trim());
    }

    return result;
  }

  extractProps(content, jsdoc) {
    const props = [];

    // From JSDoc params
    if (jsdoc.params) {
      jsdoc.params.forEach(param => {
        if (param.name === 'props') {
          // Try to extract nested props
          const propsMatch = content.match(/props\.(\w+)/g);
          if (propsMatch) {
            propsMatch.forEach(match => {
              const propName = match.split('.')[1];
              if (!props.find(p => p.name === propName)) {
                props.push({
                  name: propName,
                  type: 'any',
                  description: '',
                  required: false,
                });
              }
            });
          }
        }
      });
    }

    // From destructuring
    const destructureMatch = content.match(/const\s*{([^}]+)}\s*=\s*props/);
    if (destructureMatch) {
      const propNames = destructureMatch[1].split(',').map(p => p.trim());
      propNames.forEach(propName => {
        if (!props.find(p => p.name === propName)) {
          props.push({
            name: propName,
            type: 'any',
            description: '',
            required: false,
          });
        }
      });
    }

    return props;
  }

  extractExamples(content, jsdoc) {
    const examples = [];

    // From JSDoc
    if (jsdoc.examples) {
      examples.push(...jsdoc.examples);
    }

    // From test files
    const testFile = content.replace('.js', '.test.js');
    const testPath = path.join(projectRoot, 'tests/components', testFile);
    if (fs.existsSync(testPath)) {
      const testContent = fs.readFileSync(testPath, 'utf8');
      const testExamples = this.extractTestExamples(testContent);
      examples.push(...testExamples);
    }

    return examples;
  }

  extractTestExamples(testContent) {
    const examples = [];
    const testMatches = testContent.matchAll(
      /test\(['"]([^'"]+)['"],[\s\S]*?{([\s\S]*?)}\)/g
    );

    for (const match of testMatches) {
      const testName = match[1];
      const testBody = match[2];

      // Extract component usage from test
      const usageMatch = testBody.match(
        /const\s+\w+\s*=\s*(\w+)\(([\s\S]*?)\);/
      );
      if (usageMatch) {
        examples.push({
          title: testName,
          code: usageMatch[0],
        });
      }
    }

    return examples;
  }

  async scanUtilities() {
    console.log(chalk.blue('🔍 Scanning utilities...'));

    const utilsDir = path.join(projectRoot, 'src/utils');
    if (fs.existsSync(utilsDir)) {
      await this.scanDirectory(utilsDir, this.utils);
    }

    console.log(chalk.green(`  ✓ Found ${this.utils.length} utilities`));
  }

  async scanFeatures() {
    console.log(chalk.blue('🔍 Scanning features...'));

    const featuresDir = path.join(projectRoot, 'src/features');
    if (fs.existsSync(featuresDir)) {
      const features = fs
        .readdirSync(featuresDir)
        .filter(f => fs.statSync(path.join(featuresDir, f)).isDirectory());

      for (const feature of features) {
        const readme = path.join(featuresDir, feature, 'README.md');
        if (fs.existsSync(readme)) {
          this.features.push({
            name: feature,
            content: fs.readFileSync(readme, 'utf8'),
          });
        }
      }
    }

    console.log(chalk.green(`  ✓ Found ${this.features.length} features`));
  }

  async scanDirectory(dir, results, basePath = '') {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.startsWith('.')) {
        await this.scanDirectory(fullPath, results, path.join(basePath, file));
      } else if (file.endsWith('.js') && !file.includes('.test.')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const info = this.parseUtility(content, file, basePath);
        if (info) {
          results.push(info);
        }
      }
    }
  }

  parseUtility(content, filename, basePath) {
    const jsdocMatches = content.matchAll(
      /\/\*\*[\s\S]*?\*\/\s*export\s+(?:const|function)\s+(\w+)/g
    );
    const functions = [];

    for (const match of jsdocMatches) {
      const jsdoc = this.parseJSDoc(match[0]);
      const functionName = match[1];

      functions.push({
        name: functionName,
        description: jsdoc.description,
        params: jsdoc.params,
        returns: jsdoc.returns,
        examples: jsdoc.examples,
      });
    }

    if (functions.length > 0) {
      return {
        name: filename.replace('.js', ''),
        path: basePath,
        functions,
      };
    }

    return null;
  }

  async generateComponentDocs() {
    console.log(chalk.blue('\n📝 Generating component documentation...'));

    const outputDir = path.join(projectRoot, 'docs/generated/components');
    fs.mkdirSync(outputDir, { recursive: true });

    // Generate built-in component docs
    for (const component of this.components) {
      await this.generateComponentPage(component, outputDir);
    }

    // Generate custom component docs
    for (const component of this.customComponents) {
      await this.generateComponentPage(component, outputDir, true);
    }
  }

  async generateComponentPage(component, outputDir, isCustom = false) {
    const {
      name,
      description,
      props = [],
      examples = [],
      category,
    } = component;

    let content = `# ${name} Component\n\n`;
    content += `**Category:** ${category}${isCustom ? ' (Custom)' : ''}\n\n`;
    content += `${description}\n\n`;

    // Props table
    if (props && props.length > 0) {
      content += `## Props\n\n`;
      content += `| Prop | Type | Required | Description |\n`;
      content += `|------|------|----------|-------------|\n`;

      props.forEach(prop => {
        content += `| ${prop.name} | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | ${prop.description} |\n`;
      });

      content += '\n';
    }

    // Examples
    if (examples && examples.length > 0) {
      content += `## Examples\n\n`;

      examples.forEach((example, index) => {
        if (typeof example === 'string') {
          content += `### Example ${index + 1}\n\n`;
          content += '```javascript\n';
          content += example;
          content += '\n```\n\n';
        } else {
          content += `### ${example.title}\n\n`;
          content += '```javascript\n';
          content += example.code;
          content += '\n```\n\n';
        }
      });
    }

    // Storyblok usage
    if (!isCustom) {
      content += `## Storyblok Usage\n\n`;
      content += `In Storyblok, use the component type: \`${component.cmsType}\`\n\n`;

      if (component.schema) {
        content += `### Schema\n\n`;
        content += '```json\n';
        content += JSON.stringify(component.schema, null, 2);
        content += '\n```\n\n';
      }
    }

    // Write markdown file
    const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.md`;
    fs.writeFileSync(path.join(outputDir, filename), content);

    // Generate HTML version
    const html = this.generateHTMLPage(content, name);
    fs.writeFileSync(
      path.join(outputDir, filename.replace('.md', '.html')),
      html
    );
  }

  generateHTMLPage(markdown, title) {
    const content = marked(markdown);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Svarog-UI Documentation</title>
  <link rel="stylesheet" href="../assets/styles.css">
  <link rel="stylesheet" href="../assets/highlight.css">
</head>
<body>
  <nav class="sidebar">
    <h3>Documentation</h3>
    <ul>
      <li><a href="../index.html">Home</a></li>
      <li><a href="../components.html">Components</a></li>
      <li><a href="../api.html">API Reference</a></li>
      <li><a href="../features.html">Features</a></li>
    </ul>
  </nav>
  <main class="content">
    <div class="container">
      ${content}
    </div>
  </main>
  <script src="../assets/search.js"></script>
</body>
</html>`;
  }

  async generateAPIDocs() {
    console.log(chalk.blue('📝 Generating API documentation...'));

    const outputDir = path.join(projectRoot, 'docs/generated');

    let content = '# API Reference\n\n';

    // Group utilities by path
    const grouped = this.utils.reduce((acc, util) => {
      const key = util.path || 'root';
      if (!acc[key]) acc[key] = [];
      acc[key].push(util);
      return acc;
    }, {});

    // Generate content for each group
    Object.entries(grouped).forEach(([path, utils]) => {
      content += `## ${path === 'root' ? 'Core Utilities' : path}\n\n`;

      utils.forEach(util => {
        content += `### ${util.name}\n\n`;

        util.functions.forEach(func => {
          content += `#### \`${func.name}()\`\n\n`;
          content += `${func.description}\n\n`;

          if (func.params.length > 0) {
            content += '**Parameters:**\n\n';
            func.params.forEach(param => {
              content += `- \`${param.name}\` (${param.type}) - ${param.description}\n`;
            });
            content += '\n';
          }

          if (func.returns) {
            content += `**Returns:** ${func.returns}\n\n`;
          }

          if (func.examples.length > 0) {
            content += '**Example:**\n\n';
            content += '```javascript\n';
            content += func.examples[0];
            content += '\n```\n\n';
          }
        });
      });
    });

    // Write files
    fs.writeFileSync(path.join(outputDir, 'api.md'), content);
    const html = this.generateHTMLPage(content, 'API Reference');
    fs.writeFileSync(path.join(outputDir, 'api.html'), html);
  }

  async generateIndexPage() {
    console.log(chalk.blue('📝 Generating index page...'));

    const outputDir = path.join(projectRoot, 'docs/generated');

    let content = `# Svarog-UI + Storyblok Documentation\n\n`;
    content += `Welcome to the comprehensive documentation for your Svarog-UI + Storyblok integration.\n\n`;

    content += `## Quick Links\n\n`;
    content += `- [Getting Started](../README.md)\n`;
    content += `- [Components](components.html)\n`;
    content += `- [API Reference](api.html)\n`;
    content += `- [Features](features.html)\n`;
    content += `- [Customization Guide](../CUSTOMIZATION.md)\n\n`;

    content += `## Component Categories\n\n`;

    // Group components by category
    const categories = {};
    this.components.forEach(comp => {
      if (!categories[comp.category]) categories[comp.category] = [];
      categories[comp.category].push(comp);
    });

    Object.entries(categories).forEach(([category, components]) => {
      content += `### ${category}\n\n`;
      components.forEach(comp => {
        const filename = `${comp.svarogType.toLowerCase().replace(/\s+/g, '-')}.html`;
        content += `- [${comp.svarogType}](components/${filename}) - ${comp.cmsType}\n`;
      });
      content += '\n';
    });

    if (this.customComponents.length > 0) {
      content += `### Custom Components\n\n`;
      this.customComponents.forEach(comp => {
        const filename = `${comp.name.toLowerCase().replace(/\s+/g, '-')}.html`;
        content += `- [${comp.name}](components/${filename})\n`;
      });
      content += '\n';
    }

    // Write files
    fs.writeFileSync(path.join(outputDir, 'index.md'), content);
    const html = this.generateHTMLPage(content, 'Documentation Home');
    fs.writeFileSync(path.join(outputDir, 'index.html'), html);
  }

  async generateSearchIndex() {
    console.log(chalk.blue('🔍 Generating search index...'));

    const searchIndex = {
      components: [],
      utilities: [],
      features: [],
    };

    // Index components
    [...this.components, ...this.customComponents].forEach(comp => {
      searchIndex.components.push({
        name: comp.name || comp.svarogType,
        description: comp.description || '',
        category: comp.category,
        url: `components/${(comp.name || comp.svarogType).toLowerCase().replace(/\s+/g, '-')}.html`,
      });
    });

    // Index utilities
    this.utils.forEach(util => {
      util.functions.forEach(func => {
        searchIndex.utilities.push({
          name: func.name,
          description: func.description,
          category: util.path || 'Core',
          url: `api.html#${func.name}`,
        });
      });
    });

    // Write search index
    const outputDir = path.join(projectRoot, 'docs/generated/assets');
    fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(
      path.join(outputDir, 'search-index.json'),
      JSON.stringify(searchIndex, null, 2)
    );
  }

  async copyStaticAssets() {
    console.log(chalk.blue('📁 Copying static assets...'));

    const assetsDir = path.join(projectRoot, 'docs/generated/assets');
    fs.mkdirSync(assetsDir, { recursive: true });

    // Create CSS file
    const css = `
/* Documentation Styles */
:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-bg: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-text: #333333;
  --color-border: #dee2e6;
  --font-mono: 'Fira Code', Monaco, Consolas, monospace;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  padding: 2rem;
  overflow-y: auto;
}

.sidebar h3 {
  margin: 0 0 1rem 0;
  color: var(--color-primary);
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  margin: 0.5rem 0;
}

.sidebar a {
  color: var(--color-text);
  text-decoration: none;
  transition: color 0.2s;
}

.sidebar a:hover {
  color: var(--color-primary);
}

.content {
  margin-left: 250px;
  min-height: 100vh;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

h1, h2, h3, h4, h5, h6 {
  margin: 2rem 0 1rem;
  line-height: 1.2;
}

h1 {
  font-size: 2.5rem;
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 0.5rem;
}

h2 {
  font-size: 2rem;
  margin-top: 3rem;
}

h3 {
  font-size: 1.5rem;
}

code {
  font-family: var(--font-mono);
  background: var(--color-bg-secondary);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

pre {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 5px;
  padding: 1rem;
  overflow-x: auto;
}

pre code {
  background: none;
  padding: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

th {
  background: var(--color-bg-secondary);
  font-weight: 600;
}

blockquote {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background: var(--color-bg-secondary);
  border-left: 4px solid var(--color-primary);
}

/* Search */
.search-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

.search-input {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  width: 300px;
  font-size: 1rem;
}

.search-results {
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-height: 500px;
  overflow-y: auto;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-top: 0.5rem;
  display: none;
}

.search-results.active {
  display: block;
}

.search-result {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.2s;
}

.search-result:hover {
  background: var(--color-bg-secondary);
}

.search-result-title {
  font-weight: 600;
  color: var(--color-primary);
}

.search-result-category {
  font-size: 0.875rem;
  color: var(--color-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .content {
    margin-left: 0;
  }
}
`;

    fs.writeFileSync(path.join(assetsDir, 'styles.css'), css);

    // Create search JS
    const searchJS = `
// Documentation Search
document.addEventListener('DOMContentLoaded', () => {
  // Create search UI
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  searchContainer.innerHTML = \`
    <input type="text" class="search-input" placeholder="Search documentation...">
    <div class="search-results"></div>
  \`;
  
  document.body.appendChild(searchContainer);
  
  const searchInput = searchContainer.querySelector('.search-input');
  const searchResults = searchContainer.querySelector('.search-results');
  
  let searchIndex = null;
  
  // Load search index
  fetch('../assets/search-index.json')
    .then(res => res.json())
    .then(data => {
      searchIndex = data;
    });
  
  // Search functionality
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    if (!query || !searchIndex) {
      searchResults.classList.remove('active');
      return;
    }
    
    const results = [];
    
    // Search components
    searchIndex.components.forEach(item => {
      if (item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)) {
        results.push({
          ...item,
          type: 'Component'
        });
      }
    });
    
    // Search utilities
    searchIndex.utilities.forEach(item => {
      if (item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)) {
        results.push({
          ...item,
          type: 'Utility'
        });
      }
    });
    
    // Display results
    if (results.length > 0) {
      searchResults.innerHTML = results.map(result => \`
        <div class="search-result" onclick="window.location.href='../\${result.url}'">
          <div class="search-result-title">\${result.name}</div>
          <div class="search-result-category">\${result.type} - \${result.category}</div>
        </div>
      \`).join('');
      
      searchResults.classList.add('active');
    } else {
      searchResults.innerHTML = '<div class="search-result">No results found</div>';
      searchResults.classList.add('active');
    }
  });
  
  // Close search on outside click
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target)) {
      searchResults.classList.remove('active');
    }
  });
});
`;

    fs.writeFileSync(path.join(assetsDir, 'search.js'), searchJS);

    // Copy highlight.js theme
    const highlightCSS = `
/* Highlight.js GitHub Theme */
.hljs {
  display: block;
  overflow-x: auto;
  padding: 0.5em;
  color: #333;
  background: #f8f8f8;
}

.hljs-comment,
.hljs-quote {
  color: #998;
  font-style: italic;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-subst {
  color: #333;
  font-weight: bold;
}

.hljs-number,
.hljs-literal,
.hljs-variable,
.hljs-template-variable,
.hljs-tag .hljs-attr {
  color: #008080;
}

.hljs-string,
.hljs-doctag {
  color: #d14;
}

.hljs-title,
.hljs-section,
.hljs-selector-id {
  color: #900;
  font-weight: bold;
}

.hljs-subst {
  font-weight: normal;
}

.hljs-type,
.hljs-class .hljs-title {
  color: #458;
  font-weight: bold;
}

.hljs-tag,
.hljs-name,
.hljs-attribute {
  color: #000080;
  font-weight: normal;
}

.hljs-regexp,
.hljs-link {
  color: #009926;
}

.hljs-symbol,
.hljs-bullet {
  color: #990073;
}

.hljs-built_in,
.hljs-builtin-name {
  color: #0086b3;
}

.hljs-meta {
  color: #999;
  font-weight: bold;
}

.hljs-deletion {
  background: #fdd;
}

.hljs-addition {
  background: #dfd;
}

.hljs-emphasis {
  font-style: italic;
}

.hljs-strong {
  font-weight: bold;
}
`;

    fs.writeFileSync(path.join(assetsDir, 'highlight.css'), highlightCSS);
  }
}

// Run the generator
const generator = new DocumentationGenerator();
generator.generate().catch(console.error);
