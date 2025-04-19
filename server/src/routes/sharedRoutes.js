import express from 'express';
import { getPDFByShareLink } from '../controllers/pdfController.js';
import { getCommentsByShareLink, addCommentByShareLink } from '../controllers/commentController.js';

const router = express.Router();

router.get('/:shareLink', getPDFByShareLink);

router.get('/:shareLink/comments', getCommentsByShareLink);

router.post('/:shareLink/comments', addCommentByShareLink);

export default router;
