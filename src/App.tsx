import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.js';
import { AuthView } from './components/AuthView.js';
import { OnboardingWizard } from './components/OnboardingWizard.js';
import { DashboardView } from './components/DashboardView.js';
import { AnalyticsView } from './components/AnalyticsView.js';
import { FinanceView } from './components/FinanceView.js';
import { HealthView } from './components/HealthView.js';
import { AchievementsView } from './components/AchievementsView.js';
import { ProfileView } from './components/ProfileView.js';
import { Navigation } from './components/Navigation.js';
import { CravingRescueModal } from './components/CravingRescueModal.js';
import { DailyLogModal } from './components/DailyLogModal.js';
import { SmokingLog } from './types/index.js';
import { Flame, WifiOff, AlertCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from './context/ThemeContext.js';

export default function App() {
  const { user, profile, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stats' | 'finance' | 'health' | 'achievements' | 'profile'>('dashboard');
  const [isCravingModalOpen, setIsCravingModalOpen] = useState(false);
  const [isDailyLogModalOpen, setIsDailyLogModalOpen] = useState(false);
  const [selectedLogDate, setSelectedLogDate] = useState<string | undefined>(undefined);
  const [selectedExistingLog, setSelectedExistingLog] = useState<SmokingLog | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleOpenDateLog = (date: string, existingLog?: SmokingLog) => {
    setSelectedLogDate(date);
    setSelectedExistingLog(existingLog || null);
    setIsDailyLogModalOpen(true);
  };

  const handleOpenTodayCheckin = () => {
    setSelectedLogDate(new Date().toISOString().split('T')[0]);
    setSelectedExistingLog(null);
    setIsDailyLogModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-2xl font-bold animate-pulse">
          🚭
        </div>
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Initializing QuitTrack PWA...</p>
      </div>
    );
  }

  // 1. Not logged in -> Show Auth View
  if (!user) {
    return <AuthView />;
  }

  // 2. Logged in but hasn't completed onboarding -> Show Onboarding Wizard
  if (profile && !profile.onboardingCompleted) {
    return <OnboardingWizard />;
  }

  // 3. Main Application Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-slate-950">
      
      {/* Offline Status Bar */}
      {isOffline && (
        <div className="bg-amber-600 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
          <WifiOff className="w-4 h-4" />
          <span>You are currently offline. Logs will be stored locally and synced when you reconnect.</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-base shadow-md shadow-teal-500/20">
              🚭
            </div>
            <div>
              <span className="font-display font-black text-base sm:text-lg text-white tracking-tight">QuitTrack</span>
              <span className="text-[10px] text-teal-400 font-bold ml-1.5 px-1.5 py-0.5 rounded bg-teal-950 border border-teal-800/50">PWA</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Theme Toggle Button */}
            <button
              id="header-theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-xs"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Quick SOS Trigger in Header */}
            <button
              id="header-craving-sos-btn"
              onClick={() => setIsCravingModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/25 active:scale-95 transition-all"
            >
              <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
              <span>SOS Crave</span>
            </button>

            {/* Profile Avatar Quick Link */}
            <button
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-400 font-bold text-xs flex items-center justify-center transition-all"
              title="Profile & Settings"
            >
              {user.name.charAt(0)}
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 pb-28 sm:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenCravingRescue={() => setIsCravingModalOpen(true)}
            onOpenDailyCheckin={handleOpenTodayCheckin}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'stats' && (
          <AnalyticsView
            onOpenDateLog={handleOpenDateLog}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceView />
        )}

        {activeTab === 'health' && (
          <HealthView />
        )}

        {activeTab === 'achievements' && (
          <AchievementsView />
        )}

        {activeTab === 'profile' && (
          <ProfileView />
        )}
      </main>

      {/* Bottom Sticky Navigation & Desktop Nav */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTabChange={setActiveTab}
        onOpenCravingRescue={() => setIsCravingModalOpen(true)}
      />

      {/* Craving Rescue SOS Modal */}
      <CravingRescueModal
        isOpen={isCravingModalOpen}
        onClose={() => setIsCravingModalOpen(false)}
        onSuccess={() => {
          // Trigger refresh of views if needed
        }}
      />

      {/* Daily Check-In / Log Modal */}
      <DailyLogModal
        isOpen={isDailyLogModalOpen}
        onClose={() => setIsDailyLogModalOpen(false)}
        selectedDate={selectedLogDate}
        existingLog={selectedExistingLog}
        onSuccess={() => {
          // Trigger refresh
        }}
      />
    </div>
  );
}
