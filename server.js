import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Determine the correct static files directory
const staticDir = process.env.RENDER ? '/opt/render/project/src/dist' : join(__dirname, 'dist');

// Log the paths for debugging
console.log('Current directory:', __dirname);
console.log('Static directory:', staticDir);

// Serve static files
app.use(express.static(staticDir));

// Handle all routes for SPA
app.get('*', (req, res) => {
  console.log('Request path:', req.path);
  console.log('Serving index.html from:', join(staticDir, 'index.html'));
  res.sendFile(join(staticDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Serving static files from: ${staticDir}`);
});
