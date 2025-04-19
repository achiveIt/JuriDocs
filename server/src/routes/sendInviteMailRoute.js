import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { generateShareLink } from '../controllers/sendInviteMail.js';
import { getPDFByShareLink } from '../controllers/pdfController.js';
import { getCommentsByShareLink, addCommentByShareLink } from '../controllers/commentController.js';

const router = express.Router();

router.post('/:id', protect, generateShareLink);

router.get('/:shareLink', getPDFByShareLink);

router.get('/:shareLink/comments', getCommentsByShareLink);

router.post('/:shareLink/comments', addCommentByShareLink);

export default router;
