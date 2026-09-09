import { RecaptchaVerifier } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { auth } from '../firebase';
import { clearExistingRecaptcha } from './auth_phone_recaptcha_verifier_simple';

/**
 * Set up a visible normal reCAPTCHA verifier widget with lifecycle reset protection.
 * Based on: snippets/auth-next/phone-auth/auth_phone_recaptcha_verifier_visible.js
 */
export function setupRecaptchaVerifierVisible(
  containerId: string = 'recaptcha-container',
  authInstance: Auth = auth,
  onSolved?: () => void
): RecaptchaVerifier {
  clearExistingRecaptcha(containerId);

  if (typeof document !== 'undefined') {
    let el = document.getElementById(containerId);
    if (!el) {
      el = document.createElement('div');
      el.id = containerId;
      document.body.appendChild(el);
    }
  }

  const verifier = new RecaptchaVerifier(authInstance, containerId, {
    size: 'normal',
    callback: () => {
      if (onSolved) onSolved();
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired, clearing verifier.');
      clearExistingRecaptcha(containerId);
    },
  });

  if (typeof window !== 'undefined') {
    (window as any).recaptchaVerifier = verifier;
  }

  return verifier;
}
