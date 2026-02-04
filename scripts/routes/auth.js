import express from 'express';
import { loginUser, logoutUser, checkAuthStatus } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/status', checkAuthStatus);

export { router as authRoutes };
