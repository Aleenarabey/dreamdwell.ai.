import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ dest: uploadsDir });

// Route 1: Analyze floorplan (get processed image)
router.post('/analyze-floorplan', upload.single('file'), async (req, res) => {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

    const response = await axios.post(
      'http://127.0.0.1:8000/process-image/',
      form,
      { headers: form.getHeaders(), responseType: 'arraybuffer' }
    );

    res.set('Content-Type', 'image/jpeg');
    res.send(response.data);
    
    // Clean up temp file
    fs.unlink(req.file.path, () => {});
  } catch (err) {
    console.error('Error in analyze-floorplan:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Route 2: Detect features (get walls and rooms as JSON)
router.post('/detect-features', upload.single('file'), async (req, res) => {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

    const response = await axios.post(
      'http://127.0.0.1:8000/detect-features/',
      form,
      { headers: form.getHeaders() }
    );

    res.json(response.data);
    
    // Clean up temp file
    fs.unlink(req.file.path, () => {});
  } catch (err) {
    console.error('Error in detect-features:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;


