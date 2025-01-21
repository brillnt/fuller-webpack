import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';

async function loadBackup(archiveName) {
  const rootDir = process.cwd();
  const archivePath = path.join(rootDir, 'site', 'archives', `${archiveName}`);
  const exportPath = path.join(rootDir, 'site', 'export');

  try {
    // Check if archive exists
    await fs.access(archivePath);
  } catch (error) {
    console.error(`Archive not found: ${archivePath}`);
    process.exit(1);
  }

  try {
    const zip = new AdmZip(archivePath);
    
    // Extract all files
    zip.getEntries().forEach((entry) => {
      if (!entry.isDirectory) {
        const entryPath = path.join(exportPath, entry.entryName);
        const entryDir = path.dirname(entryPath);
        
        // Ensure the directory exists
        fs.mkdir(entryDir, { recursive: true }).then(() => {
          // Write the file
          fs.writeFile(entryPath, entry.getData());
          console.log(`Extracted: ${entryPath}`);
        });
      }
    });

    console.log(`Backup loaded successfully from: ${archiveName}`);
  } catch (error) {
    console.error(`Error loading backup: ${error.message}`);
    process.exit(1);
  }
}

// Shift twice to remove "node" and the script name from arguments
const args = process.argv.slice(2);
console.log(args);

if (args.length !== 1 || !args[0].startsWith('--archive=')) {
  console.error('Usage: npm run load -- --archive=<backup-file>');
  process.exit(1);
}

const archiveName = args[0].split('=')[1];

console.log(`Loading backup from archive: ${archiveName}`);

loadBackup(archiveName).catch(console.error);