import React from 'react';
import { Info } from 'lucide-react';

export const HealthDisclaimer: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      id="health-disclaimer-banner"
      className={`p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5 ${className}`}
    >
      <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
      <p className="leading-relaxed">
        <span className="font-semibold text-slate-300">Health Notice:</span> This app provides tracking and general educational information based on public smoking cessation milestones. It does not measure your actual physiological health or provide medical diagnosis or treatment.
      </p>
    </div>
  );
};
