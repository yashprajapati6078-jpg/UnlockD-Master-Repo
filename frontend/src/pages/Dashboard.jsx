import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../utils/formatter';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2,
  Calendar,
  Layers,
  Percent
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [incomeRes, expenseRes, budgetRes, goalRes] = await Promise.all([
          api.get('/income'),
          api.get('/expense'),
          api.get('/budget'),
          api.get('/goals'),
        ]);

        if (incomeRes.data.success) setIncomes(incomeRes.data.data);
        if (expenseRes.data.success) setExpenses(expenseRes.data.data);
        if (budgetRes.data.success) setBudgets(budgetRes.data.data);
        if (goalRes.data.success) setGoals(goalRes.data.data);
      } catch (error) {
        console.error('Error loading dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Calculating dashboard figures...
          </p>
        </div>
      </div>
    );
  }

  // 1. Calculate Metrics
  const totalIncomeVal = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenseVal = expenses.reduce((sum, item) => sum + item.amount, 0);
  const currentBalanceVal = totalIncomeVal - totalExpenseVal;
  const totalSavingsGoalVal = goals.reduce((sum, item) => sum + item.currentAmount, 0);

  // Filter current month data (Format: YYYY-MM)
  const currentMonthStr = new Date().toISOString().substring(0, 7); // e.g. "2026-07"
  
  const currentMonthExpenses = expenses.filter(item => {
    return item.date && item.date.substring(0, 7) === currentMonthStr;
  });
  const currentMonthSpendingVal = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);

  // Active budgets for the current month
  const currentMonthBudgets = budgets.filter(b => b.month === currentMonthStr);
  const totalBudgetedVal = currentMonthBudgets.reduce((sum, item) => sum + item.amount, 0);
  const budgetRemainingVal = totalBudgetedVal > 0 ? totalBudgetedVal - currentMonthSpendingVal : 0;

  // 2. Prepare Chart Data
  // A. Pie Chart: Expenses by Category
  const expenseByCategory = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const pieChartData = Object.keys(expenseByCategory).map(cat => ({
    name: cat,
    value: parseFloat(expenseByCategory[cat].toFixed(2)),
  }));

  // B. Bar Chart: Monthly Expenses (Grouped by YYYY-MM)
  const expenseByMonth = expenses.reduce((acc, item) => {
    if (item.date) {
      const month = item.date.substring(0, 7);
      acc[month] = (acc[month] || 0) + item.amount;
    }
    return acc;
  }, {});

  // Sort months ascending
  const barChartData = Object.keys(expenseByMonth)
    .sort()
    .map(month => ({
      month,
      Amount: parseFloat(expenseByMonth[month].toFixed(2)),
    }))
    .slice(-6); // Last 6 months

  // C. Line Chart: Savings Growth trend (simplified using goals cumulative progress or monthly savings)
  // Let's create a simulated growth timeline based on current savings goals dates or simple mock timeline
  const lineChartData = goals.map((goal, idx) => ({
    name: goal.title.substring(0, 10) + '...',
    Target: goal.targetAmount,
    Saved: goal.currentAmount,
  }));

  // D. Combine recent activities
  const recentIncomes = incomes.map(item => ({ ...item, type: 'income' }));
  const recentExpenses = expenses.map(item => ({ ...item, type: 'expense' }));
  const recentActivities = [...recentIncomes, ...recentExpenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-transparent p-6 rounded-3xl border border-indigo-100/50 dark:border-slate-800/80">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Welcome back, {user?.name || 'Yash Prajapati'}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Here's your financial overview for today. You are doing great!
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/income"
            className="flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-md shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Income
          </Link>
          <Link
            to="/expenses"
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-md shadow-indigo-500/10"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title="Current Balance"
          value={formatCurrency(currentBalanceVal)}
          icon={Wallet}
          color={currentBalanceVal >= 0 ? 'indigo' : 'rose'}
          subtitle="Net liquid worth"
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncomeVal)}
          icon={TrendingUp}
          color="emerald"
          subtitle="All-time earnings value"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenseVal)}
          icon={TrendingDown}
          color="rose"
          subtitle="All-time outgoing flow"
        />
        <StatCard
          title="Total Savings"
          value={formatCurrency(totalSavingsGoalVal)}
          icon={PiggyBank}
          color="violet"
          subtitle="Accrued in savings goals"
        />
      </div>

      {/* Extra Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl card-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Budget</span>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white">
              {formatCurrency(budgetRemainingVal)}
            </h4>
            <p className="text-xs text-slate-500">For {currentMonthStr}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl card-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Spend</span>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white">
              {formatCurrency(currentMonthSpendingVal)}
            </h4>
            <p className="text-xs text-slate-500">In {currentMonthStr}</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl card-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Savings Rate</span>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white">
              {totalIncomeVal > 0 ? `${Math.round(((totalIncomeVal - totalExpenseVal) / totalIncomeVal) * 100)}%` : '0%'}
            </h4>
            <p className="text-xs text-slate-500">Savings to income ratio</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart: Monthly Expenses */}
        <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 card-shadow lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
            Monthly Expenses
          </h3>
          <div className="h-80">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="Amount" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                No expense data available to plot trends.
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart: Expense Categories */}
        <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 card-shadow">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
            Expense Distribution
          </h3>
          <div className="h-80 flex flex-col items-center justify-center">
            {pieChartData.length > 0 ? (
              <>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(30, 41, 59, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend list */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-4 max-h-20 overflow-y-auto">
                  {pieChartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="truncate">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-slate-400 dark:text-slate-500 text-center">
                No expense categories to display.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Savings Growth & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Savings Growth Chart */}
        <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 card-shadow lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
            Savings Progress
          </h3>
          <div className="h-72">
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend fontSize={10} />
                  <Line type="monotone" dataKey="Saved" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Target" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                No goals created. Create goals to view progress!
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 card-shadow lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Recent Transactions
            </h3>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer" onClick={() => navigate('/expenses')}>
              View all transactions
            </span>
          </div>

          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-200"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`p-2.5 rounded-xl ${
                        activity.type === 'income'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'
                          : 'bg-rose-50 dark:bg-rose-950/20 text-rose-500'
                      }`}
                    >
                      {activity.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[150px] sm:max-w-[200px]">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {activity.category} • {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      activity.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {activity.type === 'income' ? '+' : '-'}{formatCurrency(activity.amount)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                No transactions yet. Click "Add Income" or "Add Expense" to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
