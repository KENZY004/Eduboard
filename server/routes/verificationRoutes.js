const router = require('express').Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const TeacherVerification = require('../models/TeacherVerification');
const User = require('../models/User');
const { sendTeacherRegistrationNotification, sendApprovalEmail, sendRejectionEmail } = require('../services/emailService');
const verifyToken = require('../utils/verifyToken');
const verifyAdmin = require('../utils/verifyAdmin');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer with Cloudinary storage for documents
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'teacher_verifications',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        resource_type: 'auto'
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});



/**
 * POST /api/verification/upload-documents
 * Upload teacher verification documents
 */
router.post('/upload-documents', verifyToken, upload.fields([
    { name: 'id_proof', maxCount: 1 },
    { name: 'teaching_certificate', maxCount: 1 },
    { name: 'degree', maxCount: 1 }
]), async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user exists and is a teacher
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'teacher') {
            return res.status(403).json({ message: 'Only teachers can upload verification documents' });
        }

        // Check if verification already exists
        const existingVerification = await TeacherVerification.findOne({ userId });
        if (existingVerification) {
            return res.status(400).json({ message: 'Verification documents already uploaded' });
        }

        // Process uploaded files
        const documents = [];

        if (req.files.id_proof) {
            documents.push({
                type: 'id_proof',
                url: req.files.id_proof[0].path,
                publicId: req.files.id_proof[0].filename
            });
        }

        if (req.files.teaching_certificate) {
            documents.push({
                type: 'teaching_certificate',
                url: req.files.teaching_certificate[0].path,
                publicId: req.files.teaching_certificate[0].filename
            });
        }

        if (req.files.degree) {
            documents.push({
                type: 'degree',
                url: req.files.degree[0].path,
                publicId: req.files.degree[0].filename
            });
        }

        // Validate required documents
        if (!req.files.id_proof || !req.files.teaching_certificate) {
            return res.status(400).json({
                message: 'ID proof and teaching certificate are required'
            });
        }

        // Create verification record
        const verification = new TeacherVerification({
            userId,
            documents,
            status: 'pending'
        });

        await verification.save();

        // Send email notification to admin
        try {
            await sendTeacherRegistrationNotification({
                username: user.username,
                email: user.email,
                userId: user._id
            }, documents);
        } catch (emailError) {
            console.error('Failed to send admin notification:', emailError);
            // Don't fail the request if email fails
        }

        res.status(201).json({
            message: 'Documents uploaded successfully. Your account is pending verification.',
            verification: {
                status: verification.status,
                documentsCount: documents.length
            }
        });

    } catch (err) {
        console.error('Document upload error:', err);
        res.status(500).json({
            message: 'Failed to upload documents',
            error: err.message
        });
    }
});

/**
 * GET /api/verification/status
 * Check verification status for logged-in user
 */
router.get('/status', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const verification = await TeacherVerification.findOne({ userId });

        res.json({
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
            verificationDate: user.verificationDate,
            rejectionReason: user.rejectionReason,
            documentsUploaded: !!verification,
            documents: verification ? verification.documents : []
        });

    } catch (err) {
        console.error('Status check error:', err);
        res.status(500).json({
            message: 'Failed to check verification status',
            error: err.message
        });
    }
});

/**
 * POST /api/verification/approve/:userId
 * Admin approves a teacher
 * Requires: Admin authentication
 */
router.post('/approve/:userId', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { adminNotes } = req.body;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'teacher') {
            return res.status(400).json({ message: 'User is not a teacher' });
        }

        // Update user verification status
        user.isVerified = true;
        user.verificationStatus = 'approved';
        user.verificationDate = new Date();
        await user.save();

        // Update verification record
        const verification = await TeacherVerification.findOne({ userId });
        if (verification) {
            verification.status = 'approved';
            verification.adminNotes = adminNotes;
            await verification.save();
        }

        // Send approval email
        try {
            await sendApprovalEmail(user.email, user.username);
        } catch (emailError) {
            console.error('Failed to send approval email:', emailError);
        }

        res.json({
            message: 'Teacher approved successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                verificationStatus: user.verificationStatus
            }
        });

    } catch (err) {
        console.error('Approval error:', err);
        res.status(500).json({
            message: 'Failed to approve teacher',
            error: err.message
        });
    }
});

/**
 * POST /api/verification/reject/:userId
 * Admin rejects a teacher
 * Requires: Admin authentication
 */
router.post('/reject/:userId', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason, adminNotes } = req.body;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'teacher') {
            return res.status(400).json({ message: 'User is not a teacher' });
        }

        // Update user verification status
        user.verificationStatus = 'rejected';
        user.verificationDate = new Date();
        user.rejectionReason = reason;
        await user.save();

        // Update verification record
        const verification = await TeacherVerification.findOne({ userId });
        if (verification) {
            verification.status = 'rejected';
            verification.adminNotes = adminNotes;
            await verification.save();
        }

        // Send rejection email
        try {
            await sendRejectionEmail(user.email, user.username, reason);
        } catch (emailError) {
            console.error('Failed to send rejection email:', emailError);
        }

        res.json({
            message: 'Teacher rejected',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verificationStatus: user.verificationStatus,
                rejectionReason: user.rejectionReason
            }
        });

    } catch (err) {
        console.error('Rejection error:', err);
        res.status(500).json({
            message: 'Failed to reject teacher',
            error: err.message
        });
    }
});

module.exports = router;
