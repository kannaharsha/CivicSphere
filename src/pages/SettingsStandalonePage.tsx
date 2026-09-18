import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../firebase/AuthProvider';
import { SettingsPage } from '../components/Settings/SettingsPage';

export default function SettingsStandalonePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { user, profile } = useAuth();

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        isDark
          ? 'bg-[#07121E] text-white'
          : 'bg-[#FDFBF5] text-[#1A2F1E]'
      }`}
    >
      {/* ── Top Navigation Bar ── */}
      <header
        className={`sticky top-0 z-40 px-4 sm:px-8 py-3.5 backdrop-blur-xl border-b flex items-center justify-between ${
          isDark
            ? 'bg-[#07121E]/90 border-emerald-900/60'
            : 'bg-[#FDFBF5]/90 border-amber-200/60'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              isDark
                ? 'text-emerald-300/80 hover:bg-emerald-500/10'
                : 'text-amber-800 hover:bg-amber-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <div className={`h-4 w-px hidden sm:block ${isDark ? 'bg-emerald-900/60' : 'bg-amber-200'}`} />

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #00B87C 0%, #10B981 100%)'
                  : 'linear-gradient(135deg, #C9890A 0%, #D4A017 100%)',
                color: '#FFFFFF',
              }}
            >
              <Settings className="w-4 h-4" />
            </div>
            <span className={`font-black text-sm tracking-tight hidden sm:inline-block ${isDark ? 'text-white' : 'text-slate-900'}`}>
              CivicSphere{' '}
              <span className={`font-extrabold text-xs ${isDark ? 'text-emerald-400' : 'text-amber-600'}`}>
                Settings Center
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-emerald-900/60 hover:bg-emerald-500/10 text-emerald-300'
                : 'border-amber-200 hover:bg-amber-100 text-amber-700'
            }`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-700" />}
          </button>

          {/* User chip */}
          <div className={`flex items-center gap-2 pl-2 border-l ${isDark ? 'border-emerald-900/60' : 'border-amber-200'}`}>
            <div className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center ${
              isDark
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-amber-500/15 text-amber-800'
            }`}>
              {(profile?.fullName || user?.displayName || 'C').charAt(0).toUpperCase()}
            </div>
            <span className={`text-xs font-bold hidden md:inline-block ${isDark ? 'text-emerald-200/70' : 'text-amber-900/80'}`}>
              {profile?.fullName || user?.displayName || 'Citizen'}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Content (full width) ── */}
      <main className="w-full px-0 py-6">
        <SettingsPage isDark={isDark} />
      </main>
    </div>
  );
}
