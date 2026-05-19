const mongoose = require('mongoose');
const User = require('./models/User');
const TeacherVerification = require('./models/TeacherVerification');
require('dotenv').config();

async function checkAll() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('--- ALL USERS WITH ROLE TEACHER ---');
    const teachers = await User.find({ role: 'teacher' });
    for (const t of teachers) {
        const verification = await TeacherVerification.findOne({ userId: t._id });
        console.log(`Username: ${t.username}`);
        console.log(`Email: ${t.email}`);
        console.log(`Has Verification Record: ${verification ? '✅ Yes' : '❌ No'}`);
        if (verification) {
            console.log(`Documents count: ${verification.documents ? verification.documents.length : 0}`);
            console.log(`Documents details:`, verification.documents);
        }
        console.log('-----------------------------');
    }
    
    await mongoose.disconnect();
}

checkAll();
