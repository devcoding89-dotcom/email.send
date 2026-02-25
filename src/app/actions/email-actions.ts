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

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Simulation mode check: only simulate if credentials are missing or default
  if (!user || !pass || user.includes('example.com')) {
    console.log('SMTP Simulation Mode: Please set your real Brevo email in .env');
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      success: true, 
      status: 'simulated',
      message: 'Email simulated. Update .env with your real Brevo email to send for real.'
    };
  }

  try {
    // Brevo SMTP Relay Configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
      tls: {
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
    if (error.message.includes('Authentication failed') || error.message.includes('Invalid login')) {
      userFriendlyError = "SMTP Auth Error: Your EMAIL_USER must be your Brevo login email. Check .env.";
    } else if (error.message.includes('unauthorized sender')) {
      userFriendlyError = `Sender error: ${user} is not a verified sender in Brevo.`;
    }

    return { 
      success: false, 
      status: 'failed', 
      error: userFriendlyError 
    };
  }
}
