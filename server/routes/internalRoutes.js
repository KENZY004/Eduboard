const router = require('express').Router();
const emailService = require('../services/emailService');

router.post('/send-email', async (req, res) => {
    try {
        const secret = req.headers['x-internal-secret'];
        if (!secret || secret !== process.env.INTERNAL_EMAIL_SECRET) {
            console.warn('⚠️ Blocked unauthorized internal email relay attempt');
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { emailType, payload } = req.body;
        if (!emailType || !payload) {
            return res.status(400).json({ success: false, error: 'Missing emailType or payload' });
        }

        console.log(`📥 Received secure relay request for: ${emailType}`);
        let result;
        switch (emailType) {
            case 'teacher-notification':
                result = await emailService.sendDirectTeacherRegistrationNotification(payload.teacherData, payload.documents);
                break;
            case 'approval':
                result = await emailService.sendDirectApprovalEmail(payload.teacherEmail, payload.teacherName);
                break;
            case 'rejection':
                result = await emailService.sendDirectRejectionEmail(payload.teacherEmail, payload.teacherName, payload.reason);
                break;
            case 'password-reset':
                result = await emailService.sendDirectPasswordResetEmail(payload.userEmail, payload.userName, payload.otp);
                break;
            default:
                return res.status(400).json({ success: false, error: 'Invalid emailType' });
        }

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result);
        }
    } catch (err) {
        console.error('❌ Error in internal email relay handler:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
