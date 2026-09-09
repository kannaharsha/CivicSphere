import { GoogleAuthProvider, OAuthCredential } from 'firebase/auth';

/**
 * Generate Google Auth credential from ID token or access token.
 * Based on: snippets/auth-next/google-signin/auth_google_provider_credential.js
 */
export function getGoogleCredential(idToken?: string | null, accessToken?: string | null): OAuthCredential {
  return GoogleAuthProvider.credential(idToken, accessToken);
}
