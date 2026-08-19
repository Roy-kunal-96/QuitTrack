import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { HealthMilestone } from '../types/index.js';
import {
  Heart,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Layers,
  Wind,
  Zap,
  TrendingUp,
  AlertCircle,
  Timer,
  Calendar,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Lock,
  Flame,
  Award,
  ArrowDownCircle,
  RefreshCw
} from 'lucide-react';
import { HealthDisclaimer } from './HealthDisclaimer.js';

type StatusFilter = 'all' | 'completed' | 'in_progress' | 'upcoming';

export const HealthView: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const activeMilestoneRef = useRef<HTMLDivElement | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await api.getHealthAnalytics();
      if (res.success && res.data) {
        setHealthData(res.data);
      }
    } catch (err) {
      console.error('Health fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-9 h-9 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading physiological health milestones...</p>
      </div>
    );
  }

  const milestones: HealthMilestone[] = healthData?.milestones || [];
  const completedCount = healthData?.completedCount || 0;
  const totalDays = healthData?.totalDays || 0;
  const totalHours = healthData?.totalHours || 0;
  const totalMinutes = healthData?.totalMinutes || 0;

  // Find the current in-progress milestone (the first uncompleted milestone)
  const currentInProgressMilestone = milestones.find(m => !m.isCompleted);
  const nextMinutesRemaining = currentInProgressMilestone
    ? Math.max(0, currentInProgressMilestone.targetMinutes - totalMinutes)
    : 0;

  // Clean, human-readable remaining time calculation that never overflows mobile
  const formatRemainingTime = (minutes: number) => {
    if (minutes <= 0) return 'Achieved';
    if (minutes < 60) return `${Math.round(minutes)}m left`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${Math.round(minutes % 60)}m left`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d left`;
    const months = Math.floor(days / 30.41);
    if (months < 12) return `${months} mo left`;
    const years = (days / 365.25).toFixed(1);
    return `${years} yrs left`;
  };

  // Human-readable target milestone date (e.g., "Aug 18, 2026", "Today", "Tomorrow")
  const getMilestoneDate = (targetMinutes: number, isCompleted?: boolean) => {
    try {
      const now = new Date();
      // Calculate milestone timestamp based on quit baseline
      const quitTime = now.getTime() - (totalMinutes || 0) * 60 * 1000;
      const milestoneTime = new Date(quitTime + targetMinutes * 60 * 1000);
      
      if (isNaN(milestoneTime.getTime())) return 'Upcoming';

      // Check if same calendar day as today
      const isToday = milestoneTime.toDateString() === now.toDateString();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = milestoneTime.toDateString() === tomorrow.toDateString();

      const dateStr = milestoneTime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: milestoneTime.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });

      if (isCompleted) {
        return dateStr;
      }

      if (isToday) return `Today (${dateStr})`;
      if (isTomorrow) return `Tomorrow (${dateStr})`;
      return dateStr;
    } catch (e) {
      return 'Upcoming';
    }
  };

  const categories = ['All', 'Cardiovascular', 'Blood Chemistry', 'Sensory', 'Respiratory', 'Circulation', 'Long-term'];

  // Categorize milestones by status
  const completedMilestones = milestones.filter(m => m.isCompleted);
  const inProgressMilestones = milestones.filter(m => m.id === currentInProgressMilestone?.id);
  const upcomingMilestones = milestones.filter(m => !m.isCompleted && m.id !== currentInProgressMilestone?.id);

  // Apply filters: category + status + search
  const filteredMilestones = milestones.filter(m => {
    // 1. Category Filter
    if (selectedCategory !== 'All' && m.category !== selectedCategory) {
      return false;
    }

    // 2. Status Filter
    const isInProgress = m.id === currentInProgressMilestone?.id;
    if (statusFilter === 'completed' && !m.isCompleted) return false;
    if (statusFilter === 'in_progress' && !isInProgress) return false;
    if (statusFilter === 'upcoming' && (m.isCompleted || isInProgress)) return false;

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchDesc = m.description.toLowerCase().includes(q);
      const matchBenefit = m.benefit.toLowerCase().includes(q);
      const matchTime = m.timeLabel.toLowerCase().includes(q);
      const matchCat = m.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchBenefit && !matchTime && !matchCat) {
        return false;
      }
    }

    return true;
  });

  const completionPercent = Math.round((completedCount / (milestones.length || 1)) * 100);

  const scrollToActive = () => {
    if (activeMilestoneRef.current) {
      activeMilestoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedMilestoneId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto px-3.5 sm:px-4 py-3 sm:py-6">
      
      {/* ========================================================================= */}
      {/* 1. HEADER & OVERVIEW                                                     */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center shadow-sm border border-teal-500/30">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
              Health Recovery
            </h1>
            <p className="text-xs text-slate-400">
              Evidence-based chronological milestones of physical detox & organ repair.
            </p>
          </div>
        </div>

        {currentInProgressMilestone && (
          <button
            onClick={scrollToActive}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
            title="Jump to current active milestone"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Jump to</span> Current
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. RECOVERY PROGRESS HERO BANNER                                         */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-teal-950/80 via-slate-900 to-slate-950 border border-teal-500/30 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 shrink-0" />
              Body Repair Progress
            </span>
            <div className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight pt-1">
              {completedCount} of {milestones.length} Reached
            </div>
            
            {/* Formatted smoke-free duration */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-300 pt-0.5">
              <span className="text-slate-400">Smoke-Free Duration:</span>
              <span className="text-teal-300 font-bold px-2 py-0.5 rounded-lg bg-teal-950/80 border border-teal-800/60 font-mono">
                {Math.floor(totalDays)}d {Math.floor(totalHours % 24)}h {Math.round(totalMinutes % 60)}m
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
            <div className="text-xs text-slate-400 sm:hidden">
              Overall Completion:
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-teal-500/40 flex flex-col items-center justify-center bg-slate-950/90 shadow-lg shadow-teal-500/10 shrink-0">
              <span className="font-display font-black text-xl sm:text-2xl text-teal-400">
                {completionPercent}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Repaired</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. NEXT UP ACTIVE SPOTLIGHT MILESTONE                                     */}
      {/* ========================================================================= */}
      {currentInProgressMilestone && (
        <div
          ref={activeMilestoneRef}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-amber-500/40 space-y-2.5 shadow-md relative overflow-hidden"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Current Active Milestone
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                {formatRemainingTime(nextMinutesRemaining)}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between flex-wrap gap-1">
              <h3 className="font-bold text-sm sm:text-base text-white">{currentInProgressMilestone.title}</h3>
              <span className="text-xs font-semibold text-teal-300">Target: {currentInProgressMilestone.timeLabel}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentInProgressMilestone.description}</p>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Est. Date: {getMilestoneDate(currentInProgressMilestone.targetMinutes)}
              </span>
              <span className="text-amber-300 font-bold">{currentInProgressMilestone.progress}% Complete</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-teal-400 transition-all duration-500"
                style={{ width: `${currentInProgressMilestone.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. NEW DEDICATED TIMELINE SECTION                                        */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
        
        {/* Timeline Header & Live Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-teal-400" />
              <h2 className="font-display font-bold text-base sm:text-lg text-white">
                Physical Health Recovery Timeline
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Follow every biological phase from minutes to decades smoke-free.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[200px] sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search BP, CO, cilia, organs..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        {/* Status Filter Tabs (All / Unlocked / In Progress / Upcoming) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all' as StatusFilter, label: 'All Milestones', count: milestones.length },
            { id: 'completed' as StatusFilter, label: '✓ Achieved', count: completedMilestones.length },
            { id: 'in_progress' as StatusFilter, label: '⚡ In Progress', count: inProgressMilestones.length },
            { id: 'upcoming' as StatusFilter, label: '🔒 Upcoming', count: upcomingMilestones.length }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-teal-500 border-teal-400 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-950/80 border-slate-800/90 text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === tab.id
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-slate-800 border-teal-400 text-teal-300 font-bold shadow-xs'
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Empty State when filters yield no matches */}
        {filteredMilestones.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
            <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-xs font-semibold text-slate-300">No milestones match your current filters.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-teal-400 hover:underline font-bold"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* ===================================================================== */}
        {/* VERTICAL SCROLLABLE TIMELINE CONTAINER WITH VISUAL SPINE             */}
        {/* ===================================================================== */}
        {filteredMilestones.length > 0 && (
          <div className="max-h-[640px] overflow-y-auto pr-1 sm:pr-2 space-y-3 relative">
            
            {/* Connected Vertical Timeline Spine Guide */}
            <div className="relative pl-5 sm:pl-7 space-y-3.5 before:content-[''] before:absolute before:top-4 before:bottom-4 before:left-2.5 sm:before:left-3.5 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-500/60 before:to-slate-800">
              
              {filteredMilestones.map((m, idx) => {
                const isDone = m.isCompleted;
                const isInProgress = m.id === currentInProgressMilestone?.id;
                const isLocked = !isDone && !isInProgress;
                const remainingMins = Math.max(0, m.targetMinutes - totalMinutes);
                const dateStr = getMilestoneDate(m.targetMinutes, isDone);
                const isExpanded = expandedMilestoneId === m.id;

                return (
                  <div
                    key={m.id}
                    id={`milestone-${m.id}`}
                    className={`relative rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-slate-950/90 border-emerald-500/40 hover:border-emerald-500/60 shadow-xs'
                        : isInProgress
                        ? 'bg-slate-950 border-teal-500 shadow-md ring-1 ring-teal-500/40'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Node on the Timeline Spine */}
                    <div
                      className={`absolute -left-5 sm:-left-7 top-4 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-slate-950 text-slate-950 shadow-sm shadow-emerald-500/30'
                          : isInProgress
                          ? 'bg-teal-400 border-slate-950 text-slate-950 shadow-md shadow-teal-500/50 ring-2 ring-teal-500/30 animate-pulse'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                      ) : isInProgress ? (
                        <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                      ) : (
                        <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      )}
                    </div>

                    {/* Milestone Card Content */}
                    <div className="p-3.5 sm:p-4 space-y-2.5">
                      
                      {/* Top Row: Time Badge, Title, Status Chip, Category */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700/80">
                              {m.timeLabel}
                            </span>
                            <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">
                              {m.category}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-xs sm:text-sm text-white pt-0.5">
                            {m.title}
                          </h3>
                        </div>

                        {/* Status Chip */}
                        <div className="shrink-0 flex items-center gap-1">
                          {isDone ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                              ✓ Achieved
                            </span>
                          ) : isInProgress ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                              ⚡ In Progress
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold border border-slate-700">
                              🔒 Locked
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {m.description}
                      </p>

                      {/* Key Benefit Highlight */}
                      <div className="flex items-center gap-1.5 text-[11px] text-teal-300 font-medium bg-teal-950/40 border border-teal-800/40 p-2 rounded-xl">
                        <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="leading-snug">{m.benefit}</span>
                      </div>

                      {/* Progress Bar & Date / Time Remaining */}
                      <div className="space-y-1.5 pt-0.5">
                        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 flex-wrap gap-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {isDone ? `Unlocked: ${dateStr}` : `Target: ${dateStr}`}
                          </span>
                          <span className={
                            isDone
                              ? 'text-emerald-400 font-bold'
                              : isInProgress
                              ? 'text-amber-300 font-bold'
                              : 'text-slate-400 font-semibold'
                          }>
                            {isDone ? '100% Repaired' : formatRemainingTime(remainingMins)}
                          </span>
                        </div>

                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isDone
                                ? 'bg-emerald-400'
                                : isInProgress
                                ? 'bg-gradient-to-r from-amber-500 to-teal-400'
                                : 'bg-slate-700'
                            }`}
                            style={{ width: `${m.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Expandable Details Toggle */}
                      <div className="pt-1 border-t border-slate-900 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => toggleExpand(m.id)}
                          className="text-[11px] text-slate-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>{isExpanded ? 'Hide clinical notes' : 'View biological mechanism'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <span className="text-[10px] text-slate-500 font-mono">
                          {m.progress}% healed
                        </span>
                      </div>

                      {/* Expanded Mechanism & Biological Impact */}
                      {isExpanded && (
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2 mt-2 animate-in fade-in duration-200">
                          <div className="flex items-start gap-2">
                            <Shield className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" />
                            <div>
                              <strong className="text-white block">Biological Mechanism:</strong>
                              <span className="text-slate-300 text-[11px] leading-relaxed">
                                Tobacco cessation halts chronic vascular vasoconstriction and allows red blood cell hemoglobin to bind with oxygen instead of carbon monoxide.
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2 pt-1 border-t border-slate-800/60">
                            <Activity className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            <div>
                              <strong className="text-white block">Immediate Impact:</strong>
                              <span className="text-slate-300 text-[11px] leading-relaxed">
                                {m.benefit}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 5. MEDICAL DISCLAIMER                                                     */}
      {/* ========================================================================= */}
      <HealthDisclaimer />
    </div>
  );
};
