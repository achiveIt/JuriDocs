import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export const sendInvitationEmails = async ({ emails, shareUrl, pdfTitle }) => {
  if (!emails || emails.length === 0) return;

  const mailOptions = {
    from: `"PDF Share" <${process.env.MAIL_USER}>`,
    to: emails.join(','),
    subject: `You've been invited to view: ${pdfTitle}`,
    html: `
      <p>Hello,</p>
      <p>You have been invited to view the PDF titled <strong>${pdfTitle}</strong>.</p>
      <p>Click the link below to access it:</p>
      <p><a href="${shareUrl}" target="_blank">${shareUrl}</a></p>
      <p>This link does not require an account to access.</p>
      <br>
      <p>Regards,<br>JuriDocs</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Invitation email sent to:', emails);
  } catch (err) {
    console.error('Error sending invitation email:', err);
    throw new Error('Failed to send emails');
  }
};

export default sendInvitationEmails;