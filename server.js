import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Debug info
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PWD: process.env.PWD,
  RENDER: process.env.RENDER,
  __dirname,
  cwd: process.cwd()
});

// Determine static directory
const staticDir = resolve(__dirname, 'dist');
console.log('Static directory:', staticDir);

// Create dist if it doesn't exist
if (!fs.existsSync(staticDir)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(staticDir, { recursive: true });
}

// List directory contents
const listDir = (path) => {
  try {
    const items = fs.readdirSync(path);
    console.log(`\nContents of ${path}:`, items);
    return items;
  } catch (err) {
    console.error(`Error reading ${path}:`, err);
    return [];
  }
};

// Log contents
console.log('\nDirectory contents:');
listDir(__dirname);
listDir(staticDir);

// Serve static files
app.use(express.static(staticDir));

// Handle all routes for SPA
app.get('*', (req, res) => {
  console.log('\nHandling request:', req.path);
  
  const indexPath = join(staticDir, 'index.html');
  console.log('Looking for index.html at:', indexPath);
  
  if (fs.existsSync(indexPath)) {
    console.log('Found index.html, serving...');
    res.sendFile(indexPath);
  } else {
    console.error('index.html not found');
    res.status(404).send(`
      <h1>Debug Info</h1>
      <pre>
        Static Dir: ${staticDir}
        Index Path: ${indexPath}
        Directory Contents: ${JSON.stringify(listDir(staticDir), null, 2)}
      </pre>
    `);
  }
});

app.listen(port, () => {
  console.log(`\nServer running at http://localhost:${port}`);
  console.log(`Serving static files from: ${staticDir}`);
});
