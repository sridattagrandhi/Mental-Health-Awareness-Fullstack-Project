const express = require("express");
const router = express.Router();
const MoodLog = require("../models/MoodLog");
const auth = require("../middleware/auth");

// Get Mood Logs for Authenticated User
router.get("/", auth, async (req, res) => {
  try {
    const moodLogs = await MoodLog.find({ user: req.user.id });
    res.json(moodLogs);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.post("/", auth, async (req, res) => {
    try {
      const { date, mood, notes } = req.body;
  
      const newMoodLog = new MoodLog({
        user: req.user.id,
        date: date || new Date().toISOString(), // Use ISO string for consistent formatting
        mood,
      });
  
      const moodLog = await newMoodLog.save();
      res.json(moodLog);
    } catch (err) {
      res.status(500).send("Server Error");
    }
  });
  
  

module.exports = router;
