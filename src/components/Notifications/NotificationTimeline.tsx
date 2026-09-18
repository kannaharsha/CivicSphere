import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Sparkles, History } from 'lucide-react';
import type { SchemeNotification, TimelineGroup } from './notificationTypes';
import { NotificationCard } from './NotificationCard';

interface NotificationTimelineProps {
  notifications: SchemeNotification[];
  isDark?: boolean;
  onToggleRead: (id: string) => void;
}

const SECTION_CONFIG: Record<TimelineGroup, {
  label: string;
  icon: any;
  subtitle: string;
  lightColor: string;
  darkColor: string;
  lightBg: string;
  darkBg: string;
  lightBorder: string;
  darkBorder: string;
}> = {
  today: {
    label: 'Today',
    icon: Clock,
    subtitle: 'Urgent actions & deadline alerts closing tonight (11:59 PM)',
    lightColor: '#DC2626',
    darkColor: '#F87171',
    lightBg: '#FEF2F2',
    darkBg: 'rgba(239, 68, 68, 0.16)',
    lightBorder: 'rgba(239, 68, 68, 0.35)',
    darkBorder: 'rgba(239, 68, 68, 0.40)',
  },
  tomorrow: {
    label: 'Tomorrow',
    icon: Calendar,
    subtitle: 'Final notice cutoff dates (24 hours remaining)',
    lightColor: '#EA580C',
    darkColor: '#FB923C',
    lightBg: '#FFF7ED',
    darkBg: 'rgba(249, 115, 22, 0.16)',
    lightBorder: 'rgba(249, 115, 22, 0.35)',
    darkBorder: 'rgba(249, 115, 22, 0.40)',
  },
  this_week: {
    label: 'Upcoming This Week',
    icon: Sparkles,
    subtitle: 'Enrollment windows closing in the next 7 days',
    lightColor: '#C9890A',
    darkColor: '#FBBF24',
    lightBg: '#FFFDF0',
    darkBg: 'rgba(245, 158, 11, 0.14)',
    lightBorder: 'rgba(212, 160, 23, 0.35)',
    darkBorder: 'rgba(245, 158, 11, 0.35)',
  },
  earlier: {
    label: 'Earlier Announcements',
    icon: History,
    subtitle: 'Scheme launches, guidelines, and general policy bulletins',
    lightColor: '#059669',
    darkColor: '#34D399',
    lightBg: '#F0FDF4',
    darkBg: 'rgba(0, 184, 124, 0.14)',
    lightBorder: 'rgba(5, 150, 105, 0.30)',
    darkBorder: 'rgba(0, 184, 124, 0.30)',
  }
};

export const NotificationTimeline: React.FC<NotificationTimelineProps> = ({
  notifications,
  isDark = false,
  onToggleRead
}) => {
  // Group notifications into Today, Tomorrow, This Week, and Earlier
  const groups: Record<TimelineGroup, SchemeNotification[]> = {
    today: [],
    tomorrow: [],
    this_week: [],
    earlier: []
  };

  notifications.forEach(n => {
    if (groups[n.timelineGroup]) {
      groups[n.timelineGroup].push(n);
    } else {
      groups.earlier.push(n);
    }
  });

  const timelineOrder: TimelineGroup[] = ['today', 'tomorrow', 'this_week', 'earlier'];

  return (
    <div className="space-y-8">
      {timelineOrder.map((grpKey) => {
        const items = groups[grpKey];
        if (items.length === 0) return null;

        const cfg = SECTION_CONFIG[grpKey];
        const Icon = cfg.icon;
        const color = isDark ? cfg.darkColor : cfg.lightColor;
        const bg = isDark ? cfg.darkBg : cfg.lightBg;
        const border = isDark ? cfg.darkBorder : cfg.lightBorder;

        return (
          <section key={grpKey} className="space-y-3.5">
            {/* Sticky Section Header */}
            <div
              className="sticky top-0 z-20 py-2.5 backdrop-blur-xl flex items-center justify-between border-b"
              style={{
                background: isDark ? 'rgba(8, 19, 31, 0.92)' : 'rgba(250, 247, 242, 0.95)',
                borderColor: isDark ? 'rgba(0, 184, 124, 0.15)' : 'rgba(212, 160, 23, 0.20)'
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center font-black"
                  style={{
                    background: bg,
                    color: color,
                    border: `1px solid ${border}`
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3
                    className="text-xs sm:text-sm font-black tracking-tight uppercase"
                    style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
                  >
                    {cfg.label}
                  </h3>
                  <p
                    className="text-[10px] font-medium hidden sm:block"
                    style={{ color: isDark ? '#94A3B8' : '#7A5009' }}
                  >
                    {cfg.subtitle}
                  </p>
                </div>
              </div>

              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black border"
                style={{
                  background: bg,
                  borderColor: border,
                  color: color
                }}
              >
                {items.length} {items.length === 1 ? 'Alert' : 'Alerts'}
              </span>
            </div>

            {/* Individual Notification Cards */}
            <div className="space-y-3">
              {items.map((item, idx) => (
                <NotificationCard
                  key={item.notification_id}
                  notification={item}
                  isDark={isDark}
                  onToggleRead={onToggleRead}
                  index={idx}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
