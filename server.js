import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Possible static file locations
const possiblePaths = [
  join(__dirname, 'dist'),
  join(__dirname, 'client', 'build'),
  '/opt/render/project/src/dist',
  '/opt/render/project/src/client/build'
];

// Find the first directory that exists
let staticDir = possiblePaths.find(path => {
  try {
    return fs.existsSync(path) && fs.existsSync(join(path, 'index.html'));
  } catch (err) {
    return false;
  }
}) || join(__dirname, 'dist'); // fallback to dist

// Log the paths for debugging
console.log('Current directory:', __dirname);
console.log('Checking static directories:', possiblePaths);
console.log('Using static directory:', staticDir);

// Serve static files
app.use(express.static(staticDir));

// Handle all routes for SPA
app.get('*', (req, res) => {
  console.log('Request path:', req.path);
  const indexPath = join(staticDir, 'index.html');
  console.log('Serving index.html from:', indexPath);
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('Error: index.html not found at', indexPath);
    res.status(404).send('index.html not found');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Serving static files from: ${staticDir}`);
});
