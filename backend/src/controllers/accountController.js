const Account = require('../models/Account');

// @desc    Get all accounts
// @route   GET /api/accounts
// @access  Private
const getAccounts = async (req, res, next) => {
  try {
    let accounts = await Account.find({ userId: req.user.id });

    // Seed default accounts if user has none
    if (accounts.length === 0) {
      accounts = await Account.create([
        { name: 'Checking Account', type: 'Checking', balance: 25000, userId: req.user.id },
        { name: 'Savings Account', type: 'Savings', balance: 50000, userId: req.user.id },
        { name: 'Cash Wallet', type: 'Cash', balance: 3500, userId: req.user.id },
      ]);
    }

    res.json({ success: true, count: accounts.length, data: accounts });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new account
// @route   POST /api/accounts
// @access  Private
const createAccount = async (req, res, next) => {
  try {
    const { name, type, balance } = req.body;

    // Check duplicate name
    const existing = await Account.findOne({ userId: req.user.id, name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this name already exists' });
    }

    const account = await Account.create({
      name,
      type,
      balance: balance || 0,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

// @desc    Update account
// @route   PUT /api/accounts/:id
// @access  Private
const updateAccount = async (req, res, next) => {
  try {
    let account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (account.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this account' });
    }

    account = await Account.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account
// @route   DELETE /api/accounts/:id
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (account.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this account' });
    }

    await account.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
};
