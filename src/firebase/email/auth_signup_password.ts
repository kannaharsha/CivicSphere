import { createUserWithEmailAndPassword } from 'firebase/auth';
import type { Auth, UserCredential } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Register a new user with an email address and password.
 * Based on official Firebase snippets: snippets/auth-next/email/auth_signup_password.js
 */
export async function createUserWithEmail(
  email: string,
  pass: string,
  authInstance: Auth = auth
): Promise<UserCredential> {
  return await createUserWithEmailAndPassword(authInstance, email, pass);
}
