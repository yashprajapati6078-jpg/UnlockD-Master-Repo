const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an account name'],
    trim: true,
    maxlength: [50, 'Account name cannot exceed 50 characters'],
  },
  type: {
    type: String,
    required: [true, 'Please select an account type'],
    enum: ['Checking', 'Savings', 'Cash', 'Credit Card'],
    default: 'Checking',
  },
  balance: {
    type: Number,
    required: [true, 'Please provide an initial balance'],
    default: 0,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// A user cannot have two accounts with the same name
AccountSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Account', AccountSchema);
