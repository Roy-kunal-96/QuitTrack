import React, { useState } from 'react';
import { Achievement } from '../types/index.js';
import {
  X,
  Share2,
  Copy,
  Check,
  Flame,
  Award,
  Sparkles,
  DollarSign,
  Cigarette,
  ShieldCheck,
  Send
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext.js';

interface ShareProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAchievement?: Achievement | null;
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
  rankTitle: string;
  rankLevel: string;
  smokeFreeDays?: number;
  moneySaved?: number;
  currency?: string;
}

export const ShareProgressModal: React.FC<ShareProgressModalProps> = ({
  isOpen,
  onClose,
  selectedAchievement,
  totalPoints,
  unlockedCount,
  totalCount,
  rankTitle,
  rankLevel,
  smokeFreeDays = 0,
  moneySaved = 0,
  currency = '₹'
}) => {
  const { showToast } = useNotification();
  const [copied, setCopied] = useState(false);
  const [shareMode, setShareMode] = useState<'overall' | 'badge'>(selectedAchievement ? 'badge' : 'overall');

  if (!isOpen) return null;

  const appUrl = window.location.origin;

  const getShareText = () => {
    if (shareMode === 'badge' && selectedAchievement) {
      return `🎉 Milestone Unlocked on QuitTrack!
🏆 Badge: ${selectedAchievement.title} (${selectedAchievement.icon})
✨ ${selectedAchievement.description}
🔥 Smoke-Free Streak: ${smokeFreeDays} Days
⭐ Total Points: ${totalPoints} pts
💪 Tracking my tobacco-free journey with #QuitTrack #SmokeFree #HealthRecovery
${appUrl}`;
    }

    return `🚭 My Smoke-Free Milestone on QuitTrack!
🔥 ${smokeFreeDays} Days 100% Smoke-Free
🏆 Rank: ${rankTitle} (${rankLevel})
💰 Money Saved: ${currency}${moneySaved.toLocaleString()}
⭐ ${totalPoints} Resilience Points | ${unlockedCount}/${totalCount} Badges
💪 Overcoming cravings one day at a time!
#QuitTrack #SmokeFreeJourney #NicotineFree #Health
${appUrl}`;
  };

  const handleNativeShare = async () => {
    const text = getShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My QuitTrack Smoke-Free Milestone',
          text: text,
          url: appUrl
        });
        showToast('Shared successfully!', 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    const text = getShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Share text copied to clipboard! Paste anywhere.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(appUrl);
    const summary = encodeURIComponent(getShareText());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${summary}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Share Your Progress</h3>
              <p className="text-[11px] text-slate-400">Inspire others & celebrate your victory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector (if specific badge is available) */}
        {selectedAchievement && (
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setShareMode('badge')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                shareMode === 'badge'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Badge Card
            </button>
            <button
              onClick={() => setShareMode('overall')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                shareMode === 'overall'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overall Stats
            </button>
          </div>
        )}

        {/* VISUAL SHARE CARD PREVIEW */}
        <div
          id="share-card-canvas"
          className="rounded-2xl p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-xl space-y-4 relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-xs font-black text-white">
                🚭
              </div>
              <span className="font-display font-black text-sm text-white tracking-tight">QuitTrack</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {rankLevel}
            </span>
          </div>

          {shareMode === 'badge' && selectedAchievement ? (
            <div className="space-y-3 relative z-10 text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-amber-500/20 animate-bounce">
                {selectedAchievement.icon}
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  ACHIEVEMENT UNLOCKED
                </span>
                <h4 className="font-display text-lg font-black text-white mt-0.5">
                  {selectedAchievement.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                  {selectedAchievement.description}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-teal-300 font-bold">
                <span>🔥 {smokeFreeDays} Days Smoke-Free</span>
                <span>•</span>
                <span>+{selectedAchievement.points} pts</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 relative z-10">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    SMOKE-FREE STREAK
                  </span>
                  <div className="font-display text-3xl font-black text-white tracking-tight">
                    {smokeFreeDays} Days
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    REWARD POINTS
                  </span>
                  <div className="font-display text-2xl font-black text-amber-400">
                    ⭐ {totalPoints}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">Rank Title</span>
                  <span className="text-white font-bold">{rankTitle}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">Badges Unlocked</span>
                  <span className="text-teal-400 font-bold">{unlockedCount} / {totalCount}</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>QuitTrack PWA</span>
            <span className="text-amber-400/80 font-medium">#BreakTheHabit</span>
          </div>
        </div>

        {/* Social Share Action Buttons */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-4 gap-2">
            {/* Native / System Share */}
            <button
              onClick={handleNativeShare}
              className="p-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md shadow-teal-600/30 transition-all active:scale-95"
              title="Native Share"
            >
              <Send className="w-4 h-4" />
              <span className="text-[10px]">Share</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
              title="Share on WhatsApp"
            >
              <span className="text-sm">💬</span>
              <span className="text-[10px]">WhatsApp</span>
            </button>

            {/* X / Twitter */}
            <button
              onClick={handleTwitterShare}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
              title="Share on X"
            >
              <span className="text-sm">𝕏</span>
              <span className="text-[10px]">Post</span>
            </button>

            {/* Copy Clipboard */}
            <button
              onClick={handleCopy}
              className={`p-3 rounded-2xl border text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                copied
                  ? 'bg-amber-500 border-amber-400 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
              }`}
              title="Copy Summary"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="text-[10px]">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Formatted Caption & Hashtags</span>
          </button>
        </div>

      </div>
    </div>
  );
};
