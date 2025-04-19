import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export const sendInvitationEmails = async ({ emails, shareUrl, pdfTitle }) => {
  if (!emails || emails.length === 0) return { sentTo: [], failed: [] };

  const sentTo = [];
  const failed = [];
  
  for (const email of emails) {
    const personalizedLink = `${shareUrl}?email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: `"PDF Share" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `You've been invited to view: ${pdfTitle}`,
      html: `
        <p>Hello,</p>
        <p>You have been invited to view the PDF titled <strong>${pdfTitle}</strong>.</p>
        <p>Click the link below to access it:</p>
        <p><a href="${personalizedLink}" target="_blank">${personalizedLink}</a></p>
        <p>This link does not require an account to access.</p>
        <br>
        <p>Regards,<br>JuriDocs</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Invitation email sent to: ${email}, ${personalizedLink}`);
      sentTo.push(email);
    } catch (err) {
      console.error(`Failed to send email to ${email}:`, err.message);
      failed.push(email);
    }
  }

  return { sentTo, failed };
};

export default sendInvitationEmails;