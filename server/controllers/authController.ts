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

export async function phoneSyncController(req: Request, res: Response): Promise<void> {
  try {
    const {
      firebaseUid,
      phoneNumber,
      fullName,
      email,
    } = req.body || {};

    if (!firebaseUid || typeof firebaseUid !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Firebase UID is required.',
      });
      return;
    }

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Valid phone number is required.',
      });
      return;
    }

    const { phoneSyncUserService } = await import('../services/authService.js');
    const result = await phoneSyncUserService({
      firebaseUid,
      phoneNumber,
      fullName: fullName || 'Citizen User',
      email: email || '',
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

    console.error('Unhandled Phone Sync Error:', err);
    res.status(500).json({
      success: false,
      message: 'Phone login synchronization failed.',
    });
  }
}

export async function checkPhoneController(req: Request, res: Response): Promise<void> {
  try {
    const phoneNumber = req.body?.phoneNumber || (req.query?.phone as string) || (req.query?.phoneNumber as string);
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      res.status(400).json({
        registered: false,
        message: 'Valid phone number is required.',
      });
      return;
    }

    const { checkPhoneRegisteredService } = await import('../services/authService.js');
    const result = await checkPhoneRegisteredService(phoneNumber);
    res.status(200).json(result);
  } catch (err: any) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({
        registered: false,
        message: err.message,
      });
      return;
    }
    console.error('Check Phone Controller Error:', err);
    res.status(500).json({
      registered: false,
      message: 'Failed to verify phone number in database.',
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

export async function getCitizenProfileController(req: Request, res: Response): Promise<void> {
  try {
    const firebaseUid = req.params.uid || req.body?.firebaseUid || (req.query?.firebaseUid as string);
    const email = req.body?.email || (req.query?.email as string) || '';
    const phone = req.body?.phone || req.body?.phoneNumber || (req.query?.phone as string) || (req.query?.phoneNumber as string) || '';

    if (!firebaseUid || typeof firebaseUid !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Firebase UID is required.',
      });
      return;
    }

    const { getCitizenProfileByUidService } = await import('../services/authService.js');
    const result = await getCitizenProfileByUidService(firebaseUid, email, phone);

    res.status(200).json(result);
  } catch (err: any) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
      return;
    }

    console.error('Unhandled Get Citizen Profile Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve citizen profile.',
    });
  }
}

export async function saveCitizenProfileController(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body || {};
    const firebase_uid = data.firebase_uid || data.firebaseUid || data.uid || req.params.uid;
    const email = data.email || data.userEmail || '';
    const phoneNumber = data.phone_number || data.phoneNumber || null;

    if (!firebase_uid) {
      res.status(400).json({
        success: false,
        message: 'Firebase UID is required.',
      });
      return;
    }

    const payload = {
      profile_id: data.profile_id || data.profileId || data.citizen_id || data.citizenId,
      firebase_uid,
      email: email ? String(email).trim().toLowerCase() : '',
      phone_number: phoneNumber ? String(phoneNumber).trim() : null,
      full_name: data.full_name || data.fullName || 'Citizen',
      date_of_birth: data.date_of_birth || data.dateOfBirth || null,
      age: data.age !== undefined && data.age !== null ? Number(data.age) : null,
      gender: data.gender || null,
      marital_status: data.marital_status || data.maritalStatus || null,
      caste_category: data.caste_category || data.casteCategory || null,
      occupation: data.occupation || null,
      employment_status: data.employment_status || data.employmentStatus || null,
      education_qualification: data.education_qualification || data.educationQualification || null,
      annual_family_income: data.annual_family_income || data.annualFamilyIncome || null,
      state: data.state || null,
      district: data.district || null,
      mandal: data.mandal || null,
      village_city: data.village_city || data.villageCity || null,
      residence_type: data.residence_type || data.residenceType || null,
      pincode: data.pincode || null,
      disability_percentage: data.disability_percentage || data.disabilityPercentage || 0,
      preferred_language: data.preferred_language || data.preferredLanguage || 'English',
      profile_photo_url: data.profile_photo_url || data.profilePhotoUrl || null,
    };

    const { saveCitizenProfileService } = await import('../services/authService.js');
    const result = await saveCitizenProfileService(payload);

    res.status(200).json(result);
  } catch (err: any) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
      return;
    }

    console.error('Unhandled Save Citizen Profile Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to save citizen profile.',
    });
  }
}


