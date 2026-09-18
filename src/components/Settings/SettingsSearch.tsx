import React from 'react';
import { motion } from 'framer-motion';
import { Search, X, Command } from 'lucide-react';

interface SettingsSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDark?: boolean;
}

export const SettingsSearch: React.FC<SettingsSearchProps> = ({
  searchQuery,
  onSearchChange,
  isDark = true,
}) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className={`relative flex items-center rounded-2xl border transition-all duration-200 ${
          isDark
            ? 'bg-slate-900/60 border-white/8 focus-within:border-emerald-500/50 focus-within:shadow-lg focus-within:shadow-emerald-500/10 backdrop-blur-sm'
            : 'bg-white border-slate-200 focus-within:border-amber-400 focus-within:shadow-lg focus-within:shadow-amber-500/10'
        }`}
      >
        {/* Search Icon */}
        <Search
          className={`w-4.5 h-4.5 ml-4 flex-shrink-0 transition-colors ${
            searchQuery
              ? isDark
                ? 'text-emerald-400'
                : 'text-amber-600'
              : isDark
              ? 'text-white/30'
              : 'text-slate-400'
          }`}
        />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search settings… (language, theme, notifications, privacy)"
          className={`flex-1 px-3.5 py-4 bg-transparent text-sm font-medium outline-none ${
            isDark
              ? 'text-white placeholder:text-white/30'
              : 'text-slate-900 placeholder:text-slate-400'
          }`}
        />

        {/* Keyboard shortcut badge */}
        {!searchQuery && (
          <div className={`hidden sm:flex items-center gap-1 mr-3 px-2 py-1 rounded-lg text-[10px] font-bold border ${
            isDark ? 'bg-white/5 border-white/10 text-white/30' : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}>
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        )}

        {/* Clear button */}
        {searchQuery && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => onSearchChange('')}
            className={`p-1.5 mr-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-slate-100 text-slate-400'
            }`}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </motion.div>

      {/* Search result count */}
      {searchQuery && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-[11px] font-medium mt-1.5 ml-1 ${isDark ? 'text-white/35' : 'text-slate-400'}`}
        >
          Filtering settings for "{searchQuery}"
        </motion.p>
      )}
    </div>
  );
};
