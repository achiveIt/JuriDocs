import {PDF} from '../models/pdfModel.js';
import { cloudinary } from '../config/cloudinary.js';
import { v4 as uuidv4 } from 'uuid';

export const getUserPDFs = async (req, res) => {
    try {
        const pdfs = await PDF.find({ uploadedBy: req.user._id });
        res.status(200).json(pdfs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const uploadPDF = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }
        //console.log("this is the user when uploading PDF", req.user);
        

        console.log("file ka path", req.file.path);
        
        const newPDF = await PDF.create({
            title: req.body.title || req.file.originalname,
            fileName: req.file.originalname,
            cloudinaryId: req.file.filename,
            cloudinaryUrl: cloudinary.url(req.file.path, {
                resource_type: 'raw',
                secure: true,
                transformation: [
                    { flags: `attachment:${req.file.originalname}` }
                ],
                  
            }),
            uploadedBy: req.user.id
        });
        

        res.status(200).json(newPDF);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getPDFById = async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);
        
        if (!pdf) {
            return res.status(400).json({ message: 'PDF not found' });
        }
        
        if (pdf.uploadedBy.toString() !== req.user._id.toString() && !pdf.sharedWith.includes(req.user._id)) {
            return res.status(400).json({ message: 'Sorry you are not authorized to access this PDF' });
        }
        
        res.status(200).json({
            id: pdf._id,
            title: pdf.title,
            url: pdf.cloudinaryUrl,
            uploadedBy: pdf.uploadedBy,
            createdAt: pdf.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const deletePDF = async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);
        
        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }
        
        if (pdf.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this PDF' });
        }
        
        await cloudinary.uploader.destroy(pdf.cloudinaryId, { resource_type: 'raw' });
        
        await PDF.findByIdAndDelete(pdf._id);
        
        res.status(200).json({ message: 'PDF deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const generateShareLink = async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);
        
        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }
        
        if (pdf.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to share this PDF' });
        }
        
        if (!pdf.shareLink) {
            pdf.shareLink = uuidv4();
            await pdf.save();
        }
        
        const shareUrl = `${process.env.FRONTEND_URL}/shared/${pdf.shareLink}`;
        
        res.status(200).json({ shareUrl });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getPDFByShareLink = async (req, res) => {
    try {
        const pdf = await PDF.findOne({ shareLink: req.params.shareLink });
        
        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found or link is invalid' });
        }
        
        res.status(200).json({
        pdf: {
            id: pdf._id,
            title: pdf.title,
            url: pdf.cloudinaryUrl,
            createdAt: pdf.createdAt
        }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};