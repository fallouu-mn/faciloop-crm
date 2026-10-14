/**
 * Règles de validation et de formatage des numéros de téléphone par pays.
 * Utilisé pour :
 * 1. Valider le format national selon l'indicatif choisi (Sénégal, CI, France, etc.)
 * 2. Bloquer les saisies invalides (ex : taper un numéro français sous l'indicatif +221)
 * 3. Détecter automatiquement le pays lors du collage ou de la saisie d'un indicatif international
 * 4. Fournir des messages d'erreur clairs et localisés
 */

export interface CountryPhoneRule {
  dialCode: string;
  countryCode: string;
  name: string;
  /** Longueur(s) autorisée(s) du numéro local (chiffres uniquement) */
  expectedLengths: number[];
  /** Expression régulière validant le numéro local */
  regex: RegExp;
  placeholder: string;
  example: string;
  formatGroups: number[];
  errorMessageFr: string;
  errorMessageEn: string;
  errorMessageWo: string;
}

export const COUNTRY_PHONE_RULES: Record<string, CountryPhoneRule> = {
  // ── Sénégal (+221) ──────────────────────────────────────────────────────────
  // 9 chiffres locaux. Mobile : 70 (Expresso), 71 (Promobile), 75 (Promobile), 76 (Free), 77 (Orange), 78 (Orange).
  // Fixe : 33 (Sonatel).
  '221': {
    dialCode: '221',
    countryCode: 'SN',
    name: 'Sénégal',
    expectedLengths: [9],
    regex: /^(7[015678]\d{7}|33[89]\d{6})$/,
    placeholder: '77 123 45 67',
    example: '77 123 45 67',
    formatGroups: [2, 3, 2, 2],
    errorMessageFr: 'Le numéro sénégalais (+221) doit comporter 9 chiffres et commencer par 70, 71, 75, 76, 77 ou 78 (ou 338/339 pour un fixe).',
    errorMessageEn: 'Senegalese phone numbers (+221) must have 9 digits and start with 70, 71, 75, 76, 77, or 78.',
    errorMessageWo: 'Limu telfon Senegaal (+221) war na am 9 nimro te tàmbalee 70, 71, 75, 76, 77 wala 78.',
  },

  // ── Côte d'Ivoire (+225) ────────────────────────────────────────────────────
  // Plan à 10 chiffres (depuis 2021). Mobile : 01 (Moov), 05 (MTN), 07 (Orange).
  // Fixe : 21, 25, 27.
  '225': {
    dialCode: '225',
    countryCode: 'CI',
    name: "Côte d'Ivoire",
    expectedLengths: [10],
    regex: /^(0[157]|2[157])\d{8}$/,
    placeholder: '07 12 34 56 78',
    example: '07 12 34 56 78',
    formatGroups: [2, 2, 2, 2, 2],
    errorMessageFr: "Le numéro ivoirien (+225) doit comporter 8 à 10 chiffres (ex : 01, 05, 07 pour mobile, 21, 25, 27 pour fixe).",
    errorMessageEn: 'Ivorian phone numbers (+225) must have 8 to 10 digits (e.g. 01, 05, 07...).',
    errorMessageWo: 'Limu telfon Kot Diwaar (+225) war na am 8 ba 10 nimro (misal : 01, 05, 07...).',
  },

  // ── France (+33) ────────────────────────────────────────────────────────────
  // 9 chiffres (sans le 0 initial) commençant par 1-9 (mobile : 6 ou 7).
  // Si saisi avec 0 initial : 10 chiffres.
  '33': {
    dialCode: '33',
    countryCode: 'FR',
    name: 'France',
    expectedLengths: [9, 10],
    regex: /^0?[1-9]\d{8}$/,
    placeholder: '6 12 34 56 78',
    example: '6 12 34 56 78',
    formatGroups: [1, 2, 2, 2, 2],
    errorMessageFr: 'Le numéro français (+33) doit comporter 9 chiffres (ex : 6 12 34 56 78).',
    errorMessageEn: 'French phone numbers (+33) must have 9 digits (e.g. 6 12 34 56 78).',
    errorMessageWo: 'Limu telfon Faraas (+33) war na am 9 nimro (misal : 6 12 34 56 78).',
  },

  // ── Mali (+223) ────────────────────────────────────────────────────────────
  '223': {
    dialCode: '223',
    countryCode: 'ML',
    name: 'Mali',
    expectedLengths: [8],
    regex: /^[256789]\d{7}$/,
    placeholder: '70 12 34 56',
    example: '70 12 34 56',
    formatGroups: [2, 2, 2, 2],
    errorMessageFr: 'Le numéro malien (+223) doit comporter 8 chiffres.',
    errorMessageEn: 'Malian phone numbers (+223) must have 8 digits.',
    errorMessageWo: 'Limu telfon Mali (+223) war na am 8 nimro.',
  },

  // ── Guinée (+224) ──────────────────────────────────────────────────────────
  '224': {
    dialCode: '224',
    countryCode: 'GN',
    name: 'Guinée',
    expectedLengths: [9],
    regex: /^6\d{8}$/,
    placeholder: '620 12 34 56',
    example: '620 12 34 56',
    formatGroups: [3, 2, 2, 2],
    errorMessageFr: 'Le numéro guinéen (+224) doit comporter 9 chiffres et commencer par 6.',
    errorMessageEn: 'Guinean phone numbers (+224) must have 9 digits and start with 6.',
    errorMessageWo: 'Limu telfon Giné (+224) war na am 9 nimro te tàmbalee 6.',
  },

  // ── Burkina Faso (+226) ────────────────────────────────────────────────────
  '226': {
    dialCode: '226',
    countryCode: 'BF',
    name: 'Burkina Faso',
    expectedLengths: [8],
    regex: /^[0567]\d{7}$/,
    placeholder: '70 12 34 56',
    example: '70 12 34 56',
    formatGroups: [2, 2, 2, 2],
    errorMessageFr: 'Le numéro burkinabè (+226) doit comporter 8 chiffres.',
    errorMessageEn: 'Burkinabe phone numbers (+226) must have 8 digits.',
    errorMessageWo: 'Limu telfon Burkinaa (+226) war na am 8 nimro.',
  },

  // ── Bénin (+229) ───────────────────────────────────────────────────────────
  '229': {
    dialCode: '229',
    countryCode: 'BJ',
    name: 'Bénin',
    expectedLengths: [8, 10],
    regex: /^[4569]\d{7,9}$/,
    placeholder: '97 12 34 56',
    example: '97 12 34 56',
    formatGroups: [2, 2, 2, 2],
    errorMessageFr: 'Le numéro béninois (+229) doit comporter 8 ou 10 chiffres.',
    errorMessageEn: 'Beninese phone numbers (+229) must have 8 or 10 digits.',
    errorMessageWo: 'Limu telfon Benin (+229) war na am 8 wala 10 nimro.',
  },

  // ── Togo (+228) ────────────────────────────────────────────────────────────
  '228': {
    dialCode: '228',
    countryCode: 'TG',
    name: 'Togo',
    expectedLengths: [8],
    regex: /^[79]\d{7}$/,
    placeholder: '90 12 34 56',
    example: '90 12 34 56',
    formatGroups: [2, 2, 2, 2],
    errorMessageFr: 'Le numéro togolais (+228) doit comporter 8 chiffres et commencer par 7 ou 9.',
    errorMessageEn: 'Togolese phone numbers (+228) must have 8 digits and start with 7 or 9.',
    errorMessageWo: 'Limu telfon Togo (+228) war na am 8 nimro te tàmbalee 7 wala 9.',
  },

  // ── Niger (+227) ───────────────────────────────────────────────────────────
  '227': {
    dialCode: '227',
    countryCode: 'NE',
    name: 'Niger',
    expectedLengths: [8],
    regex: /^[789]\d{7}$/,
    placeholder: '90 12 34 56',
    example: '90 12 34 56',
    formatGroups: [2, 2, 2, 2],
    errorMessageFr: 'Le numéro nigérien (+227) doit comporter 8 chiffres.',
    errorMessageEn: 'Nigerien phone numbers (+227) must have 8 digits.',
    errorMessageWo: 'Limu telfon Niseer (+227) war na am 8 nimro.',
  },

  // ── Cameroun (+237) ────────────────────────────────────────────────────────
  '237': {
    dialCode: '237',
    countryCode: 'CM',
    name: 'Cameroun',
    expectedLengths: [9],
    regex: /^[26]\d{8}$/,
    placeholder: '6 90 12 34 56',
    example: '6 90 12 34 56',
    formatGroups: [1, 2, 2, 2, 2],
    errorMessageFr: 'Le numéro camerounais (+237) doit comporter 9 chiffres et commencer par 6 ou 2.',
    errorMessageEn: 'Cameroonian phone numbers (+237) must have 9 digits and start with 6 or 2.',
    errorMessageWo: 'Limu telfon Kamerun (+227) war na am 9 nimro.',
  },

  // ── Gabon (+241) ───────────────────────────────────────────────────────────
  '241': {
    dialCode: '241',
    countryCode: 'GA',
    name: 'Gabon',
    expectedLengths: [8, 9],
    regex: /^[067]\d{7,8}$/,
    placeholder: '66 12 34 56',
    example: '66 12 34 56',
    formatGroups: [2, 2, 2, 2],
    errorMessageFr: 'Le numéro gabonais (+241) doit comporter 8 ou 9 chiffres.',
    errorMessageEn: 'Gabonese phone numbers (+241) must have 8 or 9 digits.',
    errorMessageWo: 'Limu telfon Gaboŋ (+241) war na am 8 wala 9 nimro.',
  },

  // ── Maroc (+212) ───────────────────────────────────────────────────────────
  '212': {
    dialCode: '212',
    countryCode: 'MA',
    name: 'Maroc',
    expectedLengths: [9, 10],
    regex: /^0?[567]\d{8}$/,
    placeholder: '6 12 34 56 78',
    example: '6 12 34 56 78',
    formatGroups: [1, 2, 2, 2, 2],
    errorMessageFr: 'Le numéro marocain (+212) doit comporter 9 chiffres (commençant par 5, 6 ou 7).',
    errorMessageEn: 'Moroccan phone numbers (+212) must have 9 digits.',
    errorMessageWo: 'Limu telfon Marok (+212) war na am 9 nimro.',
  },

  // ── Tunisie (+216) ─────────────────────────────────────────────────────────
  '216': {
    dialCode: '216',
    countryCode: 'TN',
    name: 'Tunisie',
    expectedLengths: [8],
    regex: /^[2459]\d{7}$/,
    placeholder: '98 123 456',
    example: '98 123 456',
    formatGroups: [2, 3, 3],
    errorMessageFr: 'Le numéro tunisien (+216) doit comporter 8 chiffres.',
    errorMessageEn: 'Tunisian phone numbers (+216) must have 8 digits.',
    errorMessageWo: 'Limu telfon Tinnisi (+216) war na am 8 nimro.',
  },

  // ── Algérie (+213) ─────────────────────────────────────────────────────────
  '213': {
    dialCode: '213',
    countryCode: 'DZ',
    name: 'Algérie',
    expectedLengths: [9, 10],
    regex: /^0?[567]\d{8}$/,
    placeholder: '555 12 34 56',
    example: '555 12 34 56',
    formatGroups: [3, 2, 2, 2],
    errorMessageFr: 'Le numéro algérien (+213) doit comporter 9 chiffres.',
    errorMessageEn: 'Algerian phone numbers (+213) must have 9 digits.',
    errorMessageWo: 'Limu telfon Alseeri (+213) war na am 9 nimro.',
  },

  // ── USA / Canada (+1) ──────────────────────────────────────────────────────
  '1': {
    dialCode: '1',
    countryCode: 'US',
    name: 'États-Unis / Canada',
    expectedLengths: [10],
    regex: /^[2-9]\d{9}$/,
    placeholder: '514 123 4567',
    example: '514 123 4567',
    formatGroups: [3, 3, 4],
    errorMessageFr: 'Le numéro nord-américain (+1) doit comporter 10 chiffres.',
    errorMessageEn: 'North American phone numbers (+1) must have 10 digits.',
    errorMessageWo: 'Limu telfon Amerig/Kanada (+1) war na am 10 nimro.',
  },
};

/**
 * Récupère les règles spécifiques d'un pays par son indicatif, ou une règle générique de repli.
 */
export function getCountryPhoneRule(dialCode: string): CountryPhoneRule {
  const cleanDial = dialCode.replace(/\D/g, '');
  if (COUNTRY_PHONE_RULES[cleanDial]) {
    return COUNTRY_PHONE_RULES[cleanDial];
  }

  // Règle internationale générique (E.164)
  return {
    dialCode: cleanDial,
    countryCode: '',
    name: 'International',
    expectedLengths: [6, 7, 8, 9, 10, 11, 12, 13, 14],
    regex: /^\d{6,14}$/,
    placeholder: '12 34 56 78',
    example: '12 34 56 78',
    formatGroups: [2, 2, 2, 2],
    errorMessageFr: `Veuillez renseigner un numéro de téléphone valide pour l'indicatif +${cleanDial}.`,
    errorMessageEn: `Please enter a valid phone number for country code +${cleanDial}.`,
    errorMessageWo: `Joxleen limu telfon bu sax ngir wii kood (+${cleanDial}).`,
  };
}

/**
 * Normalise le numéro local en enlevant les espaces et le préfixe zéro superflu
 * (ex: pour la France '0614578547' -> '614578547').
 */
export function normalizeLocalPhone(dialCode: string, rawLocal: string): string {
  let cleaned = rawLocal.replace(/\D/g, '');
  const cleanDial = dialCode.replace(/\D/g, '');

  // France / Maroc / Algérie : retirer le 0 initial en format international
  if ((cleanDial === '33' || cleanDial === '212' || cleanDial === '213') && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  return cleaned;
}

/**
 * Valide un numéro local selon l'indicatif du pays sélectionné.
 */
export function validatePhoneForCountry(
  dialCode: string,
  rawLocalNumber: string,
  lang: string = 'fr'
): { isValid: boolean; message?: string; normalizedLocal: string } {
  const cleanDial = dialCode.replace(/\D/g, '');
  const digitsOnly = rawLocalNumber.replace(/\D/g, '');

  if (!digitsOnly) {
    const emptyMsg =
      lang === 'wo'
        ? 'Duggalal limu telfon bi'
        : lang === 'en'
        ? 'Please enter a phone number'
        : 'Veuillez saisir un numéro de téléphone';
    return { isValid: false, message: emptyMsg, normalizedLocal: '' };
  }

  const rule = getCountryPhoneRule(cleanDial);
  const isValid = rule.regex.test(digitsOnly);
  const normalized = normalizeLocalPhone(cleanDial, digitsOnly);

  if (!isValid) {
    const msg =
      lang === 'wo'
        ? rule.errorMessageWo
        : lang === 'en'
        ? rule.errorMessageEn
        : rule.errorMessageFr;
    return { isValid: false, message: msg, normalizedLocal: normalized };
  }

  return { isValid: true, normalizedLocal: normalized };
}

/**
 * Formate visuellement les chiffres selon les groupes du pays.
 */
export function formatLocalDigits(dialCode: string, digits: string): string {
  const clean = digits.replace(/\D/g, '');
  if (!clean) return '';

  const rule = getCountryPhoneRule(dialCode);
  let groups = rule.formatGroups;
  // Si numéro français ou maghrébin saisi avec le 0 initial (ex: 06 14 57 85 47), grouper par paires de 2
  if ((rule.dialCode === '33' || rule.dialCode === '212' || rule.dialCode === '213') && clean.startsWith('0')) {
    groups = [2, 2, 2, 2, 2];
  }

  const chunks: string[] = [];
  let i = 0;
  for (const size of groups) {
    if (i >= clean.length) break;
    chunks.push(clean.slice(i, i + size));
    i += size;
  }
  if (i < clean.length) {
    chunks.push(clean.slice(i));
  }

  return chunks.join(' ');
}

/**
 * Longueur maximale autorisée pour la saisie locale du pays.
 */
export function getMaxLocalLength(dialCode: string): number {
  const rule = getCountryPhoneRule(dialCode);
  const maxDigits = Math.max(...rule.expectedLengths);
  // Pour la France (+33), on autorise 10 si commencé par 0
  if (rule.dialCode === '33' || rule.dialCode === '212' || rule.dialCode === '213') {
    return 10;
  }
  return maxDigits;
}
