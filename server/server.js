const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Save to uploads folder
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.png';
        cb(null, `${Date.now()}${ext}`);
    }
});

const upload = multer({ storage });

// Load keys from keys.json or create if not exists
const keysFilePath = path.join(__dirname, 'keys.json');
if (!fs.existsSync(keysFilePath)) {
    fs.writeFileSync(keysFilePath, JSON.stringify([]));
}
let keys = require(keysFilePath);

// ----------------------
// 🛡️ ADMIN ROUTES
// ----------------------

// Admin Login Route
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
        res.send('Logged in');
    } else {
        res.status(401).send('Unauthorized');
    }
});

// Generate Upload Key
app.post('/admin/generate-key', (req, res) => {
    const newKey = uuidv4();
    keys.push(newKey);
    fs.writeFileSync(keysFilePath, JSON.stringify(keys));
    res.json({ key: newKey });
});

// ----------------------
// 📸 UPLOAD ROUTES
// ----------------------

// Upload an Image with Description
app.post('/upload', upload.single('image'), (req, res) => {
    const { key, description } = req.body;

    if (!key || !keys.includes(key)) {
        return res.status(401).send('Invalid upload key');
    }

    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    // Save metadata (description)
    const metadataPath = path.join(uploadsDir, `${req.file.filename}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify({ description: description || '' }));

    res.json({ 
        message: 'Image uploaded successfully', 
        filename: req.file.filename 
    });
});

// ----------------------
// 🖼️ FETCH IMAGES
// ----------------------

// Fetch Uploaded Images with Descriptions, sorted by the most recent
app.get('/uploads', (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading uploads folder');
        }

        const images = files
            .filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file))
            .map(file => {
                const metadataPath = path.join(uploadsDir, `${file}.json`);
                let description = '';

                if (fs.existsSync(metadataPath)) {
                    const metadata = JSON.parse(fs.readFileSync(metadataPath));
                    description = metadata.description || '';
                }

                return { filename: file, description, timestamp: fs.statSync(path.join(uploadsDir, file)).mtime };
            })
            .sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent upload

        res.json(images);
    });
});

// Delete Image and its Description
app.delete('/admin/delete-image', (req, res) => {
    const { filename } = req.body;

    const imagePath = path.join(uploadsDir, filename);
    const metadataPath = path.join(uploadsDir, `${filename}.json`);

    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete image
    }

    if (fs.existsSync(metadataPath)) {
        fs.unlinkSync(metadataPath); // Delete description metadata
    }

    res.send({ message: 'Image and description deleted successfully' });
});

// ----------------------
// 🌍 SERVE PAGES
// ----------------------

// Serve Main Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serve Admin Dashboard
app.get('/admin/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

// ----------------------
// 🚀 START SERVER
// ----------------------

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

// Set up multer storage
const upload = multer({
  dest: path.join(__dirname, '../uploads/') // Destination for uploaded files
});

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, '../public')));

// Example route for file upload
app.post('/upload', upload.single('winImage'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded');
  }
  // You can store file data or handle it further here
  res.send('File uploaded successfully');
});

// Example route for deleting images (admin feature)
app.delete('/admin/delete/:imageName', (req, res) => {
  const { imageName } = req.params;
  const fs = require('fs');
  const imagePath = path.join(__dirname, '../uploads', imageName);
  
  fs.unlink(imagePath, (err) => {
    if (err) {
      return res.status(500).send('Failed to delete image');
    }
    res.send('Image deleted successfully');
  });
});

// Start the server (only needed in development for local testing)
// In Vercel, serverless functions will be used, so this will not run.
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

