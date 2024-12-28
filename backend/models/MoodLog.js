const mongoose = require('mongoose');

const MoodLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference the User model
        required: true,
    },
    mood: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('MoodLog', MoodLogSchema);
