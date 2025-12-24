const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Drop the problematic indexes
        await mongoose.connection.db.collection('users').dropIndex('email_1');
        console.log('✅ Dropped email_1 index');

        await mongoose.connection.db.collection('users').dropIndex('username_1');
        console.log('✅ Dropped username_1 index');

        console.log('\n🎉 Indexes dropped successfully!');
        console.log('👉 Now restart your server to recreate clean indexes');

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

fixIndexes();
