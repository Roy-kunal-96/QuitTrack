import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useNotification } from '../context/NotificationContext.js';
import { SmokingLog } from '../types/index.js';
import { X, CheckCircle2, AlertCircle, Trash2, Calendar, Cigarette } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string; // YYYY-MM-DD
  existingLog?: SmokingLog | null;
  onSuccess: () => void;
}

const COMMON_TRIGGERS = [
  'Stress',
  'Tea/Coffee',
  'Alcohol',
  'After food',
  'Work pressure',
  'Social situation',
  'Driving',
  'Boredom',
  'Other'
];

export const DailyLogModal: React.FC<DailyLogModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  existingLog,
  onSuccess
}) => {
  const { showToast } = useNotification();

  const [date, setDate] = useState(() => selectedDate || new Date().toISOString().split('T')[0]);
  const [smoked, setSmoked] = useState(false);
  const [cigarettes, setCigarettes] = useState(1);
  const [trigger, setTrigger] = useState('Stress');
  const [cravingIntensity, setCravingIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (existingLog) {
      setDate(existingLog.date);
      setSmoked(existingLog.smoked);
      setCigarettes(existingLog.cigarettes || 1);
      setTrigger(existingLog.trigger || 'Stress');
      setCravingIntensity(existingLog.cravingIntensity || 5);
      setNotes(existingLog.notes || '');
    } else {
      setDate(selectedDate || new Date().toISOString().split('T')[0]);
      setSmoked(false);
      setCigarettes(1);
      setTrigger('Stress');
      setCravingIntensity(5);
      setNotes('');
    }
  }, [existingLog, selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.logSmoking({
        date,
        smoked,
        cigarettes: smoked ? Number(cigarettes) : 0,
        trigger: smoked ? trigger : undefined,
        cravingIntensity: smoked ? Number(cravingIntensity) : undefined,
        notes: notes.trim() ? notes.trim() : undefined
      });

      if (res.success) {
        if (!smoked) {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 }
          });
          showToast('🎉 Another smoke-free day confirmed! +20 points', 'success');
        } else {
          showToast('Log recorded. Honest tracking helps you regain control.', 'info');
        }
        onSuccess();
        onClose();
      } else {
        showToast(res.message || 'Failed to save log', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingLog?._id) return;
    if (!confirm('Are you sure you want to delete this log?')) return;

    setDeleting(true);
    try {
      const res = await api.deleteSmokingLog(existingLog._id);
      if (res.success) {
        showToast('Log deleted successfully', 'info');
        onSuccess();
        onClose();
      } else {
        showToast(res.message || 'Failed to delete', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Delete error', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Daily Check-In</h3>
              <p className="text-xs text-teal-300 font-medium">
                {(() => {
                  try {
                    const [y, m, d] = date.split('-').map(Number);
                    if (y && m && d) {
                      return new Date(y, m - 1, d).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                    }
                  } catch (e) {}
                  return date;
                })()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Select Date</label>
            
            {/* Quick Date Presets on Mobile */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              <button
                type="button"
                onClick={() => setDate(new Date().toISOString().split('T')[0])}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-teal-900/40 text-[11px] font-semibold text-teal-300 border border-slate-700 whitespace-nowrap transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 1);
                  setDate(d.toISOString().split('T')[0]);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-teal-900/40 text-[11px] font-semibold text-teal-300 border border-slate-700 whitespace-nowrap transition-colors"
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 2);
                  setDate(d.toISOString().split('T')[0]);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-teal-900/40 text-[11px] font-semibold text-teal-300 border border-slate-700 whitespace-nowrap transition-colors"
              >
                2 Days Ago
              </button>
            </div>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 box-border"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Did you smoke on this day?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="daily-checkin-no-btn"
                onClick={() => setSmoked(false)}
                className={`py-3.5 px-4 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-2 transition-all ${
                  !smoked
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>NO (Smoke-Free)</span>
              </button>

              <button
                type="button"
                id="daily-checkin-yes-btn"
                onClick={() => setSmoked(true)}
                className={`py-3.5 px-4 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-2 transition-all ${
                  smoked
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md ring-1 ring-rose-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>YES (Smoked)</span>
              </button>
            </div>
          </div>

          {smoked && (
            <div className="space-y-4 pt-2 border-t border-slate-800/80 animate-in fade-in">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  How many cigarettes: <span className="text-rose-400 font-bold">{cigarettes}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={cigarettes}
                  onChange={(e) => setCigarettes(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">What triggered it?</label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                >
                  {COMMON_TRIGGERS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Craving Intensity: <span className="text-amber-400 font-bold">{cravingIntensity} / 10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={cravingIntensity}
                  onChange={(e) => setCravingIntensity(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What was happening? How can you counter it next time?"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {!smoked && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-200 text-center font-medium">
              🎉 Another smoke-free day builds your streak, clears your lungs, and saves your hard-earned money!
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {existingLog && (
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="p-3 rounded-xl border border-rose-900/60 text-rose-400 hover:bg-rose-950/40"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Saving Check-in...' : 'Confirm Day Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
