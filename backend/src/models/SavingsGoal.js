const mongoose = require('mongoose');

const SavingsGoalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a goal title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please add a target amount'],
    min: [0.01, 'Target amount must be greater than 0'],
  },
  currentAmount: {
    type: Number,
    required: [true, 'Please add a current amount'],
    default: 0,
    min: [0, 'Current amount cannot be negative'],
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline date'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SavingsGoal', SavingsGoalSchema);
