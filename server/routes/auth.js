const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // Use env in prod!

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Username, email, and password are required',
                error: 'MISSING_FIELDS'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long',
                error: 'PASSWORD_TOO_SHORT'
            });
        }

        // Check if user exists (case-insensitive)
        const existingUser = await User.findOne({
            $or: [
                { email: { $regex: new RegExp(`^${email}$`, 'i') } },
                { username: { $regex: new RegExp(`^${username}$`, 'i') } }
            ]
        });

        if (existingUser) {
            // Determine which field is duplicate
            const isDuplicateEmail = existingUser.email.toLowerCase() === email.toLowerCase();
            const isDuplicateUsername = existingUser.username.toLowerCase() === username.toLowerCase();

            let message = 'User already exists';
            if (isDuplicateEmail && isDuplicateUsername) {
                message = 'A user with that email and username already exists';
            } else if (isDuplicateEmail) {
                message = 'A user with that email already exists';
            } else if (isDuplicateUsername) {
                message = 'A user with that username already exists';
            }
            return res.status(400).json({
                message,
                error: 'USER_EXISTS'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const userRole = role || 'student';

        // Only teachers need verification, admins and students are auto-verified
        const needsVerification = userRole === 'teacher';

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: userRole,
            isVerified: !needsVerification, // true for admin/student, false for teacher
            verificationStatus: needsVerification ? 'pending' : 'approved'
        });

        const savedUser = await newUser.save();

        // Create token
        const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            token,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role,
                isVerified: savedUser.isVerified,
                verificationStatus: savedUser.verificationStatus
            },
            message: savedUser.role === 'teacher'
                ? 'Registration successful! Please upload your verification documents.'
                : 'Registration successful!'
        });
    } catch (err) {
        console.error('Registration error:', err);

        // Handle MongoDB duplicate key error (code 11000)
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({
                message: `A user with that ${field} already exists`,
                error: 'DUPLICATE_KEY',
                field: field
            });
        }

        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed',
                error: 'VALIDATION_ERROR',
                details: Object.values(err.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
                error: 'MISSING_CREDENTIALS'
            });
        }

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'Invalid credentials',
                error: 'INVALID_CREDENTIALS'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials',
                error: 'INVALID_CREDENTIALS'
            });
        }

        // Check if teacher is verified
        if (user.role === 'teacher' && !user.isVerified) {
            return res.status(403).json({
                message: 'Your account is pending verification. Please wait for admin approval.',
                error: 'ACCOUNT_NOT_VERIFIED',
                verificationStatus: user.verificationStatus,
                rejectionReason: user.rejectionReason
            });
        }

        // Create token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                verificationStatus: user.verificationStatus
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            error: 'Internal server error',
            message: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

module.exports = router;
