const mongoose = require('mongoose');

async function testOldDb() {
    const oldUri = 'mongodb+srv://minhakenzyom23_db_user:3hHu1n78JqKaeYKe@eduboard.kpjsuqr.mongodb.net/test?retryWrites=true&w=majority';
    try {
        console.log('Connecting to old MongoDB...');
        await mongoose.connect(oldUri);
        console.log('✅ Connection to old database successful!');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in old database:', collections.map(c => c.name));
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    }
}

testOldDb();
