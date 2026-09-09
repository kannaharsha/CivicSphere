import { Router } from 'express';
import {
  registerController,
  verifySyncController,
  googleSyncController,
  phoneSyncController,
  checkPhoneController,
  getUserProfileController,
  resendVerificationController,
  getCitizenProfileController,
  saveCitizenProfileController,
} from '../controllers/authController.js';

const router = Router();

// POST /api/auth/register
router.post('/register', registerController);

// POST /api/auth/verify-sync & POST /api/auth/login
router.post('/verify-sync', verifySyncController);
router.post('/login', verifySyncController);

// POST /api/auth/google-sync & POST /api/auth/google
router.post('/google-sync', googleSyncController);
router.post('/google', googleSyncController);

// POST /api/auth/phone-sync & POST /api/auth/phone
router.post('/phone-sync', phoneSyncController);
router.post('/phone', phoneSyncController);

// POST & GET /api/auth/check-phone & /api/auth/verify-phone
router.post('/check-phone', checkPhoneController);
router.get('/check-phone', checkPhoneController);
router.post('/verify-phone', checkPhoneController);

// GET & POST /api/auth/profile
router.get('/profile/:uid', getUserProfileController);
router.post('/profile', getUserProfileController);

// GET & POST /api/auth/citizen-profile
router.get('/citizen-profile/:uid', getCitizenProfileController);
router.get('/citizen-profile', getCitizenProfileController);
router.post('/citizen-profile/save', saveCitizenProfileController);
router.post('/citizen-profile/:uid', saveCitizenProfileController);
router.post('/citizen-profile', saveCitizenProfileController);
router.put('/citizen-profile', saveCitizenProfileController);

// POST /api/auth/resend-verification
router.post('/resend-verification', resendVerificationController);



export default router;
