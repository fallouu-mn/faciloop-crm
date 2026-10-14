/**
 * Formatters partagés (affichage uniquement).
 *
 * Règle d'or : la donnée stockée en base reste brute / E.164 (ex: `+221771234567`).
 * Ces fonctions ne servent qu'au rendu visuel — jamais à écrire en base.
 */

/* ──────────────────────────────────────────────────────────────
 * Pays
 * ────────────────────────────────────────────────────────────── */

export const PAYS = [
  'Sénégal', "Côte d'Ivoire", 'Mali', 'Burkina Faso', 'Guinée',
  'Cameroun', 'Bénin', 'Togo', 'Niger',
  'Congo', 'Gabon', 'Mauritanie',
  'France', 'Belgique', 'Suisse',
  'Maroc', 'Tunisie', 'Algérie',
  'Rwanda', 'Ouganda', 'Kenya', 'Tanzanie',
  'Canada', 'Royaume-Uni',
  'Autre',
] as const;

/* ──────────────────────────────────────────────────────────────
 * Téléphone
 * ────────────────────────────────────────────────────────────── */

/**
 * Normalise un numéro vers le format E.164 sans espace (`+221771234567`).
 * Anciennement `lib/phoneUtils.formatPhoneNumber` — c'est cette fonction
 * qui doit être utilisée pour la détection de doublons et l'écriture en base.
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';

  let cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');

  // 00221... → +221...
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // 9 chiffres locaux sénégalais (771234567, 711234567) → +221...
  if (/^7[015678]\d{7}$/.test(cleaned)) {
    cleaned = '+221' + cleaned;
  }

  // 9 chiffres locaux sans indicatif pays
  if (!cleaned.startsWith('+') && cleaned.length === 9) {
    cleaned = '+221' + cleaned;
  }

  // Indicatif pays manquant
  if (!cleaned.startsWith('+') && cleaned.length >= 8) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
};

/** Groupes de chiffres attendus après l'indicatif pays, par indicatif. */
const PHONE_GROUPS: Record<string, number[]> = {
  '221': [2, 3, 2, 2], // Sénégal   → +221 77 123 45 67
  '225': [2, 3, 2, 3], // Côte d'Ivoire → +225 07 123 456 78
  '223': [2, 2, 2, 2], // Mali
  '226': [2, 2, 2, 2], // Burkina Faso
  '224': [2, 3, 2, 2], // Guinée
  '237': [2, 3, 2, 2], // Cameroun
  '229': [2, 2, 2, 2], // Bénin
  '228': [2, 2, 2, 2], // Togo
  '227': [2, 2, 2, 2], // Niger
  '242': [2, 3, 2, 2], // Congo
  '243': [2, 3, 2, 2], // Congo (RDC)
  '241': [2, 2, 2, 2], // Gabon
  '222': [2, 2, 2, 2], // Mauritanie
  '33': [1, 2, 2, 2, 2], // France  → +33 6 12 34 56 78
  '32': [3, 2, 2, 2],  // Belgique → +32 475 12 34 56
  '41': [2, 3, 2, 2],  // Suisse   → +41 79 123 45 67
  '212': [1, 2, 2, 2, 2], // Maroc → +212 6 12 34 56 78
  '216': [2, 3, 3],    // Tunisie  → +216 98 123 456
  '213': [3, 2, 2, 2], // Algérie  → +213 555 12 34 56
  '250': [3, 3, 3],    // Rwanda   → +250 788 123 456
  '256': [3, 3, 3],    // Ouganda  → +256 772 123 456
  '254': [3, 3, 3],    // Kenya    → +254 712 123 456
  '255': [3, 3, 3],    // Tanzanie → +255 712 123 456
  '1': [3, 3, 4],      // USA/Canada → +1 514 123 4567
  '44': [4, 3, 3],     // UK → +44 7911 123 456
};

/** Les indicatifs les plus longs d'abord (le match est un prefixe). */
const DIAL_CODES = Object.keys(PHONE_GROUPS).sort((a, b) => b.length - a.length);

function groupDigits(digits: string, groups: number[] | null): string {
  const chunks: string[] = [];
  if (groups) {
    let i = 0;
    for (const size of groups) {
      if (i >= digits.length) break;
      chunks.push(digits.slice(i, i + size));
      i += size;
    }
    if (i < digits.length) chunks.push(digits.slice(i));
    return chunks.filter(Boolean).join(' ');
  }
  // Fallback générique : paires (1 seul chiffre devant si le total est impair)
  let i = 0;
  if (digits.length % 2 === 1) {
    chunks.push(digits[0]);
    i = 1;
  }
  for (; i < digits.length; i += 2) chunks.push(digits.slice(i, i + 2));
  return chunks.filter(Boolean).join(' ');
}

/**
 * Formate visuellement un numéro pour l'affichage.
 * `+221771234567` → `+221 77 123 45 67`
 * Ne modifie jamais la donnée stockée en base.
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const normalized = normalizePhoneNumber(phone);
  if (!normalized.startsWith('+')) return phone;

  const rest = normalized.slice(1);
  const dial = DIAL_CODES.find((c) => rest.startsWith(c));
  const country = dial ?? '';
  const subscriber = rest.slice(country.length);

  if (!/^\d+$/.test(subscriber)) return phone;
  if (country && subscriber.length === 0) return `+${country}`;

  const grouped = groupDigits(subscriber, country ? PHONE_GROUPS[country] : null);
  return `+${country} ${grouped}`.trim();
};

/* ──────────────────────────────────────────────────────────────
 * Noms / libellés
 * ────────────────────────────────────────────────────────────── */

/**
 * Concatène prénom + nom avec un fallback si les champs sont vides.
 * Les champs `nom` / `prenom` / `entreprise` sont optionnels depuis le
 * retour client n°5 — on affiche « Inconnu » plutôt qu'une cellule vide.
 */
export const fullName = (
  person: { prenom?: string; nom?: string },
  fallback = 'Inconnu',
): string => {
  const full = `${person.prenom || ''} ${person.nom || ''}`.trim();
  return full || fallback;
};

/** Libellé d'une ligne prospect/entreprise avec fallback visuel. */
export const orFallback = (value?: string | null, fallback = '—'): string =>
  value && value.trim() ? value : fallback;

/* ──────────────────────────────────────────────────────────────
 * Dates
 * ────────────────────────────────────────────────────────────── */

const MONTHS_SHORT_FR = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
];
const MONTHS_SHORT_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Affiche une date ISO (`YYYY-MM-DD`) avec son heure éventuelle :
 * `12 Oct 2026 à 14:30` (fr) / `12 Oct 2026 at 14:30` (en)
 */
export const formatDateWithTime = (
  date?: string | null,
  heure?: string | null,
  lang: 'fr' | 'en' = 'fr',
): string => {
  if (!date) return '';
  const [y, m, d] = date.split('T')[0].split('-').map(Number);
  if (!y || !m || !d) return date;
  const months = lang === 'en' ? MONTHS_SHORT_EN : MONTHS_SHORT_FR;
  const label = `${d} ${months[m - 1]} ${y}`;
  const time = heure || (date.includes('T') ? date.split('T')[1].slice(0, 5) : '');
  if (!time) return label;
  return lang === 'en' ? `${label} at ${time}` : `${label} à ${time}`;
};

/* ──────────────────────────────────────────────────────────────
 * datetime-local helpers (Point 10 — créneaux horaires)
 * ────────────────────────────────────────────────────────────── */

/** `2026-10-12` + `14:30` → `2026-10-12T14:30` (valeur d'un input datetime-local) */
export const toDateTimeLocal = (date?: string | null, heure?: string | null): string => {
  if (!date) return '';
  return heure ? `${date}T${heure}` : date;
};

/** `2026-10-12T14:30` → `{ date: '2026-10-12', heure: '14:30' }` */
export const splitDateTimeLocal = (
  value: string,
): { date: string; heure?: string } => {
  if (!value) return { date: '' };
  const [date, heure] = value.split('T');
  return { date, heure: heure || undefined };
};
