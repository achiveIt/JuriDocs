import express from 'express';
import { register, login, logout, getCurrentUser, changePassword, updateUserProfile, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/current-user', protect, getCurrentUser);
router.post('/change-password', protect, changePassword);
router.patch('/update-profile', protect, updateUserProfile)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;