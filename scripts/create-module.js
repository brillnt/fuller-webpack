// scripts/create-module.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create template with provided class name
function createTemplate(className) {
  return `import { select, selectId } from '../utils/helpers.js';

export default class ${className} {
  constructor(elementId) {
    if (!elementId) return;

    this.element = selectId(elementId);
    this.init();
  }

  init() {
    // Initialize your module here
  }
}`;
}

// Convert dash-case to PascalCase
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Validate module name format
function validateModuleName(name) {
  const validPattern = /^[a-z][a-z0-9-]*$/;
  if (!validPattern.test(name)) {
    return 'Module name must be in dash-case format (e.g., my-module)';
  }
  return true;
}

async function createModule() {
  try {
    // Get module name from command line
    const moduleName = process.argv[2];
    
    if (!moduleName) {
      console.error(chalk.red('Please provide a module name in dash-case format'));
      console.error(chalk.dim('Example: npm run module:new -- my-module'));
      process.exit(1);
    }

    // Validate module name
    const validationResult = validateModuleName(moduleName);
    if (validationResult !== true) {
      console.error(chalk.red(validationResult));
      process.exit(1);
    }

    // Define the output path
    const outputPath = path.resolve(__dirname, '../project/src/modules', `${moduleName}.js`);

    // Check if module already exists
    if (existsSync(outputPath)) {
      console.error(chalk.red(`Module ${moduleName} already exists at ${outputPath}`));
      process.exit(1);
    }

    // Generate the class name and template
    const className = toPascalCase(moduleName);
    const template = createTemplate(className);

    // Create the directory if it doesn't exist
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Write the file
    await fs.writeFile(outputPath, template);

    // Success message
    console.log(chalk.green(`✓ Successfully created module: ${chalk.bold(moduleName)}`));
    console.log(chalk.dim(`  Location: ${outputPath}`));

  } catch (error) {
    console.error(chalk.red('Error creating module:'), error);
    process.exit(1);
  }
}

// Run the module creator
createModule();