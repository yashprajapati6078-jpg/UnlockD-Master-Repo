const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'All',
      'Food',
      'Shopping',
      'Transport',
      'Bills',
      'Entertainment',
      'Education',
      'Health',
      'Other'
    ],
    default: 'All',
  },
  amount: {
    type: Number,
    required: [true, 'Please add a budget amount'],
    min: [0.01, 'Budget amount must be greater than 0'],
  },
  month: {
    type: String,
    required: [true, 'Please add a month (Format: YYYY-MM)'],
    match: [/^\d{4}-\d{2}$/, 'Please use the format YYYY-MM'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Compound unique index so a user can set only one budget per category per month
BudgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
