import { sendPasswordResetEmail } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Send a password reset email to the specified email address.
 * Based on official Firebase snippets: snippets/auth-next/email/auth_send_password_reset.js
 */
export async function sendUserPasswordReset(email: string, authInstance: Auth = auth): Promise<void> {
  await sendPasswordResetEmail(authInstance, email);
}
