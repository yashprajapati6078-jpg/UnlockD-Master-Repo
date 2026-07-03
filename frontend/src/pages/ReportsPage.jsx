import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatter';
import {
  BarChart3,
  Download,
  Printer,
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  Percent,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

const ReportsPage = () => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().substring(0, 7); // Format: YYYY-MM
  });

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const [incomeRes, expenseRes, budgetRes] = await Promise.all([
        api.get('/income'),
        api.get('/expense'),
        api.get('/budget'),
      ]);

      if (incomeRes.data.success) setIncomes(incomeRes.data.data);
      if (expenseRes.data.success) setExpenses(expenseRes.data.data);
      if (budgetRes.data.success) setBudgets(budgetRes.data.data);
    } catch (error) {
      toast.error('Failed to load transaction reports data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  // Filter items based on selected month
  const activeIncomes = incomes.filter((inc) => inc.date && inc.date.substring(0, 7) === selectedMonth);
  const activeExpenses = expenses.filter((exp) => exp.date && exp.date.substring(0, 7) === selectedMonth);

  const monthIncomeTotal = activeIncomes.reduce((sum, item) => sum + item.amount, 0);
  const monthExpenseTotal = activeExpenses.reduce((sum, item) => sum + item.amount, 0);
  const monthSavings = monthIncomeTotal - monthExpenseTotal;

  // 1. Category Pie Chart Data
  const expensesByCategory = activeExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const categoryChartData = Object.keys(expensesByCategory).map((cat) => ({
    name: cat,
    value: parseFloat(expensesByCategory[cat].toFixed(2)),
  }));

  // 2. Trend Bar Chart Data (Incomes vs Expenses for last 6 months)
  const allMonths = [...new Set([
    ...incomes.map(i => i.date?.substring(0, 7)),
    ...expenses.map(e => e.date?.substring(0, 7))
  ])].filter(Boolean).sort().slice(-6);

  const trendChartData = allMonths.map((m) => {
    const incSum = incomes.filter(i => i.date?.substring(0, 7) === m).reduce((sum, i) => sum + i.amount, 0);
    const expSum = expenses.filter(e => e.date?.substring(0, 7) === m).reduce((sum, e) => sum + e.amount, 0);
    return {
      month: m,
      Income: parseFloat(incSum.toFixed(2)),
      Expense: parseFloat(expSum.toFixed(2)),
    };
  });

  // 3. AI Insights engine (Rule-based financial analytics)
  const getAIInsights = () => {
    const insights = [];

    if (monthExpenseTotal > monthIncomeTotal) {
      insights.push({
        type: 'warning',
        text: 'Warning: Your spending exceeds your earnings this month. Analyze your Shopping or Bills to find saving avenues.',
      });
    }

    if (monthIncomeTotal > 0) {
      const savingsRate = (monthSavings / monthIncomeTotal) * 100;
      if (savingsRate >= 20) {
        insights.push({
          type: 'success',
          text: `Exceptional saving! Your savings rate is ${Math.round(savingsRate)}% (target is 20%). Keep routing balance to goals!`,
        });
      } else if (savingsRate > 0 && savingsRate < 10) {
        insights.push({
          type: 'tip',
          text: `Opportunity: Your savings rate is currently ${Math.round(savingsRate)}%. Trimming entertainment budgets could push you closer to a healthy 15% rate.`,
        });
      }
    }

    // Food category high check
    const foodSpend = expensesByCategory['Food'] || 0;
    if (monthExpenseTotal > 0) {
      const foodPercent = (foodSpend / monthExpenseTotal) * 100;
      if (foodPercent > 35) {
        insights.push({
          type: 'tip',
          text: `Dining alert: ${Math.round(foodPercent)}% of your expenses went to Food this month. Cooking at home could save you up to $150/month.`,
        });
      }
    }

    // Budget configuration check
    const activeBudgets = budgets.filter((b) => b.month === selectedMonth);
    if (activeBudgets.length === 0) {
      insights.push({
        type: 'tip',
        text: 'Budget Advisor: Setting monthly category limits on the Budgets page helps decrease ad-hoc lifestyle spending by 12%.',
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'tip',
        text: 'WalletWise is collecting more transaction details to personalize your financial insights. Check back soon!',
      });
    }

    return insights;
  };

  // CSV Export logic
  const handleCSVExport = () => {
    const consolidated = [
      ...activeIncomes.map(i => ({ Type: 'Income', Title: i.title, Category: i.category, Date: i.date.substring(0, 10), Amount: i.amount })),
      ...activeExpenses.map(e => ({ Type: 'Expense', Title: e.title, Category: e.category, Date: e.date.substring(0, 10), Amount: -e.amount }))
    ].sort((a, b) => new Date(b.Date) - new Date(a.Date));

    if (consolidated.length === 0) {
      toast.error('No transactions available in the selected month to export');
      return;
    }

    const headers = ['Type', 'Title', 'Category', 'Date', 'Amount'];
    const csvRows = [headers.join(',')];

    for (const row of consolidated) {
      const values = headers.map(header => {
        const val = row[header];
        // escape double quotes and wrap in quotes if containing comma
        const escaped = ('' + val).replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WalletWise_Report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully!');
  };

  // PDF Print Trigger
  const handlePrint = () => {
    window.print();
  };


  return (
    <div className="space-y-8 animate-fade-in print:p-0 print:m-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center">
            <BarChart3 className="w-7 h-7 mr-2.5 text-indigo-500" />
            Financial Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyze historical spending patterns, download statement copies, and view AI-curated insights
          </p>
        </div>

        <div className="flex gap-2.5 items-center">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm outline-none text-slate-800 dark:text-white"
          />
          <button
            onClick={handleCSVExport}
            className="flex items-center justify-center p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-semibold transition-all duration-200"
            title="Download CSV"
          >
            <Download className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-md shadow-indigo-500/10"
          >
            <Printer className="w-4.5 h-4.5 mr-2" />
            Print PDF
          </button>
        </div>
      </div>

      {/* Print-Only Title Banner */}
      <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900">WalletWise Statement Report</h1>
        <p className="text-sm text-slate-500 mt-1">Statement Period: {selectedMonth}</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 print:hidden">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Compiling ledger statistics...</p>
        </div>
      ) : (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 card-shadow flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Month Income</span>
                <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(monthIncomeTotal)}
                </h4>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 card-shadow flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Month Expenses</span>
                <h4 className="text-2xl font-black text-rose-600 dark:text-rose-450">
                  {formatCurrency(monthExpenseTotal)}
                </h4>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-550 rounded-xl">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 card-shadow flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Monthly Savings</span>
                <h4 className={`text-2xl font-black ${monthSavings >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
                  {formatCurrency(monthSavings)}
                </h4>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl">
                <Percent className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* AI Spending Insights Banner */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden print:hidden">
            {/* Background sparkle accents */}
            <div className="absolute right-0 top-0 transform translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
              <Sparkles className="w-64 h-64" />
            </div>

            <div className="flex items-center space-x-2.5 mb-4">
              <Sparkles className="w-5.5 h-5.5 text-amber-300 animate-pulse" />
              <h3 className="text-lg font-extrabold tracking-tight">AI Financial Spending Insights</h3>
            </div>

            <div className="space-y-3.5 relative z-10">
              {getAIInsights().map((insight, idx) => (
                <div key={idx} className="flex items-start text-sm bg-white/10 rounded-2xl p-3.5 backdrop-blur-sm border border-white/5">
                  <span className="mr-2">💡</span>
                  <p className="font-medium">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chart visualizers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
            {/* Bar Chart: Recent Trends */}
            <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 card-shadow print:border-none print:shadow-none print:mb-12">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
                Income vs Expense Trends
              </h3>
              <div className="h-80">
                {trendChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(30, 41, 59, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    Not enough data points to plot trend.
                  </div>
                )}
              </div>
            </div>

            {/* Pie Chart: Category breakdown */}
            <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 card-shadow print:border-none print:shadow-none">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
                Category Spending Breakdown
              </h3>
              <div className="h-80 flex flex-col md:flex-row items-center justify-around gap-4">
                {categoryChartData.length > 0 ? (
                  <>
                    <div className="w-full md:w-1/2 h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryChartData.map((entry, index) => (
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

                    <div className="w-full md:w-1/2 space-y-2 max-h-60 overflow-y-auto pr-2">
                      {categoryChartData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span className="font-medium truncate max-w-[100px]">{entry.name}</span>
                          </div>
                          <span className="font-bold text-slate-800 dark:text-white">
                            {formatCurrency(entry.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 dark:text-slate-500 text-center py-20">
                    No expense category distributions detected in {selectedMonth}.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Printable detailed ledger log table */}
          <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl card-shadow overflow-hidden print:border-none print:shadow-none print:mt-12">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white p-6 pb-2">
              Monthly Transaction Log
            </h3>
            {activeIncomes.length === 0 && activeExpenses.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                No transaction entries recorded for {selectedMonth}.
              </div>
            ) : (
              <div className="overflow-x-auto p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/20">
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/65 text-xs">
                    {[
                      ...activeIncomes.map(i => ({ ...i, type: 'income' })),
                      ...activeExpenses.map(e => ({ ...e, type: 'expense' }))
                    ]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/30">
                          <td className="px-4 py-3 font-semibold">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] ${
                                item.type === 'income'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-800 dark:text-slate-100 font-medium">
                            {item.title}
                          </td>
                          <td className="px-4 py-3 text-slate-500">{item.category}</td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-bold ${
                              item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
