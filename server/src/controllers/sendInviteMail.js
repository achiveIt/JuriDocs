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

    const shareUrl = `${process.env.FRONTEND_URL}/shared/invite/${pdf.shareLink}`;

    const { emails } = req.body;
    if (emails && Array.isArray(emails)) {
      await sendInvitationEmails({ emails, shareUrl, pdfTitle: pdf.title });
    }

    res.status(200).json({ shareUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
