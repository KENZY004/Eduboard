const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendPasswordResetEmail, sendRegistrationVerificationEmail } = require('../services/emailService');
const { JWT_SECRET } = require('../config/jwt');
const {
  registerValidation,
  validate,
} = require("../middlewares/auth.validator");
const { authLimiter, otpLimiter, globalAuthLimiter } = require('../middlewares/rateLimiter'); // ← NEW
                                                                                            // ← NEW
router.use(globalAuthLimiter); // ← NEW

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const verifyToken = require('../utils/verifyToken');

const formatUserResponse = (user) => {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName || "",
        profilePicture: user.profilePicture || "",
        educationalInstitution: user.educationalInstitution || "",
        courseOrDepartment: user.courseOrDepartment || "",
        phoneNumber: user.phoneNumber || "",
        bio: user.bio || "",
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        isEmailVerified: user.isEmailVerified
    };
};

// Check if Cloudinary credentials are set up
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                               process.env.CLOUDINARY_API_KEY && 
                               process.env.CLOUDINARY_API_SECRET;

let upload;

if (isCloudinaryConfigured) {
    try {
        const cloudinary = require('../config/cloudinaryConfig');
        const { CloudinaryStorage } = require('multer-storage-cloudinary');
        const storage = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: {
                folder: 'eduboard-profiles',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                transformation: [{ width: 500, height: 500, crop: 'limit' }],
            },
        });
        upload = multer({
            storage: storage,
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
            fileFilter: (req, file, cb) => {
                const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
                if (allowed.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, WEBP allowed.'));
                }
            }
        });
    } catch (e) {
        console.warn('Failed to initialize Cloudinary storage, falling back to local storage:', e.message);
    }
}

if (!upload) {
    const uploadsDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
            const safeName = file.originalname
                .replace(/\.\.\//g, '')
                .replace(/[^a-zA-Z0-9._-]/g, '_');
            const ext = path.extname(safeName);
            const baseName = path.basename(safeName, ext).slice(0, 100);
            cb(null, 'profile-' + Date.now() + '-' + baseName + ext);
        }
    });
    upload = multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        fileFilter: (req, file, cb) => {
            const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
            if (allowed.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only JPG, JPEG, PNG, WEBP allowed.'));
            }
        }
    });
}
                                                                                            // ← NEW
// REGISTER
router.post('/register', authLimiter, registerValidation, validate, async (req, res) => { // ← NEW
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
            // If the user exists but their email is not verified, delete them so they can register again
            if (!existingUser.isEmailVerified) {
                const TeacherVerification = require('../models/TeacherVerification');
                await TeacherVerification.deleteMany({ userId: existingUser._id });
                await User.deleteOne({ _id: existingUser._id });
            } else {
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
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const userRole = role || 'student';

        // Only teachers need verification, admins and students are auto-verified
        const needsVerification = userRole === 'teacher';

        // Generate 6-digit verification OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpSalt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, otpSalt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: userRole,
            isVerified: !needsVerification, // true for admin/student, false for teacher
            verificationStatus: needsVerification ? 'pending' : 'approved',
            isEmailVerified: false,
            emailVerificationOTP: hashedOtp,
            emailVerificationExpire: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        const savedUser = await newUser.save();

        // Send verification email
        const emailResult = await sendRegistrationVerificationEmail(savedUser.email, savedUser.username, otp);
        if (!emailResult.success) {
            // Cleanup user if email failed on registration
            await User.findByIdAndDelete(savedUser._id);
            return res.status(500).json({
                message: 'Failed to send verification email. Please check your email and try again.',
                error: 'EMAIL_SEND_FAILED'
            });
        }

        // Create temporary token for document upload / session tracking
        const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            token,
            user: formatUserResponse(savedUser),
            message: 'Registration successful! A verification code has been sent to your email.'
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
router.post('/login', authLimiter, async (req, res) => { // ← NEW
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

        // Check if email is verified
        if (user.isEmailVerified === false) {
            return res.status(403).json({
                message: 'Email not verified. Please verify your email first.',
                error: 'EMAIL_NOT_VERIFIED',
                email: user.email
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
            user: formatUserResponse(user)
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

// FORGOT PASSWORD
router.post('/forgot-password', otpLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user but do not reveal existence in the response
        const user = await User.findOne({ email });

        // Only send OTP email internally when user exists and email is verified
        if (user && user.isEmailVerified) {
            try {
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const salt = await bcrypt.genSalt(10);
                const hashedOtp = await bcrypt.hash(otp, salt);

                user.resetPasswordOTP = hashedOtp;
                user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
                await user.save();

                const emailResult = await sendPasswordResetEmail(user.email, user.username, otp);
                if (!emailResult.success) {
                    user.resetPasswordOTP = undefined;
                    user.resetPasswordExpire = undefined;
                    await user.save();
                    console.error('Forgot password: failed to send reset email for', user.email);
                }
            } catch (err) {
                // Do not reveal internal errors to the client. Log and continue.
                console.error('Forgot password internal error:', err);
            }
        }

        // Always return a generic success message so callers cannot probe registered emails
        return res.status(200).json({ message: 'If an account with that email exists, an OTP has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// VERIFY OTP
router.post('/verify-otp', otpLimiter, async (req, res) => { // ← NEW
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

        // Generate a temporary token for resetting password
        const resetToken = jwt.sign(
            { id: user._id, type: 'password_reset' },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.status(200).json({
            message: 'OTP verified successfully',
            resetToken
        });
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

        // Verify token
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

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear OTP fields
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// VERIFY REGISTRATION OTP
router.post('/verify-registration-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({
            email,
            emailVerificationExpire: { $gt: Date.now() }
        });

        if (!user || !user.emailVerificationOTP) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        const isMatch = await bcrypt.compare(otp.toString(), user.emailVerificationOTP);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // Update status and clear fields
        user.isEmailVerified = true;
        user.emailVerificationOTP = undefined;
        user.emailVerificationExpire = undefined;

        const savedUser = await user.save();

        // Create login token
        const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            token,
            user: formatUserResponse(savedUser),
            message: 'Email verified successfully! Registration complete.'
        });
    } catch (error) {
        console.error('Verify registration OTP error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// RESEND REGISTRATION OTP
router.post('/resend-registration-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No registered user found with this email address.' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'This email is already verified.' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpSalt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, otpSalt);

        user.emailVerificationOTP = hashedOtp;
        user.emailVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        const emailResult = await sendRegistrationVerificationEmail(user.email, user.username, otp);
        if (!emailResult.success) {
            return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
        }

        res.status(200).json({ message: 'Verification code resent successfully!' });
    } catch (error) {
        console.error('Resend registration OTP error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// CHECK ROLE
router.post('/check-role', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'A valid email string is required' });
        }

        // Escape regex special characters to prevent regex injection or parsing crash
        const escapedEmail = email.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

        // Find user by email (case-insensitive and trimmed)
        const user = await User.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ role: user.role });
    } catch (err) {
        console.error('Check role error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Helper to verify Google Access Token supporting older Node.js versions
const verifyGoogleAccessToken = (token) => {
    return new Promise((resolve, reject) => {
        if (typeof fetch === 'function') {
            fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`)
                .then(response => {
                    if (!response.ok) {
                        return reject(new Error('Invalid Google access token'));
                    }
                    return response.json();
                })
                .then(data => resolve(data))
                .catch(err => reject(err));
        } else {
            const https = require('https');
            https.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode !== 200) {
                            reject(new Error(parsed.error_description || 'Invalid Google access token'));
                        } else {
                            resolve(parsed);
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', (err) => {
                reject(err);
            });
        }
    });
};

// GOOGLE LOGIN & SIGNUP (STUDENTS ONLY)
router.post('/google-login', authLimiter, async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                message: 'Google token is required',
                error: 'MISSING_TOKEN'
            });
        }

        // Verify token with Google's API (using access token helper)
        const payload = await verifyGoogleAccessToken(token);

        // Check email verification status in the Google token
        const isGoogleEmailVerified = payload.email_verified === 'true' || payload.email_verified === true;
        if (!isGoogleEmailVerified) {
            return res.status(400).json({
                message: 'Google account email is not verified',
                error: 'EMAIL_NOT_VERIFIED'
            });
        }

        const email = payload.email;

        // Escape regex special characters for safe email search
        const escapedEmail = email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

        // Check if user already exists
        let user = await User.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } });

        if (user) {
            // User exists. 
            // If they are a teacher, they must be verified by admin.
            if (user.role === 'teacher' && !user.isVerified) {
                return res.status(403).json({
                    message: 'Your account is pending verification. Please wait for admin approval.',
                    error: 'ACCOUNT_NOT_VERIFIED',
                    verificationStatus: user.verificationStatus,
                    rejectionReason: user.rejectionReason
                });
            }

            // Ensure isEmailVerified is true, as Google has verified it
            if (!user.isEmailVerified) {
                user.isEmailVerified = true;
                await user.save();
            }
        } else {
            // Create user (Sign-up flow)
            // Generate unique username
            let baseUsername = payload.name 
                ? payload.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() 
                : '';
            
            if (baseUsername.length < 3) {
                baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            }
            if (baseUsername.length < 3) {
                baseUsername = 'student';
            }

            let username = baseUsername;
            let userExists = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
            while (userExists) {
                username = baseUsername + Math.floor(1000 + Math.random() * 9000);
                userExists = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
            }

            // Generate secure random password
            const crypto = require('crypto');
            const tempPassword = crypto.randomBytes(16).toString('hex') + 'Aa1!';
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(tempPassword, salt);

            user = new User({
                username,
                email,
                password: hashedPassword,
                role: 'student', // Students only
                isVerified: true, // Students are auto-verified
                verificationStatus: 'approved',
                isEmailVerified: true // Already verified by Google
            });

            await user.save();
        }

        // Create JWT login token
        const loginToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token: loginToken,
            user: formatUserResponse(user)
        });

    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({
            error: 'Internal server error',
            message: err.message
        });
    }
});

// GET PROFILE
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            success: true,
            user: formatUserResponse(user)
        });
    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// UPDATE PROFILE
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const {
            fullName,
            username,
            email,
            educationalInstitution,
            courseOrDepartment,
            phoneNumber,
            bio,
            profilePicture
        } = req.body;

        // Validation
        if (!fullName || !fullName.trim()) {
            return res.status(400).json({ message: 'Full Name is required' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'Email is required' });
        }
        if (!username || !username.trim()) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const emailRegex = /.+\@.+\..+/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please fill a valid email address' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Duplication Checks
        if (email.toLowerCase() !== user.email.toLowerCase()) {
            const emailExists = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
            if (emailExists) {
                return res.status(400).json({ message: 'A user with that email already exists' });
            }
        }

        if (username.toLowerCase() !== user.username.toLowerCase()) {
            const usernameExists = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
            if (usernameExists) {
                return res.status(400).json({ message: 'A user with that username already exists' });
            }
        }

        // Update fields
        user.fullName = fullName.trim();
        user.username = username.trim();
        user.email = email.trim();
        user.educationalInstitution = (educationalInstitution || "").trim();
        user.courseOrDepartment = (courseOrDepartment || "").trim();
        user.phoneNumber = (phoneNumber || "").trim();
        user.bio = (bio || "").trim();
        if (profilePicture !== undefined) {
            user.profilePicture = profilePicture;
        }

        await user.save();

        res.json({
            success: true,
            user: formatUserResponse(user),
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// PROFILE IMAGE UPLOAD
router.post('/profile/upload', verifyToken, (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            const imageUrl = isCloudinaryConfigured && req.file.path.startsWith('http')
                ? req.file.path
                : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

            res.json({
                success: true,
                imageUrl
            });
        } catch (error) {
            console.error('Profile image upload processing error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
});

module.exports = router;
