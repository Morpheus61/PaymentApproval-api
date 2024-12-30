import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Determine static directory
const distDir = join(__dirname, 'dist');
console.log('Serving static files from:', distDir);

// Serve static files
app.use(express.static(distDir));

// Handle all routes for SPA
app.get('*', (req, res) => {
  const indexPath = join(distDir, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
