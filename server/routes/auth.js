const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');                          // ← NEW
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');
const { blacklistToken } = require('../services/tokenBlacklist'); // ← NEW
const { verifyToken } = require('../utils/auth');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const {
  registerValidation,
  validate,
} = require("../middlewares/auth.validator");

// REGISTER
router.post('/register', registerValidation, validate, async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Username, email, and password are required',
                error: 'MISSING_FIELDS'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long',
                error: 'PASSWORD_TOO_SHORT'
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: { $regex: new RegExp(`^${email}$`, 'i') } },
                { username: { $regex: new RegExp(`^${username}$`, 'i') } }
            ]
        });

        if (existingUser) {
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
            return res.status(400).json({ message, error: 'USER_EXISTS' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = role || 'student';
        const needsVerification = userRole === 'teacher';

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: userRole,
            isVerified: !needsVerification,
            verificationStatus: needsVerification ? 'pending' : 'approved'
        });

        const savedUser = await newUser.save();

        // ── jti added so the blacklist can target individual tokens ──
        const jti = crypto.randomUUID();
        const token = jwt.sign({ id: savedUser._id, jti }, JWT_SECRET, { expiresIn: '1d' });

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

        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({
                message: `A user with that ${field} already exists`,
                error: 'DUPLICATE_KEY',
                field
            });
        }

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

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
                error: 'MISSING_CREDENTIALS'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials', error: 'INVALID_CREDENTIALS' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials', error: 'INVALID_CREDENTIALS' });
        }

        if (user.role === 'teacher' && !user.isVerified) {
            return res.status(403).json({
                message: 'Your account is pending verification. Please wait for admin approval.',
                error: 'ACCOUNT_NOT_VERIFIED',
                verificationStatus: user.verificationStatus,
                rejectionReason: user.rejectionReason
            });
        }

        // ── jti added so the blacklist can target individual tokens ──
        const jti = crypto.randomUUID();
        const token = jwt.sign({ id: user._id, jti }, JWT_SECRET, { expiresIn: '1d' });

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

// ── NEW: LOGOUT ────────────────────────────────────────────────────────
// POST /api/auth/logout
// Requires:  Authorization: Bearer <token>
// Effect:    Adds the token to the server-side blacklist so it cannot
//            be reused even before its 1-day expiry.
//            The client must also delete the token from storage.
router.post('/logout', verifyToken, (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const rawToken = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7).trim()
            : null;

        if (!rawToken) {
            return res.status(400).json({ message: 'No token to invalidate.' });
        }

        // req.user is the decoded payload set by verifyToken
        blacklistToken(req.user, rawToken);

        res.json({ message: 'Logged out successfully. Token has been invalidated.' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Internal server error during logout.' });
    }
});
// ──────────────────────────────────────────────────────────────────────

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        user.resetPasswordOTP = hashedOtp;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        const emailResult = await sendPasswordResetEmail(user.email, user.username, otp);

        if (!emailResult.success) {
            user.resetPasswordOTP = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }

        res.status(200).json({ message: 'If an account with that email exists, an OTP has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({
            email,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user || !user.resetPasswordOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const isMatch = await bcrypt.compare(otp.toString(), user.resetPasswordOTP);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const resetToken = jwt.sign(
            { id: user._id, type: 'password_reset' },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.status(200).json({ message: 'OTP verified successfully', resetToken });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// RESET PASSWORD
router.put('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        let decoded;
        try {
            decoded = jwt.verify(resetToken, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        if (decoded.type !== 'password_reset') {
            return res.status(400).json({ message: 'Invalid token type' });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;