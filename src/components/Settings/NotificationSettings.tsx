import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Sparkles, Megaphone, CheckSquare, Sprout } from 'lucide-react';
import { SettingToggle } from './SettingToggle';
import type { UserSettings } from './settingsTypes';

interface NotificationSettingsProps {
  isDark?: boolean;
  settings: UserSettings;
  onUpdate: (key: keyof UserSettings, value: boolean) => void;
}

const ITEMS = [
  {
    key: 'deadline_notifications' as keyof UserSettings,
    icon: Calendar,
    iconColor: 'text-rose-400',
    label: 'Application Deadline Reminders',
    desc: 'High-priority alerts for closing schemes — Today, Tomorrow, and 7-day warnings',
    badge: 'Urgent',
  },
  {
    key: 'new_scheme_notifications' as keyof UserSettings,
    icon: Sparkles,
    iconColor: 'text-emerald-400',
    label: 'New Scheme Notifications',
    desc: 'Alerts when new government initiatives matching your occupation are published',
    badge: null,
  },
  {
    key: 'announcement_notifications' as keyof UserSettings,
    icon: Megaphone,
    iconColor: 'text-indigo-400',
    label: 'Government Announcements',
    desc: 'Important policy updates, portal maintenance alerts, and state releases',
    badge: null,
  },
  {
    key: 'application_status_notifications' as keyof UserSettings,
    icon: CheckSquare,
    iconColor: 'text-teal-400',
    label: 'Application Status Reminders',
    desc: 'Updates on submitted applications, officer verifications, and sanction releases',
    badge: null,
  },
  {
    key: 'weekly_updates' as keyof UserSettings,
    icon: Sprout,
    iconColor: 'text-lime-400',
    label: 'Weekly Agriculture Updates',
    desc: 'Digest of agricultural advisories, mandi prices, and seasonal subsidy windows',
    badge: 'Weekly',
  },
];

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isDark = true,
  settings,
  onUpdate,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-3xl overflow-hidden border backdrop-blur-sm transition-all ${
        isDark
          ? 'bg-slate-900/40 border-white/8 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-950/30'
          : 'bg-white/80 border-slate-100 hover:border-amber-300/50 hover:shadow-xl hover:shadow-amber-500/8'
      }`}
    >
      <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400" />

      <div className="p-6 sm:p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isDark ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
          }`}>
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Notification Preferences
            </h2>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              Control which scheme alerts and government updates you receive
            </p>
          </div>
        </div>

        <div className="space-y-1">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 px-2 py-1 rounded-2xl transition-colors ${
                isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${item.iconColor}`} />
              <div className="flex-1">
                <SettingToggle
                  id={`toggle-${item.key}`}
                  label={item.label}
                  description={item.desc}
                  badge={item.badge || undefined}
                  checked={settings[item.key] as boolean}
                  onChange={(val) => onUpdate(item.key, val)}
                  isDark={isDark}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
