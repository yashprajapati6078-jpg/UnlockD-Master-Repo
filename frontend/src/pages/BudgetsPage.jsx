import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  PiggyBank,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Calendar,
  AlertTriangle,
  Layers,
  DollarSign,
  IndianRupee
} from 'lucide-react';
import { formatCurrency } from '../utils/formatter';

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().substring(0, 7); // Format: YYYY-MM
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const categories = [
    'All',
    'Food',
    'Shopping',
    'Transport',
    'Bills',
    'Entertainment',
    'Education',
    'Health',
    'Other'
  ];

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const [budgetsRes, expensesRes] = await Promise.all([
        api.get('/budget'),
        api.get('/expense'),
      ]);

      if (budgetsRes.data.success) setBudgets(budgetsRes.data.data);
      if (expensesRes.data.success) setExpenses(expensesRes.data.data);
    } catch (error) {
      toast.error('Failed to load budgets and expense tracking data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const handleAddClick = () => {
    setEditingBudget(null);
    reset({
      category: 'All',
      amount: '',
      month: selectedMonth,
    });
    setModalOpen(true);
  };

  const handleEditClick = (budget) => {
    setEditingBudget(budget);
    setValue('category', budget.category);
    setValue('amount', budget.amount);
    setValue('month', budget.month);
    setModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget limit?')) return;
    try {
      const res = await api.delete(`/budget/${id}`);
      if (res.data.success) {
        toast.success('Budget deleted successfully');
        fetchPageData();
      }
    } catch (error) {
      toast.error('Failed to delete budget limit');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingBudget) {
        const res = await api.put(`/budget/${editingBudget._id}`, data);
        if (res.data.success) {
          toast.success('Budget updated successfully!');
          setModalOpen(false);
          fetchPageData();
        }
      } else {
        const res = await api.post('/budget', data);
        if (res.data.success) {
          toast.success('Budget set successfully!');
          setModalOpen(false);
          fetchPageData();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  // 1. Filter budgets and expenses for the selected month
  const activeBudgets = budgets.filter((b) => b.month === selectedMonth);
  const activeExpenses = expenses.filter(
    (e) => e.date && e.date.substring(0, 7) === selectedMonth
  );

  // 2. Compute spending by category
  const spendingByCategory = activeExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const totalSpentAll = activeExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // 3. Prepare budgets structure for rendering comparison progress
  const budgetListWithProgress = activeBudgets.map((budget) => {
    let spent = 0;
    if (budget.category === 'All') {
      spent = totalSpentAll;
    } else {
      spent = spendingByCategory[budget.category] || 0;
    }
    const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const isExceeded = spent > budget.amount;

    return {
      ...budget,
      spent,
      percent,
      isExceeded,
    };
  });


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center">
            <PiggyBank className="w-7 h-7 mr-2.5 text-indigo-500" />
            Budget Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set and monitor budget limits by category to control your spend patterns
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm outline-none text-slate-800 dark:text-white"
          />
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-md shadow-indigo-500/10"
          >
            <Plus className="w-5 h-5 mr-2" />
            Set Budget
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Comparing budget limits...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Columns */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Budget Status: {selectedMonth}
            </h3>

            {budgetListWithProgress.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgetListWithProgress.map((budget) => (
                  <div
                    key={budget._id}
                    className={`bg-white dark:bg-[#161e2f] border rounded-2xl p-5 card-shadow space-y-4 relative overflow-hidden transition-all hover:scale-[1.01] ${
                      budget.isExceeded
                        ? 'border-rose-250 dark:border-rose-950/40 bg-rose-50/10'
                        : 'border-slate-100 dark:border-slate-800/80'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                          {budget.category === 'All' ? 'Overall Budget' : `${budget.category} Category`}
                        </span>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                          {budget.category}
                        </h4>
                      </div>

                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => handleEditClick(budget)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(budget._id)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress figures */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Spent: {formatCurrency(budget.spent)}</span>
                        <span>Limit: {formatCurrency(budget.amount)}</span>
                      </div>
                      {/* Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            budget.isExceeded ? 'bg-rose-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(100, budget.percent)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span
                          className={`font-semibold ${
                            budget.isExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'
                          }`}
                        >
                          {Math.round(budget.percent)}% consumed
                        </span>

                        {budget.isExceeded && (
                          <span className="flex items-center text-rose-600 font-bold text-[10px] uppercase tracking-wider animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 mr-0.5" /> Over Limit
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500 card-shadow">
                No budget targets configured for {selectedMonth}. Click "Set Budget" to define limits.
              </div>
            )}
          </div>

          {/* Quick Category Summary Panel */}
          <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 card-shadow h-fit space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
              <Layers className="w-5 h-5 mr-2 text-indigo-500" />
              Month Spending Summary
            </h3>

            <div className="space-y-4">
              {Object.keys(spendingByCategory).length > 0 ? (
                Object.keys(spendingByCategory).map((cat) => (
                  <div key={cat} className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-2">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{cat}</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {formatCurrency(spendingByCategory[cat])}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No expense records logged in {selectedMonth}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Set Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 card-shadow relative animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingBudget ? 'Update Budget Limit' : 'Set Budget Limit'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Budget Category
                </label>
                <select
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-750 rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white focus:border-indigo-500"
                  {...register('category')}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All (Overall Limit)' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                    <IndianRupee className="w-4 h-4 mr-0.5 text-slate-400" /> Amount Limit
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`block w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                      errors.amount ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                    {...register('amount', {
                      required: 'Limit is required',
                      min: { value: 0.01, message: 'Must be > 0' },
                    })}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-xs font-semibold text-rose-500">{errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-slate-400" /> Month
                  </label>
                  <input
                    type="month"
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-755 rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white focus:border-indigo-500"
                    {...register('month', { required: true })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold hover:scale-[1.01]"
                >
                  {editingBudget ? 'Save Changes' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;
