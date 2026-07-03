const Budget = require('../models/Budget');

// @desc    Get all budgets
// @route   GET /api/budget
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.json({ success: true, count: budgets.length, data: budgets });
  } catch (error) {
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budget
// @access  Private
const createBudget = async (req, res, next) => {
  try {
    const { category, amount, month } = req.body;

    // Check if budget already exists for this category and month
    let budget = await Budget.findOne({ userId: req.user.id, category, month });

    if (budget) {
      // If it exists, update it instead of creating a duplicate
      budget.amount = amount;
      await budget.save();
      return res.status(200).json({ success: true, data: budget, updated: true });
    }

    budget = await Budget.create({
      category,
      amount,
      month,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budget/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    // Check user ownership
    if (budget.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this budget' });
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budget/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    // Check user ownership
    if (budget.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this budget' });
    }

    await budget.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
