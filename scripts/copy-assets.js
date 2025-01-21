import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cssSourceDirectories = [
  '../site/export/brillnt/css',
  '../site/export/css'
];

const jsSourceDirectories = [
  '../site/export/js'
];

const targetDirectory = '../site/shopify/assets';
const prefix = 'br_';

async function copyFiles() {
  try {
    let allFiles = [];

    // Get CSS files
    for (const dir of cssSourceDirectories) {
      const sourcePath = path.resolve(__dirname, dir);
      if (await fs.pathExists(sourcePath)) {
        const files = await fs.readdir(sourcePath);
        allFiles.push(...files
          .filter(file => file.endsWith('.css'))
          .map(file => ({ file, sourcePath, type: 'CSS' }))
        );
      } else {
        console.warn(chalk.yellow(`Warning: CSS directory not found: ${sourcePath}`));
      }
    }

    // Get JS files
    for (const dir of jsSourceDirectories) {
      const sourcePath = path.resolve(__dirname, dir);
      if (await fs.pathExists(sourcePath)) {
        const files = await fs.readdir(sourcePath);
        allFiles.push(...files
          .filter(file => file.endsWith('.js'))
          .map(file => ({ file, sourcePath, type: 'JS' }))
        );
      } else {
        console.warn(chalk.yellow(`Warning: JS directory not found: ${sourcePath}`));
      }
    }

    if (allFiles.length === 0) {
      console.log(chalk.yellow('No CSS or JS files found in source directories.'));
      return;
    }

    // Check target directory
    const targetPath = path.resolve(__dirname, targetDirectory);
    if (!(await fs.pathExists(targetPath))) {
      console.error(chalk.red(`Target directory does not exist: ${targetPath}`));
      return;
    }

    // Check for existing files and get confirmation if needed
    const existingFiles = [];
    for (const { file } of allFiles) {
      const targetFile = path.join(targetPath, `${prefix}${file}`);
      if (await fs.pathExists(targetFile)) {
        existingFiles.push(file);
      }
    }

    if (existingFiles.length > 0) {
      console.log(chalk.yellow('\nThe following files already exist in the target directory:'));
      existingFiles.forEach(file => console.log(chalk.dim(`- ${prefix}${file}`)));

      const { proceed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: 'Do you want to overwrite these files?',
        default: false
      }]);

      if (!proceed) {
        console.log(chalk.yellow('Operation cancelled.'));
        return;
      }
    }

    // Copy files with prefix
    const cssCount = allFiles.filter(f => f.type === 'CSS').length;
    const jsCount = allFiles.filter(f => f.type === 'JS').length;

    for (const { file, sourcePath, type } of allFiles) {
      const sourceFile = path.join(sourcePath, file);
      const targetFile = path.join(targetPath, `${prefix}${file}`);
      await fs.copy(sourceFile, targetFile);
      console.log(chalk.green(`✓ Copied ${type}: ${file} → ${prefix}${file}`));
    }

    console.log(chalk.green(`\nSuccess! Copied ${cssCount} CSS files and ${jsCount} JS files to ${targetPath}`));

  } catch (error) {
    console.error(chalk.red('Error copying files:'), error);
    process.exit(1);
  }
}

copyFiles();
