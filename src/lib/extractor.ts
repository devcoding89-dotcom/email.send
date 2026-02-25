/**
 * Utility functions for email extraction, personalization, and CSV handling.
 */

export function extractEmails(text: string): string[] {
  if (!text) return [];
  
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  const matches = text.match(emailRegex) || [];
  
  const uniqueEmails = Array.from(new Set(matches.map(email => email.toLowerCase())));
  
  return uniqueEmails.filter(email => validateEmailFormat(email));
}

/**
 * Robust email syntax validation using a comprehensive regex.
 */
export function validateEmailFormat(email: string): boolean {
  if (!email || email.length > 254) return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) return false;

  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const domain = parts[1];
  const domainParts = domain.split(".");
  if (domainParts.length < 2) return false;

  return true;
}

export function generateCSV(emails: string[]): string {
  if (!emails.length) return "";
  return "Email Address\n" + emails.join("\n");
}

export function parseCSVContacts(csvText: string): any[] {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];
  
  // Clean headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const results = [];
  
  // Find email column index
  const emailIdx = headers.findIndex(h => h === 'email' || h === 'email address');
  if (emailIdx === -1) return [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parser that handles basic commas
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    
    const email = values[emailIdx];
    if (email && validateEmailFormat(email)) {
      const contact: any = {
        email: email.toLowerCase(),
        firstName: values[headers.indexOf('firstname')] || values[headers.indexOf('first name')] || "",
        lastName: values[headers.indexOf('lastname')] || values[headers.indexOf('last name')] || "",
        company: values[headers.indexOf('company')] || values[headers.indexOf('organization')] || "",
        position: values[headers.indexOf('position')] || values[headers.indexOf('role')] || "Lead"
      };
      results.push(contact);
    }
  }
  
  return results;
}

export function personalizeTemplate(template: string, contact: any): string {
  if (!template) return "";
  let personalized = template;
  const tokens = ['firstName', 'lastName', 'email', 'company', 'position'];
  
  tokens.forEach(token => {
    const regex = new RegExp(`\\{\\{${token}\\}\\}`, 'g');
    personalized = personalized.replace(regex, contact[token] || '');
  });
  
  return personalized;
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
