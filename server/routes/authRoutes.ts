import { Router } from 'express';
import {
  registerController,
  verifySyncController,
  googleSyncController,
  getUserProfileController,
  resendVerificationController,
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

// GET & POST /api/auth/profile
router.get('/profile/:uid', getUserProfileController);
router.post('/profile', getUserProfileController);

// POST /api/auth/resend-verification
router.post('/resend-verification', resendVerificationController);

export default router;
