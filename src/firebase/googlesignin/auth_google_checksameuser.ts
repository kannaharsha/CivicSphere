import { linkWithCredential } from 'firebase/auth';
import type { AuthCredential, User, UserCredential } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Link an existing user account with a Google credential, ensuring the same user is updated.
 * Based on: snippets/auth-next/google-signin/auth_google_checksameuser.js
 */
export async function linkGoogleCredentialToUser(
  credential: AuthCredential,
  currentUser?: User | null
): Promise<UserCredential> {
  const user = currentUser || auth.currentUser;
  if (!user) {
    throw new Error('No user is currently authenticated to link credential.');
  }
  return await linkWithCredential(user, credential);
}
