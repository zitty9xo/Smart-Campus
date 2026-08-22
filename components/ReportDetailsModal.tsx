'use client';

import React from 'react';
import { X, MapPin, Clock, Tag, Sparkles, CheckCircle2, Phone, Mail } from 'lucide-react';
import { Report } from '@/lib/types';

interface ReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  onFindMatches: (report: Report) => void;
  onResolve: (reportId: string) => void;
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  isOpen,
  onClose,
  report,
  onFindMatches,
  onResolve,
}) => {
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

  if (!isOpen || !report) return null;

  const isLost = report.type === 'lost';
  const isMatched = report.status === 'matched';
  const formattedDate = new Date(report.time).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="details-modal-title">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              isLost ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {report.type}
            </span>
            <span className="text-xs font-semibold text-slate-400">{report.category}</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close report details modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Media Preview */}
        {report.imageBase64 && (
          <div className="w-full h-64 bg-slate-950 overflow-hidden relative border-b border-slate-800">
            <img src={report.imageBase64} alt={`Photo of ${report.title}`} className="w-full h-full object-contain" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 id="details-modal-title" className="text-xl font-extrabold text-white mb-2">{report.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{report.description}</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" aria-hidden="true" />
              <span className="font-semibold text-white">Location:</span>
              <span>{report.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" aria-hidden="true" />
              <span className="font-semibold text-white">Time:</span>
              <span>{formattedDate}</span>
            </div>
            {report.contactInfo && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                <span className="font-semibold text-white">Contact / Desk Ref:</span>
                <span>{report.contactInfo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          {!isMatched ? (
            <button
              onClick={() => onResolve(report.id)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
            >
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Mark as Resolved</span>
            </button>
          ) : (
            <span className="text-xs text-purple-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Item Resolved
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onFindMatches(report);
              }}
              disabled={isMatched}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white ai-gradient-bg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Find AI Matches</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
