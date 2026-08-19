import React, { useState } from 'react';
import {
  Home,
  BarChart2,
  AlertCircle,
  Award,
  User,
  Flame,
  Heart,
  DollarSign,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export type NavTab = 'dashboard' | 'home' | 'stats' | 'finance' | 'health' | 'achievements' | 'profile';

interface NavigationProps {
  activeTab: NavTab | string;
  setActiveTab?: (tab: any) => void;
  onTabChange?: (tab: any) => void;
  onOpenCravingRescue: () => void;
  smokeFreeDays?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onTabChange,
  onOpenCravingRescue,
  smokeFreeDays = 0
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleTabClick = (tab: NavTab) => {
    // Normalize 'home' to 'dashboard'
    const targetTab = tab === 'home' ? 'dashboard' : tab;
    if (typeof onTabChange === 'function') {
      onTabChange(targetTab);
    } else if (typeof setActiveTab === 'function') {
      setActiveTab(targetTab);
    }
    setIsMoreMenuOpen(false);
  };

  const isHomeActive = activeTab === 'home' || activeTab === 'dashboard';
  const isHealthActive = activeTab === 'health';
  const isFinanceActive = activeTab === 'finance';
  const isStatsActive = activeTab === 'stats';
  const isBadgesActive = activeTab === 'achievements';
  const isProfileActive = activeTab === 'profile';
  const isMoreActive = isStatsActive || isBadgesActive || isProfileActive;

  return (
    <>
      {/* ================= DESKTOP HEADER NAVIGATION ================= */}
      <header className="hidden md:block sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            onClick={() => handleTabClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-black text-xl">
              🚭
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg text-white">QuitTrack</span>
                {smokeFreeDays > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {smokeFreeDays}d free
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden lg:block">Track your journey. Beat the craving.</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="desktop-nav-dashboard"
              onClick={() => handleTabClick('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isHomeActive ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              id="desktop-nav-health"
              onClick={() => handleTabClick('health')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isHealthActive ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Health
            </button>
            <button
              id="desktop-nav-finance"
              onClick={() => handleTabClick('finance')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isFinanceActive ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Savings
            </button>
            <button
              id="desktop-nav-stats"
              onClick={() => handleTabClick('stats')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isStatsActive ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Analytics
            </button>
            <button
              id="desktop-nav-achievements"
              onClick={() => handleTabClick('achievements')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isBadgesActive ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Badges
            </button>
            <button
              id="desktop-nav-profile"
              onClick={() => handleTabClick('profile')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isProfileActive ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Profile
            </button>

            <button
              id="desktop-craving-sos-btn"
              onClick={onOpenCravingRescue}
              className="ml-3 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <AlertCircle className="w-4 h-4 animate-pulse" />
              <span>SOS Crave</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE "MORE" POPUP SHEET ================= */}
      {isMoreMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end p-4 animate-in fade-in"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl mb-16 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-display font-bold text-sm text-white">More Views</span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => handleTabClick('stats')}
                className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all ${
                  isStatsActive ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30' : 'bg-slate-950/60 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Analytics & Craving Logs</div>
                    <div className="text-[10px] text-slate-400">Trigger insights, success rate & calendar</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => handleTabClick('achievements')}
                className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all ${
                  isBadgesActive ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'bg-slate-950/60 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Badges & Achievements</div>
                    <div className="text-[10px] text-slate-400">Milestone points & social share cards</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => handleTabClick('profile')}
                className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all ${
                  isProfileActive ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30' : 'bg-slate-950/60 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Profile & Settings</div>
                    <div className="text-[10px] text-slate-400">Smoking plan, pricing, triggers & account</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE BOTTOM NAVIGATION BAR ================= */}
      {/* 5-Item Native App Style Navigation: Home | Health | SOS (Center) | Savings | More */}
      <nav
        id="mobile-bottom-navbar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-3 py-2 shadow-2xl"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-items-center">
          
          {/* 1. Home / Dashboard */}
          <button
            id="mobile-nav-home"
            type="button"
            onClick={() => handleTabClick('dashboard')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all active:scale-95 ${
              isHomeActive ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className={`w-5 h-5 transition-transform ${isHomeActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight mt-1">Home</span>
            {isHomeActive && <span className="w-1 h-1 rounded-full bg-teal-400 mt-0.5" />}
          </button>

          {/* 2. Health Recovery */}
          <button
            id="mobile-nav-health"
            type="button"
            onClick={() => handleTabClick('health')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all active:scale-95 ${
              isHealthActive ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className={`w-5 h-5 transition-transform ${isHealthActive ? 'scale-110 text-teal-400 fill-teal-400/20' : ''}`} />
            <span className="text-[10px] tracking-tight mt-1">Health</span>
            {isHealthActive && <span className="w-1 h-1 rounded-full bg-teal-400 mt-0.5" />}
          </button>

          {/* 3. Center Elevated SOS Crave Button */}
          <div className="relative -top-3 flex flex-col items-center">
            <button
              id="mobile-craving-sos-btn"
              type="button"
              onClick={onOpenCravingRescue}
              aria-label="Craving Rescue SOS"
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xl shadow-rose-600/50 border-3 border-slate-950 transition-transform active:scale-90 animate-pulse"
            >
              <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
            <span className="text-[10px] font-extrabold text-rose-400 tracking-tight mt-0.5">SOS Crave</span>
          </div>

          {/* 4. Savings / Finance */}
          <button
            id="mobile-nav-finance"
            type="button"
            onClick={() => handleTabClick('finance')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all active:scale-95 ${
              isFinanceActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className={`w-5 h-5 transition-transform ${isFinanceActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight mt-1">Savings</span>
            {isFinanceActive && <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />}
          </button>

          {/* 5. More Menu (Analytics, Badges, Profile) */}
          <button
            id="mobile-nav-more"
            type="button"
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all active:scale-95 relative ${
              isMoreActive ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Menu className={`w-5 h-5 transition-transform ${isMoreActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight mt-1">
              {isStatsActive ? 'Stats' : isBadgesActive ? 'Badges' : isProfileActive ? 'Profile' : 'More'}
            </span>
            {isMoreActive && <span className="w-1 h-1 rounded-full bg-teal-400 mt-0.5" />}
          </button>

        </div>
      </nav>
    </>
  );
};
