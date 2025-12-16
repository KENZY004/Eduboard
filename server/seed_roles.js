const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

console.log('Starting seed script...');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env file');
    process.exit(1);
}

const seedUsers = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB (Cloud)');

        // Clear existing users (optional - comment out if you want to keep existing users)
        console.log('Clearing existing users...');
        await User.deleteMany({});
        console.log('✓ Cleared existing users');

        // Hash passwords using salt like in auth.js
        console.log('Hashing passwords...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        console.log('✓ Passwords hashed');

        // Create sample users with different roles
        const users = [
            {
                username: 'teacher1',
                email: 'teacher1@eduboard.com',
                password: hashedPassword,
                role: 'teacher'
            },
            {
                username: 'teacher2',
                email: 'teacher2@eduboard.com',
                password: hashedPassword,
                role: 'teacher'
            },
            {
                username: 'student1',
                email: 'student1@eduboard.com',
                password: hashedPassword,
                role: 'student'
            },
            {
                username: 'student2',
                email: 'student2@eduboard.com',
                password: hashedPassword,
                role: 'student'
            },
            {
                username: 'student3',
                email: 'student3@eduboard.com',
                password: hashedPassword,
                role: 'student'
            }
        ];

        // Insert users
        console.log('Inserting users...');
        const createdUsers = await User.insertMany(users);
        console.log(`\n✓ Successfully created ${createdUsers.length} users:`);
        createdUsers.forEach(user => {
            console.log(`  ✓ ${user.username} (${user.role}) - ${user.email}`);
        });

        console.log('\n📝 Login credentials for all users:');
        console.log('   Password: password123\n');

    } catch (error) {
        console.error('❌ Error seeding database:');
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);
        process.exit(1);
    } finally {
        console.log('Disconnecting from MongoDB...');
        await mongoose.disconnect();
        console.log('✓ Disconnected from MongoDB');
    }
};

seedUsers();
