export const WHATSAPP_CONTACT_NUMBER = '243997173630';

function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `243${digits.slice(1)}`;
  if (digits.length === 9) return `243${digits}`;

  return digits;
}

export function createWhatsAppUrl(message: string, phone?: string): string {
  const recipient = phone ? normalizeWhatsAppPhone(phone) : '';
  const path = recipient ? `/${recipient}` : '';
  return `https://wa.me${path}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string, phone?: string): void {
  window.open(createWhatsAppUrl(message, phone), '_blank', 'noopener,noreferrer');
}
