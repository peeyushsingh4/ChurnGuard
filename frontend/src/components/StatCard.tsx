import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'default' | 'success' | 'danger' | 'warning' | 'indigo';
  icon: LucideIcon;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  badgeText,
  badgeVariant = 'default',
  icon: Icon,
}) => {
  const badgeStyles = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    danger: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    warning: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
  };

  return (
    <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-xs dark:shadow-none transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center text-slate-600 dark:text-slate-300">
          <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">{value}</div>
        {badgeText && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyles[badgeVariant]}`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-normal">{subtitle}</p>}
    </div>
  );
};
