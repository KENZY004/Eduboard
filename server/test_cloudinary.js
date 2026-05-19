const cloudinary = require('cloudinary').v2;
require('dotenv').config();

console.log('Testing Cloudinary configuration...\n');
console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testUpload() {
    try {
        console.log('\nAttempting a test upload to Cloudinary...');
        // We can upload a base64 sample image
        const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', {
            folder: 'eduboard_test'
        });
        console.log('✅ Cloudinary upload successful!');
        console.log('Asset URL:', result.secure_url);
    } catch (error) {
        console.error('❌ Cloudinary upload failed:');
        console.error(error);
    }
}

testUpload();
