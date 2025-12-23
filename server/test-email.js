// Test email configuration
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing email configuration...\n');

// Check if environment variables are loaded
console.log('Environment variables:');
console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Not set');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set (length: ' + process.env.SMTP_PASS.length + ')' : '❌ Not set');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Not set');
console.log('');

// Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify connection
console.log('Verifying SMTP connection...');
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP verification failed:');
        console.error('Error:', error.message);
        console.error('\nPossible issues:');
        console.error('1. SMTP_USER or SMTP_PASS not set in .env');
        console.error('2. App password is incorrect');
        console.error('3. Gmail "Less secure app access" or "2-Step Verification" not configured');
    } else {
        console.log('✅ SMTP connection successful!');
        console.log('Email service is ready to send messages.');

        // Send test email
        console.log('\nSending test email...');
        transporter.sendMail({
            from: `"EduBoard Test" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
            subject: 'Test Email from EduBoard',
            text: 'If you receive this, email configuration is working correctly!'
        }, (err, info) => {
            if (err) {
                console.error('❌ Failed to send test email:', err.message);
            } else {
                console.log('✅ Test email sent successfully!');
                console.log('Message ID:', info.messageId);
            }
            process.exit(0);
        });
    }
});
