import type { Request, Response } from 'express';
import { registerUserService, CustomError } from '../services/authService.js';

export async function registerController(req: Request, res: Response): Promise<void> {
  try {
    const { fullName, email, password } = req.body || {};

    // Validate inputs
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: 'Full Name is required and must be at least 3 characters.',
      });
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(fullName.trim())) {
      res.status(400).json({
        success: false,
        message: 'Full Name can only contain alphabets and spaces.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      res.status(400).json({
        success: false,
        message: 'Invalid email address.',
      });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password is too weak. Must be at least 8 characters long.',
      });
      return;
    }

    const result = await registerUserService({
      fullName,
      email,
      password,
    });

    res.status(201).json(result);
  } catch (err: any) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
      return;
    }

    console.error('Unhandled Registration Error:', err);
    res.status(500).json({
      success: false,
      message: 'Unable to create account. Try again later.',
    });
  }
}

export async function verifySyncController(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({
        success: false,
        message: 'Valid email address is required.',
      });
      return;
    }

    if (!password || typeof password !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Password is required.',
      });
      return;
    }

    const { verifyAndSyncUserService } = await import('../services/authService.js');
    const result = await verifyAndSyncUserService({ email, password });

    res.status(200).json(result);
  } catch (err: any) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({
        success: false,
        verified: false,
        message: err.message,
      });
      return;
    }

    console.error('Unhandled Login Sync Error:', err);
    res.status(500).json({
      success: false,
      verified: false,
      message: 'Authentication service temporarily unavailable.',
    });
  }
}

export async function googleSyncController(req: Request, res: Response): Promise<void> {
  try {
    const {
      firebaseUid,
      fullName,
      email,
      authProvider,
      emailVerified,
      photoUrl,
      phoneNumber,
    } = req.body || {};

    if (!firebaseUid || typeof firebaseUid !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Firebase UID is required.',
      });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({
        success: false,
        message: 'Valid email address is required.',
      });
      return;
    }

    const { googleSyncUserService } = await import('../services/authService.js');
    const result = await googleSyncUserService({
      firebaseUid,
      fullName: fullName || 'Google User',
      email,
      authProvider: authProvider || 'google.com',
      emailVerified: emailVerified !== undefined ? Boolean(emailVerified) : true,
      photoUrl: photoUrl || null,
      phoneNumber: phoneNumber || null,
    });

    res.status(200).json(result);
  } catch (err: any) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
      return;
    }

    console.error('Unhandled Google Sync Error:', err);
    res.status(500).json({
      success: false,
      message: 'Google login synchronization failed.',
    });
  }
}

export async function getUserProfileController(req: Request, res: Response): Promise<void> {
  try {
    const firebaseUid = req.params.uid || req.body?.firebaseUid || (req.query?.firebaseUid as string);
    const email = req.body?.email || (req.query?.email as string) || '';

    if (!firebaseUid || typeof firebaseUid !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Firebase UID is required.',
      });
      return;
    }

    const { getUserProfileService } = await import('../services/authService.js');
    const result = await getUserProfileService(firebaseUid, email);

    res.status(200).json(result);
  } catch (err: any) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
      return;
    }

    console.error('Unhandled Get Profile Error:', err);
    res.status(404).json({
      success: false,
      message: 'User profile not found.',
    });
  }
}

export async function resendVerificationController(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({
        success: false,
        message: 'Valid email address is required.',
      });
      return;
    }

    const { resendVerificationEmailService } = await import('../services/authService.js');
    const result = await resendVerificationEmailService(email, password);

    res.status(200).json(result);
  } catch (err: any) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email.',
    });
  }
}
