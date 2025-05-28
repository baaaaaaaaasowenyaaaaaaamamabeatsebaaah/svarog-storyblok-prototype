// scripts/doc-templates.js
/**
 * Documentation templates for different component types
 */

export const componentTemplate = ({
  name,
  description,
  props,
  examples,
  storyblokUsage,
  relatedComponents,
}) => `
# ${name}

${description}

## Import

\`\`\`javascript
import { ${name} } from 'svarog-ui';
\`\`\`

## Basic Usage

\`\`\`javascript
${examples[0]?.code || `const ${name.toLowerCase()} = ${name}({ /* props */ });`}
\`\`\`

## Props

${generatePropsTable(props)}

## Examples

${examples.map(ex => generateExample(ex)).join('\n\n')}

${storyblokUsage ? `## Storyblok Integration\n\n${storyblokUsage}` : ''}

${relatedComponents ? `## Related Components\n\n${relatedComponents.map(c => `- [${c}](${c.toLowerCase()}.html)`).join('\n')}` : ''}
`;

export const apiTemplate = ({ name, description, functions }) => `
# ${name} API

${description}

## Functions

${functions.map(func => generateFunctionDoc(func)).join('\n\n')}
`;

export const featureTemplate = ({
  name,
  description,
  setup,
  usage,
  configuration,
}) => `
# ${name} Feature

${description}

## Setup

${setup}

## Usage

${usage}

## Configuration

${configuration}
`;

function generatePropsTable(props) {
  if (!props || props.length === 0) {
    return 'This component has no props.';
  }

  let table = '| Prop | Type | Default | Required | Description |\n';
  table += '|------|------|---------|----------|-------------|\n';

  props.forEach(prop => {
    table += `| ${prop.name} | \`${prop.type}\` | ${prop.default || '-'} | ${prop.required ? '✓' : ''} | ${prop.description} |\n`;
  });

  return table;
}

function generateExample(example) {
  return `### ${example.title}

${example.description || ''}

\`\`\`javascript
${example.code}
\`\`\`

${example.demo ? `[Live Demo](${example.demo})` : ''}
`;
}

function generateFunctionDoc(func) {
  return `### \`${func.signature || `${func.name}()`}\`

${func.description}

${func.params ? `**Parameters:**\n\n${generateParams(func.params)}` : ''}

${func.returns ? `**Returns:** \`${func.returns.type}\` - ${func.returns.description}` : ''}

${func.examples ? `**Example:**\n\n\`\`\`javascript\n${func.examples[0]}\n\`\`\`` : ''}

${func.throws ? `**Throws:** ${func.throws}` : ''}
`;
}

function generateParams(params) {
  return params
    .map(
      param =>
        `- \`${param.name}\` (${param.type})${param.optional ? ' _optional_' : ''} - ${param.description}`
    )
    .join('\n');
}
