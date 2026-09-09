import { GoogleAuthProvider } from 'firebase/auth';

/**
 * Specify additional OAuth 2.0 scopes that you want to request from the authentication provider.
 * Based on: snippets/auth-next/google-signin/auth_google_provider_scopes.js
 */
export function addGoogleProviderScopes(providerInstance: GoogleAuthProvider, scopes: string[] = ['profile', 'email']): GoogleAuthProvider {
  scopes.forEach(scope => providerInstance.addScope(scope));
  return providerInstance;
}
