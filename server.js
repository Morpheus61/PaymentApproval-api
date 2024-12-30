import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Determine the static directory
const staticDir = process.env.RENDER 
  ? '/opt/render/project/src/dist'
  : join(__dirname, 'dist');

console.log('Current directory:', __dirname);
console.log('Static directory:', staticDir);

// Log directory contents
try {
  console.log('Static directory contents:', fs.readdirSync(staticDir));
} catch (err) {
  console.error('Error reading static directory:', err);
}

// Serve static files
app.use(express.static(staticDir));

// Handle all routes for SPA
app.get('*', (req, res) => {
  const indexPath = join(staticDir, 'index.html');
  console.log('Request path:', req.path);
  console.log('Serving from:', indexPath);
  
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
