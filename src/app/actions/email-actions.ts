'use server';

import nodemailer from 'nodemailer';
import { validateEmailFormat } from '@/lib/extractor';
import { promises as dns } from 'dns';

/**
 * Checks if a domain has valid MX records.
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
 */
export async function sendCampaignEmail(to: string, subject: string, body: string) {
  // Get credentials from environment
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  const senderEmail = process.env.SENDER_EMAIL?.trim() || user;

  // Validate presence of keys
  if (!user || !pass) {
    console.error('SMTP ERROR: Missing credentials in .env');
    return { 
      success: false, 
      status: 'failed',
      error: 'SMTP Configuration Missing: Check EMAIL_USER and EMAIL_PASS in .env'
    };
  }

  // 1. Level 1: Syntax Validation
  if (!validateEmailFormat(to)) {
    return { success: false, status: 'failed', error: 'Invalid email syntax' };
  }

  // 2. Level 2: Domain MX Validation
  const domainValid = await hasMXRecord(to);
  if (!domainValid) {
    return { success: false, status: 'failed', error: 'Recipient domain has no valid mail servers (MX)' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // Must be false for 587 (TLS upgrade)
      auth: {
        user: user,
        pass: pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Send the email
    await transporter.sendMail({
      from: `"Scoutier Outreach" <${senderEmail}>`,
      to,
      subject,
      text: body,
    });

    return { success: true, status: 'sent' };
  } catch (error: any) {
    console.error('SMTP Error Detail:', error.message);
    
    let userFriendlyError = "Failed to send email.";
    
    if (error.message.includes('Authentication failed') || error.code === 'EAUTH') {
      userFriendlyError = `Authentication Failed: Brevo rejected your Login ID or Password.`;
    } else if (error.message.includes('unauthorized sender')) {
      userFriendlyError = `Sender Error: ${senderEmail} must be a verified sender in Brevo.`;
    } else {
      userFriendlyError = `Mail Error: ${error.message}`;
    }

    return { 
      success: false, 
      status: 'failed', 
      error: userFriendlyError 
    };
  }
}