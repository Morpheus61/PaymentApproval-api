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
const distDir = resolve(process.cwd(), 'dist');
console.log('Static directory:', distDir);

// List directory contents
const listDir = (path) => {
  try {
    console.log(`\nListing contents of ${path}:`);
    const items = fs.readdirSync(path);
    console.log(items);
    items.forEach(item => {
      const fullPath = join(path, item);
      const stats = fs.statSync(fullPath);
      console.log(`${item}: ${stats.isDirectory() ? 'directory' : 'file'} (${stats.size} bytes)`);
    });
    return items;
  } catch (err) {
    console.error(`Error reading ${path}:`, err);
    return [];
  }
};

// Log current state
console.log('\nCurrent directory structure:');
listDir(process.cwd());

// Create dist if it doesn't exist
if (!fs.existsSync(distDir)) {
  console.log('\nRunning build since dist directory is missing...');
  try {
    const { execSync } = await import('child_process');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build completed successfully');
  } catch (err) {
    console.error('Build failed:', err);
  }
}

listDir(distDir);

// Serve static files
app.use(express.static(distDir));

// Handle all routes for SPA
app.get('*', (req, res) => {
  console.log('\nHandling request:', req.path);
  
  const indexPath = join(distDir, 'index.html');
  console.log('Looking for index.html at:', indexPath);
  
  try {
    if (fs.existsSync(indexPath)) {
      console.log('Found index.html, serving...');
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      console.log('index.html content length:', indexContent.length);
      res.sendFile(indexPath);
    } else {
      console.error('index.html not found');
      
      // Get parent directory contents
      const parentDir = dirname(distDir);
      const parentContents = fs.existsSync(parentDir) ? fs.readdirSync(parentDir) : [];
      
      res.status(404).send(`
        <h1>Debug Info</h1>
        <pre>
Current Working Directory: ${process.cwd()}
__dirname: ${__dirname}
Static Directory: ${distDir}
Index Path: ${indexPath}

Parent Directory (${parentDir}):
${JSON.stringify(parentContents, null, 2)}

Static Directory Contents:
${JSON.stringify(listDir(distDir), null, 2)}

Environment:
${JSON.stringify({
  NODE_ENV: process.env.NODE_ENV,
  PWD: process.env.PWD,
  RENDER: process.env.RENDER,
  PATH: process.env.PATH
}, null, 2)}
        </pre>
      `);
    }
  } catch (err) {
    console.error('Error serving index.html:', err);
    res.status(500).send('Server error: ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`\nServer running at http://localhost:${port}`);
  console.log(`Serving static files from: ${distDir}`);
});
