
'use server';

import nodemailer from 'nodemailer';

/**
 * Sends a personalized campaign email using SMTP via Nodemailer.
 * Requires EMAIL_USER and EMAIL_PASS environment variables.
 */
export async function sendCampaignEmail(to: string, subject: string, body: string) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Simulation mode if credentials are missing
  if (!user || !pass) {
    return { success: true, status: 'simulated' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Standard default for quick setup
      auth: {
        user: user,
        pass: pass,
      },
    });

    await transporter.sendMail({
      from: `"Scoutier Outreach" <${user}>`,
      to,
      subject,
      text: body,
    });

    return { success: true, status: 'sent' };
  } catch (error: any) {
    console.error('Nodemailer error:', error);
    return { success: false, status: 'failed', error: error.message };
  }
}
