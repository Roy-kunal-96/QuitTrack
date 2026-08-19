import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useNotification } from '../context/NotificationContext.js';
import {
  X,
  AlertCircle,
  Footprints,
  Droplets,
  Wind,
  Dumbbell,
  Timer,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CravingRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TRIGGERS = [
  'Stress',
  'Tea/Coffee',
  'Alcohol',
  'After food',
  'Work',
  'Social situation',
  'Driving',
  'Boredom',
  'Habit',
  'Other'
];

const ENVIRONMENTS = [
  'At home',
  'At work',
  'Outside',
  'With friends',
  'Driving',
  'Other'
];

export const CravingRescueModal: React.FC<CravingRescueModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { showToast } = useNotification();

  // Wizard state: 1: Intensity, 2: Trigger, 3: Environment, 4: Interventions, 5: Result
  const [rescueStep, setRescueStep] = useState(1);
  const [intensity, setIntensity] = useState(7);
  const [trigger, setTrigger] = useState('Stress');
  const [environment, setEnvironment] = useState('At home');
  const [selectedIntervention, setSelectedIntervention] = useState<
    'Breathing' | 'Water' | 'Walk' | 'Quick Exercise' | 'Delay'
  >('Breathing');

  // Breathing state: 4s inhale, 2s hold, 6s exhale (12s per cycle)
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathRepetitions, setBreathRepetitions] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // 10-Minute Delay Timer state (600 seconds)
  const [delaySeconds, setDelaySeconds] = useState(600);
  const [isDelayRunning, setIsDelayRunning] = useState(false);

  // Exercise reps
  const [exerciseCount, setExerciseCount] = useState(0);

  // Result state
  const [resultOutcome, setResultOutcome] = useState<'gone' | 'reduced' | 'strong'>('gone');
  const [smokedAfter, setSmokedAfter] = useState(false);
  const [saving, setSaving] = useState(false);

  // Total session timer in seconds
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isOpen) {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } else {
      setSessionDuration(0);
      setRescueStep(1);
      setIsBreathingActive(false);
      setIsDelayRunning(false);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  // Breathing Cycle Logic (4-2-6)
  useEffect(() => {
    let interval: any;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathTimer(prev => {
          if (prev <= 1) {
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold');
              return 2;
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale');
              return 6;
            } else {
              setBreathPhase('Inhale');
              setBreathRepetitions(r => r + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase]);

  // 10-min Delay countdown logic
  useEffect(() => {
    let interval: any;
    if (isDelayRunning && delaySeconds > 0) {
      interval = setInterval(() => {
        setDelaySeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isDelayRunning, delaySeconds]);

  if (!isOpen) return null;

  const handleFinishRescue = async () => {
    setSaving(true);
    try {
      const res = await api.createCraving({
        intensity,
        trigger,
        environment,
        intervention: selectedIntervention,
        interventionDuration: sessionDuration,
        result: resultOutcome,
        smokedAfterCraving: smokedAfter
      });

      if (res.success) {
        if (!smokedAfter) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
          showToast('Craving conquered! +15 points earned 💪', 'success');
        } else {
          showToast('Craving event logged. Keep going, recovery is a journey.', 'info');
        }
        onSuccess();
        onClose();
      } else {
        showToast(res.message || 'Error saving craving', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to record craving', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">Craving Rescue SOS</h2>
              <p className="text-[11px] text-slate-400">Step {rescueStep} of 5 • Stay calm, this peak passes in 3-5 mins</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Craving Intensity */}
        {rescueStep === 1 && (
          <div className="py-6 space-y-6 animate-in fade-in">
            <div className="text-center">
              <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">Step 1</p>
              <h3 className="text-xl font-bold text-white">How strong is your craving right now?</h3>
              <p className="text-xs text-slate-400 mt-1">Rate the urge from mild (1) to overwhelming (10).</p>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
              <div
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center font-black text-4xl shadow-xl transition-all ${
                  intensity >= 8
                    ? 'bg-rose-600/30 text-rose-300 border-4 border-rose-500 shadow-rose-600/30 scale-110'
                    : intensity >= 5
                    ? 'bg-amber-600/30 text-amber-300 border-4 border-amber-500 shadow-amber-600/30'
                    : 'bg-teal-600/30 text-teal-300 border-4 border-teal-500 shadow-teal-600/30'
                }`}
              >
                <span>{intensity}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {intensity >= 8 ? 'Intense' : intensity >= 5 ? 'Moderate' : 'Mild'}
                </span>
              </div>

              <div className="w-full max-w-xs mt-6 space-y-2">
                <input
                  id="craving-intensity-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>1 (Mild)</span>
                  <span>5 (Medium)</span>
                  <span>10 (Severe)</span>
                </div>
              </div>
            </div>

            <button
              id="craving-step1-next"
              onClick={() => setRescueStep(2)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2"
            >
              <span>Identify Trigger</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Trigger Identification */}
        {rescueStep === 2 && (
          <div className="py-6 space-y-4 animate-in fade-in">
            <div className="text-center mb-2">
              <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">Step 2</p>
              <h3 className="text-xl font-bold text-white">What triggered this craving?</h3>
              <p className="text-xs text-slate-400 mt-1">Recognizing patterns takes away the automatic power of the urge.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {TRIGGERS.map(t => (
                <button
                  key={t}
                  onClick={() => setTrigger(t)}
                  className={`p-3 rounded-xl text-xs font-semibold text-left border flex items-center justify-between transition-all ${
                    trigger === t
                      ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{t}</span>
                  {trigger === t && <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRescueStep(1)}
                className="py-3 px-4 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setRescueStep(3)}
                className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Next: Environment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Current Environment */}
        {rescueStep === 3 && (
          <div className="py-6 space-y-4 animate-in fade-in">
            <div className="text-center mb-2">
              <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">Step 3</p>
              <h3 className="text-xl font-bold text-white">Where are you right now?</h3>
              <p className="text-xs text-slate-400 mt-1">Context helps suggest the most realistic rescue activity.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {ENVIRONMENTS.map(env => (
                <button
                  key={env}
                  onClick={() => setEnvironment(env)}
                  className={`p-3.5 rounded-xl text-xs font-semibold text-left border flex items-center justify-between transition-all ${
                    environment === env
                      ? 'bg-teal-500/20 border-teal-500 text-teal-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{env}</span>
                  {environment === env && <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRescueStep(2)}
                className="py-3 px-4 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setRescueStep(4)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Choose Intervention 🛡️</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Interactive Interventions */}
        {rescueStep === 4 && (
          <div className="py-4 space-y-4 animate-in fade-in">
            {/* Intervention Selector Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
              {[
                { id: 'Breathing', label: '🫁 4-2-6 Breath' },
                { id: 'Water', label: '💧 Water Glass' },
                { id: 'Walk', label: '🚶 5-min Walk' },
                { id: 'Quick Exercise', label: '🏃 Quick Reps' },
                { id: 'Delay', label: '⏱️ 10-Min Delay' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedIntervention(item.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedIntervention === item.id
                      ? 'bg-teal-500 border-teal-400 text-slate-950 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* INTERVENTION 1: Breathing (4-2-6 Guided Pulse) */}
            {selectedIntervention === 'Breathing' && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
                <div>
                  <h4 className="font-bold text-white text-base">4-2-6 Calming Breath</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Slow deep exhalations stimulate the vagus nerve and dampen nicotine panic.</p>
                </div>

                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                  {/* Visual expanding/contracting circle */}
                  <div
                    className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl transition-all duration-1000 ${
                      breathPhase === 'Inhale'
                        ? 'bg-teal-500/30 border-4 border-teal-400 scale-110 shadow-teal-500/40'
                        : breathPhase === 'Hold'
                        ? 'bg-amber-500/30 border-4 border-amber-400 scale-110 shadow-amber-500/40'
                        : 'bg-emerald-600/30 border-4 border-emerald-400 scale-90 shadow-emerald-500/40'
                    }`}
                  >
                    <span className="text-sm font-extrabold uppercase tracking-wider opacity-90">{breathPhase}</span>
                    <span className="text-3xl font-display">{breathTimer}s</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 font-medium">
                  Completed cycles: <span className="text-teal-400 font-bold">{breathRepetitions} / 5</span>
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setIsBreathingActive(!isBreathingActive)}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-teal-600/30"
                  >
                    {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isBreathingActive ? 'Pause Breath' : 'Start 4-2-6 Guide'}
                  </button>
                  <button
                    onClick={() => {
                      setIsBreathingActive(false);
                      setBreathPhase('Inhale');
                      setBreathTimer(4);
                      setBreathRepetitions(0);
                    }}
                    className="p-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* INTERVENTION 2: Drink Water */}
            {selectedIntervention === 'Water' && (
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Drink a Tall Glass of Cold Water</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    Sip slowly through a straw or take small, conscious swallows. Cold water creates oral sensation and helps flush oral nicotine residues.
                  </p>
                </div>
                <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-cyan-200">
                  ✨ Focus on the temperature and sensation in your throat for 60 seconds.
                </div>
              </div>
            )}

            {/* INTERVENTION 3: Walk */}
            {selectedIntervention === 'Walk' && (
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Footprints className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Take a 5-Minute Fresh Air Walk</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    Change your physical location immediately. Walking outdoors or pacing briskly releases endorphins and breaks the automatic visual cue.
                  </p>
                </div>
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-200">
                  🍃 Notice 5 things around you that you can see, hear, or feel.
                </div>
              </div>
            )}

            {/* INTERVENTION 4: Quick Exercise */}
            {selectedIntervention === 'Quick Exercise' && (
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Quick Physical Reset</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                    Try 10 squats, 10 wall push-ups, or 30 seconds of shoulder stretches.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-xs text-slate-400">Reps completed:</span>
                  <span className="font-display font-extrabold text-2xl text-amber-400">{exerciseCount}</span>
                  <button
                    onClick={() => setExerciseCount(c => c + 5)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/30 border border-amber-500 text-amber-300 text-xs font-bold"
                  >
                    +5 Reps
                  </button>
                </div>
              </div>
            )}

            {/* INTERVENTION 5: 10-Minute Delay Timer */}
            {selectedIntervention === 'Delay' && (
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                  <Timer className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">The 10-Minute Urge Rule</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                    "Give yourself 10 minutes before making any decision. Cravings are waves—they rise, peak, and naturally break."
                  </p>
                </div>
                <div className="font-display font-black text-3xl text-indigo-300 tracking-wider">
                  {formatTime(delaySeconds)}
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-1000"
                    style={{ width: `${((600 - delaySeconds) / 600) * 100}%` }}
                  />
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setIsDelayRunning(!isDelayRunning)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    {isDelayRunning ? 'Pause Timer' : 'Start 10m Timer'}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setRescueStep(5)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2"
            >
              <span>Record How You Feel</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 5: Craving Result & Save */}
        {rescueStep === 5 && (
          <div className="py-5 space-y-5 animate-in fade-in">
            <div className="text-center">
              <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">Final Step</p>
              <h3 className="text-xl font-bold text-white">How do you feel now?</h3>
              <p className="text-xs text-slate-400 mt-1">Reflecting on the outcome builds neural resistance for the next craving.</p>
            </div>

            {/* Outcome Selection */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setResultOutcome('gone')}
                className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 border transition-all ${
                  resultOutcome === 'gone'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-xl">🟢</span>
                <span>Craving Gone</span>
              </button>

              <button
                type="button"
                onClick={() => setResultOutcome('reduced')}
                className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 border transition-all ${
                  resultOutcome === 'reduced'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-xl">🟡</span>
                <span>Reduced</span>
              </button>

              <button
                type="button"
                onClick={() => setResultOutcome('strong')}
                className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 border transition-all ${
                  resultOutcome === 'strong'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-xl">🔴</span>
                <span>Still Strong</span>
              </button>
            </div>

            {/* Did you smoke? */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-300 text-center">
                Did you smoke during this craving?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSmokedAfter(false)}
                  className={`py-3 rounded-xl text-xs font-extrabold border transition-all ${
                    !smokedAfter
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  🎉 NO (Resisted!)
                </button>
                <button
                  type="button"
                  onClick={() => setSmokedAfter(true)}
                  className={`py-3 rounded-xl text-xs font-extrabold border transition-all ${
                    smokedAfter
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Yes, I slipped
                </button>
              </div>
            </div>

            <button
              id="finish-craving-rescue-btn"
              disabled={saving}
              onClick={handleFinishRescue}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-sm shadow-xl shadow-teal-500/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Recording Rescue...' : 'Save & Claim Points 🛡️'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
