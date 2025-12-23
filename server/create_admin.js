const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdminUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'kenzninnu409@gmail.com' });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');

            // Update to admin role if not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                existingAdmin.isVerified = true;
                existingAdmin.verificationStatus = 'approved';
                await existingAdmin.save();
                console.log('✅ Updated existing user to admin role');
            }
        } else {
            // Create new admin user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            const adminUser = new User({
                username: 'Admin',
                email: 'kenzninnu409@gmail.com',
                password: hashedPassword,
                role: 'admin',
                isVerified: true,
                verificationStatus: 'approved'
            });

            await adminUser.save();
            console.log('✅ Admin user created successfully');
        }

        console.log('\n📧 Admin Email: kenzninnu409@gmail.com');
        console.log('🔑 Admin Password: admin123');
        console.log('🎯 Admin Role: admin\n');

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    } catch (err) {
        console.error('❌ Error creating admin user:', err);
        process.exit(1);
    }
}

createAdminUser();
