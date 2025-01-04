const express = require("express");
const router = express.Router();
const ChatbotSession = require("../models/ChatbotSession");
const { generateChatResponse } = require("../services/chatbotService");
const axios = require("axios");
const { authMiddleware } = require("./auth");

// Create or get chatbot session
router.post("/session", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        let session = await ChatbotSession.findOne({ user: userId });
        if (!session) {
            session = new ChatbotSession({
                user: userId,
                sessionId: `session-${userId}`,
                messages: [],
            });

            await session.save();
        }

        res.json({ sessionId: session.sessionId });
    } catch (err) {
        console.error("Error in creating/retrieving session:", err.message);
        res.status(500).json({ error: "Failed to create or retrieve chatbot session" });
    }
});

router.post("/generate", authMiddleware, async (req, res) => {
    try {
        const { prompt, sessionId } = req.body;

        if (!prompt || typeof prompt !== "string") {
            return res.status(400).json({ error: "Invalid request: prompt is required." });
        }

        if (!sessionId || typeof sessionId !== "string") {
            return res.status(400).json({ error: "Invalid request: sessionId is required." });
        }

        // Retrieve session from database
        const session = await ChatbotSession.findOne({ sessionId });
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        // Prepare session history
        const sessionHistory = session.messages.map((msg) => ({
            parts: [{ text: msg.text }],
        }));

        // Add the current prompt to the history
        sessionHistory.push({
            parts: [{ text: prompt }],
        });

        // Send request to Google's Gemini API
        const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
        const apiKey = process.env.GEMINI_API_KEY;

        const response = await axios.post(
            `${apiUrl}?key=${apiKey}`,
            {
                contents: sessionHistory,
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7,
                },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        // Extract and log the API response
        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reply) {
            throw new Error("Invalid response from Gemini API");
        }

        console.log("Generated reply from Gemini API:", reply);

        // Save the new messages to the session
        session.messages.push({ sender: "user", text: prompt });
        session.messages.push({ sender: "chatbot", text: reply });
        await session.save();

        // Return the generated reply
        res.status(200).json({ reply });
    } catch (error) {
        console.error("Error in /generate route:", error.message);
        res.status(500).json({ error: "Failed to generate chatbot response" });
    }
});


// Fetch chatbot conversation history
router.get("/history/:sessionId", authMiddleware, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await ChatbotSession.findOne({ sessionId }).populate("user");
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        res.json({ messages: session.messages });
    } catch (err) {
        console.error("Error in retrieving chatbot history:", err.message);
        res.status(500).json({ error: "Failed to retrieve chatbot history" });
    }
});

module.exports = router;
