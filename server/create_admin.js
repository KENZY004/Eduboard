const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'kenznajeeb@gmail.com';
const NEW_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function createAdminUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Delete any unwanted admin user
        const deletionResult = await User.deleteOne({ email: 'kenzninnu409@gmail.com' });
        if (deletionResult.deletedCount > 0) {
            console.log('🧹 Removed legacy admin user (kenzninnu409@gmail.com)');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

        if (existingAdmin) {
            console.log(`⚠️  Admin user already exists for ${ADMIN_EMAIL}`);
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'admin';
            existingAdmin.isVerified = true;
            existingAdmin.verificationStatus = 'approved';
            await existingAdmin.save();
            console.log(`✅ Updated existing user ${ADMIN_EMAIL} to admin role with password`);
        } else {
            const adminUser = new User({
                username: ADMIN_EMAIL.split('@')[0],
                email: ADMIN_EMAIL,
                password: hashedPassword,
                role: 'admin',
                isVerified: true,
                verificationStatus: 'approved'
            });

            await adminUser.save();
            console.log(`✅ Admin user created successfully for ${ADMIN_EMAIL}`);
        }

        console.log('\n📧 Sole Admin Email Seeded/Updated:');
        console.log(`  - ${ADMIN_EMAIL}`);
        console.log(`🔑 Admin Password Set To: ${NEW_PASSWORD}`);
        console.log('🎯 Admin Role: admin\n');

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    } catch (err) {
        console.error('❌ Error creating/updating admin user:', err);
        process.exit(1);
    }
}

createAdminUser();
