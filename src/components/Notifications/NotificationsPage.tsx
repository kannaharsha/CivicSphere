import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  fetchSchemeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from './supabaseNotificationService';
import type {
  SchemeNotification,
  NotificationCategory,
  PriorityLevel,
  NotificationSummaryMetrics,
  NotificationStatsMetrics
} from './notificationTypes';

import { NotificationHeader } from './NotificationHeader';
import { NotificationSummary } from './NotificationSummary';
import { ReminderSection } from './ReminderSection';
import { NotificationFilters } from './NotificationFilters';
import { NotificationCalendar } from './NotificationCalendar';
import { NotificationStats } from './NotificationStats';
import { NotificationTimeline } from './NotificationTimeline';
import { EmptyNotificationState } from './EmptyNotificationState';

interface NotificationsPageProps {
  isDark?: boolean;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  isDark = false
}) => {
  const [notifications, setNotifications] = useState<SchemeNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'all'>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Load from Supabase on mount
  const loadData = useCallback(async (force = false) => {
    try {
      setIsLoading(true);
      const data = await fetchSchemeNotifications(force);
      setNotifications(data);
    } catch (err) {
      console.error('[NotificationsPage] Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Toggle read state locally
  const handleToggleRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => {
        if (n.notification_id === id) {
          const nextRead = !n.isRead;
          markNotificationAsRead(id, nextRead);
          return { ...n, isRead: nextRead };
        }
        return n;
      })
    );
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.notification_id);
    markAllNotificationsAsRead(allIds);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setActiveCategory('all');
    setSelectedPriority('all');
    setSelectedState('all');
    setSelectedDate(null);
    setSearchQuery('');
  };

  // Compute Metrics
  const summaryMetrics: NotificationSummaryMetrics = useMemo(() => {
    const totalCount = notifications.length;
    const deadlinesTodayCount = notifications.filter(
      n => n.notification_type === 'deadline_today' || n.timelineGroup === 'today'
    ).length;
    const deadlinesTomorrowCount = notifications.filter(
      n => n.notification_type === 'deadline_tomorrow' || n.timelineGroup === 'tomorrow'
    ).length;
    const upcomingThisWeekCount = notifications.filter(
      n => n.timelineGroup === 'this_week' || n.notification_type === 'upcoming_deadline'
    ).length;
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return {
      totalCount,
      deadlinesTodayCount,
      deadlinesTomorrowCount,
      upcomingThisWeekCount,
      unreadCount
    };
  }, [notifications]);

  // Compute Analytics Stats
  const statsMetrics: NotificationStatsMetrics = useMemo(() => {
    return {
      activeDeadlines: notifications.filter(n =>
        ['deadline_today', 'deadline_tomorrow', 'upcoming_deadline'].includes(n.notification_type)
      ).length,
      newSchemes: notifications.filter(n => n.notification_type === 'new_scheme').length,
      statusReminders: notifications.filter(n => n.notification_type === 'status_reminder').length,
      documentReminders: notifications.filter(n => n.notification_type === 'document_reminder').length,
      announcements: notifications.filter(n => n.notification_type === 'announcement').length,
    };
  }, [notifications]);

  // Compute Category Counts
  const categoryCounts: Record<NotificationCategory, number> = useMemo(() => {
    return {
      all: notifications.length,
      deadlines: notifications.filter(n =>
        ['deadline_today', 'deadline_tomorrow', 'upcoming_deadline'].includes(n.notification_type)
      ).length,
      upcoming_deadlines: notifications.filter(n =>
        n.timelineGroup === 'this_week' || n.notification_type === 'upcoming_deadline'
      ).length,
      new_schemes: notifications.filter(n => n.notification_type === 'new_scheme').length,
      status_updates: notifications.filter(n => n.notification_type === 'status_reminder').length,
      document_reminders: notifications.filter(n => n.notification_type === 'document_reminder').length,
      announcements: notifications.filter(n =>
        ['announcement', 'scheme_reopened'].includes(n.notification_type)
      ).length,
      completed: notifications.filter(n => n.isRead).length,
    };
  }, [notifications]);

  // Filter and Search
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    // Category Filter
    if (activeCategory === 'deadlines') {
      result = result.filter(n =>
        ['deadline_today', 'deadline_tomorrow', 'upcoming_deadline'].includes(n.notification_type)
      );
    } else if (activeCategory === 'upcoming_deadlines') {
      result = result.filter(n =>
        n.timelineGroup === 'this_week' || n.notification_type === 'upcoming_deadline'
      );
    } else if (activeCategory === 'new_schemes') {
      result = result.filter(n => n.notification_type === 'new_scheme');
    } else if (activeCategory === 'status_updates') {
      result = result.filter(n => n.notification_type === 'status_reminder');
    } else if (activeCategory === 'document_reminders') {
      result = result.filter(n => n.notification_type === 'document_reminder');
    } else if (activeCategory === 'announcements') {
      result = result.filter(n =>
        ['announcement', 'scheme_reopened'].includes(n.notification_type)
      );
    } else if (activeCategory === 'completed') {
      result = result.filter(n => n.isRead);
    }

    // Priority Filter
    if (selectedPriority !== 'all') {
      result = result.filter(n => n.priority === selectedPriority);
    }

    // State Filter
    if (selectedState !== 'all') {
      result = result.filter(n =>
        n.state.toLowerCase().includes(selectedState.toLowerCase()) || n.state === 'All India'
      );
    }

    // Calendar Date Filter
    if (selectedDate) {
      result = result.filter(n => n.deadline_date && n.deadline_date.startsWith(selectedDate));
    }

    // Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        n =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.ministry.toLowerCase().includes(q) ||
          n.source_department.toLowerCase().includes(q) ||
          n.state.toLowerCase().includes(q)
      );
    }

    return result;
  }, [
    notifications,
    activeCategory,
    selectedPriority,
    selectedState,
    selectedDate,
    searchQuery
  ]);

  const hasFiltersActive =
    activeCategory !== 'all' ||
    selectedPriority !== 'all' ||
    selectedState !== 'all' ||
    Boolean(selectedDate) ||
    searchQuery.trim().length > 0;

  return (
    <div className="w-full select-none transition-colors duration-500 space-y-8 pb-12">
      {/* ── 1. HERO HEADER ── */}
      <NotificationHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unreadCount={summaryMetrics.unreadCount}
        totalCount={summaryMetrics.totalCount}
        isDark={isDark}
      />

      {/* ── 2. SUMMARY METRIC CARDS (4 independent cards) ── */}
      <NotificationSummary
        metrics={summaryMetrics}
        isDark={isDark}
        onMarkAllRead={handleMarkAllRead}
        onRefresh={() => loadData(true)}
        isLoading={isLoading}
      />

      {/* ── 3. DAILY REMINDER SECTION (Urgent banners) ── */}
      <ReminderSection notifications={notifications} isDark={isDark} />

      {/* ── 4. CATEGORY & SMART FILTERS ── */}
      <NotificationFilters
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        selectedPriority={selectedPriority}
        onSelectPriority={setSelectedPriority}
        selectedState={selectedState}
        onSelectState={setSelectedState}
        onResetFilters={handleResetFilters}
        isDark={isDark}
        categoryCounts={categoryCounts}
      />

      {/* ── 5. MAIN FEED + SIDEBAR GRID (Full Width Responsive) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Vertical Timeline Feed */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="h-36 rounded-2xl animate-pulse"
                  style={{
                    background: isDark ? 'rgba(12, 26, 43, 0.8)' : 'rgba(0, 0, 0, 0.04)'
                  }}
                />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <EmptyNotificationState
              isDark={isDark}
              onResetFilters={handleResetFilters}
              hasFiltersActive={hasFiltersActive}
            />
          ) : (
            <NotificationTimeline
              notifications={filteredNotifications}
              isDark={isDark}
              onToggleRead={handleToggleRead}
            />
          )}
        </div>

        {/* Right 1 Column: Calendar Preview & Analytics Stats */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <NotificationCalendar
            notifications={notifications}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            isDark={isDark}
          />

          <NotificationStats
            stats={statsMetrics}
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
};
