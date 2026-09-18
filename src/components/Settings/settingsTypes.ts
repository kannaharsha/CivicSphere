export type LanguageCode = 'en' | 'te' | 'hi';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserSettings {
  id?: string;
  user_id: string;
  // Section 2: Language
  preferred_language: LanguageCode;
  // Section 3: Theme
  preferred_theme: ThemePreference;
  // Section 4: Notifications
  deadline_notifications: boolean;
  new_scheme_notifications: boolean;
  announcement_notifications: boolean;
  application_status_notifications: boolean;
  weekly_updates: boolean;
  // Section 5: Accessibility
  larger_text: boolean;
  high_contrast: boolean;
  reduce_motion: boolean;
  screen_reader_mode: boolean;
  larger_buttons: boolean;
  // Section 6: Privacy
  personalized_recommendations: boolean;
  anonymous_analytics: boolean;
  remember_preferences: boolean;
  // Section 7: App Preferences
  default_sector: string;
  default_state: string;
  default_district: string;
  // Meta
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  user_id: '',
  preferred_language: 'en',
  preferred_theme: 'system',
  deadline_notifications: true,
  new_scheme_notifications: true,
  announcement_notifications: true,
  application_status_notifications: true,
  weekly_updates: false,
  larger_text: false,
  high_contrast: false,
  reduce_motion: false,
  screen_reader_mode: false,
  larger_buttons: false,
  personalized_recommendations: true,
  anonymous_analytics: true,
  remember_preferences: true,
  default_sector: 'Agriculture',
  default_state: 'Andhra Pradesh',
  default_district: 'Visakhapatnam',
};
