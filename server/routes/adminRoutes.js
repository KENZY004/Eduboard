const router = require('express').Router();
const User = require('../models/User');
const TeacherVerification = require('../models/TeacherVerification');
const Board = require('../models/Board');
const SavedBoard = require('../models/SavedBoard');
const verifyToken = require('../utils/verifyToken');
const verifyAdmin = require('../utils/verifyAdmin');

// Apply authentication and admin verification to ALL routes in this file
router.use(verifyToken);
router.use(verifyAdmin);

/**
 * GET /api/admin/pending-teachers
 * Get all pending teacher verification requests
 * Requires: Admin authentication
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

// Delete a teacher account
router.delete('/teacher/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the teacher
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        if (user.role !== 'teacher') {
            return res.status(400).json({ message: 'User is not a teacher' });
        }

        // Delete teacher verification records
        await TeacherVerification.deleteMany({ userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({ message: 'Teacher removed successfully' });
    } catch (err) {
        console.error('Error removing teacher:', err);
        res.status(500).json({ message: 'Failed to remove teacher', error: err.message });
    }
});

/**
 * GET /api/admin/all-students
 * Get all students with their registration details
 */
router.get('/all-students', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('username email createdAt')
            .sort({ createdAt: -1 });

        res.json(students);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ message: 'Failed to fetch students', error: err.message });
    }
});

/**
 * DELETE /api/admin/user/:userId
 * Comprehensive user deletion with cleanup of all related data
 * Use this for complete user removal (students, teachers, or any user)
 */
router.delete('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user first
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[ADMIN] Deleting user: ${user.username} (${user.email})`);

        // Clean up all related data
        await TeacherVerification.deleteMany({ userId });
        await SavedBoard.deleteMany({ userId });

        // Update boards created by this user (set creator to null instead of deleting boards)
        await Board.updateMany(
            { createdBy: userId },
            { $set: { createdBy: null } }
        );

        // Delete the user
        await User.findByIdAndDelete(userId);
        res.json({
            message: 'User deleted successfully',
            deletedUser: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({
            message: 'Failed to delete user',
            error: err.message
        });
    }
});

module.exports = router;
