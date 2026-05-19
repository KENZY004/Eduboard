const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUser() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'fleetcosupport@gmail.com' });
    console.log('User exists in DB:', user ? { id: user._id, username: user.username, role: user.role } : '❌ No');
    await mongoose.disconnect();
}

checkUser();
