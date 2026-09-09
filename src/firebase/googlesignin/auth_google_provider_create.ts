import { GoogleAuthProvider } from 'firebase/auth';

/**
 * Create an instance of the Google provider object.
 * Based on: snippets/auth-next/google-signin/auth_google_provider_create.js
 */
export const provider = new GoogleAuthProvider();

export function createGoogleProvider(): GoogleAuthProvider {
  return new GoogleAuthProvider();
}
