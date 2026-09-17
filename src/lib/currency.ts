export type DeviseCode = 'XOF' | 'EUR' | 'USD';

export interface ExchangeRates {
  XOF: number;
  EUR: number;
  USD: number;
}

// Taux de conversion centralisés (base: XOF)
// TODO: Remplacer par un appel API backend (ex: GET /api/exchange-rates)
const RATES_FROM_XOF: ExchangeRates = {
  XOF: 1,
  EUR: 0.00152,   // 1 XOF ≈ 0.00152 EUR (taux fixe FCFA/EUR ≈ 655.957)
  USD: 0.00166,   // 1 XOF ≈ 0.00166 USD
};

export function convertAmount(amount: number, from: DeviseCode, to: DeviseCode): number {
  if (from === to) return amount;
  const amountInXOF = from === 'XOF' ? amount : amount / RATES_FROM_XOF[from];
  return Math.round(amountInXOF * RATES_FROM_XOF[to]);
}

export function formatAmount(amount: number, devise: DeviseCode): string {
  const formatted = new Intl.NumberFormat('fr-FR').format(amount);
  switch (devise) {
    case 'XOF': return `${formatted} FCFA`;
    case 'EUR': return `${formatted} €`;
    case 'USD': return `${formatted} $`;
  }
}

export function getDeviseSymbol(devise: DeviseCode): string {
  switch (devise) {
    case 'XOF': return 'FCFA';
    case 'EUR': return '€';
    case 'USD': return '$';
  }
}

export const DEVISES: { code: DeviseCode; label: string }[] = [
  { code: 'XOF', label: 'FCFA' },
  { code: 'EUR', label: 'EUR' },
  { code: 'USD', label: 'USD' },
];

const EUROPE_TZ_PREFIXES = ['Europe/', 'Atlantic/Canary', 'Atlantic/Faroe', 'Atlantic/Madeira', 'Atlantic/Reykjavik'];
const AMERICAS_TZ_PREFIXES = ['America/', 'US/', 'Canada/', 'Pacific/Honolulu'];

export function detectDevise(): DeviseCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (EUROPE_TZ_PREFIXES.some(p => tz.startsWith(p))) return 'EUR';
    if (AMERICAS_TZ_PREFIXES.some(p => tz.startsWith(p))) return 'USD';
  } catch {}
  return 'XOF';
}
