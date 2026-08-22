'use client';

import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, AlertTriangle, CheckCircle2, ShieldCheck, MapPin, Clock, ArrowRight, Loader2, HelpCircle } from 'lucide-react';
import { Report, MatchCandidate } from '@/lib/types';

interface MatchDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetReport: Report | null;
  matches: MatchCandidate[];
  isLoading: boolean;
  isAiGenerated: boolean;
  modelName?: string;
  onResolveMatch: (targetId: string, matchedWithId: string) => void;
}

function formatModelName(name?: string): string {
  if (!name) return 'Gemini Flash';
  return name
    .split('-')
    .map(word => {
      if (word.match(/^\d+(\.\d+)?$/)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export const MatchDrawerModal: React.FC<MatchDrawerModalProps> = ({
  isOpen,
  onClose,
  targetReport,
  matches,
  isLoading,
  isAiGenerated,
  modelName = 'gemini-3.6-flash',
  onResolveMatch,
}) => {
  const [selectedDeskNotice, setSelectedDeskNotice] = useState<string | null>(null);

  // Close modal on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !targetReport) return null;

  const oppositeTypeLabel = targetReport.type === 'lost' ? 'Found' : 'Lost';
  const formattedModel = formatModelName(modelName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="match-modal-title">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl ai-gradient-bg flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Sparkles className="w-5 h-5 text-white animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="match-modal-title" className="text-lg font-bold text-white">Gemini AI Match Results</h3>
                {isAiGenerated ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-950 border border-purple-500/40 text-purple-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping inline-block" aria-hidden="true"></span>
                    Live {formattedModel}
                  </span>
                ) : (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300 flex items-center gap-1"
                    title="GEMINI_API_KEY is not set or API failed — using built-in heuristic matcher"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-400" aria-hidden="true" />
                    Demo Mode · Fallback
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Comparing <span className="text-purple-300 font-semibold">{targetReport.type.toUpperCase()}: {targetReport.title}</span> against all open {oppositeTypeLabel} reports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close match results modal"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          
          {/* Target Item Header Summary */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-800">
              {targetReport.imageBase64 ? (
                <img src={targetReport.imageBase64} alt={targetReport.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">No Image</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  targetReport.type === 'lost' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {targetReport.type}
                </span>
                <span className="text-xs font-semibold text-slate-400">{targetReport.category}</span>
              </div>
              <h4 className="text-sm font-bold text-white truncate">{targetReport.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-1">{targetReport.description}</p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl ai-gradient-bg flex items-center justify-center shadow-xl shadow-purple-500/40">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Analyzing Multimodal Attributes...</h4>
                <p className="text-xs text-slate-400 max-w-md mt-1">
                  Gemini AI is examining visual features, scratch locations, brand details, location proximity, and timing across all {oppositeTypeLabel} items.
                </p>
              </div>
            </div>
          )}

          {/* No Matches Found */}
          {!isLoading && matches.length === 0 && (
            <div className="py-10 px-6 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="text-base font-bold text-white">No Candidate Matches Above Confidence Threshold</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Gemini AI found no {oppositeTypeLabel} reports matching this item with high confidence (&gt;30%). New reports submitted by students will automatically be cross-referenced!
              </p>
            </div>
          )}

          {/* Matches List */}
          {!isLoading && matches.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Found {matches.length} Candidate Match{matches.length > 1 ? 'es' : ''}</span>
                </h4>
                <span className="text-xs text-slate-400">Sorted by AI Confidence</span>
              </div>

              {matches.map((match, idx) => {
                const candidate = match.report;
                if (!candidate) return null;

                const isHighConf = match.confidence >= 75;
                const isMediumConf = match.confidence >= 50 && match.confidence < 75;

                return (
                  <div
                    key={match.reportId}
                    className="glass-panel rounded-2xl border border-purple-500/30 overflow-hidden space-y-4 p-5 hover:border-purple-500/60 transition-all shadow-xl"
                  >
                    {/* Candidate Top Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-900/80 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <h5 className="text-sm font-bold text-white">{candidate.title}</h5>
                      </div>

                      {/* Confidence Score Pill */}
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-md ${
                          isHighConf
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-emerald-950/50'
                            : isMediumConf
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-amber-950/50'
                            : 'bg-blue-950 text-blue-300 border border-blue-500/60'
                        }`}>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{match.confidence}% Confidence</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Reasoning Banner */}
                    <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 text-xs text-purple-200 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-pink-300">Why this matches: </span>
                        <span>{match.reason}</span>
                      </div>
                    </div>

                    {/* Side-by-Side Photo & Detail Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Target Item Brief */}
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>TARGET ITEM ({targetReport.type.toUpperCase()})</span>
                          <span className="text-slate-500">{targetReport.id}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0">
                            {targetReport.imageBase64 && (
                              <img src={targetReport.imageBase64} alt={targetReport.title} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="text-xs text-slate-300">
                            <p className="font-semibold text-white truncate">{targetReport.title}</p>
                            <p className="text-slate-400 text-[11px] truncate"><MapPin className="w-3 h-3 inline mr-1" />{targetReport.location}</p>
                          </div>
                        </div>
                      </div>

                      {/* Candidate Item Brief */}
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>MATCH CANDIDATE ({candidate.type.toUpperCase()})</span>
                          <span className="text-slate-500">{candidate.id}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0">
                            {candidate.imageBase64 && (
                              <img src={candidate.imageBase64} alt={candidate.title} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="text-xs text-slate-300">
                            <p className="font-semibold text-white truncate">{candidate.title}</p>
                            <p className="text-slate-400 text-[11px] truncate"><MapPin className="w-3 h-3 inline mr-1" />{candidate.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Physical Desk Verification Required</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDeskNotice(candidate.id)}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                        >
                          How To Claim
                        </button>

                        <button
                          onClick={() => onResolveMatch(targetReport.id, candidate.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-900/30"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Match</span>
                        </button>
                      </div>
                    </div>

                    {/* Desk Notice Accordion */}
                    {selectedDeskNotice === candidate.id && (
                      <div className="mt-3 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 space-y-2">
                        <h6 className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Campus Drop-off Desk Claim Flow
                        </h6>
                        <p className="text-slate-300 leading-relaxed">
                          This AI match is surfaced as a qualified lead. To prevent false ownership claims, both items route through the physical campus desk at <strong className="text-white">{candidate.location}</strong>.
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Contact reference: <span className="text-slate-200 font-mono">{candidate.contactInfo || 'Campus Security Desk'}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all"
          >
            Close Match Window
          </button>
        </div>
      </div>
    </div>
  );
};
