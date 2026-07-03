const SavingsGoal = require('../models/SavingsGoal');

// @desc    Get all savings goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user.id }).sort({ deadline: 1 });
    res.json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    next(error);
  }
};

// @desc    Create savings goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount, deadline } = req.body;

    const goal = await SavingsGoal.create({
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update savings goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    let goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    // Check user ownership
    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this goal' });
    }

    goal = await SavingsGoal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    // Check user ownership
    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this goal' });
    }

    await goal.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};
