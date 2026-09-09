import { sendEmailVerification } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Send an email verification link to the given user or current user.
 * Based on official Firebase snippets: snippets/auth-next/email/auth_send_email_verification.js
 */
export async function sendUserEmailVerification(targetUser?: User | null): Promise<void> {
  const user = targetUser || auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in to send verification email.');
  }
  await sendEmailVerification(user);
}
