'use client';

import React from 'react';
import { MapPin, Clock, Sparkles, CheckCircle2, Eye, Tag } from 'lucide-react';
import { Report } from '@/lib/types';

interface ReportCardProps {
  report: Report;
  onFindMatches: (report: Report) => void;
  onViewDetails: (report: Report) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onFindMatches,
  onViewDetails,
}) => {
  const isLost = report.type === 'lost';
  const isMatched = report.status === 'matched';

  const formattedDate = new Date(report.time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800/80 group">
      {/* Top Media & Badges Container */}
      <div>
        <div className="relative w-full h-48 bg-slate-950 overflow-hidden">
          {report.imageBase64 ? (
            <img
              src={report.imageBase64}
              alt={`Photo of ${report.title}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500 p-4 text-center">
              <span className="text-xs font-semibold">No Image Provided</span>
              <span className="text-[11px] text-slate-600">Text-only AI match supported</span>
            </div>
          )}

          {/* Type Badge (Lost vs Found) */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md ${
                isLost
                  ? 'bg-rose-950/90 text-rose-300 border border-rose-500/50 shadow-rose-950/50'
                  : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-emerald-950/50'
              }`}
            >
              {report.type}
            </span>

            {isMatched && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-950/90 text-purple-300 border border-purple-500/50 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-purple-400" aria-hidden="true" /> Matched
              </span>
            )}
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-950/80 text-slate-300 border border-slate-700/80 backdrop-blur-md">
              {report.category}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
            {report.title}
          </h3>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {report.description}
          </p>

          <div className="space-y-1.5 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{report.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" aria-hidden="true" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-5 pt-0 flex items-center gap-2">
        <button
          onClick={() => onFindMatches(report)}
          disabled={isMatched}
          aria-label={`Find AI matches for ${report.title}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-white ai-gradient-bg hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-purple-600/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
          <span>Find Matches (AI)</span>
        </button>

        <button
          onClick={() => onViewDetails(report)}
          aria-label={`View full details for ${report.title}`}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
          title="View Full Details"
        >
          <Eye className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
