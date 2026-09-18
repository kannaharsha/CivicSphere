/**
 * CivicSphere Notification Center Types
 * Type definitions for scheme alerts, deadlines, announcements,
 * and category filtering within the government notification dashboard.
 */

export type NotificationType =
  | 'deadline_today'
  | 'deadline_tomorrow'
  | 'upcoming_deadline'
  | 'new_scheme'
  | 'status_reminder'
  | 'document_reminder'
  | 'announcement'
  | 'scheme_reopened';

export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

export type TimelineGroup = 'today' | 'tomorrow' | 'this_week' | 'earlier';

export type NotificationCategory =
  | 'all'
  | 'deadlines'
  | 'new_schemes'
  | 'status_updates'
  | 'document_reminders'
  | 'announcements'
  | 'upcoming_deadlines'
  | 'completed';

export interface SchemeNotification {
  notification_id: string;
  scheme_id?: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  priority: PriorityLevel;
  state: string; // e.g. "All India", "Andhra Pradesh", "Telangana"
  ministry: string;
  notification_date: string; // ISO string
  deadline_date?: string; // ISO string or null
  action_type: 'view_scheme' | 'check_eligibility' | 'check_status' | 'view_documents' | 'view_announcement';
  action_route: string; // Internal route e.g. "/eligibility", "/dashboard"
  source_department: string; // e.g. "Department of Agriculture & Farmers Welfare, GoI"
  is_active: boolean;

  // Computed frontend attributes
  daysRemaining?: number;
  hoursRemaining?: number;
  timelineGroup: TimelineGroup;
  isRead: boolean;
}

export interface NotificationSummaryMetrics {
  totalCount: number;
  deadlinesTodayCount: number;
  deadlinesTomorrowCount: number;
  upcomingThisWeekCount: number;
  unreadCount: number;
}

export interface NotificationStatsMetrics {
  activeDeadlines: number;
  newSchemes: number;
  statusReminders: number;
  documentReminders: number;
  announcements: number;
}
