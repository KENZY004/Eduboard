const router = require('express').Router();
const User = require('../models/User');
const TeacherVerification = require('../models/TeacherVerification');

/**
 * GET /api/admin/pending-teachers
 * Get all pending teacher verification requests
 */
router.get('/pending-teachers', async (req, res) => {
    try {
        // Find all teachers with pending verification
        const pendingTeachers = await User.find({
            role: 'teacher',
            verificationStatus: 'pending'
        }).select('username email createdAt');

        // Get verification details for each teacher
        const teachersWithDocs = await Promise.all(
            pendingTeachers.map(async (teacher) => {
                const verification = await TeacherVerification.findOne({ userId: teacher._id });
                return {
                    id: teacher._id,
                    username: teacher.username,
                    email: teacher.email,
                    registeredAt: teacher.createdAt,
                    documents: verification ? verification.documents : [],
                    hasDocuments: !!verification
                };
            })
        );

        res.json(teachersWithDocs);
    } catch (err) {
        console.error('Error fetching pending teachers:', err);
        res.status(500).json({ message: 'Failed to fetch pending teachers', error: err.message });
    }
});

/**
 * GET /api/admin/all-teachers
 * Get all teachers with their verification status
 */
router.get('/all-teachers', async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' })
            .select('username email verificationStatus isVerified verificationDate createdAt')
            .sort({ createdAt: -1 });

        res.json(teachers);
    } catch (err) {
        console.error('Error fetching teachers:', err);
        res.status(500).json({ message: 'Failed to fetch teachers', error: err.message });
    }
});

module.exports = router;
