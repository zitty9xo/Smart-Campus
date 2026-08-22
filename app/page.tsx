'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { SearchBar } from '@/components/SearchBar';
import { ReportCard } from '@/components/ReportCard';
import { ReportFormModal } from '@/components/ReportFormModal';
import { MatchDrawerModal } from '@/components/MatchDrawerModal';
import { ReportDetailsModal } from '@/components/ReportDetailsModal';
import { Report, MatchCandidate, SearchCandidate } from '@/lib/types';
import { Sparkles, Layers, RefreshCw, Filter, Search, AlertCircle, PlusCircle } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Water Bottle', 'Wallet/ID', 'Keys', 'Apparel', 'Accessories', 'Other'];

export default function Home() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({ total: 0, lostCount: 0, foundCount: 0, matchedCount: 0 });
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found' | 'matched'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchAiGenerated, setIsSearchAiGenerated] = useState(false);

  // AI Match Drawer State
  const [selectedTargetReport, setSelectedTargetReport] = useState<Report | null>(null);
  const [matchResults, setMatchResults] = useState<MatchCandidate[]>([]);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const [isMatchAiGenerated, setIsMatchAiGenerated] = useState(false);
  const [isMatchDrawerOpen, setIsMatchDrawerOpen] = useState(false);

  // Detail Modal State
  const [detailReport, setDetailReport] = useState<Report | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Create Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // AI mode and model tracking
  const [aiMode, setAiMode] = useState<'unknown' | 'live' | 'fallback'>('unknown');
  const [aiModelName, setAiModelName] = useState<string>('gemini-3.6-flash');

  // Fetch Reports
  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (res.ok) {
        setReports(data.reports);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  // Check server-side AI key presence immediately on mount
  const fetchAiStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setAiMode(data.aiEnabled ? 'live' : 'fallback');
        if (data.defaultModel) setAiModelName(data.defaultModel);
      }
    } catch {
      setAiMode('fallback');
    }
  };

  useEffect(() => {
    fetchReports();
    fetchAiStatus();
  }, []);

  // Handle Search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.results);
        setIsSearchAiGenerated(data.isAiGenerated);
        if (data.modelUsed) setAiModelName(data.modelUsed);
        // Keep aiMode in sync with the most recent real call result
        setAiMode(data.isAiGenerated ? 'live' : 'fallback');
      }
    } catch (err) {
      console.error('Error conducting AI search', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle AI Match
  const handleFindMatches = async (target: Report) => {
    setSelectedTargetReport(target);
    setIsMatchDrawerOpen(true);
    setIsMatchLoading(true);

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: target.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMatchResults(data.matches);
        setIsMatchAiGenerated(data.isAiGenerated);
        if (data.modelUsed) setAiModelName(data.modelUsed);
        // Keep aiMode in sync with the most recent real call result
        setAiMode(data.isAiGenerated ? 'live' : 'fallback');
      }
    } catch (err) {
      console.error('Error finding AI matches', err);
    } finally {
      setIsMatchLoading(false);
    }
  };

  // Handle Resolve Match
  const handleResolveMatch = async (targetId: string, matchedWithId: string) => {
    try {
      const res = await fetch('/api/reports/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: targetId, matchedWithId }),
      });
      if (res.ok) {
        await fetchReports();
        setIsMatchDrawerOpen(false);
      }
    } catch (err) {
      console.error('Error resolving match', err);
    }
  };

  // Handle Reset Seed Data
  const handleResetSeedData = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setReports(data.reports);
        setStats(data.stats);
        handleClearSearch();
      }
    } catch (err) {
      console.error('Failed to reset seed data', err);
    } finally {
      setIsResetting(false);
    }
  };

  // Filter Logic
  const filteredReports = reports.filter((r) => {
    // Tab Filter
    if (activeTab === 'lost' && (r.type !== 'lost' || r.status === 'matched')) return false;
    if (activeTab === 'found' && (r.type !== 'found' || r.status === 'matched')) return false;
    if (activeTab === 'matched' && r.status !== 'matched') return false;

    // Category Filter
    if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Navbar */}
      <Navbar
        stats={stats}
        aiMode={aiMode}
        modelName={aiModelName}
        onOpenReportModal={() => setIsFormOpen(true)}
        onResetSeedData={handleResetSeedData}
        isResetting={isResetting}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <HeroSection />

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          onClear={handleClearSearch}
          isSearching={isSearching}
          activeQuery={searchQuery}
        />

        {/* AI Free Text Search Results View */}
        {searchQuery ? (
          <div className="space-y-6 mb-12">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-purple-950/40 border border-purple-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl ai-gradient-bg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    AI Search Results for "<span className="ai-gradient-text">{searchQuery}</span>"
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isSearchAiGenerated ? `Ranked by ${aiModelName} semantic reasoning` : 'Ranked by smart semantic heuristic engine'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleClearSearch}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all"
              >
                Clear Search Results
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white">No Matching Reports Found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Try searching with broader terms or submit a new report using the button above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((res) => {
                  const report = res.report;
                  if (!report) return null;

                  return (
                    <div key={report.id} className="relative group">
                      {/* Search Match Score Pill */}
                      <div className="absolute -top-3 left-4 z-20 px-3 py-1 rounded-full text-xs font-extrabold bg-purple-950 text-purple-300 border border-purple-500/50 shadow-lg flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-pink-400" />
                        <span>{res.relevanceScore}% Relevance</span>
                      </div>

                      <ReportCard
                        report={report}
                        onFindMatches={handleFindMatches}
                        onViewDetails={(r) => {
                          setDetailReport(r);
                          setIsDetailOpen(true);
                        }}
                      />

                      {/* AI Search Reason */}
                      <div className="mt-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{res.matchReason}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Directory Filter Tabs & Grid View */
          <div className="space-y-6">
            
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              
              {/* Type Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0" role="tablist" aria-label="Filter reports by status">
                <button
                  role="tab"
                  aria-selected={activeTab === 'all'}
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${
                    activeTab === 'all'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-950/50'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  All Campus Reports ({reports.length})
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'lost'}
                  onClick={() => setActiveTab('lost')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none ${
                    activeTab === 'lost'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-950/50'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" aria-hidden="true"></span>
                  <span>Lost Items ({stats.lostCount})</span>
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'found'}
                  onClick={() => setActiveTab('found')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                    activeTab === 'found'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
                  <span>Found Items ({stats.foundCount})</span>
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'matched'}
                  onClick={() => setActiveTab('matched')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${
                    activeTab === 'matched'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-950/50'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  Matched / Resolved ({stats.matchedCount})
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" role="group" aria-label="Filter reports by category">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    aria-pressed={selectedCategory === cat}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${
                      selectedCategory === cat
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Reports Grid */}
            {isLoadingReports ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mb-3" />
                <p className="text-sm font-medium">Loading campus lost & found directory...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
                <Layers className="w-12 h-12 text-slate-600 mx-auto" />
                <div>
                  <h4 className="text-base font-bold text-white">No Reports Found in this Category</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Try switching tabs or submit a new lost/found report to start matching.
                  </p>
                </div>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white ai-gradient-bg hover:opacity-90 transition-all shadow-md shadow-purple-600/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit New Report</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onFindMatches={handleFindMatches}
                    onViewDetails={(r) => {
                      setDetailReport(r);
                      setIsDetailOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Smart Campus Lost & Found — PromptWars x YenTech Hackathon Edition</p>
          <p className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Powered by Gemini 2.5 Flash Multimodal Reasoning Engine</span>
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ReportFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmitSuccess={fetchReports}
      />

      <MatchDrawerModal
        isOpen={isMatchDrawerOpen}
        onClose={() => setIsMatchDrawerOpen(false)}
        targetReport={selectedTargetReport}
        matches={matchResults}
        isLoading={isMatchLoading}
        isAiGenerated={isMatchAiGenerated}
        modelName={aiModelName}
        onResolveMatch={handleResolveMatch}
      />

      <ReportDetailsModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        report={detailReport}
        onFindMatches={handleFindMatches}
        onResolve={async (id) => {
          await handleResolveMatch(id, '');
          setIsDetailOpen(false);
        }}
      />
    </div>
  );
}
