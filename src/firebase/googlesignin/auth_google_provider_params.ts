import { GoogleAuthProvider } from 'firebase/auth';

/**
 * Specify additional custom OAuth provider parameters that you want to send with the OAuth request.
 * Based on: snippets/auth-next/google-signin/auth_google_provider_params.js
 */
export function setGoogleCustomParameters(
  providerInstance: GoogleAuthProvider,
  customParameters: Record<string, string> = { prompt: 'select_account' }
): GoogleAuthProvider {
  providerInstance.setCustomParameters(customParameters);
  return providerInstance;
}
