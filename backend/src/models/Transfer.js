const mongoose = require('mongoose');

const TransferSchema = new mongoose.Schema({
  fromAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Please specify the source account'],
  },
  toAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Please specify the destination account'],
  },
  amount: {
    type: Number,
    required: [true, 'Please specify the transfer amount'],
    min: [0.01, 'Amount must be greater than 0'],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
  },
  status: {
    type: String,
    required: true,
    enum: ['Completed', 'Failed'],
    default: 'Completed',
  },
  idempotencyKey: {
    type: String,
    required: [true, 'Idempotency key is required'],
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Transfer', TransferSchema);
