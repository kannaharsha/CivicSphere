import { Router } from 'express';
import { registerController, verifySyncController } from '../controllers/authController.js';

const router = Router();

// POST /api/auth/register
router.post('/register', registerController);

// POST /api/auth/verify-sync & POST /api/auth/login
router.post('/verify-sync', verifySyncController);
router.post('/login', verifySyncController);

export default router;
