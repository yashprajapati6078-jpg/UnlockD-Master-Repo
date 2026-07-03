import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  BarChart3,
  LogOut,
  Menu,
  X,
  Wallet,
  CreditCard
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Accounts & Transfers', path: '/accounts', icon: CreditCard },
    { name: 'Income', path: '/income', icon: TrendingUp },
    { name: 'Expenses', path: '/expenses', icon: TrendingDown },
    { name: 'Budgets', path: '/budgets', icon: PiggyBank },
    { name: 'Savings Goals', path: '/goals', icon: Target },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const sidebarLinks = navItems.map((item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.name}
        to={item.path}
        onClick={() => setIsOpen(false)}
        className={({ isActive }) =>
          `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
            isActive
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:shadow-indigo-600/10'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
          }`
        }
      >
        <Icon className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110" />
        {item.name}
      </NavLink>
    );
  });

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 dark:bg-[#161e2f] dark:border-slate-800 sticky top-0 z-30 card-shadow">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
            WalletWise
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer Panel */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#161e2f] z-50 transform transition-transform duration-300 ease-in-out p-6 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                WalletWise
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">{sidebarLinks}</div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="truncate mr-2">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {user?.name || 'Yash Prajapati'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || 'yashprajapati6078@gmail.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-white border-r border-slate-100 dark:bg-[#161e2f] dark:border-slate-800 h-screen sticky top-0 p-6 z-20">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 dark:shadow-indigo-600/10">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              WalletWise
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">{sidebarLinks}</nav>
        </div>

        {/* User Info / Controls */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="truncate mr-2">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {user?.name || 'Yash Prajapati'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || 'yashprajapati6078@gmail.com'}
              </p>
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
