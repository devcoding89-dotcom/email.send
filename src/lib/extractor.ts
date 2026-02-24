
export function extractEmails(text: string): string[] {
  if (!text) return [];
  
  // Standard email regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];
  
  // Normalize to lowercase and remove duplicates
  const uniqueEmails = Array.from(new Set(matches.map(email => email.toLowerCase())));
  
  return uniqueEmails;
}

export function validateEmailFormat(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function generateCSV(emails: string[]): string {
  if (!emails.length) return "";
  return "Email\n" + emails.join("\n");
}

export function downloadFile(content: string, fileName: string, contentType: string) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}
