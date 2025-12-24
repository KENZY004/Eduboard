const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    elements: { type: Array, default: [] },
    allowedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    participants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['teacher', 'student'] },
        joinedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Board', boardSchema);
