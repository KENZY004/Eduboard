const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const verifyToken = require('../utils/verifyToken');

// Apply authentication to ALL image routes
router.use(verifyToken);

// Configure multer storage with Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'eduboard-images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 2000, height: 2000, crop: 'limit' }], // Max size limit
    },
});

const upload = multer({ storage: storage });

// Upload image endpoint (requires authentication)
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Return the Cloudinary URL and metadata
        res.json({
            success: true,
            url: req.file.path,
            publicId: req.file.filename,
            width: req.file.width,
            height: req.file.height,
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ message: 'Failed to upload image', error: error.message });
    }
});

// Delete image endpoint (optional)
router.delete('/delete/:publicId', async (req, res) => {
    try {
        const { publicId } = req.params;
        const result = await cloudinary.uploader.destroy(publicId);

        res.json({
            success: true,
            result: result,
        });
    } catch (error) {
        console.error('Image delete error:', error);
        res.status(500).json({ message: 'Failed to delete image', error: error.message });
    }
});

module.exports = router;
