const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function run() {
    try {
        console.log('Testing upload with parameters...');
        console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
        console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
        console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET);

        const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', {
            folder: 'teacher_verifications',
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf']
        });
        console.log('✅ Upload succeeded! URL:', result.secure_url);
    } catch (error) {
        console.error('❌ Upload failed:', error);
    }
}

run();
