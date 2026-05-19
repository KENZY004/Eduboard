const mongoose = require('mongoose');
const User = require('./models/User');
const TeacherVerification = require('./models/TeacherVerification');
require('dotenv').config();

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    const pendingTeachers = await User.find({
        role: 'teacher',
        verificationStatus: 'pending'
    }).select('username email createdAt');

    const teachersWithDocs = await Promise.all(
        pendingTeachers.map(async (teacher) => {
            const verification = await TeacherVerification.findOne({ userId: teacher._id });
            return {
                id: teacher._id,
                username: teacher.username,
                email: teacher.email,
                registeredAt: teacher.createdAt,
                documents: verification ? verification.documents : [],
                hasDocuments: !!verification
            };
        })
    );

    console.log(JSON.stringify(teachersWithDocs, null, 2));
    await mongoose.disconnect();
}

test();
