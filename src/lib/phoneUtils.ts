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
