import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import { getUserPDFs, uploadPDF, getPDFById, deletePDF, generateShareLink } from '../controllers/pdfController.js';

const router = express.Router();

router.get('/', protect, getUserPDFs);
router.post('/upload', protect, upload.single('pdf'), uploadPDF);
router.get('/:id', protect, getPDFById);
router.delete('/:id', protect, deletePDF);
router.post('/:id/share', protect, generateShareLink);

export default router;