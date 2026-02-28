import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// User registration route
router.post('/register', authController.register);

// User login route
router.post('/login', authController.login);

// Password reset route
router.post('/reset-password', authController.resetPassword);

export default router;