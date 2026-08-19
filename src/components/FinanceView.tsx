import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useNotification } from '../context/NotificationContext.js';
import { SavingsGoalItem } from '../types/index.js';
import {
  DollarSign,
  TrendingUp,
  Target,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  PiggyBank,
  Calculator,
  Gift,
  Coins,
  ShieldCheck,
  ShoppingBag,
  Plane,
  HeartHandshake
} from 'lucide-react';
import { HealthDisclaimer } from './HealthDisclaimer.js';

const GOAL_PRESETS = [
  { name: 'Emergency Safety Fund', icon: '🛡️', targetAmount: 10000 },
  { name: 'Weekend Mountain Getaway', icon: '✈️', targetAmount: 25000 },
  { name: 'Latest Smartphone', icon: '📱', targetAmount: 45000 },
  { name: 'Fitness Gym Membership', icon: '🏋️', targetAmount: 12000 },
  { name: 'Noise-Cancelling Headphones', icon: '🎧', targetAmount: 18000 },
  { name: 'Outdoor Bicycle / Gear', icon: '🚴', targetAmount: 15000 }
];

export const FinanceView: React.FC = () => {
  const { showToast } = useNotification();
  const [financialData, setFinancialData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive Simulator State
  const [simulatedDays, setSimulatedDays] = useState<number>(90);

  // New Goal Modal state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState(10000);
  const [goalIcon, setGoalIcon] = useState('🎯');
  const [creating, setCreating] = useState(false);

  const fetchFinance = async () => {
    try {
      const [finRes, savRes, dashRes] = await Promise.all([
        api.getFinancialAnalytics(),
        api.getSavings(),
        api.getDashboard()
      ]);

      if (finRes.success && finRes.data) setFinancialData(finRes.data);
      if (savRes.success && savRes.data) setSavingsGoals(savRes.data.goals || []);
      if (dashRes.success && dashRes.data) setDashboardData(dashRes.data);
    } catch (err) {
      console.error('Finance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim() || goalAmount <= 0) return;

    setCreating(true);
    try {
      const res = await api.createSavingsGoal({
        name: goalName.trim(),
        targetAmount: Number(goalAmount),
        icon: goalIcon
      });

      if (res.success) {
        showToast('Savings goal created! Keep stacking your smoke-free funds.', 'success');
        setIsGoalModalOpen(false);
        setGoalName('');
        fetchFinance();
      } else {
        showToast(res.message || 'Error creating goal', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const res = await api.deleteSavingsGoal(id);
      if (res.success) {
        showToast('Savings goal removed', 'info');
        fetchFinance();
      }
    } catch (err) {
      console.error('Delete goal error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Calculating financial return on health...</p>
      </div>
    );
  }

  const cigarettesPerDay = dashboardData?.profile?.cigarettesPerDay || 10;
  const cigarettesPerPack = dashboardData?.profile?.cigarettesPerPack || 20;
  const pricePerPack = dashboardData?.profile?.pricePerPack || 100;
  const currency = financialData?.currency || dashboardData?.profile?.currency || '₹';

  const costPerCigarette = financialData?.costPerCigarette || Number((pricePerPack / (cigarettesPerPack || 1)).toFixed(2));
  const dailyCost = financialData?.dailyCost || Math.round(cigarettesPerDay * costPerCigarette);
  const currentSaved = financialData?.currentSaved ?? (dashboardData?.stats?.moneySaved ?? 0);
  const cigarettesAvoided = dashboardData?.stats?.cigarettesAvoided || 0;

  // Simulated savings calculations
  const simulatedSavings = Math.round(simulatedDays * dailyCost);
  const simulatedCigsAvoided = simulatedDays * cigarettesPerDay;

  // Target date for simulated future
  const getSimulatedTargetDate = (days: number) => {
    try {
      const now = new Date();
      const target = new Date();
      target.setDate(target.getDate() + days);
      return target.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: target.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (e) {
      return `+${days} days`;
    }
  };

  // Helper for goal projected date
  const getGoalProjectedDate = (daysRemaining: number) => {
    if (daysRemaining <= 0) return 'Achieved today';
    if (daysRemaining === 1) return 'Tomorrow';
    try {
      const now = new Date();
      const target = new Date();
      target.setDate(target.getDate() + daysRemaining);
      const dateStr = target.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: target.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
      return dateStr;
    } catch (e) {
      return `in ${daysRemaining}d`;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto px-3.5 sm:px-4 py-3 sm:py-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-sm">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
              Cost & Wealth Saved
            </h1>
            <p className="text-xs text-slate-400">
              Direct financial dividends from reclaiming your smoke-free life.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Card: Realized Savings to Date */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              <PiggyBank className="w-3.5 h-3.5" />
              Accumulated Bank Balance Saved
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div className="font-display text-3xl sm:text-5xl font-black text-emerald-400 tracking-tight">
              {currency}{currentSaved.toLocaleString()}
            </div>
            <div className="text-xs text-slate-300">
              From <span className="text-emerald-300 font-bold">{cigarettesAvoided.toLocaleString()} unsmoked cigarettes</span>
            </div>
          </div>

          {/* Quick Metrics in 2-column mobile layout */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">DAILY EXPENSE RATE</span>
              <span className="text-white font-bold text-xs sm:text-sm">{currency}{dailyCost.toLocaleString()} / day</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">1-YEAR PROJECTION</span>
              <span className="text-emerald-300 font-bold text-xs sm:text-sm">{currency}{financialData?.yearlyCost?.toLocaleString() || '36,500'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CALCULATION TRANSPARENCY CARD (Fully Mobile Responsive) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Calculator className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Habit Cost Breakdown Formula</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20 font-semibold">
            Real-time
          </span>
        </div>
        
        {/* Responsive 4-box layout with auto-wrapping */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">Pack Price</span>
            <span className="text-white font-bold text-xs sm:text-sm truncate block">{currency}{pricePerPack}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">Cigs per Pack</span>
            <span className="text-white font-bold text-xs sm:text-sm truncate block">{cigarettesPerPack} cigs</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">Cost / Cigarette</span>
            <span className="text-teal-300 font-bold text-xs sm:text-sm truncate block">{currency}{costPerCigarette}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">Your Habit</span>
            <span className="text-amber-400 font-bold text-xs sm:text-sm truncate block">{cigarettesPerDay} cigs/day</span>
          </div>
        </div>

        {/* Clean wrapped formula display */}
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 text-xs text-slate-300 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Formula Equation:</div>
          <div className="font-mono text-[11px] sm:text-xs text-teal-300 break-words leading-relaxed">
            ({currency}{pricePerPack} ÷ {cigarettesPerPack}) × {cigarettesPerDay} cigs = <span className="text-emerald-400 font-bold">{currency}{dailyCost} saved/day</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE SAVINGS SIMULATOR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            <h3 className="font-display font-bold text-sm text-white">Savings Forecast Simulator</h3>
          </div>
          <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full whitespace-nowrap">
            {simulatedDays} Days (~{Math.round(simulatedDays / 30)} Mo)
          </span>
        </div>

        {/* Preset quick buttons */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { days: 30, label: '1 Month' },
            { days: 90, label: '3 Months' },
            { days: 180, label: '6 Months' },
            { days: 365, label: '1 Year' },
            { days: 730, label: '2 Years' }
          ].map(p => (
            <button
              key={p.days}
              type="button"
              onClick={() => setSimulatedDays(p.days)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                simulatedDays === p.days
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <input
            id="savings-simulator-slider"
            type="range"
            min="7"
            max="730"
            step="7"
            value={simulatedDays}
            onChange={(e) => setSimulatedDays(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>7 Days</span>
            <span>6 Months</span>
            <span>1 Year</span>
            <span>2 Years</span>
          </div>
        </div>

        {/* Projected Outcome Card */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              ESTIMATED CASH ACCUMULATION
            </span>
            <div className="font-display text-2xl sm:text-3xl font-black text-emerald-400">
              {currency}{simulatedSavings.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-teal-400" />
              Projected by {getSimulatedTargetDate(simulatedDays)}
            </span>
          </div>
          <div className="sm:text-right border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Cigarettes Avoided</span>
            <span className="text-white font-bold text-sm sm:text-base">{simulatedCigsAvoided.toLocaleString()} unsmoked</span>
          </div>
        </div>
      </div>

      {/* TIME HORIZON PERIOD CARDS (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Weekly Savings</span>
          <div className="font-display text-base sm:text-xl font-bold text-white mt-0.5 truncate">
            {currency}{financialData?.weeklyCost?.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">7 days smoke-free</span>
        </div>
        
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Monthly Savings</span>
          <div className="font-display text-base sm:text-xl font-bold text-white mt-0.5 truncate">
            {currency}{financialData?.monthlyCost?.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">30 days smoke-free</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">1-Year Savings</span>
          <div className="font-display text-base sm:text-xl font-bold text-white mt-0.5 truncate">
            {currency}{financialData?.yearlyCost?.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">365 days smoke-free</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/30">
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">5-Year Wealth</span>
          <div className="font-display text-base sm:text-xl font-bold text-emerald-400 mt-0.5 truncate">
            {currency}{financialData?.fiveYearCost?.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-500/80">Major life milestone</span>
        </div>
      </div>

      {/* CUSTOM SAVINGS GOALS SECTION */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h3 className="font-display font-bold text-sm text-white">Tangible Savings Rewards</h3>
              <p className="text-[11px] text-slate-400">Treat yourself to tangible rewards from avoided cigarette costs.</p>
            </div>
          </div>
          <button
            id="add-savings-goal-btn"
            onClick={() => setIsGoalModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-teal-600/30 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Goal</span>
          </button>
        </div>

        {savingsGoals.length > 0 ? (
          <div className="space-y-3">
            {savingsGoals.map(goal => (
              <div key={goal._id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{goal.icon || '🎯'}</span>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{goal.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        Target: <span className="text-slate-200 font-semibold">{currency}{goal.targetAmount.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="text-slate-500 hover:text-rose-400 p-1 shrink-0"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-semibold flex-wrap gap-1">
                    <span className="text-slate-400">
                      Saved: {currency}{goal.savedTowardsGoal.toLocaleString()} ({goal.progressPercent}%)
                    </span>
                    <span className={goal.isCompleted ? 'text-emerald-400 font-bold' : 'text-amber-400 font-semibold'}>
                      {goal.isCompleted ? '🎉 Goal Achieved!' : `~${goal.daysToGoal}d left (${getGoalProjectedDate(goal.daysToGoal)})`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-teal-400'
                      }`}
                      style={{ width: `${goal.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 space-y-2 border border-dashed border-slate-800 rounded-xl">
            <p>You haven't added any custom savings rewards yet.</p>
            <p className="text-slate-500 text-[11px]">
              Setting concrete rewards (gadgets, vacation, fitness gear) reinforces your psychological motivation to stay smoke-free.
            </p>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create First Reward Goal
            </button>
          </div>
        )}
      </div>

      {/* CREATE GOAL MODAL */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
            <h3 className="font-display font-bold text-base text-white">Create a Savings Reward Goal</h3>
            
            {/* Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Inspiration Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {GOAL_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setGoalName(preset.name);
                      setGoalAmount(preset.targetAmount);
                      setGoalIcon(preset.icon);
                    }}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs hover:border-teal-500 transition-all flex items-center gap-2"
                  >
                    <span>{preset.icon}</span>
                    <span className="text-slate-300 font-medium truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Goal Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="e.g. Vacation in Mountains"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                  <select
                    value={goalIcon}
                    onChange={(e) => setGoalIcon(e.target.value)}
                    className="w-16 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                  >
                    <option value="🎯">🎯</option>
                    <option value="✈️">✈️</option>
                    <option value="📱">📱</option>
                    <option value="🚴">🚴</option>
                    <option value="🛡️">🛡️</option>
                    <option value="🎧">🎧</option>
                    <option value="💻">💻</option>
                    <option value="🏖️">🏖️</option>
                    <option value="🏋️">🏋️</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Amount ({currency})
                </label>
                <input
                  type="number"
                  min="100"
                  required
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md"
                >
                  {creating ? 'Saving...' : 'Set Goal 🎯'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <HealthDisclaimer />
    </div>
  );
};
