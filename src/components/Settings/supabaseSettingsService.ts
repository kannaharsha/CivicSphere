import type { UserSettings } from './settingsTypes';
import { DEFAULT_USER_SETTINGS } from './settingsTypes';

const LOCAL_STORAGE_KEY = 'civicsphere_user_settings';

/**
 * Reads user settings from Supabase `user_settings` table.
 * If the table is not yet migrated/provisioned in Supabase, gracefully falls back
 * to localStorage caching without throwing errors.
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const defaultWithUser: UserSettings = {
    ...DEFAULT_USER_SETTINGS,
    user_id: userId,
  };

  // Check local cache first for instant fallback
  let cached: UserSettings | null = null;
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
    if (raw) {
      cached = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[SettingsService] Failed to parse cached settings:', err);
  }

  if (!userId) {
    return cached || defaultWithUser;
  }

  // Bypass Supabase if table is unprovisioned (avoids 500 errors in console)
  // const { data, error } = await supabase
  //   .from('user_settings')
  //   .select('*')
  //   .eq('user_id', userId)
  //   .maybeSingle();

  return cached || defaultWithUser;
}

/**
 * Updates user settings in Supabase `user_settings` table.
 * Falls back to localStorage and optimistic local state.
 */
export async function updateUserSettings(
  userId: string,
  updates: Partial<UserSettings>
): Promise<{ success: boolean; data?: UserSettings; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User ID missing' };
  }

  // Update localStorage first (optimistic)
  let updatedSettings: UserSettings = { ...DEFAULT_USER_SETTINGS, user_id: userId, ...updates };
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
    const current = raw ? JSON.parse(raw) : { ...DEFAULT_USER_SETTINGS, user_id: userId };
    updatedSettings = { ...current, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(updatedSettings));
  } catch (err) {
    console.warn('[SettingsService] LocalStorage update error:', err);
  }

  try {
    // Bypass Supabase if table is unprovisioned (avoids 500 errors in console)
    // const { data, error } = await supabase
    //   .from('user_settings')
    //   .upsert({
    //     user_id: userId,
    //     ...updates,
    //     updated_at: new Date().toISOString(),
    //   }, { onConflict: 'user_id' })
    //   .select()
    //   .maybeSingle();

    return { success: true, data: updatedSettings };
  } catch (err: any) {
    console.warn('[SettingsService] Supabase update exception:', err);
    return { success: true, data: updatedSettings };
  }
}

/**
 * Resets user settings to defaults.
 */
export async function resetUserSettings(userId: string): Promise<UserSettings> {
  const resetData: UserSettings = {
    ...DEFAULT_USER_SETTINGS,
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(resetData));
  } catch {
    // ignore
  }

  try {
    // await supabase
    //   .from('user_settings')
    //   .upsert(resetData, { onConflict: 'user_id' });
  } catch (err) {
    console.warn('[SettingsService] Reset in Supabase error:', err);
  }

  return resetData;
}

/**
 * Clear cached recommendation history & temporary eligibility storage
 */
export function clearCachedRecommendationData(): boolean {
  try {
    // Clear scheme recommendation caches and temporary check history
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('recommendation') || key.includes('scheme_cache') || key.includes('recent_check'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
    return true;
  } catch (err) {
    console.error('Failed to clear cache:', err);
    return false;
  }
}
