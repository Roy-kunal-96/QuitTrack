import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Achievement, UserStats, SmokingProfile } from '../types/index.js';
import {
  Trophy,
  Award,
  Lock,
  CheckCircle2,
  Sparkles,
  Zap,
  Star,
  ShieldCheck,
  Flame,
  Share2
} from 'lucide-react';
import { HealthDisclaimer } from './HealthDisclaimer.js';
import { ShareProgressModal } from './ShareProgressModal.js';

export const AchievementsView: React.FC = () => {
  const [data, setData] = useState<{
    achievements: Achievement[];
    totalPoints: number;
    unlockedCount: number;
    totalCount: number;
  } | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userProfile, setUserProfile] = useState<SmokingProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Share Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedShareBadge, setSelectedShareBadge] = useState<Achievement | null>(null);

  const fetchAchievements = async () => {
    try {
      const [achRes, dashRes] = await Promise.all([
        api.getAchievements(),
        api.getDashboard()
      ]);

      if (achRes.success && achRes.data) {
        setData(achRes.data);
      }
      if (dashRes.success && dashRes.data) {
        setUserStats(dashRes.data.stats);
        setUserProfile(dashRes.data.profile);
      }
    } catch (err) {
      console.error('Achievements fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading your trophy cabinet...</p>
      </div>
    );
  }

  const achievements = data?.achievements || [];
  const totalPoints = data?.totalPoints || 0;
  const unlockedCount = data?.unlockedCount || 0;
  const totalCount = data?.totalCount || achievements.length;

  // Compute Rank Badge
  const getRank = (points: number) => {
    if (points >= 500) return { title: 'Master of Will', level: 'Platinum 💎', next: 1000 };
    if (points >= 250) return { title: 'Vanguard', level: 'Gold 🥇', next: 500 };
    if (points >= 100) return { title: 'Smoke Slayer', level: 'Silver 🥈', next: 250 };
    return { title: 'Initiate', level: 'Bronze 🥉', next: 100 };
  };

  const currentRank = getRank(totalPoints);

  const handleOpenGeneralShare = () => {
    setSelectedShareBadge(null);
    setIsShareModalOpen(true);
  };

  const handleOpenBadgeShare = (badge: Achievement) => {
    setSelectedShareBadge(badge);
    setIsShareModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 py-4 sm:py-6">
      
      {/* Header with Share Action */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            Achievements & Badges
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Earn recognition points for every craving survived, milestone reached, and smoke-free day logged.
          </p>
        </div>
        <button
          id="share-progress-btn"
          onClick={handleOpenGeneralShare}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Progress</span>
        </button>
      </div>

      {/* Gamification Level Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              Rank: {currentRank.level}
            </span>
            <div className="font-display text-3xl sm:text-4xl font-black text-amber-300 tracking-tight pt-1">
              {totalPoints.toLocaleString()} Points
            </div>
            <p className="text-xs text-slate-300">
              Rank Title: <span className="text-white font-bold">{currentRank.title}</span> • {unlockedCount} of {totalCount} Badges Unlocked
            </p>
          </div>

          <div className="flex sm:flex-col gap-2">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">NEXT TIER</span>
              <span className="text-amber-400 font-display font-extrabold text-sm sm:text-base">
                {currentRank.next} pts
              </span>
            </div>
            <button
              onClick={handleOpenGeneralShare}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
            >
              <Share2 className="w-3 h-3" />
              <span>Share Milestone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Point Rules Summary */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>How You Earn Points</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block">Smoke-Free Day</span>
            <span className="text-emerald-400 font-bold">+20 pts</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block">Craving Conquered</span>
            <span className="text-teal-400 font-bold">+15 pts</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block">Breathing / Walk</span>
            <span className="text-amber-400 font-bold">+5 pts</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block">Badge Unlocked</span>
            <span className="text-indigo-400 font-bold">+50 pts</span>
          </div>
        </div>
      </div>

      {/* BADGES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {achievements.map((item) => {
          const itemKey = item.id || item.type || `ach-${item.title}`;
          return (
            <div
              key={itemKey}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                item.unlocked
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-65'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    item.unlocked
                      ? 'bg-amber-500/20 border border-amber-500/30'
                      : 'bg-slate-800/80 text-slate-500'
                  }`}
                >
                  {item.unlocked ? item.icon : '🔒'}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs sm:text-sm text-white">{item.title}</h3>
                    {item.unlocked ? (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">Category: {item.category || 'Milestone'}</span>
                    <span className="text-[10px] font-bold text-teal-400">+{item.points} pts</span>
                  </div>
                </div>
              </div>

              {/* Action for Unlocked Badges: Share This Badge */}
              {item.unlocked && (
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.unlockedAt ? `Unlocked ${new Date(item.unlockedAt).toLocaleDateString()}` : 'Achieved'}
                  </span>
                  <button
                    onClick={() => handleOpenBadgeShare(item)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] font-semibold flex items-center gap-1 transition-all"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Share Badge</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <HealthDisclaimer />

      {/* Share Progress Modal */}
      <ShareProgressModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        selectedAchievement={selectedShareBadge}
        totalPoints={totalPoints}
        unlockedCount={unlockedCount}
        totalCount={totalCount}
        rankTitle={currentRank.title}
        rankLevel={currentRank.level}
        smokeFreeDays={userStats?.smokeFreeDays || 0}
        moneySaved={userStats?.moneySaved || 0}
        currency={userProfile?.currency || '₹'}
      />
    </div>
  );
};
