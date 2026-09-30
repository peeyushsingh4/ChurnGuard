import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Play,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  Sparkles,
  BarChart2,
  RefreshCw,
  Sliders,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { ModelComparisonItem, ModelRun } from '../types';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { useTheme } from '../context/ThemeContext';

const AVAILABLE_MODELS = [
  {
    key: 'logistic_regression',
    name: 'Logistic Regression',
    family: 'Baseline',
    desc: 'L2-regularized linear decision boundary for calibrated probabilities',
    typicalTime: '~0.3s'
  },
  {
    key: 'decision_tree',
    name: 'Decision Tree (CART)',
    family: 'Baseline',
    desc: 'Single hierarchical tree partition using Gini impurity',
    typicalTime: '~0.2s'
  },
  {
    key: 'random_forest',
    name: 'Random Forest',
    family: 'Bagging',
    desc: 'Parallel ensemble of 150 trees with feature subspace sampling to reduce variance',
    typicalTime: '~1.8s'
  },
  {
    key: 'bagging_classifier',
    name: 'Bagging Classifier',
    family: 'Bagging',
    desc: 'Bootstrap aggregating across 80 decision estimators with replacement',
    typicalTime: '~1.2s'
  },
  {
    key: 'adaboost',
    name: 'AdaBoost Classifier',
    family: 'Boosting',
    desc: 'Sequential sample re-weighting using decision stumps to reduce bias',
    typicalTime: '~1.5s'
  },
  {
    key: 'gradient_boosting',
    name: 'Gradient Boosting (GBM)',
    family: 'Boosting',
    desc: 'Additive sequential ensemble fitting pseudo-residuals in function space',
    typicalTime: '~2.4s'
  },
  {
    key: 'xgboost',
    name: 'XGBoost Classifier',
    family: 'Boosting',
    desc: 'Second-order Taylor expansion loss optimization with shrinkage & pruning',
    typicalTime: '~1.4s'
  },
  {
    key: 'stacking',
    name: 'Stacking Classifier',
    family: 'Stacking',
    desc: 'Heterogeneous ensemble (RF + XGBoost + LogReg) with Logistic Regression blender',
    typicalTime: '~4.5s'
  }
];

export const ModelTrainingComparison: React.FC = () => {
  const { theme } = useTheme();
  const [comparison, setComparison] = useState<ModelComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModelKey, setSelectedModelKey] = useState('xgboost');
  const [useSmote, setUseSmote] = useState(true);
  const [training, setTraining] = useState(false);
  const [trainingStep, setTrainingStep] = useState<string | null>(null);
  const [lastTrainedRun, setLastTrainedRun] = useState<ModelRun | null>(null);

  const loadComparison = async () => {
    try {
      const data = await api.getModelComparison();
      setComparison(data);
    } catch (e) {
      console.error('Failed loading model comparison:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison();
  }, []);

  const handleTrain = async () => {
    setTraining(true);
    setTrainingStep('Partitioning 80/20 Stratified Splits...');
    
    // Simulate UI progress for rich visual feedback
    setTimeout(() => {
      setTrainingStep(useSmote ? 'Synthesizing Minority Vectors via SMOTE...' : 'Balancing class weights...');
    }, 400);

    setTimeout(() => {
      setTrainingStep('Fitting Estimators & Optimizing Objective Loss...');
    }, 900);

    setTimeout(() => {
      setTrainingStep('Executing 5-Fold Cross-Validation & ROC Curve Calculation...');
    }, 1500);

    try {
      const runResult = await api.trainModel(selectedModelKey, useSmote);
      setLastTrainedRun(runResult);
      await loadComparison();
    } catch (err) {
      console.error('Training error:', err);
    } finally {
      setTraining(false);
      setTrainingStep(null);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const isDark = theme === 'dark';

  // Chart data formatting
  const chartData = comparison.map((item) => ({
    name: item.model_name.replace(' Classifier', '').replace(' (CART)', '').replace(' (L2)', ''),
    ROC_AUC: Number((item.roc_auc * 100).toFixed(1)),
    Accuracy: Number((item.accuracy * 100).toFixed(1)),
    F1_Score: Number((item.f1_score * 100).toFixed(1)),
    family: item.model_family,
  }));

  const familyColors: Record<string, string> = {
    Baseline: 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/40',
    Bagging: 'border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/20',
    Boosting: 'border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20',
    Stacking: 'border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20',
  };

  return (
    <div className="space-y-6">
      {/* Training Control Cockpit */}
      <div className="bg-white dark:bg-[#0f172a]/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 shadow-xs dark:shadow-none transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Interactive Model Training Cockpit
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select an algorithm family, toggle SMOTE resampling, and trigger synchronous or background training.
            </p>
          </div>

          {/* SMOTE toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useSmote}
                onChange={(e) => setUseSmote(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer"
              />
              <span>Enable SMOTE Resampling</span>
            </label>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-medium">
              k-NN = 5
            </span>
          </div>
        </div>

        {/* Model Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {AVAILABLE_MODELS.map((m) => {
            const isSelected = selectedModelKey === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelectedModelKey(m.key)}
                className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/50 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${familyColors[m.family]}`}>
                    {m.family}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{m.typicalTime}</span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">{m.name}</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{m.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Train Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {training ? (
              <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {trainingStep}
              </span>
            ) : (
              <span>Ready to train selected model on 80% training set (N=5,634 rows).</span>
            )}
          </div>

          <button
            onClick={handleTrain}
            disabled={training}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            {training ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Training Model...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Train Selected Model
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comparative Bar Chart across all 8 models */}
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 shadow-xs dark:shadow-none transition-all">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Algorithm Benchmark Comparison</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ROC-AUC, Accuracy, and F1-Score across all 8 trained models (Syllabus Module 2.3)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Metrics in %</span>
        </div>

        <div className="h-72 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
              <XAxis dataKey="name" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} angle={-15} textAnchor="end" />
              <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} domain={[50, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  color: isDark ? '#ffffff' : '#0f172a',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="ROC_AUC" name="ROC-AUC (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Accuracy" name="Accuracy (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1_Score" name="F1-Score (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Leaderboard & Historical Runs Table */}
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 shadow-xs dark:shadow-none transition-all">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Ensemble Leaderboard & Historical Metrics</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Persisted in SQLite database (`model_runs` table)</p>
          </div>
          <button
            onClick={loadComparison}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                <th className="pb-3 pl-2">Rank / Model</th>
                <th className="pb-3">Family</th>
                <th className="pb-3 text-right">ROC-AUC</th>
                <th className="pb-3 text-right">Accuracy</th>
                <th className="pb-3 text-right">Precision</th>
                <th className="pb-3 text-right">Recall (Sens)</th>
                <th className="pb-3 text-right">Specificity</th>
                <th className="pb-3 text-right">F1-Score</th>
                <th className="pb-3 text-right pr-2">Train Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {comparison.map((item, idx) => {
                return (
                  <tr key={item.run_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pl-2 text-slate-900 dark:text-white font-medium flex items-center gap-2">
                      <span className="w-5 text-slate-400 text-[11px]">#{idx + 1}</span>
                      <span className="font-sans font-semibold">{item.model_name}</span>
                      {item.is_champion && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[9px] font-semibold">
                          CHAMPION
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${familyColors[item.model_family]}`}>
                        {item.model_family}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {(item.roc_auc * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 text-right text-slate-700 dark:text-slate-200">
                      {(item.accuracy * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 text-right text-slate-600 dark:text-slate-300">
                      {(item.precision * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 text-right text-indigo-600 dark:text-indigo-400 font-semibold">
                      {(item.recall * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 text-right text-slate-600 dark:text-slate-300">
                      {(item.specificity * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 text-right text-amber-600 dark:text-amber-400 font-semibold">
                      {(item.f1_score * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 text-right text-slate-500 dark:text-slate-400 pr-2">
                      {item.training_time_seconds.toFixed(2)}s
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
