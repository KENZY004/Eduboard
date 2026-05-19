const mongoose = require('mongoose');
const TeacherVerification = require('./models/TeacherVerification');
const User = require('./models/User');
require('dotenv').config();

async function checkVerification() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'fleetcosupport@gmail.com' });
    if (!user) {
        console.log('No user found.');
        await mongoose.disconnect();
        return;
    }
    console.log('User found:', user._id);
    const verification = await TeacherVerification.findOne({ userId: user._id });
    console.log('Verification record:', verification ? verification : '❌ None');
    await mongoose.disconnect();
}

checkVerification();
