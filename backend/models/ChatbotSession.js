const mongoose = require("mongoose");

const ChatbotSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
    },
    messages: [
        {
            sender: { type: String, enum: ["user", "chatbot"], required: true },
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("ChatbotSession", ChatbotSessionSchema);
