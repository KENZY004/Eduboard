// Quick script to check pending teachers in database
const mongoose = require('mongoose');
const User = require('./models/User');
const TeacherVerification = require('./models/TeacherVerification');
require('dotenv').config();

async function checkPendingTeachers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all teachers
        const allTeachers = await User.find({ role: 'teacher' })
            .select('username email role verificationStatus isVerified createdAt');

        console.log(`📊 Total Teachers: ${allTeachers.length}\n`);

        if (allTeachers.length > 0) {
            console.log('All Teachers:');
            allTeachers.forEach((teacher, idx) => {
                console.log(`\n${idx + 1}. ${teacher.username} (${teacher.email})`);
                console.log(`   Status: ${teacher.verificationStatus}`);
                console.log(`   Verified: ${teacher.isVerified}`);
                console.log(`   ID: ${teacher._id}`);
            });
        }

        // Find pending teachers
        const pendingTeachers = await User.find({
            role: 'teacher',
            verificationStatus: 'pending'
        });

        console.log(`\n\n⏳ Pending Teachers: ${pendingTeachers.length}\n`);

        if (pendingTeachers.length > 0) {
            for (const teacher of pendingTeachers) {
                const verification = await TeacherVerification.findOne({ userId: teacher._id });
                console.log(`- ${teacher.username} (${teacher.email})`);
                console.log(`  Documents uploaded: ${verification ? verification.documents.length : 0}`);
            }
        } else {
            console.log('No pending teachers found.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkPendingTeachers();
