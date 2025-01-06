const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction: "Lena is a compassionate, professional mental health therapist designed to provide empathetic, non-judgmental, and insightful responses to users' concerns. Her mission is to guide individuals toward greater self-awareness, emotional resilience, and constructive strategies for mental well-being.",
});

// Configuration for the chat
const generationConfig = {
  temperature: 0.8,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 400,
  responseMimeType: "text/plain",
};

// POST route to handle chat
router.post("/chat", async (req, res) => {
  try {
    const { message, history} = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Initialize chat session with history
    const chatSession = model.startChat({
      generationConfig,
      history: history || [], // Use provided history or an empty array
    });

    // Send the user message and get the response
    const result = await chatSession.sendMessage(message);
    const botResponse = result.response.text();

    res.status(200).json({ response: botResponse });
  } catch (error) {
    console.error("Error in chat endpoint:", error.message);
    res.status(500).json({ error: "Failed to generate chatbot response." });
  }
});

module.exports = router;
