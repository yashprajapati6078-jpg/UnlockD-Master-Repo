import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Calendar,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  IndianRupee
} from 'lucide-react';
import { formatCurrency } from '../utils/formatter';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [fundingGoal, setFundingGoal] = useState(null);

  const {
    register: registerGoal,
    handleSubmit: handleGoalSubmit,
    setValue,
    reset: resetGoal,
    formState: { errors: goalErrors },
  } = useForm();

  const {
    register: registerFund,
    handleSubmit: handleFundSubmit,
    reset: resetFund,
    formState: { errors: fundErrors },
  } = useForm();

  const fetchPageData = async () => {
    try {
      const [goalsRes, accountsRes] = await Promise.all([
        api.get('/goals'),
        api.get('/accounts'),
      ]);

      if (goalsRes.data.success) setGoals(goalsRes.data.data);
      if (accountsRes.data.success) setAccounts(accountsRes.data.data);
    } catch (error) {
      toast.error('Failed to load savings goals or accounts data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const handleAddClick = () => {
    setEditingGoal(null);
    resetGoal({
      title: '',
      targetAmount: '',
      currentAmount: 0,
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().substring(0, 10),
    });
    setGoalModalOpen(true);
  };

  const handleEditClick = (goal) => {
    setEditingGoal(goal);
    setValue('title', goal.title);
    setValue('targetAmount', goal.targetAmount);
    setValue('currentAmount', goal.currentAmount);
    setValue('deadline', goal.deadline.substring(0, 10));
    setGoalModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      const res = await api.delete(`/goals/${id}`);
      if (res.data.success) {
        toast.success('Savings goal deleted successfully!');
        fetchPageData();
      }
    } catch (error) {
      toast.error('Failed to delete savings goal');
    }
  };

  const handleFundClick = (goal) => {
    setFundingGoal(goal);
    resetFund({
      amount: '',
      accountId: accounts[0]?._id || '',
    });
    setFundModalOpen(true);
  };

  const onGoalSubmit = async (data) => {
    try {
      if (editingGoal) {
        const res = await api.put(`/goals/${editingGoal._id}`, data);
        if (res.data.success) {
          toast.success('Goal details updated!');
          setGoalModalOpen(false);
          fetchPageData();
        }
      } else {
        const res = await api.post('/goals', data);
        if (res.data.success) {
          toast.success('Goal created successfully!');
          setGoalModalOpen(false);
          fetchPageData();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save goal');
    }
  };

  const onFundSubmit = async (data) => {
    const amountVal = parseFloat(data.amount);
    const account = accounts.find((a) => a._id === data.accountId);

    if (!account) {
      toast.error('Selected account invalid');
      return;
    }

    if (account.type !== 'Credit Card' && account.balance < amountVal) {
      toast.error(`Transfer rejected: Insufficient funds in ${account.name}`);
      return;
    }

    try {
      // 1. Debit from account
      const updatedBalance = account.balance - amountVal;
      // 2. Credit to goal
      const updatedGoalSaved = fundingGoal.currentAmount + amountVal;

      await Promise.all([
        api.put(`/accounts/${account._id}`, { balance: updatedBalance }),
        api.put(`/goals/${fundingGoal._id}`, { currentAmount: updatedGoalSaved }),
      ]);

      toast.success(`Transferred ${formatCurrency(amountVal)} from ${account.name} to goal!`);
      setFundModalOpen(false);
      fetchPageData();
    } catch (error) {
      toast.error('Funding transfer failed');
    }
  };


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center">
            <Target className="w-7 h-7 mr-2.5 text-indigo-500" />
            Savings Goals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Plan, fund, and manage your long-term savings goals
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-md shadow-indigo-500/10"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Goal
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading your milestones...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.length > 0 ? (
            goals.map((goal) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const isCompleted = goal.currentAmount >= goal.targetAmount;

              return (
                <div
                  key={goal._id}
                  className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 card-shadow flex flex-col justify-between space-y-5 transition-all hover:scale-[1.01]"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                        }`}
                      >
                        {isCompleted ? 'Goal Reached' : 'Active Savings'}
                      </span>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white mt-1.5 truncate max-w-[180px]">
                        {goal.title}
                      </h4>
                    </div>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditClick(goal)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-lg"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(goal._id)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 rounded-lg"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Saved: {formatCurrency(goal.currentAmount)}</span>
                      <span>Target: {formatCurrency(goal.targetAmount)}</span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {Math.round(progress)}% complete
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-0.5" />
                        By {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Funding Actions */}
                  {!isCompleted ? (
                    <button
                      onClick={() => handleFundClick(goal)}
                      className="w-full flex items-center justify-center py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 text-slate-700 dark:text-white text-xs font-bold rounded-xl border border-slate-100 dark:border-slate-850 transition-colors duration-150"
                    >
                      Fund Savings Goal
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-center py-2.5 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-100/50 dark:border-emerald-950/20">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Goal Fully Funded!
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-16 text-center text-slate-400 dark:text-slate-500 card-shadow">
              No savings goals created yet. Set your first goal to track target progress!
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {goalModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 card-shadow relative animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingGoal ? 'Update Savings Goal' : 'Create Savings Goal'}
              </h3>
              <button
                onClick={() => setGoalModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGoalSubmit(onGoalSubmit)} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Macbook, House Downpayment"
                  className={`block w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                    goalErrors.title ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                  {...registerGoal('title', { required: 'Goal title is required' })}
                />
                {goalErrors.title && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">{goalErrors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                    <IndianRupee className="w-4 h-4 mr-0.5 text-slate-400" /> Target Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`block w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                      goalErrors.targetAmount ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                    {...registerGoal('targetAmount', {
                      required: 'Target is required',
                      min: { value: 0.01, message: 'Must be > 0' },
                    })}
                  />
                  {goalErrors.targetAmount && (
                    <p className="mt-1 text-xs font-semibold text-rose-500">{goalErrors.targetAmount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                    <IndianRupee className="w-4 h-4 mr-0.5 text-slate-400" /> Current Saved
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-750 rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white focus:border-indigo-500"
                    {...registerGoal('currentAmount')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-slate-400" /> Deadline Target
                </label>
                <input
                  type="date"
                  className={`block w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                    goalErrors.deadline ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                  {...registerGoal('deadline', { required: 'Deadline is required' })}
                />
                {goalErrors.deadline && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">{goalErrors.deadline.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold hover:scale-[1.01]"
                >
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fund Goal Modal */}
      {fundModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 card-shadow relative animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-indigo-500" />
                Fund: {fundingGoal?.title}
              </h3>
              <button
                onClick={() => setFundModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFundSubmit(onFundSubmit)} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Source Wallet/Account
                </label>
                <select
                  className={`block w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                    fundErrors.accountId ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                  {...registerFund('accountId', { required: 'Please choose source account' })}
                >
                  <option value="">Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.name} (₹{acc.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>
                {fundErrors.accountId && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">{fundErrors.accountId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-0.5 text-slate-400" /> Funding Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={`block w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                    fundErrors.amount ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                  {...registerFund('amount', {
                    required: 'Please enter a funding amount',
                    min: { value: 0.01, message: 'Must be > 0' },
                  })}
                />
                {fundErrors.amount && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">{fundErrors.amount.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setFundModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold hover:scale-[1.01]"
                >
                  Transfer Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
