import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { DashboardData } from '../types/index.js';
import {
  Flame,
  Cigarette,
  DollarSign,
  Trophy,
  Brain,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Heart,
  Sparkles,
  CalendarCheck,
  RefreshCw
} from 'lucide-react';
import { HealthDisclaimer } from './HealthDisclaimer.js';

interface DashboardViewProps {
  onOpenCravingRescue: () => void;
  onOpenDailyCheckin: () => void;
  onNavigateTab: (tab: 'stats' | 'finance' | 'health' | 'achievements' | 'profile') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenCravingRescue,
  onOpenDailyCheckin,
  onNavigateTab
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickCheckinNo = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await api.logSmoking({
        date: todayStr,
        smoked: false,
        cigarettes: 0
      });
      fetchDashboard();
    } catch (err) {
      console.error('Checkin error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading your smoke-free statistics...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    smokeFreeDays: 0,
    cigarettesAvoided: 0,
    moneySaved: 0,
    currentStreak: 0,
    longestStreak: 0,
    cravingsResisted: 0,
    cravingsTotal: 0,
    successRate: 100,
    totalPoints: 0,
    costPerCigarette: 5,
    dailyExpense: 100,
    monthlyExpense: 3000,
    yearlyExpense: 36500
  };

  const currency = data?.profile?.currency || '₹';
  const todayLog = data?.todayLog;

  return (
    <div className="space-y-5 max-w-2xl mx-auto px-4 py-4 sm:py-6">
      
      {/* Top Greeting & User Bar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-teal-400">Welcome back,</span>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            {user?.name || 'Quit Hero'} 👋
          </h1>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchDashboard(); }}
          disabled={refreshing}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          title="Refresh Dashboard"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-teal-400' : ''}`} />
        </button>
      </div>

      {/* Hero Flame Banner: DAYS SMOKE-FREE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 border border-teal-500/30 p-5 sm:p-7 shadow-2xl">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
                Smoke-Free Journey
              </div>
              {data?.profile?.quitDate && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-semibold text-slate-300">
                  <CalendarCheck className="w-3 h-3 text-teal-400" />
                  Since {(() => {
                    try {
                      const [y, m, d] = data.profile.quitDate.split('-').map(Number);
                      if (y && m && d) {
                        return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      }
                    } catch (e) {}
                    return data.profile.quitDate;
                  })()}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 pt-1">
              <span className="font-display text-5xl sm:text-6xl font-black text-white tracking-tight">
                {stats.smokeFreeDays}
              </span>
              <span className="font-display font-extrabold text-xl sm:text-2xl text-teal-300 uppercase tracking-tight">
                {stats.smokeFreeDays === 1 ? 'DAY' : 'DAYS'} SMOKE-FREE
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-sm">
              Every hour nicotine-free repairs your lungs, clears carbon monoxide, and builds neural resilience.
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 pt-2 sm:pt-0">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] font-medium">BEST STREAK</span>
              <span className="text-amber-400 font-bold font-display text-sm sm:text-base">
                🔥 {stats.longestStreak} Days
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] font-medium">REWARD POINTS</span>
              <span className="text-teal-300 font-bold font-display text-sm sm:text-base">
                ⭐ {stats.totalPoints} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Big Key Impact Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Cigarettes Avoided */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
            <Cigarette className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display text-2xl font-black text-white">{stats.cigarettesAvoided}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Cigarettes Avoided</div>
          </div>
        </div>

        {/* Money Saved */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display text-2xl font-black text-emerald-400">
              {currency}{stats.moneySaved.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Estimated Saved</div>
          </div>
        </div>

        {/* Cravings Resisted */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display text-2xl font-black text-white">{stats.cravingsResisted}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Cravings Resisted</div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display text-2xl font-black text-amber-400">{stats.successRate}%</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Resistance Rate</div>
          </div>
        </div>
      </div>

      {/* PROMINENT CRAVING SOS CTA BANNER */}
      <div className="relative group">
        <button
          id="dashboard-craving-rescue-cta"
          onClick={onOpenCravingRescue}
          className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold shadow-xl shadow-rose-600/30 flex items-center justify-between transition-all transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <AlertCircle className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="font-display text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>🚨 I'M HAVING A CRAVING</span>
              </div>
              <p className="text-xs text-rose-100 font-medium">Tap for immediate 4-2-6 breathing or 5-min rescue</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs bg-white/20 px-3 py-1.5 rounded-xl">
            <span>Rescue SOS</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* TODAY'S CHECK-IN CARD */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-teal-400" />
            <h3 className="font-display font-bold text-sm sm:text-base text-white">Today's Check-In</h3>
          </div>
          <button
            onClick={onOpenDailyCheckin}
            className="text-xs text-teal-400 hover:underline font-semibold"
          >
            {todayLog ? 'Edit Today\'s Log' : 'Detailed Log'}
          </button>
        </div>

        {todayLog ? (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              !todayLog.smoked
                ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {!todayLog.smoked ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold">
                  {!todayLog.smoked
                    ? '🎉 Another Smoke-Free Day Confirmed!'
                    : `Logged ${todayLog.cigarettes} cigarette(s) today.`}
                </p>
                <p className="text-[11px] opacity-80">
                  {!todayLog.smoked ? '+20 streak points credited.' : `Trigger: ${todayLog.trigger || 'Craving'}`}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenDailyCheckin}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-200"
            >
              Update
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">Did you smoke today?</p>
              <p className="text-[11px] text-slate-400">Record your status to keep your flame streak alive.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="quick-checkin-no"
                onClick={handleQuickCheckinNo}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NO (Clean)</span>
              </button>
              <button
                id="quick-checkin-yes"
                onClick={onOpenDailyCheckin}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <span>YES</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* HEALTH RECOVERY PREVIEW */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            <h3 className="font-display font-bold text-sm sm:text-base text-white">Health Recovery Timeline</h3>
          </div>
          <button
            onClick={() => onNavigateTab('health')}
            className="text-xs text-teal-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Oxygen & Carbon Monoxide</span>
              <span className="text-teal-400 font-bold">100% Cleared</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-400 h-full w-full rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400">Blood oxygen levels normal; toxic gases flushed.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Bronchial & Lung Cilia</span>
              <span className="text-teal-400 font-bold">In Progress</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.max(15, stats.smokeFreeDays * 4))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">Cilia cleaning out mucus and airway irritants.</p>
          </div>
        </div>
      </div>

      {/* QUICK ANALYTICS & INSIGHTS CARD */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h3 className="font-display font-bold text-sm sm:text-base text-white">Your Quit Trends</h3>
          </div>
          <button
            onClick={() => onNavigateTab('stats')}
            className="text-xs text-teal-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>Detailed Analytics</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-white">
              {stats.cravingsResisted >= 5
                ? `You have conquered ${stats.cravingsResisted} cravings so far with active interventions.`
                : 'Keep logging whenever an urge hits to discover your personal trigger pattern.'}
            </p>
            <p className="text-[11px] text-slate-400">
              Estimated avoided spending: <span className="text-emerald-400 font-bold">{currency}{stats.moneySaved.toLocaleString()}</span>.
            </p>
          </div>
        </div>
      </div>

      <HealthDisclaimer />
    </div>
  );
};
