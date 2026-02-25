'use server';

import nodemailer from 'nodemailer';
import { validateEmailFormat } from '@/lib/extractor';

/**
 * Sends a personalized campaign email using SMTP via Nodemailer.
 * Performs a final server-side validation check before transmission.
 */
export async function sendCampaignEmail(to: string, subject: string, body: string) {
  // 1. Validation Check
  if (!validateEmailFormat(to)) {
    return { success: false, status: 'failed', error: 'Invalid email format' };
  }

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Simulation mode if credentials are missing
  if (!user || !pass) {
    // Add a slight delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, status: 'simulated' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
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
