import { signInWithCredential } from 'firebase/auth';
import type { AuthCredential, UserCredential, Auth } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Sign in using an existing Google Auth credential.
 * Based on: snippets/auth-next/google-signin/auth_google_signin_credential.js
 */
export async function signInWithGoogleCredential(
  credential: AuthCredential,
  authInstance: Auth = auth
): Promise<UserCredential> {
  return await signInWithCredential(authInstance, credential);
}
