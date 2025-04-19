import express from 'express';
import { getPDFByShareLink } from '../controllers/pdfController.js';
import { getCommentsByShareLink, addCommentByShareLink } from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:shareLink', protect, getPDFByShareLink);

router.get('/:shareLink/comments', protect, getCommentsByShareLink);

router.post('/:shareLink/comments', protect, addCommentByShareLink);

export default router;
