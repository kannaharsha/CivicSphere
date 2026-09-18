import React from 'react';
import { motion } from 'framer-motion';
import {
  Flame, AlertTriangle, Clock, Sparkles,
  CreditCard, FileText, Megaphone, RotateCcw,
  ChevronRight, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SchemeNotification, NotificationType } from './notificationTypes';
import { DeadlineCountdown } from './DeadlineCountdown';

interface NotificationCardProps {
  notification: SchemeNotification;
  isDark?: boolean;
  onToggleRead: (id: string) => void;
  index?: number;
}

// Tailored alert color configuration with strict adherence to:
// - Red for urgent / today deadlines
// - Orange for tomorrow deadlines / high warnings
// - Green / Emerald for new schemes & reopened schemes
// - Gold for upcoming reminders / document updates
// - Blue for status updates
// - Soft slate / neutral for announcements
const TYPE_CONFIG: Record<NotificationType, {
  label: string;
  icon: any;
  lightColor: string;
  darkColor: string;
  lightBg: string;
  darkBg: string;
  lightBorder: string;
  darkBorder: string;
  glowColor: string;
}> = {
  deadline_today: {
    label: 'Deadline Today',
    icon: Flame,
    lightColor: '#DC2626',
    darkColor: '#F87171',
    lightBg: '#FEF2F2',
    darkBg: 'rgba(239, 68, 68, 0.16)',
    lightBorder: 'rgba(239, 68, 68, 0.35)',
    darkBorder: 'rgba(239, 68, 68, 0.40)',
    glowColor: 'rgba(239, 68, 68, 0.25)',
  },
  deadline_tomorrow: {
    label: 'Deadline Tomorrow',
    icon: AlertTriangle,
    lightColor: '#EA580C',
    darkColor: '#FB923C',
    lightBg: '#FFF7ED',
    darkBg: 'rgba(249, 115, 22, 0.16)',
    lightBorder: 'rgba(249, 115, 22, 0.35)',
    darkBorder: 'rgba(249, 115, 22, 0.40)',
    glowColor: 'rgba(249, 115, 22, 0.25)',
  },
  upcoming_deadline: {
    label: 'Upcoming Deadline',
    icon: Clock,
    lightColor: '#C9890A',
    darkColor: '#FBBF24',
    lightBg: '#FFFDF0',
    darkBg: 'rgba(245, 158, 11, 0.14)',
    lightBorder: 'rgba(212, 160, 23, 0.35)',
    darkBorder: 'rgba(245, 158, 11, 0.35)',
    glowColor: 'rgba(212, 160, 23, 0.20)',
  },
  new_scheme: {
    label: 'New Scheme Launch',
    icon: Sparkles,
    lightColor: '#059669',
    darkColor: '#34D399',
    lightBg: '#F0FDF4',
    darkBg: 'rgba(0, 184, 124, 0.16)',
    lightBorder: 'rgba(5, 150, 105, 0.30)',
    darkBorder: 'rgba(0, 184, 124, 0.35)',
    glowColor: 'rgba(0, 184, 124, 0.25)',
  },
  status_reminder: {
    label: 'Application Status',
    icon: CreditCard,
    lightColor: '#0284C7',
    darkColor: '#38BDF8',
    lightBg: '#F0F9FF',
    darkBg: 'rgba(14, 165, 233, 0.14)',
    lightBorder: 'rgba(14, 165, 233, 0.30)',
    darkBorder: 'rgba(14, 165, 233, 0.30)',
    glowColor: 'rgba(14, 165, 233, 0.20)',
  },
  document_reminder: {
    label: 'Document Update Required',
    icon: FileText,
    lightColor: '#B47A08',
    darkColor: '#A78BFA',
    lightBg: '#FFFDF5',
    darkBg: 'rgba(167, 139, 250, 0.14)',
    lightBorder: 'rgba(212, 160, 23, 0.30)',
    darkBorder: 'rgba(167, 139, 250, 0.30)',
    glowColor: 'rgba(212, 160, 23, 0.20)',
  },
  scheme_reopened: {
    label: 'Scheme Reopened',
    icon: RotateCcw,
    lightColor: '#0D9488',
    darkColor: '#2DD4BF',
    lightBg: '#F0FDFA',
    darkBg: 'rgba(20, 184, 166, 0.16)',
    lightBorder: 'rgba(13, 148, 136, 0.30)',
    darkBorder: 'rgba(45, 212, 191, 0.35)',
    glowColor: 'rgba(20, 184, 166, 0.25)',
  },
  announcement: {
    label: 'Government Update',
    icon: Megaphone,
    lightColor: '#8A6210',
    darkColor: '#94A3B8',
    lightBg: '#FFFDF7',
    darkBg: 'rgba(100, 116, 139, 0.14)',
    lightBorder: 'rgba(212, 160, 23, 0.25)',
    darkBorder: 'rgba(100, 116, 139, 0.25)',
    glowColor: 'rgba(212, 160, 23, 0.15)',
  },
};

const PRIORITY_BADGES: Record<string, { label: string; lightColor: string; darkColor: string; lightBg: string; darkBg: string; border: string }> = {
  urgent: {
    label: 'URGENT',
    lightColor: '#DC2626',
    darkColor: '#F87171',
    lightBg: '#FEF2F2',
    darkBg: 'rgba(239, 68, 68, 0.20)',
    border: 'rgba(239, 68, 68, 0.35)'
  },
  high: {
    label: 'HIGH',
    lightColor: '#EA580C',
    darkColor: '#FB923C',
    lightBg: '#FFF7ED',
    darkBg: 'rgba(249, 115, 22, 0.20)',
    border: 'rgba(249, 115, 22, 0.35)'
  },
  medium: {
    label: 'STANDARD',
    lightColor: '#059669',
    darkColor: '#34D399',
    lightBg: '#ECFDF5',
    darkBg: 'rgba(0, 184, 124, 0.16)',
    border: 'rgba(0, 184, 124, 0.28)'
  },
  low: {
    label: 'NOTICE',
    lightColor: '#8A6210',
    darkColor: '#94A3B8',
    lightBg: '#FFFDF0',
    darkBg: 'rgba(100, 116, 139, 0.16)',
    border: 'rgba(212, 160, 23, 0.25)'
  },
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  isDark = false,
  onToggleRead,
  index = 0
}) => {
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[notification.notification_type] || TYPE_CONFIG.announcement;
  const TypeIcon = cfg.icon;
  const pBadge = PRIORITY_BADGES[notification.priority] || PRIORITY_BADGES.medium;

  const accentColor = isDark ? cfg.darkColor : cfg.lightColor;
  const iconBg = isDark ? cfg.darkBg : cfg.lightBg;
  const iconBorder = isDark ? cfg.darkBorder : cfg.lightBorder;

  // Individual card spring entrance based on its own index
  const individualDelay = Math.min(index * 0.05, 0.35);

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recent';
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleRead(notification.notification_id);
    navigate(notification.action_route || '/dashboard');
  };

  const isUnread = !notification.isRead;

  // Theme card styling
  // Light: Luxury warm gold-tinted surface, crisp gold / alert borders
  // Dark: Deep night emerald canvas (#071822 / #0C212D), soft glowing green borders
  const cardBg = isDark
    ? isUnread
      ? 'linear-gradient(135deg, rgba(8, 28, 24, 0.95) 0%, rgba(10, 24, 38, 0.95) 100%)'
      : 'linear-gradient(135deg, rgba(6, 20, 22, 0.85) 0%, rgba(8, 18, 30, 0.85) 100%)'
    : isUnread
      ? 'linear-gradient(135deg, #FFFDF7 0%, #FFFFFF 100%)'
      : '#FAF8F3';

  const cardBorder = isUnread
    ? isDark
      ? 'rgba(0, 184, 124, 0.38)'
      : 'rgba(212, 160, 23, 0.45)'
    : isDark
      ? 'rgba(0, 184, 124, 0.12)'
      : 'rgba(212, 160, 23, 0.18)';

  const cardShadow = isUnread
    ? isDark
      ? '0 8px 28px -4px rgba(0, 0, 0, 0.50), 0 0 20px rgba(0, 184, 124, 0.12)'
      : '0 8px 24px -4px rgba(212, 160, 23, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)'
    : 'none';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: individualDelay,
        type: 'spring',
        stiffness: 240,
        damping: 24
      }}
      whileHover={{
        y: -3,
        scale: 1.008,
        boxShadow: isDark
          ? '0 12px 32px -4px rgba(0, 0, 0, 0.60), 0 0 24px rgba(0, 184, 124, 0.20)'
          : '0 12px 28px -4px rgba(212, 160, 23, 0.22), 0 4px 12px rgba(0, 0, 0, 0.06)',
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
      onClick={() => onToggleRead(notification.notification_id)}
      className="p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative select-none overflow-hidden group"
      style={{
        background: cardBg,
        borderColor: cardBorder,
        boxShadow: cardShadow
      }}
    >
      {/* Unread Indicator Ribbon */}
      {isUnread && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{
            background: notification.notification_type === 'deadline_today'
              ? '#EF4444'
              : notification.notification_type === 'deadline_tomorrow'
              ? '#F97316'
              : isDark
              ? 'linear-gradient(180deg, #00B87C 0%, #10B981 100%)'
              : 'linear-gradient(180deg, #C9890A 0%, #D4A017 100%)'
          }}
        />
      )}

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-2.5 flex-wrap">
        <div className="flex items-center gap-2.5">
          {/* Icon with category-tinted background */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-xs"
            style={{
              background: iconBg,
              color: accentColor,
              border: `1.5px solid ${iconBorder}`
            }}
          >
            <TypeIcon className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{
                background: iconBg,
                color: accentColor,
                border: `1px solid ${iconBorder}`
              }}
            >
              {cfg.label}
            </span>

            <span
              className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{
                background: isDark ? pBadge.darkBg : pBadge.lightBg,
                color: isDark ? pBadge.darkColor : pBadge.lightColor,
                border: `1px solid ${pBadge.border}`
              }}
            >
              {pBadge.label}
            </span>

            {notification.state && (
              <span
                className="text-[10px] font-bold hidden sm:inline-block"
                style={{ color: isDark ? '#94A3B8' : '#7A5009' }}
              >
                • {notification.state}
              </span>
            )}
          </div>
        </div>

        {/* Date & Deadline Countdown */}
        <div className="flex items-center gap-2.5 ml-auto">
          <DeadlineCountdown notification={notification} isDark={isDark} />

          <span
            className="text-[11px] font-medium whitespace-nowrap"
            style={{ color: isDark ? '#94A3B8' : '#7A5009' }}
          >
            {formatTimestamp(notification.notification_date)}
          </span>

          {/* Unread Dot */}
          {isUnread && (
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full inline-block flex-shrink-0"
              style={{
                background: isDark ? '#00B87C' : '#C9890A',
                boxShadow: `0 0 8px ${isDark ? '#00B87C' : '#C9890A'}`
              }}
              title="Unread notification"
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-1.5 pl-0.5 mb-3">
        <h3
          className="text-sm sm:text-base font-extrabold tracking-tight leading-snug"
          style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
        >
          {notification.title}
        </h3>
        <p
          className="text-xs sm:text-[13px] leading-relaxed line-clamp-2 sm:line-clamp-3 font-medium"
          style={{ color: isDark ? '#94A3B8' : '#4B5563' }}
        >
          {notification.message}
        </p>
      </div>

      {/* Action Row & Source Footer */}
      <div
        className="flex items-center justify-between gap-3 pt-3 border-t flex-wrap"
        style={{
          borderColor: isDark ? 'rgba(0, 184, 124, 0.12)' : 'rgba(212, 160, 23, 0.16)'
        }}
      >
        <div
          className="flex items-center gap-1.5 text-[11px] font-medium truncate max-w-sm"
          style={{ color: isDark ? '#94A3B8' : '#7A5009' }}
        >
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
          <span className="truncate">{notification.source_department}</span>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={handleActionClick}
            whileHover={{ scale: 1.04, x: 2 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black text-white transition-all shadow-sm cursor-pointer"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #00B87C 0%, #10B981 100%)'
                : 'linear-gradient(135deg, #C9890A 0%, #D4A017 100%)',
              boxShadow: isDark
                ? '0 2px 10px rgba(0,184,124,0.30)'
                : '0 2px 10px rgba(201,137,10,0.25)'
            }}
          >
            <span>
              {notification.action_type === 'check_eligibility'
                ? 'Check Eligibility'
                : notification.action_type === 'view_documents'
                ? 'View Documents'
                : notification.action_type === 'check_status'
                ? 'Check Status'
                : 'View Scheme Details'}
            </span>
            <ChevronRight className="w-3 h-3" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
