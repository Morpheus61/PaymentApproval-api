import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// List all files in a directory recursively
function listDir(dir) {
  try {
    const items = fs.readdirSync(dir);
    console.log(`Contents of ${dir}:`, items);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        console.log(`Directory: ${fullPath}`);
        listDir(fullPath);
      } else {
        console.log(`File: ${fullPath}`);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
  }
}

// Try different static directories
const possibleDirs = [
  join(__dirname, 'dist'),
  join(process.cwd(), 'dist'),
  '/opt/render/project/src/dist',
  './dist'
];

// Find first available directory
let staticDir = possibleDirs.find(dir => {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  } catch (err) {
    return false;
  }
}) || join(__dirname, 'dist');

console.log('Environment:', process.env.NODE_ENV);
console.log('Current directory:', __dirname);
console.log('Working directory:', process.cwd());
console.log('Selected static directory:', staticDir);

// List contents of important directories
console.log('\nDirectory structure:');
listDir(__dirname);
listDir(process.cwd());
listDir(staticDir);

// Serve static files
app.use(express.static(staticDir));

// Handle all routes for SPA
app.get('*', (req, res) => {
  const indexPath = join(staticDir, 'index.html');
  console.log('Request path:', req.path);
  console.log('Looking for index.html at:', indexPath);
  
  if (fs.existsSync(indexPath)) {
    console.log('Found index.html, serving...');
    res.sendFile(indexPath);
  } else {
    console.error('Error: index.html not found at', indexPath);
    console.log('Available files in static directory:');
    listDir(staticDir);
    res.status(404).send('index.html not found');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Serving static files from: ${staticDir}`);
});
