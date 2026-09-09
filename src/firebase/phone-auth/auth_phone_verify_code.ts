import type { ConfirmationResult, UserCredential } from 'firebase/auth';

/**
 * Sign in the user with the verification code (OTP).
 * Based on: snippets/auth-next/phone-auth/auth_phone_verify_code.js
 */
export async function verifyPhoneCodeAndSignIn(
  confirmationResult: ConfirmationResult,
  verificationCode: string
): Promise<UserCredential> {
  return await confirmationResult.confirm(verificationCode);
}
