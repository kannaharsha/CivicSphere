import { signInWithEmailAndPassword } from 'firebase/auth';
import type { Auth, UserCredential } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Sign in a user with an email address and password.
 * Based on official Firebase snippets: snippets/auth-next/email/auth_signin_password.js
 */
export async function signInUserWithEmailAndPassword(
  email: string,
  pass: string,
  authInstance: Auth = auth
): Promise<UserCredential> {
  return await signInWithEmailAndPassword(authInstance, email, pass);
}
