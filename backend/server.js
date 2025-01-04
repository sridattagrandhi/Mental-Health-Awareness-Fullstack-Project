const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const journalRoutes = require("./routes/journal");
const moodRoutes = require("./routes/mood");
const recoveryRoutes = require("./routes/recovery");
const chatbotRoutes = require("./routes/chatbot"); // Import chatbot routes

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes); // Auth routes
app.use("/api/journal", journalRoutes); // Journal routes
app.use("/api/moodlogs", moodRoutes); // Mood log routes
app.use("/api/recovery", recoveryRoutes); // Recovery routes
app.use("/api/chatbot", chatbotRoutes); // Chatbot routes

// Server Listener
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
