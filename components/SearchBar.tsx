'use client';

import React, { useState } from 'react';
import { Search, X, Sparkles, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isSearching: boolean;
  activeQuery: string;
}

const PRESET_QUERIES = [
  'blue water bottle near library',
  'black sony headphones',
  'brown leather wallet',
  'macbook usb-c charger lounge',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  isSearching,
  activeQuery,
}) => {
  const [inputVal, setInputVal] = useState(activeQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSearch(inputVal.trim());
    }
  };

  const handlePresetClick = (query: string) => {
    setInputVal(query);
    onSearch(query);
  };

  const handleClearInput = () => {
    setInputVal('');
    onClear();
  };

  return (
    <div className="w-full mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none flex items-center text-slate-400">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-purple-400" />
            )}
          </div>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="AI Free-Text Search (e.g. 'navy blue water bottle with hackathon stickers near student union')..."
            className="w-full pl-12 pr-28 py-3.5 sm:py-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all shadow-xl"
          />

          <div className="absolute right-3 flex items-center gap-2">
            {inputVal && (
              <button
                type="button"
                onClick={handleClearInput}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isSearching || !inputVal.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white ai-gradient-bg hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-purple-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* Preset Suggestions */}
      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-400">
        <span className="font-medium flex items-center gap-1 text-slate-400">
          <Sparkles className="w-3 h-3 text-purple-400" /> Try AI queries:
        </span>
        {PRESET_QUERIES.map((q) => (
          <button
            key={q}
            onClick={() => handlePresetClick(q)}
            className={`px-3 py-1 rounded-full border transition-all ${
              activeQuery === q
                ? 'bg-purple-950/80 border-purple-500 text-purple-300 font-semibold'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            "{q}"
          </button>
        ))}
      </div>
    </div>
  );
};
