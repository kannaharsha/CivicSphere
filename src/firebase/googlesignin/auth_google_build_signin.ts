import { signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

/**
 * Redirect user to the Google sign-in page.
 * Based on: snippets/auth-next/google-signin/auth_google_build_signin.js
 */
export async function buildGoogleSignInRedirect(
  authInstance: Auth = auth,
  customProvider: GoogleAuthProvider = googleProvider
): Promise<void> {
  await signInWithRedirect(authInstance, customProvider);
}
