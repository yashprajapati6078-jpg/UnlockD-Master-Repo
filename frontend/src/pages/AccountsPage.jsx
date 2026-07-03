import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  CreditCard,
  Plus,
  ArrowRightLeft,
  Loader2,
  TrendingUp,
  TrendingDown,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  IndianRupee
} from 'lucide-react';
import { formatCurrency } from '../utils/formatter';

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  const {
    register: registerAccount,
    handleSubmit: handleAccountSubmit,
    reset: resetAccount,
    formState: { errors: accountErrors },
  } = useForm();

  const {
    register: registerTransfer,
    handleSubmit: handleTransferSubmit,
    reset: resetTransfer,
    formState: { errors: transferErrors },
  } = useForm();

  const fetchPageData = async () => {
    try {
      const [accountsRes, transfersRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/transfers'),
      ]);

      if (accountsRes.data.success) setAccounts(accountsRes.data.data);
      if (transfersRes.data.success) setTransfers(transfersRes.data.data);
    } catch (error) {
      toast.error('Failed to load accounts and transfer history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const onAddAccount = async (data) => {
    try {
      const res = await api.post('/accounts', data);
      if (res.data.success) {
        toast.success('Account created successfully!');
        setAccountModalOpen(false);
        resetAccount();
        fetchPageData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create account');
    }
  };

  const onExecuteTransfer = async (data) => {
    try {
      // Generate unique idempotency key to prevent duplicate clicks/transfers
      const idempotencyKey = window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : `t_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      const res = await api.post('/transfers', { ...data, idempotencyKey });
      if (res.data.success) {
        toast.success(res.data.message || 'Money transferred successfully!');
        setTransferModalOpen(false);
        resetTransfer();
        fetchPageData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transfer failed');
    }
  };


  const accountTypes = ['Checking', 'Savings', 'Cash', 'Credit Card'];

  // Color mapping based on account type
  const typeColors = {
    Checking: 'from-blue-600 to-indigo-700 shadow-blue-500/10',
    Savings: 'from-emerald-500 to-teal-700 shadow-emerald-500/10',
    Cash: 'from-amber-500 to-orange-600 shadow-amber-500/10',
    'Credit Card': 'from-rose-500 to-red-700 shadow-rose-500/10',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center">
            <CreditCard className="w-7 h-7 mr-2.5 text-indigo-500" />
            Accounts & Transfers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your separate wallets, cards, checking/savings structures, and transfer balances atomically
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setTransferModalOpen(true)}
            className="flex items-center justify-center px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-sm font-semibold transition-all duration-200"
          >
            <ArrowRightLeft className="w-4.5 h-4.5 mr-2 text-indigo-500" />
            Transfer Money
          </button>
          <button
            onClick={() => setAccountModalOpen(true)}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-md shadow-indigo-500/10"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Account
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-9 h-9 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading accounts & transfers...</p>
        </div>
      ) : (
        <>
          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((acc) => (
              <div
                key={acc._id}
                className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${
                  typeColors[acc.type] || typeColors.Checking
                } shadow-xl hover:scale-[1.02] transition-all duration-300`}
              >
                {/* Background Pattern Accent */}
                <div className="absolute right-0 bottom-0 transform translate-x-4 translate-y-4 opacity-15 pointer-events-none">
                  <CreditCard className="w-48 h-48" />
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-75">
                      {acc.type}
                    </span>
                    <h3 className="text-lg font-bold mt-0.5 truncate max-w-[150px] sm:max-w-[200px]">
                      {acc.name}
                    </h3>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
                    Active
                  </span>
                </div>

                <div className="mt-8 space-y-1">
                  <span className="text-xs opacity-75">Available Balance</span>
                  <p className="text-3xl font-extrabold tracking-tight">
                    {formatCurrency(acc.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Transfers History Section */}
          <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 card-shadow">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-indigo-500" />
              Transfer History
            </h3>

            <div className="space-y-4">
              {transfers.length > 0 ? (
                transfers.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl gap-4"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`p-2.5 rounded-xl ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'
                            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-500'
                        }`}
                      >
                        {item.status === 'Completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800 dark:text-white flex-wrap">
                          <span>{item.fromAccountId?.name || 'Deleted Account'}</span>
                          <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.toAccountId?.name || 'Deleted Account'}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {item.description} • {new Date(item.date).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  No account transfer entries recorded yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Account Modal */}
      {accountModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 card-shadow relative animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Add Account</h3>
              <button
                onClick={() => setAccountModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAccountSubmit(onAddAccount)} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Checking, Investment Account"
                  className={`block w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                    accountErrors.name ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                  {...registerAccount('name', { required: 'Account name is required' })}
                />
                {accountErrors.name && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">{accountErrors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Type
                  </label>
                  <select
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-750 rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white focus:border-indigo-500"
                    {...registerAccount('type')}
                  >
                    {accountTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                    <IndianRupee className="w-4 h-4 mr-0.5 text-slate-400" /> Initial Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-750 rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white focus:border-indigo-500"
                    {...registerAccount('balance', { value: 0 })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setAccountModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold hover:scale-[1.01]"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Money Modal */}
      {transferModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 card-shadow relative animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                <ArrowRightLeft className="w-5 h-5 mr-2 text-indigo-500" />
                Transfer Money
              </h3>
              <button
                onClick={() => setTransferModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit(onExecuteTransfer)} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    From Account
                  </label>
                  <select
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-750 rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white focus:border-indigo-500"
                    {...registerTransfer('fromAccountId', { required: 'Required' })}
                  >
                    <option value="">Select Account</option>
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name} (₹{acc.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })})
                      </option>
                    ))}
                  </select>
                  {transferErrors.fromAccountId && (
                    <p className="mt-1 text-xs font-semibold text-rose-500">Source account required</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    To Account
                  </label>
                  <select
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-750 rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white focus:border-indigo-500"
                    {...registerTransfer('toAccountId', { required: 'Required' })}
                  >
                    <option value="">Select Account</option>
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name} (₹{acc.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })})
                      </option>
                    ))}
                  </select>
                  {transferErrors.toAccountId && (
                    <p className="mt-1 text-xs font-semibold text-rose-500">Destination account required</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-0.5 text-slate-400" /> Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={`block w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                    transferErrors.amount ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                  {...registerTransfer('amount', {
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be > 0' },
                  })}
                />
                {transferErrors.amount && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">{transferErrors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Back checking to savings transfer"
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-750 rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white focus:border-indigo-500"
                  {...registerTransfer('description')}
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold hover:scale-[1.01]"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
