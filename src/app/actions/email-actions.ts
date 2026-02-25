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

  // Configuration check
  if (!user || !pass || user === 'your-brevo-email@example.com' || user.includes('REPLACE')) {
    return { 
      success: false, 
      status: 'failed',
      error: 'SMTP Configuration Required: Please update your credentials in the .env file.'
    };
  }

  try {
    // Brevo SMTP Relay Configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: user,
        pass: pass,
      },
      tls: {
        // Brevo requires TLS, this ensures connection stability
        rejectUnauthorized: false 
      }
    });

    // Send the email
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
      userFriendlyError = `Authentication Failed: Please ensure your Brevo email (${user}) and SMTP key are correct in the .env file.`;
    } else if (error.message.includes('unauthorized sender')) {
      userFriendlyError = `Sender Error: The address ${user} must be a verified sender in your Brevo account.`;
    } else if (error.code === 'ETIMEDOUT') {
      userFriendlyError = "Connection Timeout: Could not reach Brevo SMTP servers.";
    } else {
      userFriendlyError = `SMTP Error: ${error.message}`;
    }

    return { 
      success: false, 
      status: 'failed', 
      error: userFriendlyError 
    };
  }
}
