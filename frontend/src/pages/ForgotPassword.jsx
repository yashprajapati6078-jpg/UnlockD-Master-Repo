import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet, Mail, Loader2, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    // Simulate API request delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Reset instructions sent to your email!');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#161e2f] p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 card-shadow transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 dark:shadow-indigo-600/10 mb-4">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Reset password
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {submitted
              ? "We've sent reset link instructions to your email."
              : 'Enter your email address to recover your account'}
          </p>
        </div>

        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                  placeholder="name@example.com"
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

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="mt-6 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950/30 text-center">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Check your inbox! If an account exists for that email address, you will receive password reset instructions shortly.
            </p>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <Link
            to="/login"
            className="flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
