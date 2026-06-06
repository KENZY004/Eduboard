const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Determine which email service to use based on environment
const USE_GMAIL = process.env.USE_GMAIL === 'true';
const SHOULD_RELAY = process.env.RENDER === 'true' || process.env.USE_VERCEL_RELAY === 'true';
const VERCEL_BACKEND_URL = process.env.VERCEL_BACKEND_URL;
const INTERNAL_EMAIL_SECRET = process.env.INTERNAL_EMAIL_SECRET;

let transporter = null;
let resend = null;

if (SHOULD_RELAY) {
    console.log('📡 Dual-mode emailService: Relaying outgoing emails to Vercel');
} else if (USE_GMAIL) {
    // Gmail SMTP for localhost / Vercel relay backend
    transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    transporter.verify((error, success) => {
        if (error) {
            console.error('Gmail SMTP verification failed:', error);
        } else {
            console.log('✅ Gmail SMTP ready to send emails');
        }
    });
} else {
    // Resend for production
    if (process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
        console.log('✅ Using Resend for email delivery');
    } else {
        console.warn('⚠️ Warning: RESEND_API_KEY is not set. Email features will be disabled.');
    }
}

/**
 * Helper to make secure HTTP email relay request to Vercel
 */
const relayEmailRequest = async (emailType, payload) => {
    if (!VERCEL_BACKEND_URL) {
        console.error('❌ VERCEL_BACKEND_URL is not set. Relay failed.');
        return { success: false, error: 'VERCEL_BACKEND_URL is not configured' };
    }
    if (!INTERNAL_EMAIL_SECRET) {
        console.error('❌ INTERNAL_EMAIL_SECRET is not set. Relay failed.');
        return { success: false, error: 'INTERNAL_EMAIL_SECRET is not configured' };
    }

    try {
        const url = `${VERCEL_BACKEND_URL.replace(/\/$/, '')}/api/internal/send-email`;
        console.log(`📡 Relaying ${emailType} email request to Vercel...`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-secret': INTERNAL_EMAIL_SECRET
            },
            body: JSON.stringify({ emailType, payload })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            console.log(`✅ Email successfully relayed and sent via Vercel: ${data.messageId}`);
            return data;
        } else {
            console.error(`❌ Email relay failed:`, data.error || 'Unknown error');
            return { success: false, error: data.error || 'Relay server error' };
        }
    } catch (error) {
        console.error('❌ Network error during email relay:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send email notification to admin when a teacher registers
 */
const sendTeacherRegistrationNotification = async (teacherData, documents) => {
    if (SHOULD_RELAY) {
        return await relayEmailRequest('teacher-notification', { teacherData, documents });
    }
    return await sendDirectTeacherRegistrationNotification(teacherData, documents);
};

const sendDirectTeacherRegistrationNotification = async (teacherData, documents) => {
    const adminEmail = process.env.ADMIN_EMAIL;

    const documentList = documents.map(doc => {
        const docType = doc.type.replace('_', ' ').toUpperCase();
        return `<li><strong>${docType}:</strong> <a href="${doc.url}">View Document</a></li>`;
    }).join('');

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #0891b2 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">⚡ EduBoard</h1>
                <p style="color: #e0f2fe; margin: 10px 0 0 0;">Teacher Verification Request</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #1e293b; margin-top: 0;">New Teacher Registration</h2>
                
                <p style="color: #475569; line-height: 1.6;">
                    A new teacher has registered and is awaiting verification. Please review their documents and approve or reject their application.
                </p>
                
                <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1e293b; margin-top: 0; font-size: 16px;">Teacher Details</h3>
                    <p style="margin: 8px 0;"><strong>Name:</strong> ${teacherData.username}</p>
                    <p style="margin: 8px 0;"><strong>Email:</strong> ${teacherData.email}</p>
                    <p style="margin: 8px 0;"><strong>User ID:</strong> ${teacherData.userId}</p>
                    <p style="margin: 8px 0;"><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <div style="margin: 20px 0;">
                    <h3 style="color: #1e293b; font-size: 16px;">Uploaded Documents</h3>
                    <ul style="color: #475569; line-height: 1.8;">
                        ${documentList}
                    </ul>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                    <a href="${process.env.CLIENT_URL}/admin" 
                       style="display: inline-block; background: linear-gradient(135deg, #0891b2 0%, #3b82f6 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        Go to Admin Panel
                    </a>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
                <p>This is an automated notification from EduBoard</p>
            </div>
        </div>
    `;

    try {
        if (USE_GMAIL) {
            // Send via Gmail SMTP
            const info = await transporter.sendMail({
                from: `"EduBoard Verification" <${process.env.SMTP_USER}>`,
                to: adminEmail,
                subject: '🔔 New Teacher Registration - Verification Required',
                html: htmlContent
            });
            console.log('✅ Admin notification sent via Gmail:', info.messageId);
            return { success: true, messageId: info.messageId };
        } else {
            // Send via Resend
            const { data, error } = await resend.emails.send({
                from: 'EduBoard <onboarding@resend.dev>',
                to: [adminEmail],
                subject: '🔔 New Teacher Registration - Verification Required',
                html: htmlContent
            });

            if (error) {
                console.error('❌ Failed to send admin notification:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Admin notification sent via Resend:', data.id);
            return { success: true, messageId: data.id };
        }
    } catch (error) {
        console.error('❌ Failed to send admin notification:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send approval email to teacher
 */
const sendApprovalEmail = async (teacherEmail, teacherName) => {
    if (SHOULD_RELAY) {
        return await relayEmailRequest('approval', { teacherEmail, teacherName });
    }
    return await sendDirectApprovalEmail(teacherEmail, teacherName);
};

const sendDirectApprovalEmail = async (teacherEmail, teacherName) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">⚡ EduBoard</h1>
                <p style="color: #d1fae5; margin: 10px 0 0 0;">Account Approved</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #1e293b; margin-top: 0;">Welcome to EduBoard! 🎉</h2>
                
                <p style="color: #475569; line-height: 1.6;">
                    Hi <strong>${teacherName}</strong>,
                </p>
                
                <p style="color: #475569; line-height: 1.6;">
                    Great news! Your teacher account has been approved. You can now log in and start using EduBoard's collaborative whiteboard platform.
                </p>
                
                <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                    <p style="margin: 0; color: #065f46; font-weight: 600;">
                        ✅ Your account is now active and ready to use!
                    </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.CLIENT_URL}/login" 
                       style="display: inline-block; background: linear-gradient(135deg, #0891b2 0%, #3b82f6 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 6px rgba(8, 145, 178, 0.3);">
                        Login to EduBoard
                    </a>
                </div>
                
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                    If you have any questions or need assistance, feel free to reach out to our support team.
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
                <p>This is an automated email from EduBoard</p>
            </div>
        </div>
    `;

    try {
        if (USE_GMAIL) {
            // Send via Gmail SMTP
            const info = await transporter.sendMail({
                from: `"EduBoard" <${process.env.SMTP_USER}>`,
                to: teacherEmail,
                subject: '🎉 Your Teacher Account Has Been Approved!',
                html: htmlContent
            });
            console.log('✅ Approval email sent via Gmail to:', teacherEmail);
            return { success: true, messageId: info.messageId };
        } else {
            // Send via Resend
            const { data, error } = await resend.emails.send({
                from: 'EduBoard <onboarding@resend.dev>',
                to: [teacherEmail],
                subject: '🎉 Your Teacher Account Has Been Approved!',
                html: htmlContent
            });

            if (error) {
                console.error('❌ Failed to send approval email:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Approval email sent via Resend to:', teacherEmail);
            return { success: true, messageId: data.id };
        }
    } catch (error) {
        console.error('❌ Failed to send approval email:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send rejection email to teacher
 */
const sendRejectionEmail = async (teacherEmail, teacherName, reason) => {
    if (SHOULD_RELAY) {
        return await relayEmailRequest('rejection', { teacherEmail, teacherName, reason });
    }
    return await sendDirectRejectionEmail(teacherEmail, teacherName, reason);
};

const sendDirectRejectionEmail = async (teacherEmail, teacherName, reason) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">⚡ EduBoard</h1>
                <p style="color: #e2e8f0; margin: 10px 0 0 0;">Application Update</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #1e293b; margin-top: 0;">Application Status Update</h2>
                
                <p style="color: #475569; line-height: 1.6;">
                    Hi <strong>${teacherName}</strong>,
                </p>
                
                <p style="color: #475569; line-height: 1.6;">
                    Thank you for your interest in joining EduBoard as a teacher. After reviewing your application, we're unable to approve your account at this time.
                </p>
                
                ${reason ? `
                <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                    <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong></p>
                    <p style="margin: 10px 0 0 0; color: #7f1d1d;">${reason}</p>
                </div>
                ` : ''}
                
                <p style="color: #475569; line-height: 1.6;">
                    If you believe this is an error or would like to reapply with updated documentation, please contact our support team.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="mailto:${process.env.ADMIN_EMAIL}" 
                       style="display: inline-block; background: linear-gradient(135deg, #64748b 0%, #475569 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        Contact Support
                    </a>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
                <p>This is an automated email from EduBoard</p>
            </div>
        </div>
    `;

    try {
        if (USE_GMAIL) {
            // Send via Gmail SMTP
            const info = await transporter.sendMail({
                from: `"EduBoard" <${process.env.SMTP_USER}>`,
                to: teacherEmail,
                subject: 'Update on Your Teacher Account Application',
                html: htmlContent
            });
            console.log('✅ Rejection email sent via Gmail to:', teacherEmail);
            return { success: true, messageId: info.messageId };
        } else {
            // Send via Resend
            const { data, error } = await resend.emails.send({
                from: 'EduBoard <onboarding@resend.dev>',
                to: [teacherEmail],
                subject: 'Update on Your Teacher Account Application',
                html: htmlContent
            });

            if (error) {
                console.error('❌ Failed to send rejection email:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Rejection email sent via Resend to:', teacherEmail);
            return { success: true, messageId: data.id };
        }
    } catch (error) {
        console.error('❌ Failed to send rejection email:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send password reset OTP email
 */
const sendPasswordResetEmail = async (userEmail, userName, otp) => {
    if (SHOULD_RELAY) {
        return await relayEmailRequest('password-reset', { userEmail, userName, otp });
    }
    return await sendDirectPasswordResetEmail(userEmail, userName, otp);
};

const sendDirectPasswordResetEmail = async (userEmail, userName, otp) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">⚡ EduBoard</h1>
                <p style="color: #fef3c7; margin: 10px 0 0 0;">Password Reset Request</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #1e293b; margin-top: 0;">Reset Your Password</h2>
                
                <p style="color: #475569; line-height: 1.6;">
                    Hi <strong>${userName}</strong>,
                </p>
                
                <p style="color: #475569; line-height: 1.6;">
                    We received a request to reset the password for your EduBoard account. Use the One-Time Password (OTP) below to proceed.
                </p>
                
                <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #f59e0b;">
                    <p style="margin: 0; color: #b45309; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your OTP</p>
                    <p style="margin: 10px 0 0 0; color: #78350f; font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
                </div>
                
                <p style="color: #475569; line-height: 1.6; font-size: 14px;">
                    <strong>Note:</strong> This OTP is valid for the next 10 minutes. If you did not request a password reset, you can safely ignore this email.
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
                <p>This is an automated email from EduBoard</p>
            </div>
        </div>
    `;

    try {
        if (USE_GMAIL) {
            // Send via Gmail SMTP
            const info = await transporter.sendMail({
                from: `"EduBoard" <${process.env.SMTP_USER}>`,
                to: userEmail,
                subject: '🔒 Your Password Reset OTP',
                html: htmlContent
            });
            console.log('✅ Password reset email sent via Gmail to:', userEmail);
            return { success: true, messageId: info.messageId };
        } else {
            // Send via Resend
            const { data, error } = await resend.emails.send({
                from: 'EduBoard <onboarding@resend.dev>',
                to: [userEmail],
                subject: '🔒 Your Password Reset OTP',
                html: htmlContent
            });

            if (error) {
                console.error('❌ Failed to send password reset email:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Password reset email sent via Resend to:', userEmail);
            return { success: true, messageId: data.id };
        }
    } catch (error) {
        console.error('❌ Failed to send password reset email:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send email registration verification OTP
 */
const sendRegistrationVerificationEmail = async (userEmail, userName, otp) => {
    if (SHOULD_RELAY) {
        return await relayEmailRequest('registration-verification', { userEmail, userName, otp });
    }

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">⚡ EduBoard</h1>
                <p style="color: #e0e7ff; margin: 10px 0 0 0;">Email Verification Request</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email Address</h2>
                
                <p style="color: #475569; line-height: 1.6;">
                    Hi <strong>${userName}</strong>,
                </p>
                
                <p style="color: #475569; line-height: 1.6;">
                    Thank you for signing up for EduBoard! To complete your registration and activate your account, please verify your email address using the One-Time Password (OTP) below.
                </p>
                
                <div style="background-color: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #6366f1;">
                    <p style="margin: 0; color: #4338ca; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Verification OTP</p>
                    <p style="margin: 10px 0 0 0; color: #1e1b4b; font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
                </div>
                
                <p style="color: #475569; line-height: 1.6; font-size: 14px;">
                    <strong>Note:</strong> This OTP is valid for the next 10 minutes. If you did not sign up for an account, you can safely ignore this email.
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
                <p>This is an automated email from EduBoard</p>
            </div>
        </div>
    `;

    try {
        if (USE_GMAIL) {
            // Send via Gmail SMTP
            const info = await transporter.sendMail({
                from: `"EduBoard" <${process.env.SMTP_USER}>`,
                to: userEmail,
                subject: '✉️ Verify Your EduBoard Email Address',
                html: htmlContent
            });
            console.log('✅ Verification email sent via Gmail to:', userEmail);
            return { success: true, messageId: info.messageId };
        } else {
            // Send via Resend
            const { data, error } = await resend.emails.send({
                from: 'EduBoard <onboarding@resend.dev>',
                to: [userEmail],
                subject: '✉️ Verify Your EduBoard Email Address',
                html: htmlContent
            });

            if (error) {
                console.error('❌ Failed to send verification email:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Verification email sent via Resend to:', userEmail);
            return { success: true, messageId: data.id };
        }
    } catch (error) {
        console.error('❌ Failed to send verification email:', error.message);
        return { success: false, error: error.message };
    }
};

const sendDirectRegistrationVerificationEmail = async (userEmail, userName, otp) => {
    return await sendRegistrationVerificationEmail(userEmail, userName, otp);
};

const sendContactFormEmail = async (adminEmail, subject, textContent) => {
    if (SHOULD_RELAY) {
        return await relayEmailRequest('contact', { adminEmail, subject, textContent });
    }
    return await sendDirectContactFormEmail(adminEmail, subject, textContent);
};

const sendDirectContactFormEmail = async (adminEmail, subject, textContent) => {
    // Basic formatting for contact form text
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #0891b2 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">⚡ EduBoard</h1>
                <p style="color: #e0f2fe; margin: 10px 0 0 0;">New Contact Form Submission</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #1e293b; margin-top: 0;">${subject}</h2>
                
                <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; color: #475569; line-height: 1.6;">
${textContent}
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
                <p>This is an automated notification from EduBoard Contact Form</p>
            </div>
        </div>
    `;

    try {
        if (USE_GMAIL) {
            const info = await transporter.sendMail({
                from: `"EduBoard Contact" <${process.env.SMTP_USER}>`,
                to: adminEmail,
                subject: subject,
                html: htmlContent
            });
            console.log('✅ Contact email sent via Gmail to:', adminEmail);
            return { success: true, messageId: info.messageId };
        } else {
            const { data, error } = await resend.emails.send({
                from: 'EduBoard <onboarding@resend.dev>',
                to: [adminEmail],
                subject: subject,
                html: htmlContent
            });

            if (error) {
                console.error('❌ Failed to send contact email:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Contact email sent via Resend to:', adminEmail);
            return { success: true, messageId: data.id };
        }
    } catch (error) {
        console.error('❌ Failed to send contact email:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendTeacherRegistrationNotification,
    sendDirectTeacherRegistrationNotification,
    sendApprovalEmail,
    sendDirectApprovalEmail,
    sendRejectionEmail,
    sendDirectRejectionEmail,
    sendPasswordResetEmail,
    sendDirectPasswordResetEmail,
    sendRegistrationVerificationEmail,
    sendDirectRegistrationVerificationEmail,
    sendContactFormEmail,
    sendDirectContactFormEmail,
};
