import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../firebase/AuthProvider';
import { NotificationsPage } from '../components/Notifications/NotificationsPage';

export default function NotificationsStandalonePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { user, profile } = useAuth();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#07121E] text-white' : 'bg-[#FAF7F2] text-[#17324D]'}`}>
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-40 px-4 sm:px-8 py-3.5 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#07121E]/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-sm"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #00B87C 0%, #10B981 100%)'
                  : 'linear-gradient(135deg, #C9890A 0%, #D4A017 100%)',
                color: '#FFFFFF'
              }}
            >
              <Bell className="w-4 h-4" />
            </div>
            <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white hidden sm:inline-block">
              CivicSphere <span className="text-emerald-500 font-extrabold text-xs">Alert Center</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Info / Profile chip */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center">
              {(profile?.fullName || user?.displayName || 'C').charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden md:inline-block">
              {profile?.fullName || user?.displayName || 'Citizen'}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Scrollable Content ── */}
      <main className="p-4 sm:p-8 w-full">
        <NotificationsPage isDark={isDark} />
      </main>
    </div>
  );
}
