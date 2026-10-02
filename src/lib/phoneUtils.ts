/**
 * Normalizes phone numbers to standard E.164 international format.
 * Defaults to +221 (Senegal) for 9-digit local numbers starting with 7.
 * Removes spaces, dashes, parentheses and double zeros.
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove spaces, dashes, parentheses
  let cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');

  // Convert 00221... to +221...
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // If 9 digits starting with 7 (e.g. 771234567), prefix with +221
  if (/^7[05678]\d{7}$/.test(cleaned)) {
    cleaned = '+221' + cleaned;
  }

  // If 9 digits without leading + or country code
  if (!cleaned.startsWith('+') && cleaned.length === 9) {
    cleaned = '+221' + cleaned;
  }

  // Add leading + if missing for international numbers
  if (!cleaned.startsWith('+') && cleaned.length >= 8) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
};

export const displayPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const normalized = formatPhoneNumber(phone);

  // +221 77 123 45 67
  const sn = normalized.match(/^\+221(\d{2})(\d{3})(\d{2})(\d{2})$/);
  if (sn) return `+221 ${sn[1]} ${sn[2]} ${sn[3]} ${sn[4]}`;

  // +225 07 12 34 56 78 (Côte d'Ivoire)
  const ci = normalized.match(/^\+225(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (ci) return `+225 ${ci[1]} ${ci[2]} ${ci[3]} ${ci[4]} ${ci[5]}`;

  // +33 6 12 34 56 78 (France)
  const fr = normalized.match(/^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (fr) return `+33 ${fr[1]} ${fr[2]} ${fr[3]} ${fr[4]} ${fr[5]}`;

  // Fallback: groupes de 2 après l'indicatif
  const m = normalized.match(/^(\+\d{1,3})(\d+)$/);
  if (m) {
    const digits = m[2].match(/.{1,2}/g) || [];
    return `${m[1]} ${digits.join(' ')}`;
  }

  return phone;
};
