const Transfer = require('../models/Transfer');
const Account = require('../models/Account');

// @desc    Get all transfers
// @route   GET /api/transfers
// @access  Private
const getTransfers = async (req, res, next) => {
  try {
    const transfers = await Transfer.find({ userId: req.user.id })
      .populate('fromAccountId', 'name type')
      .populate('toAccountId', 'name type')
      .sort({ date: -1 });

    res.json({ success: true, count: transfers.length, data: transfers });
  } catch (error) {
    next(error);
  }
};

// @desc    Execute money transfer between accounts (Atomic & Idempotent operation)
// @route   POST /api/transfers
// @access  Private
const createTransfer = async (req, res, next) => {
  try {
    const { fromAccountId, toAccountId, amount, description, idempotencyKey } = req.body;

    if (!idempotencyKey) {
      return res.status(400).json({ success: false, message: 'Idempotency key is required to process transfers' });
    }

    // Deduplication check: check if this transaction key was already processed
    const existing = await Transfer.findOne({ idempotencyKey })
      .populate('fromAccountId', 'name type')
      .populate('toAccountId', 'name type');

    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
        duplicate: true,
        message: 'Duplicate request detected. Transaction processed successfully (Idempotency Active).'
      });
    }

    if (fromAccountId === toAccountId) {
      return res.status(400).json({ success: false, message: 'Source and destination accounts must be different' });
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid transfer amount greater than 0' });
    }

    // Step 1: Atomic debit from source account with balance condition to prevent overdraft
    // Only debit if the account belongs to the user and has balance >= amount
    const sourceAccount = await Account.findOneAndUpdate(
      { _id: fromAccountId, userId: req.user.id, balance: { $gte: transferAmount } },
      { $inc: { balance: -transferAmount } },
      { new: true }
    );

    if (!sourceAccount) {
      return res.status(400).json({
        success: false,
        message: 'Transfer failed. Insufficient funds or invalid source account (overdraft prevented).'
      });
    }

    // Step 2: Credit destination account
    const destAccount = await Account.findOneAndUpdate(
      { _id: toAccountId, userId: req.user.id },
      { $inc: { balance: transferAmount } },
      { new: true }
    );

    // If destination account update failed, roll back the debit
    if (!destAccount) {
      await Account.findOneAndUpdate(
        { _id: fromAccountId, userId: req.user.id },
        { $inc: { balance: transferAmount } }
      );
      
      // Save transfer as failed
      const failedTransfer = await Transfer.create({
        fromAccountId,
        toAccountId,
        amount: transferAmount,
        description: description || 'Transfer failed (Destination account invalid)',
        status: 'Failed',
        idempotencyKey,
        userId: req.user.id
      });

      return res.status(400).json({ success: false, message: 'Transfer failed. Destination account is invalid.' });
    }

    // Step 3: Record transaction history
    const transfer = await Transfer.create({
      fromAccountId,
      toAccountId,
      amount: transferAmount,
      description: description || 'Account Transfer',
      status: 'Completed',
      idempotencyKey,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: transfer,
      sourceBalance: sourceAccount.balance,
      destBalance: destAccount.balance
    });
  } catch (error) {
    // Handle database duplicate key error code 11000 gracefully as duplicate transfer
    if (error.code === 11000) {
      const existing = await Transfer.findOne({ idempotencyKey })
        .populate('fromAccountId', 'name type')
        .populate('toAccountId', 'name type');
      if (existing) {
        return res.status(200).json({
          success: true,
          data: existing,
          duplicate: true,
          message: 'Duplicate request detected. Transaction processed successfully (Idempotency Active).'
        });
      }
    }
    next(error);
  }
};

module.exports = {
  getTransfers,
  createTransfer,
};
