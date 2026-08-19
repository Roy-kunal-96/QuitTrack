import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { CravingAnalytics, SmokingLog } from '../types/index.js';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart2,
  Calendar,
  Zap,
  TrendingDown,
  Sparkles,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { HealthDisclaimer } from './HealthDisclaimer.js';

interface AnalyticsViewProps {
  onOpenDateLog: (date: string, existingLog?: SmokingLog) => void;
}

const PIE_COLORS = ['#0d9488', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e'];

// Helper to reliably parse YYYY-MM-DD without UTC timezone shift bugs
const getLocalDayNumber = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return parts.length === 3 ? parseInt(parts[2], 10) : new Date(dateStr).getDate();
};

const formatLocalDateShort = (dateStr: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatLocalDateFull = (dateStr: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onOpenDateLog }) => {
  const [smokingData, setSmokingData] = useState<any>(null);
  const [cravingData, setCravingData] = useState<CravingAnalytics | null>(null);
  const [allLogs, setAllLogs] = useState<SmokingLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const [smkRes, crvRes, logsRes] = await Promise.all([
        api.getSmokingAnalytics(),
        api.getCravingAnalytics(),
        api.getSmokingLogs()
      ]);

      if (smkRes.success && smkRes.data) setSmokingData(smkRes.data);
      if (crvRes.success && crvRes.data) setCravingData(crvRes.data);
      if (logsRes.success && logsRes.data) setAllLogs(logsRes.data);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Compiling your habit analytics...</p>
      </div>
    );
  }

  const timeline = smokingData?.timeline || [];
  const triggerDist = cravingData?.triggerDistribution || [];
  const insights = cravingData?.insights || [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 py-4 sm:py-6">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
          Behavior & Craving Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Data-driven patterns to help you recognize triggers and stay ahead of urges.
        </p>
      </div>

      {/* RULE-BASED DETERMINISTIC INSIGHTS */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/60 to-slate-900 border border-teal-500/30 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Personalized Behavioral Insights</span>
        </div>
        <div className="space-y-2">
          {insights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
              <span className="text-teal-400 font-black mt-0.5">•</span>
              <p className="leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 30-DAY SMOKING TREND CHART */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-sm text-white">Daily Smoking History</h3>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
            Last 30 Days
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={10} tickLine={false} interval={4} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }}
                formatter={(value: any) => [`${value} cigs`, 'Smoked']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="cigarettes" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-slate-400 text-center">
          0 bars represent successful 100% smoke-free days.
        </p>
      </div>

      {/* CRAVING INTENSITY TIMELINE */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-sm text-white">Craving Urge Intensity</h3>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
            Scale 1 - 10
          </span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={10} tickLine={false} interval={4} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 10]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }}
                formatter={(value: any) => [`${value} / 10`, 'Avg Intensity']}
              />
              <Line type="monotone" dataKey="avgCravingIntensity" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TRIGGER DISTRIBUTION DOUGHNUT */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            <h3 className="font-display font-bold text-sm text-white">Trigger Distribution</h3>
          </div>
          <span className="text-[11px] text-slate-400">{cravingData?.totalCravings || 0} cravings recorded</span>
        </div>

        {triggerDist.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-44 h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={triggerDist}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {triggerDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }}
                    formatter={(val: any, name: any) => [`${val} times`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 w-full space-y-2">
              {triggerDist.slice(0, 5).map((trig, idx) => (
                <div key={trig.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-300 font-medium">{trig.name}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">{trig.percentage}% ({trig.value})</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            No craving triggers recorded yet. Tap "SOS Crave" during an urge to build your profile!
          </div>
        )}
      </div>

      {/* SMOKING CALENDAR / HEATMAP */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-400" />
            <h3 className="font-display font-bold text-sm text-white">Interactive Calendar & Heatmap</h3>
          </div>
          <span className="text-[11px] text-slate-400">Tap day to inspect</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-[10px] font-bold text-slate-500 py-1 uppercase">{d}</div>
          ))}

          {timeline.slice(-28).map((day: any) => {
            const existing = allLogs.find(l => l.date === day.date);
            const isSmokeFree = day.status === 'smoke_free' || (existing && !existing.smoked);
            const isSmoked = day.status === 'smoked' || (existing && existing.smoked);
            const dayNum = getLocalDayNumber(day.date);
            const fullDateLabel = formatLocalDateFull(day.date);

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => onOpenDateLog(day.date, existing)}
                aria-label={`Date ${fullDateLabel}: ${isSmokeFree ? 'Smoke-Free' : isSmoked ? 'Smoked' : 'Unrecorded'}`}
                title={`${fullDateLabel} - ${isSmokeFree ? 'Clean Smoke-Free' : isSmoked ? 'Smoked' : 'Unrecorded'}`}
                className={`aspect-square rounded-xl p-1 text-[11px] font-bold flex flex-col items-center justify-center transition-all border ${
                  isSmokeFree
                    ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900'
                    : isSmoked
                    ? 'bg-rose-950/70 border-rose-700/60 text-rose-300 hover:bg-rose-900'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-500 hover:border-slate-700'
                }`}
              >
                <span>{dayNum}</span>
                <span className="text-[9px]">
                  {isSmokeFree ? '🟢' : isSmoked ? '🚬' : '•'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Smoke-Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Smoked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span>Unrecorded</span>
          </div>
        </div>
      </div>

      <HealthDisclaimer />
    </div>
  );
};
