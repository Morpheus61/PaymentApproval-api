import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Possible target directories
const targetDirs = [
  path.join(__dirname, 'client', 'build'),
  '/opt/render/project/src/client/build',
  '/opt/render/project/src/dist'
];

// Source directory
const sourceDir = path.join(__dirname, 'dist');

// Copy function
function copyDir(src, dest) {
  // Create destination directory
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Copy all files
  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Source directory:', sourceDir);

// Try to copy to each target directory
for (const targetDir of targetDirs) {
  try {
    console.log(`Attempting to copy to ${targetDir}...`);
    copyDir(sourceDir, targetDir);
    console.log(`Successfully copied to ${targetDir}`);
  } catch (err) {
    console.log(`Failed to copy to ${targetDir}:`, err.message);
  }
}
