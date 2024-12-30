import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// List all files in a directory recursively
function listFilesRecursively(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(`Directory: ${fullPath}`);
      files.push(...listFilesRecursively(fullPath));
    } else {
      files.push(`File: ${fullPath}`);
    }
  }
  
  return files;
}

// Log directory structure
console.log('Current directory:', __dirname);
console.log('Directory structure:');
try {
  console.log(listFilesRecursively(__dirname).join('\n'));
} catch (err) {
  console.error('Error listing directory:', err);
}

// Serve static files from dist
app.use(express.static('dist'));

// Handle all routes for SPA
app.get('*', (req, res) => {
  console.log('Request path:', req.path);
  
  // Try multiple possible locations for index.html
  const possiblePaths = [
    join(__dirname, 'dist', 'index.html'),
    join(process.cwd(), 'dist', 'index.html'),
    '/opt/render/project/src/dist/index.html'
  ];
  
  console.log('Checking paths:', possiblePaths);
  
  for (const path of possiblePaths) {
    console.log('Checking path:', path);
    if (fs.existsSync(path)) {
      console.log('Found index.html at:', path);
      return res.sendFile(path);
    }
  }
  
  console.error('Error: index.html not found in any location');
  res.status(404).send('index.html not found');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
