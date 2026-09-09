import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import type { ConfirmationResult, Auth } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Send SMS verification code to the user's phone.
 * Based on: snippets/auth-next/phone-auth/auth_phone_signin.js
 */
export async function sendVerificationCodeToPhone(
  phoneNumber: string,
  verifier: RecaptchaVerifier,
  authInstance: Auth = auth
): Promise<ConfirmationResult> {
  return await signInWithPhoneNumber(authInstance, phoneNumber, verifier);
}
