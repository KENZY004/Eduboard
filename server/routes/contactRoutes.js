const express = require('express');
const router = express.Router();
const { sendContactFormEmail } = require('../services/emailService');
const rateLimit = require('express-rate-limit');

// Rate limiter: Max 5 emails per hour per IP
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { message: 'Too many contact requests from this IP, please try again after an hour.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Simple helper to escape HTML tags to prevent email injection
const sanitizeHtml = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

router.post('/', contactLimiter, async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    // Sanitize inputs
    const safeName = sanitizeHtml(name);
    const safeEmail = sanitizeHtml(email);
    const safeSubject = sanitizeHtml(subject);
    const safeMessage = sanitizeHtml(message);

    try {
        // Owner ke existing email service ko use karke mail bhejna
        const result = await sendContactFormEmail(
            process.env.ADMIN_EMAIL, // Admin (yaani tumhe) mail aayega
            safeSubject ? `[EduBoard Contact] ${safeSubject}` : `[EduBoard Contact] New message from ${safeName}`,
            `Name: ${safeName}\nEmail: ${safeEmail}\n\nMessage:\n${safeMessage}`
        );

        if (result && result.success === false) {
            throw new Error(result.error || 'Failed to relay email');
        }
        
        console.log(`[CONTACT FORM] Message received and sent via Nodemailer from ${safeName}`);
        res.status(200).json({ message: 'Your message has been sent successfully.' });
    } catch (error) {
        console.error('[CONTACT FORM] Error sending email:', error);
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
});

module.exports = router;