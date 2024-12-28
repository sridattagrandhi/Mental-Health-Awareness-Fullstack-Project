const express = require("express");
const router = express.Router();
const JournalEntry = require("../models/JournalEntry");
const { authMiddleware } = require("./auth");

// Get all journal entries for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const journalEntries = await JournalEntry.find({ user: req.user.id });
    res.json(journalEntries);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Add a journal entry
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    const newJournalEntry = new JournalEntry({
      user: req.user.id,
      title,
      content,
    });

    const journalEntry = await newJournalEntry.save();
    res.json(journalEntry);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    console.log("Request received to delete:", req.params.id);
    const journalEntry = await JournalEntry.findById(req.params.id);

    if (!journalEntry) {
      console.log("Journal entry not found");
      return res.status(404).json({ message: "Journal entry not found" });
    }

    if (journalEntry.user.toString() !== req.user.id) {
      console.log("Not authorized to delete this entry");
      return res.status(403).json({ message: "Not authorized to delete this entry" });
    }

    console.log("Deleting journal entry:", journalEntry);
    await JournalEntry.deleteOne({ _id: req.params.id }); // Use deleteOne
    res.json({ message: "Journal entry removed" });
  } catch (err) {
    console.error("Error during deletion:", err); // Log the error
    res.status(500).send("Server Error");
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
      console.log("Request received to edit:", req.params.id);

      const { title, content } = req.body;

      // Find the journal entry by ID
      const journalEntry = await JournalEntry.findById(req.params.id);

      if (!journalEntry) {
          console.log("Journal entry not found");
          return res.status(404).json({ message: "Journal entry not found" });
      }

      // Ensure the user is authorized to edit this entry
      if (journalEntry.user.toString() !== req.user.id) {
          console.log("Not authorized to edit this entry");
          return res.status(403).json({ message: "Not authorized to edit this entry" });
      }

      // Update the entry
      journalEntry.title = title || journalEntry.title; // Keep the current title if none is provided
      journalEntry.content = content || journalEntry.content; // Keep the current content if none is provided

      const updatedEntry = await journalEntry.save(); // Save the changes
      console.log("Journal entry updated:", updatedEntry);

      res.json(updatedEntry); // Send the updated entry back to the client
  } catch (err) {
      console.error("Error during update:", err); // Log the error
      res.status(500).send("Server Error");
  }
});



module.exports = router;
