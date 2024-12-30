import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import serveStatic from 'serve-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Log the current directory and dist path for debugging
console.log('Current directory:', __dirname);
console.log('Dist directory:', join(__dirname, 'dist'));

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Handle SPA routing - redirect all requests to index.html
app.get('*', (req, res) => {
  console.log('Serving index.html for path:', req.path);
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Serving static files from: ${join(__dirname, 'dist')}`);
});
