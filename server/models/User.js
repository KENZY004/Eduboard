const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['teacher', 'student', 'admin'],
        default: 'student'
    },
    isVerified: {
        type: Boolean,
        default: function () {
            return this.role === 'student'; // Students are auto-verified
        }
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: function () {
            return this.role === 'student' ? 'approved' : 'pending';
        }
    },
    verificationDate: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    savedBoards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
