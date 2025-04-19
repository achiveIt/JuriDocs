import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { generateShareLink , accessSharedPdf} from '../controllers/sendInviteMail.js';
import { getCommentsByShareLink, addCommentByShareLink } from '../controllers/commentController.js';

const router = express.Router();

router.post('/:id', protect, generateShareLink);

router.get('/:shareLink', accessSharedPdf);

router.get('/:shareLink/comments', getCommentsByShareLink);

router.post('/:shareLink/comments', addCommentByShareLink);

export default router;
