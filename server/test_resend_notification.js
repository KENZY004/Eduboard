const { sendTeacherRegistrationNotification } = require('./services/emailService');
require('dotenv').config();

// Override USE_GMAIL to false to simulate Render
process.env.USE_GMAIL = 'false';

// Force re-initialize or check if we can run it
console.log('Testing sendTeacherRegistrationNotification with Resend...');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY);
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

const mockTeacher = {
    username: 'learnix_test',
    email: 'learnixofficial.app@gmail.com',
    userId: '6a099a013a0688e05cb1fae1'
};

const mockDocs = [
    { type: 'id_proof', url: 'https://res.cloudinary.com/dmjm9faw3/image/upload/v1779014203/eduboard_test/cr7ubd7adwafyuqheohc.png' },
    { type: 'teaching_certificate', url: 'https://res.cloudinary.com/dmjm9faw3/image/upload/v1779014203/eduboard_test/cr7ubd7adwafyuqheohc.png' }
];

async function run() {
    try {
        const result = await sendTeacherRegistrationNotification(mockTeacher, mockDocs);
        console.log('Result:', result);
    } catch (error) {
        console.error('Error caught in test:', error);
    }
}

run();
