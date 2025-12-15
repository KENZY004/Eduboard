const mongoose = require('mongoose');
require('dotenv').config();
const Board = require('./models/Board');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eduwhiteboard';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB under Reset Script');
        try {
            await Board.deleteMany({});
            console.log('Successfully cleared all boards.');
        } catch (e) {
            console.error('Error clearing boards:', e);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
