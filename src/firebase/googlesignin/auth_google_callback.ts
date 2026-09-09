import { getRedirectResult } from 'firebase/auth';
import type { Auth, UserCredential } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Handle Google redirect callback flow.
 * Based on: snippets/auth-next/google-signin/auth_google_callback.js
 */
export async function handleGoogleRedirectCallback(
  authInstance: Auth = auth
): Promise<UserCredential | null> {
  try {
    const result = await getRedirectResult(authInstance);
    return result;
  } catch (error) {
    console.error('Google redirect callback error:', error);
    throw error;
  }
}
