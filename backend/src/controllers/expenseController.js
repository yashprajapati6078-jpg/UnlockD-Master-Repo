const Expense = require('../models/Expense');
const Account = require('../models/Account');

// @desc    Get all expenses
// @route   GET /api/expense
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id })
      .populate('accountId', 'name type')
      .sort({ date: -1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    next(error);
  }
};

// @desc    Create expense (debits account balance atomically with overdraft checks)
// @route   POST /api/expense
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, date, category, accountId } = req.body;
    const expenseAmount = parseFloat(amount);

    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid positive expense amount' });
    }

    // Atomic debit with balance threshold check (Credit Cards are exempt)
    const account = await Account.findOneAndUpdate(
      {
        _id: accountId,
        userId: req.user.id,
        $or: [
          { type: 'Credit Card' },
          { balance: { $gte: expenseAmount } }
        ]
      },
      { $inc: { balance: -expenseAmount } },
      { new: true }
    );

    if (!account) {
      const checkAccount = await Account.findOne({ _id: accountId, userId: req.user.id });
      if (!checkAccount) {
        return res.status(404).json({ success: false, message: 'Associated account not found' });
      }
      return res.status(400).json({
        success: false,
        message: `Transaction rejected: Insufficient funds in ${checkAccount.name} (Current balance: ₹${checkAccount.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}).`
      });
    }

    const expense = await Expense.create({
      title,
      amount: expenseAmount,
      date,
      category,
      accountId,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense (adjusts account balance atomically with overdraft checks)
// @route   PUT /api/expense/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this expense' });
    }

    const oldAmount = expense.amount;
    const oldAccountId = expense.accountId.toString();
    const newAmount = req.body.amount !== undefined ? parseFloat(req.body.amount) : oldAmount;
    const newAccountId = req.body.accountId || oldAccountId;

    if (isNaN(newAmount) || newAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid positive expense amount' });
    }

    if (oldAccountId === newAccountId) {
      const diff = newAmount - oldAmount;
      
      const updateQuery = {
        _id: oldAccountId,
        userId: req.user.id,
      };

      // If expense increased, verify we have enough balance to cover the increment
      if (diff > 0) {
        updateQuery.$or = [
          { type: 'Credit Card' },
          { balance: { $gte: diff } }
        ];
      }

      const account = await Account.findOneAndUpdate(
        updateQuery,
        { $inc: { balance: -diff } },
        { new: true }
      );

      if (!account) {
        const checkAccount = await Account.findOne({ _id: oldAccountId, userId: req.user.id });
        return res.status(400).json({
          success: false,
          message: `Transaction rejected: Insufficient funds in ${checkAccount.name} to increase this expense by ₹${diff.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`
        });
      }

      expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      // Account changed: debit from new account first
      const newAccount = await Account.findOneAndUpdate(
        {
          _id: newAccountId,
          userId: req.user.id,
          $or: [
            { type: 'Credit Card' },
            { balance: { $gte: newAmount } }
          ]
        },
        { $inc: { balance: -newAmount } },
        { new: true }
      );

      if (!newAccount) {
        const checkAccount = await Account.findOne({ _id: newAccountId, userId: req.user.id });
        return res.status(400).json({
          success: false,
          message: `Transaction rejected: Insufficient funds in new account ${checkAccount.name} (Requires: ₹${newAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}).`
        });
      }

      // Refund old account
      await Account.findOneAndUpdate(
        { _id: oldAccountId, userId: req.user.id },
        { $inc: { balance: oldAmount } }
      );

      expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense (refunds account balance atomically)
// @route   DELETE /api/expense/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this expense' });
    }

    // Refund expense amount back to account balance
    await Account.findOneAndUpdate(
      { _id: expense.accountId, userId: req.user.id },
      { $inc: { balance: expense.amount } }
    );

    await expense.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
