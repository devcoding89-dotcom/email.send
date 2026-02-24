
/**
 * Utility functions for email extraction and file handling.
 */

export function extractEmails(text: string): string[] {
  if (!text) return [];
  
  // Robust email regex that handles most standard formats
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  const matches = text.match(emailRegex) || [];
  
  // Normalize to lowercase and remove duplicates
  const uniqueEmails = Array.from(new Set(matches.map(email => email.toLowerCase())));
  
  // Filter out any obvious false positives (optional: add more validation if needed)
  return uniqueEmails.filter(email => {
    // Simple length check and ensuring it contains exactly one @
    return email.length >= 5 && (email.match(/@/g) || []).length === 1;
  });
}

export function validateEmailFormat(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function generateCSV(emails: string[]): string {
  if (!emails.length) return "";
  // Header and rows
  return "Email Address\n" + emails.join("\n");
}

export function downloadFile(content: string, fileName: string, contentType: string) {
  if (typeof document === 'undefined') return;
  
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
