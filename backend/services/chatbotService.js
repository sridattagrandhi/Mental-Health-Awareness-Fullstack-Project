const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Google Generative AI instance
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Function to generate a chatbot response
const generateChatResponse = async (sessionHistory, userMessage) => {
    try {
        console.log("Session history for Gemini API:", JSON.stringify(sessionHistory, null, 2));
        console.log("User message:", userMessage);

        // Ensure the history is formatted correctly for the Gemini API
        const formattedHistory = sessionHistory.map((entry) => ({
            role: entry.role,
            parts: entry.parts,
        }));

        // Add the user's latest message
        formattedHistory.push({
            role: "user",
            parts: [{ text: userMessage }],
        });

        console.log("Formatted history for Gemini API:", JSON.stringify(formattedHistory, null, 2));

        // Start a chat session with the history
        const chat = model.startChat({
            history: formattedHistory,
        });

        // Send the user's message and get the chatbot's response
        const result = await chat.sendMessage({ parts: [{ text: userMessage }] });
        console.log("Gemini API raw response:", result);

        // Validate the response structure
        if (!result || !result.response || typeof result.response.text !== "function") {
            throw new Error("Invalid response format from Gemini API");
        }

        // Return the generated response
        const responseText = result.response.text();
        console.log("Generated response text:", responseText);
        return responseText;
    } catch (error) {
        console.error("Error in generateChatResponse:", error.message);
        throw new Error("Failed to generate chatbot response");
    }
};

module.exports = { generateChatResponse };
