import { getRedirectResult } from 'firebase/auth';
import type { Auth, UserCredential } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Retrieve the Google sign-in result when returning from redirect flow.
 * Based on: snippets/auth-next/google-signin/auth_google_signin_redirect_result.js
 */
export async function getGoogleRedirectResult(
  authInstance: Auth = auth
): Promise<UserCredential | null> {
  return await getRedirectResult(authInstance);
}
