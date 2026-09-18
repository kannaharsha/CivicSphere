import React from 'react';
import { motion } from 'framer-motion';
import { Flame, AlertTriangle, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SchemeNotification } from './notificationTypes';

interface ReminderSectionProps {
  notifications: SchemeNotification[];
  isDark?: boolean;
}

export const ReminderSection: React.FC<ReminderSectionProps> = ({
  notifications,
  isDark = false
}) => {
  const navigate = useNavigate();

  // Find urgent reminders: deadline today, deadline tomorrow, or high priority
  const reminders = notifications
    .filter(n => n.notification_type === 'deadline_today' || n.notification_type === 'deadline_tomorrow' || n.priority === 'urgent')
    .slice(0, 2);

  if (reminders.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
          High-Priority Daily Action Reminders
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {reminders.map((rem, i) => {
          const isToday = rem.notification_type === 'deadline_today' || rem.priority === 'urgent';
          const accentColor = isToday ? '#EF4444' : '#F97316';
          const bgGradient = isDark
            ? isToday
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.14) 0%, rgba(12, 26, 43, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(249, 115, 22, 0.14) 0%, rgba(12, 26, 43, 0.95) 100%)'
            : isToday
              ? 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)'
              : 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)';

          const borderColor = isDark
            ? isToday ? 'rgba(239, 68, 68, 0.35)' : 'rgba(249, 115, 22, 0.35)'
            : isToday ? '#FECDD3' : '#FED7AA';

          const Icon = isToday ? Flame : AlertTriangle;

          return (
            <motion.div
              key={rem.notification_id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: i * 0.08,
                type: 'spring',
                stiffness: 240,
                damping: 24
              }}
              whileHover={{ y: -2 }}
              className="p-4 rounded-2xl border relative overflow-hidden flex flex-col justify-between shadow-xs select-none"
              style={{
                background: bgGradient,
                borderColor: borderColor,
              }}
            >
              <div className="flex items-start gap-3 mb-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isToday ? 'rgba(239, 68, 68, 0.18)' : 'rgba(249, 115, 22, 0.18)',
                    color: accentColor
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        background: isToday ? 'rgba(239, 68, 68, 0.18)' : 'rgba(249, 115, 22, 0.18)',
                        color: accentColor
                      }}
                    >
                      {isToday ? 'Deadline Today' : 'Closing Tomorrow'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {rem.state}
                    </span>
                  </div>

                  <h4
                    className="text-xs sm:text-sm font-extrabold tracking-tight leading-snug line-clamp-1"
                    style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
                  >
                    {rem.title}
                  </h4>
                  <p
                    className="text-[11px] sm:text-xs leading-relaxed line-clamp-2"
                    style={{ color: isDark ? '#CBD5E1' : '#475569' }}
                  >
                    {rem.message}
                  </p>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{isToday ? 'Action required by 11:59 PM' : 'Prepare documents today'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(rem.action_route || '/eligibility')}
                  className="inline-flex items-center gap-1 text-xs font-black hover:underline cursor-pointer"
                  style={{ color: accentColor }}
                >
                  <span>Resolve Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
