import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cinebook_posters',
    allowedFormats: ['jpeg', 'png', 'jpg', 'webp'],
  },
});

const upload = multer({ storage: storage });

router.post('/', protect, adminOnly, (req, res) => {
  // Catch multer errors explicitly
  upload.single('poster')(req, res, function (err) {
    if (err) {
      console.error('Cloudinary/Multer Error:', err);
      // Usually signifies missing Config or incorrect credentials
      return res.status(500).json({ 
        success: false, 
        message: 'Cloudinary configuration error or invalid keys.', 
        error: err.message 
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded or invalid format.' });
      }
      
      res.json({
        success: true,
        url: req.file.path, // This is the Cloudinary secure URL
      });
    } catch (error) {
      console.error('Upload handling error:', error);
      res.status(500).json({ success: false, message: 'Upload failed.', error: error.message });
    }
  });
});

export default router;
