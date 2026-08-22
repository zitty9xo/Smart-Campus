'use client';

import React from 'react';
import { Sparkles, PlusCircle, RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

type AiMode = 'unknown' | 'live' | 'fallback';

interface NavbarProps {
  stats: {
    total: number;
    lostCount: number;
    foundCount: number;
    matchedCount: number;
  };
  aiMode: AiMode;
  modelName?: string;
  onOpenReportModal: () => void;
  onResetSeedData: () => void;
  isResetting: boolean;
}

function formatModelName(name?: string): string {
  if (!name) return 'Gemini Flash';
  // Capitalize segments (e.g. gemini-3.6-flash -> Gemini 3.6 Flash)
  return name
    .split('-')
    .map(word => {
      if (word.match(/^\d+(\.\d+)?$/)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  aiMode,
  modelName = 'gemini-3.6-flash',
  onOpenReportModal,
  onResetSeedData,
  isResetting,
}) => {
  const formattedModel = formatModelName(modelName);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl ai-gradient-bg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                CampusFinder <span className="ai-gradient-text">AI</span>
              </h1>
              {/* Dynamic AI mode badge */}
              {aiMode === 'live' && (
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/60 border border-purple-500/30 text-purple-300">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                  {formattedModel} · Live
                </span>
              )}
              {aiMode === 'fallback' && (
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/70 border border-amber-500/40 text-amber-300"
                  title="GEMINI_API_KEY is not set or API unavailable — using built-in heuristic matcher">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  Demo Mode · Fallback
                </span>
              )}
              {aiMode === 'unknown' && (
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700 text-slate-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Checking AI…
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Multimodal AI Lost & Found Match Engine
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
            <span className="text-slate-400">Lost:</span>
            <span className="font-bold text-rose-400">{stats.lostCount}</span>
          </div>
          <div className="w-px h-4 bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span className="text-slate-400">Found:</span>
            <span className="font-bold text-emerald-400">{stats.foundCount}</span>
          </div>
          <div className="w-px h-4 bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400">Matched:</span>
            <span className="font-bold text-purple-400">{stats.matchedCount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onResetSeedData}
            disabled={isResetting}
            title="Reset in-memory dataset to demo seed reports"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-purple-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Reset Demo Data</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white ai-gradient-bg hover:opacity-95 transition-all shadow-lg shadow-purple-600/30 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};
