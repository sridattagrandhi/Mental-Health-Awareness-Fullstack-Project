const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const RecoveryPlanSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  goals: [String],
  actionPoints: [String],
  triggers: [String],
  crisisPlan: [String],
});

module.exports = mongoose.model('RecoveryPlan', RecoveryPlanSchema);
