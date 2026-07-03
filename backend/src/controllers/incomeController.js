const Income = require('../models/Income');
const Account = require('../models/Account');

// @desc    Get all incomes
// @route   GET /api/income
// @access  Private
const getIncomes = async (req, res, next) => {
  try {
    const incomes = await Income.find({ userId: req.user.id })
      .populate('accountId', 'name type')
      .sort({ date: -1 });
    res.json({ success: true, count: incomes.length, data: incomes });
  } catch (error) {
    next(error);
  }
};

// @desc    Create income (credits account balance)
// @route   POST /api/income
// @access  Private
const createIncome = async (req, res, next) => {
  try {
    const { title, amount, date, category, accountId } = req.body;

    // Verify account exists and belongs to user
    const account = await Account.findOne({ _id: accountId, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Associated account not found' });
    }

    const income = await Income.create({
      title,
      amount,
      date,
      category,
      accountId,
      userId: req.user.id,
    });

    // Credit account balance
    account.balance += parseFloat(amount);
    await account.save();

    res.status(201).json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

// @desc    Update income (adjusts account balance)
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = async (req, res, next) => {
  try {
    let income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income not found' });
    }

    if (income.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this income' });
    }

    const oldAmount = income.amount;
    const oldAccountId = income.accountId.toString();
    const newAmount = req.body.amount !== undefined ? parseFloat(req.body.amount) : oldAmount;
    const newAccountId = req.body.accountId || oldAccountId;

    // Verify new account exists
    const newAccount = await Account.findOne({ _id: newAccountId, userId: req.user.id });
    if (!newAccount) {
      return res.status(404).json({ success: false, message: 'Target account not found' });
    }

    // Update income entry
    income = await Income.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Adjust account balances
    if (oldAccountId === newAccountId) {
      // Balance difference
      const diff = newAmount - oldAmount;
      newAccount.balance += diff;
      await newAccount.save();
    } else {
      // Deduct from old account
      await Account.findOneAndUpdate(
        { _id: oldAccountId, userId: req.user.id },
        { $inc: { balance: -oldAmount } }
      );
      // Credit new account
      newAccount.balance += newAmount;
      await newAccount.save();
    }

    res.json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete income (debits account balance)
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income not found' });
    }

    if (income.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this income' });
    }

    // Deduct income amount from account balance
    await Account.findOneAndUpdate(
      { _id: income.accountId, userId: req.user.id },
      { $inc: { balance: -income.amount } }
    );

    await income.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
};
