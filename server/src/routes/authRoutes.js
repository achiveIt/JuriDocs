import express from 'express';
import { register, login, logout, getCurrentUser, changePassword, updateUserProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/current-user', protect, getCurrentUser);
router.post('/change-password', protect, changePassword);
router.patch('/update-profile', protect, updateUserProfile)

export default router;