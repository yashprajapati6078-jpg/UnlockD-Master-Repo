import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle, progress }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      bar: 'bg-indigo-600',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      bar: 'bg-emerald-600',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      text: 'text-rose-600 dark:text-rose-400',
      bar: 'bg-rose-600',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      text: 'text-amber-600 dark:text-amber-400',
      bar: 'bg-amber-500',
    },
    violet: {
      bg: 'bg-violet-50 dark:bg-violet-950/20',
      text: 'text-violet-600 dark:text-violet-400',
      bar: 'bg-violet-600',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white dark:bg-[#161e2f] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 card-shadow flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {subtitle && (
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </div>
      )}

      {progress !== undefined && (
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Progress</span>
            <span>{Math.min(100, Math.round(progress))}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${scheme.bar}`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
