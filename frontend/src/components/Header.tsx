import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Activity, CheckCircle2, AlertCircle, RefreshCw, Sun, Moon } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Platform Overview',
    subtitle: 'High-level customer health, churn dynamics, and ensemble performance',
  },
  '/data': {
    title: 'Data & Preprocessing Pipeline',
    subtitle: 'IBM Telco data cleaning, OHE encoding, scaling, and SMOTE imbalance correction',
  },
  '/training': {
    title: 'Model Training & Historical Runs',
    subtitle: 'Compare Baselines, Bagging, Boosting, and Stacking ensemble architectures',
  },
  '/evaluation': {
    title: 'Model Evaluation & Verification',
    subtitle: 'Interactive confusion matrices, overlaid ROC curves, sensitivity, and 5-fold cross-validation',
  },
  '/predict': {
    title: 'Real-Time Customer Profiler',
    subtitle: 'Predict individual subscriber churn risk with explainable driver attribution',
  },
  '/insights': {
    title: 'Feature Importance & Domain Insights',
    subtitle: 'Champion model factor rankings and actionable business retention strategies',
  },
};

export const Header: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatus = async () => {
    setIsRefreshing(true);
    try {
      await api.checkHealth();
      setHealthy(true);
    } catch {
      setHealthy(false);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const meta = routeTitles[location.pathname] || {
    title: 'ChurnGuard Intelligence',
    subtitle: 'Enterprise Customer Churn Prediction Platform',
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-[#0d1322]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      <div>
        <h1 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          {meta.title}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-2xs"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform hover:rotate-45" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600 transition-transform hover:-rotate-12" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium">
          {healthy === null ? (
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Connecting...
            </span>
          ) : healthy ? (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Backend Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
              Backend Offline
            </span>
          )}
          <button
            onClick={checkStatus}
            disabled={isRefreshing}
            title="Refresh status"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>

        {/* Dataset Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>IBM Telco (7,043 Records)</span>
        </div>
      </div>
    </header>
  );
};
