import {
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import type {
  UserCredential,
  Auth
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

/**
 * Authenticate with Firebase using Google provider via a pop-up window.
 * Based on: snippets/auth-next/google-signin/auth_google_signin_popup.js
 */
export async function signInWithGooglePopup(
  authInstance: Auth = auth,
  customProvider: GoogleAuthProvider = googleProvider
): Promise<UserCredential> {
  try {
    const result = await signInWithPopup(authInstance, customProvider);
    return result;
  } catch (error: any) {
    throw error;
  }
}
