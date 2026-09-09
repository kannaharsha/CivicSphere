import { RecaptchaVerifier } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Clean up existing reCAPTCHA instance to avoid "reCAPTCHA has already been rendered in this element" error.
 */
export function clearExistingRecaptcha(containerId: string = 'recaptcha-container') {
  if (typeof window !== 'undefined') {
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch {
        // ignore
      }
      (window as any).recaptchaVerifier = null;
    }
    if ((window as any).grecaptcha) {
      try {
        (window as any).grecaptcha.reset();
      } catch {
        // ignore
      }
    }
  }

  if (typeof document !== 'undefined') {
    const el = document.getElementById(containerId);
    if (el) {
      if (el.parentNode) {
        const clone = el.cloneNode(false) as HTMLElement;
        clone.innerHTML = '';
        el.parentNode.replaceChild(clone, el);
      } else {
        el.innerHTML = '';
      }
    }
  }
}

/**
 * Set up an invisible reCAPTCHA verifier with lifecycle reset protection.
 * Based on: snippets/auth-next/phone-auth/auth_phone_recaptcha_verifier_simple.js
 */
export function setupRecaptchaVerifierSimple(
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
    size: 'invisible',
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
