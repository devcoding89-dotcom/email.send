/**
 * Utility functions for email extraction and file handling.
 */

export function extractEmails(text: string): string[] {
  if (!text) return [];
  
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  const matches = text.match(emailRegex) || [];
  
  const uniqueEmails = Array.from(new Set(matches.map(email => email.toLowerCase())));
  
  return uniqueEmails.filter(email => {
    return email.length >= 5 && (email.match(/@/g) || []).length === 1;
  });
}

export function validateEmailFormat(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function generateCSV(emails: string[]): string {
  if (!emails.length) return "";
  return "Email Address\n" + emails.join("\n");
}

export function parseCSVContacts(csvText: string): any[] {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const contact: any = {};
    
    headers.forEach((header, index) => {
      contact[header] = values[index] || "";
    });
    
    if (contact.email) {
      results.push(contact);
    }
  }
  
  return results;
}

export function personalizeTemplate(template: string, contact: any): string {
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
