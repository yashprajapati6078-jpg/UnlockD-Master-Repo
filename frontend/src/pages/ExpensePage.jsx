import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  TrendingDown,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Filter,
  Loader2,
  Calendar,
  DollarSign,
  CreditCard,
  IndianRupee
} from 'lucide-react';
import { formatCurrency } from '../utils/formatter';

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const categories = [
    'Food',
    'Shopping',
    'Transport',
    'Bills',
    'Entertainment',
    'Education',
    'Health',
    'Other'
  ];

  // Fetch expenses and accounts
  const fetchPageData = async () => {
    setLoading(true);
    try {
      const [expenseRes, accountsRes] = await Promise.all([
        api.get('/expense'),
        api.get('/accounts')
      ]);

      if (expenseRes.data.success) {
        setExpenses(expenseRes.data.data);
      }
      if (accountsRes.data.success) {
        setAccounts(accountsRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load expense data and accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  // Open modal for adding
  const handleAddClick = () => {
    setEditingExpense(null);
    reset({
      title: '',
      amount: '',
      category: 'Food',
      accountId: accounts[0]?._id || '',
      date: new Date().toISOString().substring(0, 10),
    });
    setModalOpen(true);
  };

  // Open modal for editing
  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setValue('title', expense.title);
    setValue('amount', expense.amount);
    setValue('category', expense.category);
    setValue('accountId', expense.accountId?._id || expense.accountId);
    setValue('date', expense.date.substring(0, 10));
    setModalOpen(true);
  };

  // Delete expense
  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await api.delete(`/expense/${id}`);
      if (res.data.success) {
        toast.success('Expense deleted successfully!');
        fetchPageData();
      }
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  // Form submit (Add/Edit)
  const onSubmit = async (data) => {
    try {
      if (editingExpense) {
        // Edit flow
        const res = await api.put(`/expense/${editingExpense._id}`, data);
        if (res.data.success) {
          toast.success('Expense updated successfully!');
          setModalOpen(false);
          fetchPageData();
        }
      } else {
        // Add flow
        const res = await api.post('/expense', data);
        if (res.data.success) {
          toast.success('Expense added successfully!');
          setModalOpen(false);
          fetchPageData();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  // Filter & Search
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center">
            <TrendingDown className="w-7 h-7 mr-2.5 text-rose-500" />
            Expense Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track and log your day-to-day outgoings, shopping, bills, and lifestyle spending
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-md shadow-indigo-500/10"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Expense
        </button>
      </div>

      {/* Filters & Actions Panel */}
      <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 card-shadow flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm outline-none text-slate-800 dark:text-white focus:border-indigo-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full md:w-40 py-2 px-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm outline-none text-slate-800 dark:text-white focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense List Table */}
      <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl card-shadow overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading outgoing records...</p>
          </div>
        ) : filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/20">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/65">
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors duration-150 text-sm"
                  >
                    <td className="px-6 py-4.5 font-semibold text-slate-800 dark:text-white truncate max-w-[200px]">
                      {expense.title}
                    </td>
                    <td className="px-6 py-4.5 text-slate-600 dark:text-slate-350">
                      <span className="flex items-center text-xs font-medium">
                        <CreditCard className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {expense.accountId?.name || 'Checking Account'}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4.5 font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4.5 text-right space-x-2.5">
                      <button
                        onClick={() => handleEditClick(expense)}
                        className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(expense._id)}
                        className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            No expense entries found matching your criteria.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 card-shadow relative animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingExpense ? 'Edit Expense Entry' : 'Add Expense Entry'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grocery Store"
                  className={`block w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                    errors.title ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500 dark:border-slate-750'
                  }`}
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">{errors.title.message}</p>
                )}
              </div>

              {/* Account Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                  <CreditCard className="w-4 h-4 mr-1 text-slate-400" /> Account
                </label>
                <select
                  className={`block w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                    errors.accountId ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500 dark:border-slate-750'
                  }`}
                  {...register('accountId', { required: 'Please select a source account' })}
                >
                  <option value="">Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.name} (₹{acc.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>
                {errors.accountId && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">{errors.accountId.message}</p>
                )}
              </div>

              {/* Amount & Category */}
              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                    <IndianRupee className="w-4 h-4 mr-0.5 text-slate-400" /> Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`block w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                      errors.amount ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500 dark:border-slate-750'
                    }`}
                    {...register('amount', {
                      required: 'Amount is required',
                      min: { value: 0.01, message: 'Must be > 0' },
                    })}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-xs font-semibold text-rose-500">{errors.amount.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-750 rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white focus:border-indigo-500"
                    {...register('category')}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-slate-400" /> Date
                </label>
                <input
                  type="date"
                  className={`block w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                    errors.date ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500 dark:border-slate-750'
                  }`}
                  {...register('date', { required: 'Date is required' })}
                />
                {errors.date && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">{errors.date.message}</p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors duration-200 hover:scale-[1.01]"
                >
                  {editingExpense ? 'Save Changes' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensePage;
