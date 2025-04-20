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

export const sendResetPasswordEmail = async (email, resetLink) => {
  const mailOptions = {
    from: `"JuriDocs" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Reset Your JuriDocs Password',
    html: `
      <p>Hello,</p>
      <p>You requested to reset your JuriDocs password.</p>
      <p>Click the link below to reset it. This link will expire in 10 minutes.</p>
      <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
      <br>
      <p>If you didn't request this, please ignore this email.</p>
      <br>
      <p>— JuriDocs</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reset password email sent to: ${email}`);
  } catch (error) {
    console.error(`Failed to send reset email to ${email}:`, error.message);
    throw new Error('Failed to send reset email.');
  }
};