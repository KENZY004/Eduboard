const mongoose = require('mongoose');
require('dotenv').config();

async function rebuildIndexes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');
        console.log('📍 Database:', mongoose.connection.db.databaseName);

        const collection = mongoose.connection.db.collection('users');

        // Get all existing indexes
        const indexes = await collection.indexes();
        console.log('\n📋 Current indexes:', indexes.map(i => i.name).join(', '));

        // Drop email and username indexes if they exist
        for (const index of indexes) {
            if (index.name === 'email_1' || index.name === 'username_1') {
                try {
                    await collection.dropIndex(index.name);
                    console.log(`✅ Dropped ${index.name}`);
                } catch (err) {
                    console.log(`⚠️  Could not drop ${index.name}: ${err.message}`);
                }
            }
        }

        // Recreate the indexes
        await collection.createIndex({ email: 1 }, { unique: true });
        console.log('✅ Created fresh email_1 index');

        await collection.createIndex({ username: 1 }, { unique: true });
        console.log('✅ Created fresh username_1 index');

        console.log('\n🎉 Indexes rebuilt successfully!');
        console.log('👉 Try registering on your deployed site now!');

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error('Full error:', err);
        process.exit(1);
    }
}

rebuildIndexes();
