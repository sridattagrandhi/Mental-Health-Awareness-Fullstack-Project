const express = require("express");
const router = express.Router();
const RecoveryPlan = require("../models/RecoveryPlan");
const { authMiddleware } = require("./auth");

// Get recovery plan for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const recoveryPlan = await RecoveryPlan.findOne({ user: req.user.id });
    res.json(recoveryPlan || { goals: [], actionPoints: [], triggers: [], crisisPlan: [] });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Update or create recovery plan
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { goals, actionPoints, triggers, crisisPlan } = req.body;

    let recoveryPlan = await RecoveryPlan.findOne({ user: req.user.id });

    if (recoveryPlan) {
      recoveryPlan.goals = goals;
      recoveryPlan.actionPoints = actionPoints;
      recoveryPlan.triggers = triggers;
      recoveryPlan.crisisPlan = crisisPlan;
      await recoveryPlan.save();
    } else {
      recoveryPlan = new RecoveryPlan({
        user: req.user.id,
        goals,
        actionPoints,
        triggers,
        crisisPlan,
      });
      await recoveryPlan.save();
    }

    res.json(recoveryPlan);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Delete a specific item from recovery plan
// Delete a specific item from recovery plan
router.delete("/:type/:index", authMiddleware, async (req, res) => {
  try {
    const { type, index } = req.params; // type can be 'goals', 'actionPoints', 'triggers', 'crisisPlan'

    let recoveryPlan = await RecoveryPlan.findOne({ user: req.user.id });
    if (!recoveryPlan) {
      return res.status(404).json({ message: "Recovery plan not found" });
    }

    // Remove the specific item based on type and index
    if (recoveryPlan[type] && Array.isArray(recoveryPlan[type])) {
      recoveryPlan[type].splice(index, 1);
      await recoveryPlan.save();
      return res.json(recoveryPlan);
    } else {
      return res.status(400).json({ message: "Invalid type or index" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Edit a specific item in recovery plan
router.put("/:type/:index", authMiddleware, async (req, res) => {
  try {
    const { type, index } = req.params;
    const { value } = req.body; // New value to update

    let recoveryPlan = await RecoveryPlan.findOne({ user: req.user.id });
    if (!recoveryPlan) {
      return res.status(404).json({ message: "Recovery plan not found" });
    }

    // Update the specific item based on type and index
    if (recoveryPlan[type] && Array.isArray(recoveryPlan[type])) {
      if (index < 0 || index >= recoveryPlan[type].length) {
        return res.status(400).json({ message: "Invalid index" });
      }
      recoveryPlan[type][index] = value;
      await recoveryPlan.save();
      return res.json(recoveryPlan);
    } else {
      return res.status(400).json({ message: "Invalid type or index" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


module.exports = router;
