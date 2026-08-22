'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Zap, HelpCircle } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-purple-950/40 p-6 sm:p-8 mb-8 backdrop-blur-xl shadow-2xl">
      {/* Background Decorative Glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>Multimodal Campus AI Matcher & Search</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
          Don't just list items. <span className="ai-gradient-text">Explain why they match.</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed mb-6 max-w-3xl">
          Existing lost & found apps leave matching judgment to guesswork. CampusFinder AI uses Gemini multimodal reasoning to compare lost & found photos, descriptions, scratches, and campus locations — scoring match confidence and explaining reasoning in plain language.
        </p>

        {/* Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs font-medium text-slate-300">
            <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>Instant Multimodal Analysis</span>
          </div>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs font-medium text-slate-300">
            <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0" />
            <span>0-100% Confidence & Reasons</span>
          </div>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs font-medium text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Campus Drop-off Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};
