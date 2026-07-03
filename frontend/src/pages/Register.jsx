import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Wallet, User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signUp(data.name, data.email, data.password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#161e2f] p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 card-shadow transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 dark:shadow-indigo-600/10 mb-4">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Create account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Start tracking your personal finances today
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder=""
                  className={`block w-full pl-10 pr-4 py-3 border rounded-2xl text-sm transition-colors duration-200 outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                    errors.name
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-200 focus:border-indigo-500 dark:border-slate-700/60 dark:focus:border-indigo-500'
                  }`}
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs font-semibold text-rose-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="email"
                  placeholder=""
                  className={`block w-full pl-10 pr-4 py-3 border rounded-2xl text-sm transition-colors duration-200 outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                    errors.email
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-200 focus:border-indigo-500 dark:border-slate-700/60 dark:focus:border-indigo-500'
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs font-semibold text-rose-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`block w-full pl-10 pr-4 py-3 border rounded-2xl text-sm transition-colors duration-200 outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                    errors.password
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-200 focus:border-indigo-500 dark:border-slate-700/60 dark:focus:border-indigo-500'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-semibold text-rose-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`block w-full pl-10 pr-4 py-3 border rounded-2xl text-sm transition-colors duration-200 outline-none bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white ${
                    errors.confirmPassword
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-200 focus:border-indigo-500 dark:border-slate-700/60 dark:focus:border-indigo-500'
                  }`}
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs font-semibold text-rose-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create account
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
