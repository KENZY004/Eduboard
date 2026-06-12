const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const verifyToken = require('../utils/verifyToken');
const Image = require('../models/Image');

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

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP allowed.'));
        }
    }
});

// Upload image endpoint (requires authentication)
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Track image ownership in database
        const newImage = new Image({
            publicId: req.file.filename,
            url: req.file.path,
            userId: req.user.id
        });
        await newImage.save();

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
        
        // Find the image in the database to verify ownership
        const image = await Image.findOne({ publicId });
        
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }
        
        // Ensure the user requesting deletion owns the image
        if (image.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to delete this image' });
        }

        const result = await cloudinary.uploader.destroy(publicId);
        
        // Remove from database after successful cloudinary deletion
        if (result.result === 'ok' || result.result === 'not found') {
            await Image.deleteOne({ publicId });
        }

        res.json({
            success: true,
            result: result,
        });
    } catch (error) {
        console.error('Image delete error:', error);
        res.status(500).json({ message: 'Failed to delete image', error: error.message });
    }
});

router.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Max size is 5MB.' });
    }
    if (err.message.startsWith('Invalid file type')) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

module.exports = router;
