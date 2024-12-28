const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
  
    if (!token) {
      console.error("No token provided in the request");
      return res.status(401).json({ message: "No token, authorization denied" });
    }
  
    try {
      console.log("Received token:", token); // Log token for debugging
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token payload:", decoded); // Log decoded payload
  
      req.user = await User.findById(decoded.id);
      if (!req.user) {
        console.error("User not found for decoded token ID");
        return res.status(401).json({ message: "User not found" });
      }
  
      next();
    } catch (err) {
      console.error("JWT verification error:", err.message); // Log detailed error
      res.status(401).json({ message: "Token is not valid" });
    }
  };
  

module.exports = authMiddleware;
