import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNotification } from '../context/NotificationContext.js';
import { SmokingProfile } from '../types/index.js';
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Cigarette, Clock, Calendar, Heart, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

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

const SMOKING_TYPES = ['Cigarette', 'Bidi', 'Vape', 'Other'] as const;

const COMMON_TRIGGERS = [
  'Morning',
  'After meals',
  'Tea/Coffee',
  'Work',
  'Stress',
  'Alcohol',
  'Social situations',
  'Driving',
  'Boredom',
  'Before sleep'
];

const MOTIVATION_OPTIONS = [
  'Health & Lungs',
  'Save Money',
  'Family & Children',
  'Fitness & Stamina',
  'Better Lifestyle',
  'Smell & Cleanliness',
  'Personal Discipline'
];

const GOAL_OPTIONS = [
  'Quit completely and permanently',
  'Reduce smoking first before full quit',
  'Save money for a major goal',
  'Rebuild breathing & cardiovascular fitness',
  'Overcome daily nicotine cravings'
];

export const OnboardingWizard: React.FC = () => {
  const { updateProfile } = useAuth();
  const { showToast } = useNotification();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [cigarettesPerDay, setCigarettesPerDay] = useState(15);
  const [cigarettesPerPack, setCigarettesPerPack] = useState(20);
  const [pricePerPack, setPricePerPack] = useState(120);
  const [currency, setCurrency] = useState('₹');
  const [yearsSmoked, setYearsSmoked] = useState(5);
  const [smokingType, setSmokingType] = useState<'Cigarette' | 'Bidi' | 'Vape' | 'Other'>('Cigarette');

  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(['Morning', 'Tea/Coffee', 'Stress', 'After meals']);
  
  const [hasAlreadyQuit, setHasAlreadyQuit] = useState(true);
  const [quitDate, setQuitDate] = useState(() => formatToLocalDate());
  const [previousQuitAttempts, setPreviousQuitAttempts] = useState(1);
  const [longestSmokeFreePeriod, setLongestSmokeFreePeriod] = useState(7);

  const [selectedMotivations, setSelectedMotivations] = useState<string[]>(['Health & Lungs', 'Save Money', 'Fitness & Stamina']);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Quit completely and permanently', 'Save money for a major goal']);

  const toggleTrigger = (t: string) => {
    setSelectedTriggers(prev =>
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
  };

  const toggleMotivation = (m: string) => {
    setSelectedMotivations(prev =>
      prev.includes(m) ? prev.filter(item => item !== m) : [...prev, m]
    );
  };

  const toggleGoal = (g: string) => {
    setSelectedGoals(prev =>
      prev.includes(g) ? prev.filter(item => item !== g) : [...prev, g]
    );
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const profileData: Partial<SmokingProfile> = {
        cigarettesPerDay: Number(cigarettesPerDay),
        cigarettesPerPack: Number(cigarettesPerPack),
        pricePerPack: Number(pricePerPack),
        currency,
        yearsSmoked: Number(yearsSmoked),
        smokingType,
        quitDate,
        hasAlreadyQuit,
        previousQuitAttempts: Number(previousQuitAttempts),
        longestSmokeFreePeriod: Number(longestSmokeFreePeriod),
        triggers: selectedTriggers,
        motivation: selectedMotivations,
        goals: selectedGoals,
        onboardingCompleted: true
      };

      const res = await updateProfile(profileData);
      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast('Your personalized quit plan is ready! Welcome to QuitTrack.', 'success');
      } else {
        showToast(res.message || 'Error saving quit plan', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations for summary
  const costPerCig = pricePerPack / (cigarettesPerPack || 1);
  const monthlyCostEst = Math.round(cigarettesPerDay * costPerCig * 30);
  const yearlyCostEst = Math.round(cigarettesPerDay * costPerCig * 365);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        {/* Progress Bar Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Step {step} of 6</span>
            <span className="text-teal-400 font-bold">{Math.round((step / 6) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Smoking Habit */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Cigarette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">Your Smoking Profile</h2>
                <p className="text-xs text-slate-400">Help us accurately compute your savings and avoided smoke.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Type of Smoking</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SMOKING_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSmokingType(type)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      smokingType === type
                        ? 'bg-teal-500/20 border-teal-500 text-teal-200 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Cigarettes per day: <span className="text-teal-400 font-bold">{cigarettesPerDay}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={cigarettesPerDay}
                  onChange={(e) => setCigarettesPerDay(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Cigarettes per pack: <span className="text-teal-400 font-bold">{cigarettesPerPack}</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={cigarettesPerPack}
                  onChange={(e) => setCigarettesPerPack(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Currency & Price per Pack</label>
                <div className="flex gap-2">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-20 px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
                  >
                    <option value="₹">₹ (INR)</option>
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                    <option value="¥">¥ (JPY)</option>
                    <option value="A$">A$ (AUD)</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={pricePerPack}
                    onChange={(e) => setPricePerPack(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Years smoked: <span className="text-teal-400 font-bold">{yearsSmoked} yrs</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={yearsSmoked}
                  onChange={(e) => setYearsSmoked(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
            </div>

            <div className="p-3 bg-teal-950/40 border border-teal-800/40 rounded-xl text-xs text-teal-200">
              💡 Estimated daily cost: <span className="font-bold">{currency}{Math.round(cigarettesPerDay * costPerCig)}</span> (~{currency}{monthlyCostEst}/month).
            </div>
          </div>
        )}

        {/* STEP 2: Smoking Patterns & Triggers */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">When do you usually smoke?</h2>
                <p className="text-xs text-slate-400">Select all times and triggers that usually tempt you.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {COMMON_TRIGGERS.map(trig => {
                const isSelected = selectedTriggers.includes(trig);
                return (
                  <button
                    key={trig}
                    type="button"
                    onClick={() => toggleTrigger(trig)}
                    className={`p-3 rounded-xl text-xs font-semibold text-left border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{trig}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Quit Plan & Quit Date */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">Your Quit Plan</h2>
                <p className="text-xs text-slate-400">Setting a concrete date is proven to increase success.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Have you already stopped smoking?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHasAlreadyQuit(true)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                    hasAlreadyQuit
                      ? 'bg-teal-500/20 border-teal-500 text-teal-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  Yes, I have already quit
                </button>
                <button
                  type="button"
                  onClick={() => setHasAlreadyQuit(false)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                    !hasAlreadyQuit
                      ? 'bg-teal-500/20 border-teal-500 text-teal-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  No, I am planning a quit date
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {hasAlreadyQuit ? 'When was your last cigarette (Quit Date)?' : 'Target Quit Date'}
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const d = parseLocalDate(quitDate);
                      d.setDate(d.getDate() - 1);
                      setQuitDate(formatToLocalDate(d));
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-bold transition-colors"
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
                  >
                    + 1 Day
                  </button>
                </div>
              </div>

              {/* Quick Presets for Quit Date */}
              <div className="flex gap-1.5 mb-2 overflow-x-auto pb-0.5 no-scrollbar">
                {[
                  { label: 'Today', daysAgo: 0 },
                  { label: 'Yesterday', daysAgo: 1 },
                  { label: '3 Days Ago', daysAgo: 3 },
                  { label: '1 Week Ago', daysAgo: 7 }
                ].map(preset => {
                  const target = new Date();
                  target.setDate(target.getDate() - preset.daysAgo);
                  const pStr = formatToLocalDate(target);
                  const isCurrent = quitDate === pStr;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setQuitDate(pStr)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border ${
                        isCurrent
                          ? 'bg-teal-500/30 border-teal-400 text-teal-200 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
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
                className="w-full min-w-0 max-w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 box-border"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Previous quit attempts: <span className="text-teal-400 font-bold">{previousQuitAttempts}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={previousQuitAttempts}
                  onChange={(e) => setPreviousQuitAttempts(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Longest smoke-free streak: <span className="text-teal-400 font-bold">{longestSmokeFreePeriod} days</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={longestSmokeFreePeriod}
                  onChange={(e) => setLongestSmokeFreePeriod(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Motivation */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">Why do you want to quit?</h2>
                <p className="text-xs text-slate-400">Remembering your core motivations helps during intense cravings.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {MOTIVATION_OPTIONS.map(mot => {
                const isSelected = selectedMotivations.includes(mot);
                return (
                  <button
                    key={mot}
                    type="button"
                    onClick={() => toggleMotivation(mot)}
                    className={`p-3 rounded-xl text-xs font-semibold text-left border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{mot}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Personal Goals */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">What would you like to achieve?</h2>
                <p className="text-xs text-slate-400">Select what success looks like for you in this program.</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {GOAL_OPTIONS.map(goal => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`w-full p-3.5 rounded-xl text-xs sm:text-sm font-semibold text-left border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{goal}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: Confirmation & Summary */}
        {step === 6 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 mx-auto flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-display font-bold text-white">Ready to take control?</h2>
              <p className="text-xs text-slate-400">Here is your customized QuitTrack baseline:</p>
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Baseline Smoke:</span>
                <span className="text-white font-semibold">{cigarettesPerDay} {smokingType.toLowerCase()}s/day</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Quit Date:</span>
                <span className="text-teal-400 font-semibold">{quitDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Est. Monthly Savings:</span>
                <span className="text-amber-400 font-bold">{currency}{monthlyCostEst}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Est. 1-Year Savings:</span>
                <span className="text-emerald-400 font-bold">{currency}{yearlyCostEst}</span>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400">
              You can always adjust these settings in your Profile at any time.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1 hover:bg-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : <div />}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-teal-600/30"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinish}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-teal-500/30 active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Start My Quit Journey 🚀'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
