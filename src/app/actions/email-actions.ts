'use server';

import nodemailer from 'nodemailer';
import { validateEmailFormat } from '@/lib/extractor';
import { promises as dns } from 'dns';

/**
 * Checks if a domain has valid MX records.
 * This ensures the recipient domain is actually capable of receiving mail.
 */
async function hasMXRecord(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  try {
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch (err) {
    return false;
  }
}

/**
 * Sends a personalized campaign email using Brevo SMTP.
 * Performs a multi-level validation check (Syntax + Domain MX) before transmission.
 */
export async function sendCampaignEmail(to: string, subject: string, body: string) {
  // 1. Level 1: Syntax Validation
  if (!validateEmailFormat(to)) {
    return { success: false, status: 'failed', error: 'Invalid email syntax' };
  }

  // 2. Level 2: Domain MX Validation
  const domainValid = await hasMXRecord(to);
  if (!domainValid) {
    return { success: false, status: 'failed', error: 'Recipient domain has no valid mail servers (MX)' };
  }

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Simulation mode if credentials are missing
  if (!user || !pass) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, status: 'simulated' };
  }

  try {
    // Configure for Brevo SMTP Relay
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: {
        user: user, // Usually your Brevo account email
        pass: pass, // Your Brevo API Key
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
    console.error('SMTP error:', error);
    return { success: false, status: 'failed', error: error.message || 'SMTP Transmission Error' };
  }
}
