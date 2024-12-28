const express = require("express");
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For generating tokens
const User = require("../models/User");

const router = express.Router();

// Secret key for JWT (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";

// User Registration Route
router.post("/register", async (req, res) => {
    try {
        console.log("Incoming Registration Data:", req.body);
        const { username, password } = req.body;

        // Username validation
        if (!username || username.length < 5) {
            return res.status(400).json({ message: "Username must be at least 5 characters long" });
        }

        // Password validation (basic)
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be at least 6 characters, include an uppercase letter, a number, and a special character",
            });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("Username already exists:", username);
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save the new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        console.log("User registered successfully:", newUser);
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// User Login Route
router.post("/login", async (req, res) => {
    try {
        console.log("Incoming Login Data:", req.body);
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            console.log("User not found:", username);
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Invalid password for user:", username);
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
            expiresIn: "1h", // Token expires in 1 hour
        });

        console.log("Login successful for user:", username);
        res.status(200).json({ token, message: "Login successful" });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ message: "Server error during login" });
    }
});

// Middleware to authenticate requests
const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id);
        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

// Export only the router by default
module.exports = router;

// Export authMiddleware separately
module.exports.authMiddleware = authMiddleware;
