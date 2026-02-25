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
  // 1. Level 1: Syntax Validation
  if (!validateEmailFormat(to)) {
    return { success: false, status: 'failed', error: 'Invalid email syntax' };
  }

  // 2. Level 2: Domain MX Validation
  const domainValid = await hasMXRecord(to);
  if (!domainValid) {
    return { success: false, status: 'failed', error: 'Recipient domain has no valid mail servers (MX)' };
  }

  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();

  // Basic check for existence of credentials
  if (!user || !pass) {
    return { 
      success: false, 
      status: 'failed',
      error: 'SMTP Configuration Missing: Please ensure EMAIL_USER and EMAIL_PASS are set in your .env file.'
    };
  }

  try {
    // Brevo SMTP Relay Configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // TLS (use upgrade via STARTTLS)
      auth: {
        user: user,
        pass: pass,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      }
    });

    // Send the email
    // IMPORTANT: Brevo requires the 'from' address to be a verified sender in your account.
    await transporter.sendMail({
      from: `"Scoutier Outreach" <${user}>`,
      to,
      subject,
      text: body,
    });

    return { success: true, status: 'sent' };
  } catch (error: any) {
    console.error('SMTP Error:', error.message);
    
    let userFriendlyError = "Failed to send email.";
    
    // Catch common authentication errors
    if (error.message.includes('Authentication failed') || error.message.includes('Invalid login') || error.code === 'EAUTH') {
      userFriendlyError = `Authentication Failed: Brevo rejected the credentials for ${user}. Please double-check your SMTP Key (Master Password) in Brevo Settings.`;
    } else if (error.message.includes('unauthorized sender')) {
      userFriendlyError = `Sender Error: The address ${user} must be a verified sender in your Brevo account dashboard.`;
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
