import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getCommentsByPdfId, addComment, updateComment,deleteComment } from '../controllers/commentController.js';

const router = express.Router();

router.get('/:pdfId', protect, getCommentsByPdfId);
router.post('/:pdfId', protect, addComment);
router.put('/:commentId', protect, updateComment);
router.delete('/:commentId', protect, deleteComment);

export default router;