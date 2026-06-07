const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    publicId: {
        type: String,
        required: true,
        unique: true
    },
    url: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);
