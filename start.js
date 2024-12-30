import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure dist directory exists
const distPath = join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

// Log directory contents
console.log('Directory contents:', fs.readdirSync(__dirname));
console.log('Dist directory contents:', fs.existsSync(distPath) ? fs.readdirSync(distPath) : 'dist directory not found');

// Start the server
const server = spawn('node', ['server.js'], { stdio: 'inherit' });
