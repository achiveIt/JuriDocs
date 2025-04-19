import { v4 as uuidv4 } from 'uuid';
import { PDF } from '../models/pdfModel.js';
import sendInvitationEmails from '../utils/sendMail.js';

export const generateShareLink = async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);

    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    if (pdf.uploadedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to share this PDF' });
    }

    if (!pdf.shareLink) {
      pdf.shareLink = uuidv4();
      await pdf.save();
    }

    const { emails } = req.body;
    if (emails.length === 0) return res.status(200).json({message :"empty mail"});

    let failedEmails = [];

    if (emails && Array.isArray(emails)) {
    const { failed, sentTo } = await sendInvitationEmails({
        emails,
        shareUrl: `${process.env.FRONTEND_URL}/shared/invite/${pdf.shareLink}`,
        pdfTitle: pdf.title,
        });

        pdf.invitedEmails = Array.from(new Set([...(pdf.invitedEmails || []), ...sentTo]));
        failedEmails = failed;
        }

        await pdf.save();

    res.status(200).json({
        shareUrl: `${process.env.FRONTEND_URL}/shared/invite/${pdf.shareLink}`,
        failedEmails,
    });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
  
export const accessSharedPdf = async (req, res) => {
    const { shareLink } = req.params;
    const { email } = req.query;

    const pdf = await PDF.findOne({ shareLink });
  
    if (!pdf) {
      return res.status(404).json({ message: 'Invalid or expired link' });
    }
  
    if (!email || !pdf.invitedEmails.includes(email.toLowerCase().trim())) {
      return res.status(403).json({ message: 'You are not authorized to access this PDF' });
    }
  
    res.status(200).json({
        pdf: {
            id: pdf.id,
            title: pdf.title,
            url: pdf.cloudinaryUrl,
            createdAt: pdf.createdAt
        }
    });
};
  
