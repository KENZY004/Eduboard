const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/emailService'); // Existing service import kiya

router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    try {
        // Owner ke existing email service ko use karke mail bhejna
        await sendEmail(
            process.env.EMAIL_USER, // Admin (yaani tumhe) mail aayega
            subject ? `[EduBoard Contact] ${subject}` : `[EduBoard Contact] New message from ${name}`,
            `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        );
        
        console.log(`[CONTACT FORM] Message received and sent via Nodemailer from ${name}`);
        res.status(200).json({ message: 'Your message has been sent successfully.' });
    } catch (error) {
        console.error('[CONTACT FORM] Error sending email:', error);
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
});

module.exports = router;