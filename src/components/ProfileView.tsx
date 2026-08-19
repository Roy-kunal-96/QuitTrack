import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNotification } from '../context/NotificationContext.js';
import { useTheme, PALETTES, ThemeMode } from '../context/ThemeContext.js';
import { api } from '../services/api.js';
import {
  User,
  Settings,
  Bell,
  Download,
  RotateCcw,
  LogOut,
  Save,
  CheckCircle2,
  Calendar,
  DollarSign,
  Cigarette,
  Sparkles,
  Smartphone,
  ShieldAlert,
  Palette,
  Sun,
  Moon,
  Laptop,
  Shield,
  Award,
  Zap,
  Clock,
  Flame,
  Heart,
  Activity,
  Edit3,
  QrCode,
  Compass,
  Smile,
  Brain,
  Sliders,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Plus,
  Trash2,
  Lock
} from 'lucide-react';
import { HealthDisclaimer } from './HealthDisclaimer.js';

// Reliable Local Date Helpers (Zero UTC Timezone Shift Issues)
const formatToLocalDate = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
};

const formatHumanDateWithDays = (dateStr: string): { label: string; subLabel: string; diffDays: number } => {
  try {
    const target = parseLocalDate(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    
    const diffTime = today.getTime() - targetDay.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const dateFormatted = targetDay.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    let subLabel = '';
    if (diffDays === 0) {
      subLabel = '🎯 Quit Today (Day 1)';
    } else if (diffDays === 1) {
      subLabel = '⚡ Quit Yesterday (Day 2)';
    } else if (diffDays > 1) {
      subLabel = `🔥 ${diffDays} days smoke-free`;
    } else if (diffDays === -1) {
      subLabel = '📅 Planned for Tomorrow';
    } else {
      subLabel = `📅 Planned in ${Math.abs(diffDays)} days`;
    }

    return { label: dateFormatted, subLabel, diffDays };
  } catch (e) {
    return { label: dateStr, subLabel: '', diffDays: 0 };
  }
};

export const ProfileView: React.FC = () => {
  const { user, profile, updateProfile, logout, demoLogin } = useAuth();
  const { permission, requestPermission, sendNotification, showToast } = useNotification();
  const { mode, palette, isDark, setMode, setPalette } = useTheme();

  // Habit Settings State
  const [cigarettesPerDay, setCigarettesPerDay] = useState(profile?.cigarettesPerDay || 15);
  const [cigarettesPerPack, setCigarettesPerPack] = useState(profile?.cigarettesPerPack || 20);
  const [pricePerPack, setPricePerPack] = useState(profile?.pricePerPack || 120);
  const [currency, setCurrency] = useState(profile?.currency || '₹');
  const [quitDate, setQuitDate] = useState(profile?.quitDate || formatToLocalDate());
  const [smokingType, setSmokingType] = useState(profile?.smokingType || 'Cigarette');

  // Smart Interactive Features State
  const [passportFlipped, setPassportFlipped] = useState(false);
  const [coachPersona, setCoachPersona] = useState<'zen' | 'neuro' | 'coach' | 'friend'>('zen');
  const [reminderTime, setReminderTime] = useState('08:30');
  const [nightCheckinTime, setNightCheckinTime] = useState('20:30');
  
  // Custom Personal "Why I Quit" Mantras (stored in localStorage for persistence)
  const [mantras, setMantras] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('quittrack_user_mantras');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      'Freedom from nicotine control and daily coughing',
      'Saving funds for my family dreams and health safety',
      'Reclaiming full lung capacity for sports and endurance'
    ];
  });
  const [newMantra, setNewMantra] = useState('');
  const [isEditingMantras, setIsEditingMantras] = useState(false);

  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setCigarettesPerDay(profile.cigarettesPerDay);
      setCigarettesPerPack(profile.cigarettesPerPack);
      setPricePerPack(profile.pricePerPack);
      setCurrency(profile.currency);
      setQuitDate(profile.quitDate);
      setSmokingType(profile.smokingType);
    }
    // Fetch stats for smart passport calculations
    api.getDashboard().then(res => {
      if (res.success && res.data) {
        setDashboardStats(res.data.stats);
      }
    }).catch(() => {});
  }, [profile]);

  const handleSaveMantras = (updated: string[]) => {
    setMantras(updated);
    localStorage.setItem('quittrack_user_mantras', JSON.stringify(updated));
    showToast('Updated your personal motivation anchors!', 'success');
  };

  const handleAddMantra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMantra.trim()) return;
    const updated = [...mantras, newMantra.trim()];
    handleSaveMantras(updated);
    setNewMantra('');
  };

  const handleDeleteMantra = (index: number) => {
    const updated = mantras.filter((_, i) => i !== index);
    handleSaveMantras(updated);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({
        cigarettesPerDay: Number(cigarettesPerDay),
        cigarettesPerPack: Number(cigarettesPerPack),
        pricePerPack: Number(pricePerPack),
        currency,
        quitDate,
        smokingType: smokingType as any
      });

      if (res.success) {
        showToast('Profile and habit parameters updated successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to update profile', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        showToast('Notification permission was not granted by your browser.', 'info');
        return;
      }
    }

    const quotes: Record<string, string> = {
      zen: '🌿 "Urges are like ocean waves. You don\'t fight the wave; you breathe and ride it to the shore."',
      neuro: '🔬 "Neuro-plasticity in action: In just 5 minutes without nicotine, dopamine receptors reset by 2.4%."',
      coach: '⚡ "Eyes on the prize! You conquered yesterday, and you will dominate today. Stay locked in!"',
      friend: '💙 "Thinking of you. Take a glass of ice water, 3 deep belly breaths, and remember why you started."'
    };

    sendNotification('QuitTrack SOS Alert 🛡️', {
      body: quotes[coachPersona] || quotes.zen
    });
    showToast(`Sent ${coachPersona.toUpperCase()} coach alert to your device!`, 'success');
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const [logsRes, crvRes] = await Promise.all([
        api.getSmokingLogs(),
        api.getCravings()
      ]);

      const exportPayload = {
        user: { name: user?.name, email: user?.email },
        profile,
        smokingLogs: logsRes.data || [],
        cravingLogs: crvRes.data || [],
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QuitTrack_Data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Exported your complete quit history JSON!', 'success');
    } catch (err) {
      showToast('Failed to export data', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm('This will reload the rich demo dataset with 18 smoke-free days, craving history, and unlocked achievements. Continue?')) {
      return;
    }
    try {
      await demoLogin();
      showToast('Reloaded demo profile successfully!', 'success');
    } catch (err) {
      showToast('Failed to reset demo', 'error');
    }
  };

  // Smart calculations
  const smokeFreeDays = dashboardStats?.smokeFreeDays ?? (
    profile?.quitDate ? Math.max(0, Math.floor((Date.now() - new Date(profile.quitDate).getTime()) / (1000 * 60 * 60 * 24))) : 18
  );
  const cigsAvoided = dashboardStats?.cigarettesAvoided ?? (smokeFreeDays * cigarettesPerDay);
  const moneySaved = dashboardStats?.moneySaved ?? (Math.round(cigsAvoided * (pricePerPack / (cigarettesPerPack || 1))));
  
  // Life Regained: ~11 minutes of life regained per avoided cigarette
  const lifeHoursRegained = Math.round((cigsAvoided * 11) / 60);
  const lifeDaysRegained = (lifeHoursRegained / 24).toFixed(1);

  // User Rank/Level tier based on days
  const getLevelTier = (days: number) => {
    if (days >= 365) return { title: 'Master of Freedom', tier: 'Tier V (Legendary)', color: 'from-amber-400 to-yellow-600', badge: '👑' };
    if (days >= 90) return { title: 'Resilient Sentinel', tier: 'Tier IV (Elite)', color: 'from-purple-400 to-indigo-600', badge: '🛡️' };
    if (days >= 30) return { title: 'Smoke-Free Vanguard', tier: 'Tier III (Veteran)', color: 'from-teal-400 to-emerald-600', badge: '⚔️' };
    if (days >= 7) return { title: 'Habit Breaker', tier: 'Tier II (Progressing)', color: 'from-cyan-400 to-blue-600', badge: '⚡' };
    return { title: 'Initiate of Recovery', tier: 'Tier I (Novice)', color: 'from-slate-400 to-slate-600', badge: '🌱' };
  };

  const levelInfo = getLevelTier(smokeFreeDays);

  // Biological Craving Clock Danger Analysis for current hour
  const currentHour = new Date().getHours();
  const getRiskLevel = (hour: number) => {
    if (hour >= 7 && hour <= 9) return { risk: 'HIGH', label: 'Morning Coffee / Wake-Up Window', advice: 'Drink hot herbal tea or cold lemon water immediately', color: 'text-amber-400 bg-amber-500/20' };
    if (hour >= 13 && hour <= 14) return { risk: 'MEDIUM', label: 'Post-Lunch Digestion Trigger', advice: 'Go for a quick 5-min walk or chew cinnamon gum', color: 'text-yellow-400 bg-yellow-500/20' };
    if (hour >= 18 && hour <= 20) return { risk: 'HIGH', label: 'Evening Commute & Work Wind-Down', advice: 'Take 5 deep 4-2-6 breaths before heading home', color: 'text-rose-400 bg-rose-500/20' };
    if (hour >= 21 && hour <= 23) return { risk: 'MEDIUM', label: 'Late Night Screen / Leisure Craving', advice: 'Keep your hands busy with stress ball or journaling', color: 'text-indigo-400 bg-indigo-500/20' };
    return { risk: 'LOW', label: 'Standard Metabolic Baseline', advice: 'Your body is continuously healing and oxygenating', color: 'text-emerald-400 bg-emerald-500/20' };
  };

  const currentRisk = getRiskLevel(currentHour);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto px-3.5 sm:px-4 py-3 sm:py-6">
      
      {/* ========================================================================= */}
      {/* 1. EYE-CATCHY DIGITAL QUIT PASSPORT & IDENTITY CARD */}
      {/* ========================================================================= */}
      <div className="relative group perspective-1000">
        <div
          className={`w-full rounded-3xl p-5 sm:p-6 transition-all duration-500 transform shadow-2xl relative overflow-hidden border ${
            passportFlipped
              ? 'bg-gradient-to-br from-slate-900 via-indigo-950/90 to-slate-950 border-indigo-500/50'
              : 'bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/80 border-teal-500/40'
          }`}
        >
          {/* Holographic metallic shimmer bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-amber-300 to-indigo-400 opacity-80" />
          
          {/* Subtle background circuit watermark */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          {!passportFlipped ? (
            /* FRONT: IDENTITY BADGE */
            <div className="space-y-4">
              {/* Header inside passport */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{levelInfo.badge}</span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 block">
                      VERIFIED QUIT IDENTITY PASSPORT
                    </span>
                    <span className="text-xs font-bold text-slate-300">ID: QT-2026-{user?.name?.slice(0, 3).toUpperCase() || 'HERO'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setPassportFlipped(true)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-teal-300 border border-slate-700/80 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Flip Card</span>
                </button>
              </div>

              {/* User Avatar + Tier Info */}
              <div className="flex items-center gap-4 pt-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 shrink-0 border-2 border-white/20">
                  {user?.name?.charAt(0) || 'Q'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-tight truncate">
                      {user?.name || 'Quit Hero'}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold whitespace-nowrap">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs font-bold text-amber-300 mt-0.5">{levelInfo.title}</p>
                  <p className="text-[11px] text-slate-400">{levelInfo.tier}</p>
                </div>
              </div>

              {/* 3 Metric Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">SMOKE-FREE</span>
                  <span className="font-display text-base sm:text-lg font-black text-white">{smokeFreeDays} Days</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">LIFE GAINED</span>
                  <span className="font-display text-base sm:text-lg font-black text-teal-400">+{lifeHoursRegained}h</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">DEFENSE</span>
                  <span className="font-display text-base sm:text-lg font-black text-emerald-400">Grade A+</span>
                </div>
              </div>
            </div>
          ) : (
            /* BACK: DIGITAL QR PLEDGE & SIGNATURE */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                    CERTIFIED HEALTH DECLARATION
                  </span>
                </div>
                <button
                  onClick={() => setPassportFlipped(false)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <span>Back to Passport</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/90 border border-indigo-500/30 text-xs text-slate-300 space-y-2">
                <div className="font-mono text-[11px] text-teal-300">
                  "I solemnly pledge to honor my lungs, safeguard my future vitality, and master every urge wave."
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <span>
                    Quit Date: {(() => {
                      try {
                        const [y, m, d] = quitDate.split('-').map(Number);
                        if (y && m && d) {
                          return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        }
                      } catch (e) {}
                      return quitDate;
                    })()}
                  </span>
                  <span className="font-bold text-indigo-300">Signed: {user?.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Cryptographically Active
                </span>
                <span className="text-[10px]">Tap Flip Card to toggle</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SMART 24-HOUR BIOLOGICAL CRAVING CLOCK & DANGER HEATMAP */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-white">
                Biological Craving Radar
              </h3>
              <p className="text-[11px] text-slate-400">Real-time vulnerability analysis for the current hour.</p>
            </div>
          </div>
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${currentRisk.color}`}>
            {currentRisk.risk} RISK NOW
          </span>
        </div>

        {/* Dynamic Advice Banner based on current time */}
        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>🎯</span> {currentRisk.label} ({currentHour}:00 - {currentHour + 1}:00)
            </span>
          </div>
          <p className="text-xs text-teal-300 leading-relaxed font-medium">
            💡 Tactical Defense: {currentRisk.advice}
          </p>
        </div>

        {/* 24-Hour Micro Hour Ticks */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
            <span>6 AM (Wake)</span>
            <span>12 PM (Lunch)</span>
            <span>6 PM (Commute)</span>
            <span>11 PM (Sleep)</span>
          </div>
          <div className="grid grid-cols-24 gap-0.5 h-3 rounded-md overflow-hidden bg-slate-950 p-0.5 border border-slate-800">
            {Array.from({ length: 24 }).map((_, h) => {
              const isNow = h === currentHour;
              const isHigh = (h >= 7 && h <= 9) || (h >= 18 && h <= 20);
              const isMed = (h >= 13 && h <= 14) || (h >= 21 && h <= 23);
              return (
                <div
                  key={h}
                  title={`${h}:00 - ${isHigh ? 'High Risk' : isMed ? 'Med Risk' : 'Low Risk'}`}
                  className={`h-full rounded-xs transition-all ${
                    isNow
                      ? 'bg-white ring-2 ring-teal-400 scale-125 z-10'
                      : isHigh
                      ? 'bg-rose-500/80'
                      : isMed
                      ? 'bg-amber-500/70'
                      : 'bg-teal-500/40'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE "WHY I QUIT" PERSONAL MOTIVATIONAL ANCHORS */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-white">
                Ironclad Reasons to Quit
              </h3>
              <p className="text-[11px] text-slate-400">Personal core mantras displayed during SOS cravings.</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingMantras(!isEditingMantras)}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingMantras ? 'Done' : 'Edit'}</span>
          </button>
        </div>

        {/* List of Mantras */}
        <div className="space-y-2">
          {mantras.map((m, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-slate-200 font-medium leading-tight truncate">{m}</span>
              </div>
              {isEditingMantras && (
                <button
                  onClick={() => handleDeleteMantra(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1 shrink-0"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {isEditingMantras && (
          <form onSubmit={handleAddMantra} className="flex gap-2 pt-1">
            <input
              type="text"
              value={newMantra}
              onChange={(e) => setNewMantra(e.target.value)}
              placeholder="Add your personal reason..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shrink-0 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. AI COACH PERSONA & NOTIFICATION ALERT CUSTOMIZER */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-white">
                Motivational Coach Persona
              </h3>
              <p className="text-[11px] text-slate-400">Choose the voice and tone of your SOS push alerts.</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            permission === 'granted' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
          }`}>
            {permission === 'granted' ? 'Alerts Active ✓' : 'Alerts Off'}
          </span>
        </div>

        {/* 4 Coaching Personas Selector */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'zen' as const, name: 'Zen Guide', icon: '🌿', desc: 'Mindful breathing & calm urge surfing' },
            { id: 'neuro' as const, name: 'Neuroscientist', icon: '🔬', desc: 'Brain dopamine & scientific facts' },
            { id: 'coach' as const, name: 'Drill Coach', icon: '⚡', desc: 'High energy, disciplined motivation' },
            { id: 'friend' as const, name: 'Caring Buddy', icon: '💙', desc: 'Warm, compassionate encouragement' }
          ].map(p => {
            const isSelected = coachPersona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setCoachPersona(p.id);
                  showToast(`Selected ${p.name} coaching voice`, 'info');
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500 text-white shadow-md ring-1 ring-purple-500'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-xs font-bold text-white">{p.name}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">{p.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Test Alert Button */}
        <button
          onClick={handleTestNotification}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-teal-300 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Smartphone className="w-4 h-4" />
          <span>{permission === 'granted' ? `Send Sample ${coachPersona.toUpperCase()} Push Alert` : 'Enable Device Push Alerts'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. THEME & COLOR PALETTE */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-teal-400" />
            <h3 className="font-display font-bold text-sm sm:text-base text-white">Theme & Color Palette</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
            {mode.toUpperCase()}
          </span>
        </div>

        {/* Mode Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Display Appearance</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'dark' as ThemeMode, label: 'Dark Obsidian', icon: Moon },
              { id: 'light' as ThemeMode, label: 'Clean Light', icon: Sun },
              { id: 'system' as ThemeMode, label: 'Auto System', icon: Laptop }
            ].map(item => {
              const Icon = item.icon;
              const isSelected = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMode(item.id);
                    showToast(`Switched to ${item.label}`, 'info');
                  }}
                  className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-teal-500/20 border-teal-500 text-teal-200 shadow-md ring-1 ring-teal-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color Palette */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Color Accent Theme</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PALETTES.map(p => {
              const isSelected = palette === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPalette(p.id);
                    showToast(`Applied ${p.name} theme`, 'success');
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-teal-500/15 border-teal-500 shadow-md ring-1 ring-teal-500/40'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shadow-sm shrink-0"
                      style={{ backgroundColor: p.primaryColor }}
                    />
                    <div>
                      <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-tight">{p.description}</p>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. HABIT PARAMETERS & QUIT DATE FORM */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-white">Habit & Baseline Settings</h3>
              <p className="text-[11px] text-slate-400">Configure your quit date, smoking habits, and pack pricing.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Smoking Type</label>
              <select
                value={smokingType}
                onChange={(e) => setSmokingType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
              >
                <option value="Cigarette">Cigarette</option>
                <option value="Bidi">Bidi</option>
                <option value="Vape">Vape / E-Cig</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Official Quit Date Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Official Quit Date
                </label>
                {/* Stepper Buttons for quick 1-day adjustment */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const d = parseLocalDate(quitDate);
                      d.setDate(d.getDate() - 1);
                      setQuitDate(formatToLocalDate(d));
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-bold transition-colors"
                    title="Move quit date 1 day earlier"
                  >
                    - 1 Day
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = parseLocalDate(quitDate);
                      d.setDate(d.getDate() + 1);
                      setQuitDate(formatToLocalDate(d));
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-bold transition-colors"
                    title="Move quit date 1 day later"
                  >
                    + 1 Day
                  </button>
                </div>
              </div>

              {/* Live Formatted Date & Status Card */}
              {(() => {
                const dateInfo = formatHumanDateWithDays(quitDate);
                return (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-teal-500/30 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">{dateInfo.label}</span>
                      <span className="text-[11px] font-semibold text-teal-300">{dateInfo.subLabel}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-mono font-bold shrink-0">
                      {quitDate}
                    </span>
                  </div>
                );
              })()}

              {/* Mobile Quick Presets */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                {[
                  { label: 'Today', daysAgo: 0 },
                  { label: 'Yesterday', daysAgo: 1 },
                  { label: '3 Days Ago', daysAgo: 3 },
                  { label: '1 Week Ago', daysAgo: 7 },
                  { label: '1 Month Ago', daysAgo: 30 }
                ].map(preset => {
                  const targetDate = new Date();
                  targetDate.setDate(targetDate.getDate() - preset.daysAgo);
                  const presetStr = formatToLocalDate(targetDate);
                  const isCurrent = quitDate === presetStr;

                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setQuitDate(presetStr)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all border ${
                        isCurrent
                          ? 'bg-teal-500/30 border-teal-400 text-teal-200 font-bold shadow-sm'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <input
                type="date"
                value={quitDate}
                onChange={(e) => setQuitDate(e.target.value)}
                className="w-full min-w-0 max-w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 transition-colors box-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cigarettes / Day: <span className="text-teal-400 font-bold">{cigarettesPerDay}</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={cigarettesPerDay}
                onChange={(e) => setCigarettesPerDay(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cigs per Pack</label>
              <input
                type="number"
                min="1"
                max="100"
                value={cigarettesPerPack}
                onChange={(e) => setCigarettesPerPack(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Price & Currency</label>
              <div className="flex gap-1.5">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-18 shrink-0 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="₹">₹ (INR)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="¥">¥ (JPY)</option>
                  <option value="A$">A$ (AUD)</option>
                  <option value="C$">C$ (CAD)</option>
                </select>
                <input
                  type="number"
                  min="1"
                  value={pricePerPack}
                  onChange={(e) => setPricePerPack(Number(e.target.value))}
                  className="w-full min-w-0 px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  placeholder="Price"
                />
              </div>
            </div>
          </div>

          {/* Live Dynamic Baseline Calculation Preview Card */}
          {(() => {
            const unitRate = pricePerPack / (cigarettesPerPack || 1);
            const dailyBurn = cigarettesPerDay * unitRate;
            const target = parseLocalDate(quitDate);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
            const diffDays = Math.max(0, Math.round((today.getTime() - targetDay.getTime()) / (1000 * 60 * 60 * 24)));
            const cigsAvoided = diffDays * cigarettesPerDay;
            const moneySaved = Math.round(cigsAvoided * unitRate);

            return (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Baseline Impact Preview
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Smoke-Free Days</span>
                    <span className="text-sm font-black text-teal-400">{diffDays} Days</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Cigs Avoided</span>
                    <span className="text-sm font-black text-emerald-400">{cigsAvoided}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Saved to Date</span>
                    <span className="text-sm font-black text-amber-400">{currency}{moneySaved}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Daily Expense</span>
                    <span className="text-sm font-black text-slate-200">{currency}{Math.round(dailyBurn)}/day</span>
                  </div>
                </div>
              </div>
            );
          })()}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Habit & Quit Date...' : 'Save Habit & Cost Settings'}</span>
          </button>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 7. DATA MANAGEMENT & ACTIONS */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
        <h3 className="font-display font-bold text-sm sm:text-base text-white">Data & Account Actions</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Export Full History</p>
              <p className="text-[11px] text-slate-400">Download complete logs in JSON</p>
            </div>
          </button>

          <button
            onClick={handleResetDemoData}
            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-left flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300">Reload Demo Dataset</p>
              <p className="text-[11px] text-slate-400">18 days clean + craving logs</p>
            </div>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-900/40 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>

      <HealthDisclaimer />
    </div>
  );
};
