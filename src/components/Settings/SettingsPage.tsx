import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../firebase/AuthProvider';
import { useTheme } from '../../context/ThemeContext';
import {
  getUserSettings,
  updateUserSettings,
  resetUserSettings,
  clearCachedRecommendationData,
} from './supabaseSettingsService';
import type { UserSettings, LanguageCode, ThemePreference } from './settingsTypes';
import { DEFAULT_USER_SETTINGS } from './settingsTypes';

import { SettingsHeader } from './SettingsHeader';
import { SettingsSearch } from './SettingsSearch';
import { AccountSettingsCard } from './AccountSettingsCard';
import { LanguageSettings } from './LanguageSettings';
import { ThemeSettings } from './ThemeSettings';
import { NotificationSettings } from './NotificationSettings';
import { AccessibilitySettings } from './AccessibilitySettings';
import { PrivacySettings } from './PrivacySettings';
import { AppPreferences } from './AppPreferences';
import { AboutSettings } from './AboutSettings';
import { ConfirmDialog } from './ConfirmDialog';

interface SettingsPageProps {
  isDark?: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ isDark: propsIsDark }) => {
  const { user, profile, logout } = useAuth();
  const themeContext = useTheme();

  // Determine current theme active
  const isDark = propsIsDark !== undefined ? propsIsDark : themeContext?.theme === 'dark';

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  // Dialog states
  const [showResetModal, setShowResetModal] = useState(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Trigger Toast Notification
  const showToast = (message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 1. Initial Load from Supabase user_settings
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const userId = user?.uid || 'guest_citizen';
      const fetched = await getUserSettings(userId);
      if (isMounted) {
        setSettings(fetched);
        setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  // Autosave helper with optimistic UI update
  const handleSettingUpdate = async (key: keyof UserSettings, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setIsSaving(true);

    const userId = user?.uid || 'guest_citizen';
    const result = await updateUserSettings(userId, { [key]: value });

    setIsSaving(false);
    if (result.success) {
      setLastSavedTime(new Date());
      showToast('Settings saved to Supabase');
    }
  };

  // Language Change handler
  const handleLanguageChange = (lang: LanguageCode) => {
    handleSettingUpdate('preferred_language', lang);
  };

  // Theme Change handler (synchronize with ThemeContext if present)
  const handleThemeChange = (theme: ThemePreference) => {
    handleSettingUpdate('preferred_theme', theme);
    if (theme === 'dark' && themeContext?.theme !== 'dark') {
      themeContext.toggleTheme();
    } else if (theme === 'light' && themeContext?.theme !== 'light') {
      themeContext.toggleTheme();
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark && themeContext?.theme !== 'dark') {
        themeContext.toggleTheme();
      } else if (!prefersDark && themeContext?.theme !== 'light') {
        themeContext.toggleTheme();
      }
    }
  };

  // Reset Settings handler
  const handleConfirmReset = async () => {
    setDialogLoading(true);
    const userId = user?.uid || 'guest_citizen';
    const reset = await resetUserSettings(userId);
    setSettings(reset);
    setDialogLoading(false);
    setShowResetModal(false);
    showToast('All preferences reset to government defaults');
  };

  // Clear Cache handler
  const handleConfirmClearCache = () => {
    setDialogLoading(true);
    const ok = clearCachedRecommendationData();
    setDialogLoading(false);
    setShowClearCacheModal(false);
    if (ok) {
      showToast('Cached recommendation history cleared');
    }
  };

  // Sign out handler
  const handleConfirmSignOut = async () => {
    setDialogLoading(true);
    try {
      await logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setDialogLoading(false);
      setShowSignOutModal(false);
    }
  };

  // Filter sections according to search query
  const query = searchQuery.toLowerCase().trim();
  const showSection = (keywords: string[]) => {
    if (!query) return true;
    return keywords.some((k) => k.toLowerCase().includes(query));
  };

  const lastSavedText = useMemo(() => {
    if (!lastSavedTime) return 'Synced with Supabase';
    return `Saved at ${lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  }, [lastSavedTime]);

  return (
    <div className={`pb-16 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold border backdrop-blur-md text-white ${
              isDark
                ? 'bg-emerald-600/95 border-emerald-400/60 shadow-emerald-500/30'
                : 'bg-amber-600/95 border-amber-400/60 shadow-amber-500/30'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 pt-4">
        {/* Header with Autosave Status */}
        <SettingsHeader
          isDark={isDark}
          isSaving={isSaving}
          lastSavedText={lastSavedText}
          onRequestReset={() => setShowResetModal(true)}
          onRequestSignOut={() => setShowSignOutModal(true)}
        />

        {/* Real-time Search Filter */}
        <SettingsSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isDark={isDark}
        />

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-6 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-48 rounded-3xl animate-pulse border ${
                  isDark
                    ? 'bg-emerald-900/10 border-emerald-500/10'
                    : 'bg-amber-500/5 border-amber-400/15'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {/* Section 1: Account Information */}
            {showSection(['account', 'name', 'email', 'phone', 'state', 'district', 'occupation', 'profile']) && (
              <div id="section-account">
                <AccountSettingsCard isDark={isDark} profile={profile} />
              </div>
            )}

            {/* Section 2: Language Preferences */}
            {showSection(['language', 'english', 'telugu', 'hindi', 'regional']) && (
              <div id="section-language">
                <LanguageSettings
                  isDark={isDark}
                  selectedLanguage={settings.preferred_language}
                  onLanguageChange={handleLanguageChange}
                />
              </div>
            )}

            {/* Section 3: Theme Preferences */}
            {showSection(['theme', 'dark', 'light', 'appearance', 'color', 'mode']) && (
              <div id="section-theme">
                <ThemeSettings
                  isDark={isDark}
                  selectedTheme={settings.preferred_theme}
                  onThemeChange={handleThemeChange}
                />
              </div>
            )}

            {/* Section 4: Notification Preferences */}
            {showSection(['notification', 'alert', 'deadline', 'announcement', 'status', 'weekly', 'reminders']) && (
              <div id="section-notifications">
                <NotificationSettings
                  isDark={isDark}
                  settings={settings}
                  onUpdate={handleSettingUpdate}
                />
              </div>
            )}

            {/* Section 5: Accessibility Settings */}
            {showSection(['accessibility', 'text', 'contrast', 'animation', 'screen reader', 'button', 'motion']) && (
              <div id="section-accessibility">
                <AccessibilitySettings
                  isDark={isDark}
                  settings={settings}
                  onUpdate={handleSettingUpdate}
                />
              </div>
            )}

            {/* Section 6: Privacy & Security */}
            {showSection(['privacy', 'security', 'cache', 'recommendations', 'analytics', 'aadhaar', 'data']) && (
              <div id="section-privacy">
                <PrivacySettings
                  isDark={isDark}
                  settings={settings}
                  onUpdate={handleSettingUpdate}
                  onRequestClearCache={() => setShowClearCacheModal(true)}
                />
              </div>
            )}

            {/* Section 7: App Preferences */}
            {showSection(['preferences', 'sector', 'agriculture', 'state', 'district', 'regional', 'defaults']) && (
              <div id="section-app-preferences">
                <AppPreferences
                  isDark={isDark}
                  settings={settings}
                  onUpdate={handleSettingUpdate}
                />
              </div>
            )}

            {/* Section 8: About CivicSphere */}
            {showSection(['about', 'version', 'terms', 'privacy policy', 'help', 'support', 'feedback']) && (
              <div id="section-about">
                <AboutSettings isDark={isDark} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog: Reset Defaults */}
      <ConfirmDialog
        isOpen={showResetModal}
        type="warning"
        title="Reset All Preferences to Defaults?"
        description="This will restore all notification toggles, accessibility settings, and regional filters to the standard government defaults."
        confirmLabel="Reset All"
        cancelLabel="Cancel"
        isDark={isDark}
        isLoading={dialogLoading}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetModal(false)}
      />

      {/* Confirmation Dialog: Clear Cached Data */}
      <ConfirmDialog
        isOpen={showClearCacheModal}
        type="danger"
        title="Clear Recommendation & Eligibility Cache?"
        description="This will purge locally cached eligibility assessments, recently viewed scheme calculations, and temporary form sessions. Your profile data remains safe."
        confirmLabel="Clear Data"
        cancelLabel="Keep Data"
        isDark={isDark}
        isLoading={dialogLoading}
        onConfirm={handleConfirmClearCache}
        onCancel={() => setShowClearCacheModal(false)}
      />

      {/* Confirmation Dialog: Sign Out */}
      <ConfirmDialog
        isOpen={showSignOutModal}
        type="danger"
        title="Sign Out of CivicSphere?"
        description="Are you sure you want to exit your active citizen session? You will need to sign back in with your credentials."
        confirmLabel="Sign Out"
        cancelLabel="Stay Logged In"
        isDark={isDark}
        isLoading={dialogLoading}
        onConfirm={handleConfirmSignOut}
        onCancel={() => setShowSignOutModal(false)}
      />
    </div>
  );
};

export default SettingsPage;
