const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    moodLogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MoodLog",
        },
    ],
    journalEntries: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JournalEntry",
        },
    ],
    recoveryPlan: {
        goals: [String],
        actionPoints: [String],
        triggers: [String],
        crisisPlan: [String],
    },
});

module.exports = mongoose.model("User", UserSchema);
