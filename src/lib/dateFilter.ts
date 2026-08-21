export type DatePreset = 'all' | 'today' | '7d' | '30d' | '3m' | '12m' | 'custom';

export interface DateRange {
  preset: DatePreset;
  from: Date | null;
  to: Date | null;
}

export const DATE_RANGE_ALL: DateRange = { preset: 'all', from: null, to: null };

export const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'all',    label: 'Tout'    },
  { value: 'today',  label: 'Auj.'    },
  { value: '7d',     label: '7j'      },
  { value: '30d',    label: '30j'     },
  { value: '3m',     label: '3 mois'  },
  { value: '12m',    label: '12 mois' },
  { value: 'custom', label: 'Perso.'  },
];

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

function subDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
}

function subMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() - n);
  return r;
}

export function presetToRange(preset: DatePreset): { from: Date | null; to: Date | null } {
  const now = new Date();
  switch (preset) {
    case 'today': return { from: startOfDay(now),              to: endOfDay(now) };
    case '7d':    return { from: startOfDay(subDays(now, 6)),  to: endOfDay(now) };
    case '30d':   return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    case '3m':    return { from: startOfDay(subMonths(now, 3)),to: endOfDay(now) };
    case '12m':   return { from: startOfDay(subMonths(now, 12)), to: endOfDay(now) };
    default:      return { from: null, to: null };
  }
}

export function getDateRangeBounds(range: DateRange): { from: Date | null; to: Date | null } {
  if (range.preset === 'all') return { from: null, to: null };
  if (range.preset === 'custom') return { from: range.from, to: range.to };
  return presetToRange(range.preset);
}

export function isInDateRange(dateStr: string | null | undefined, range: DateRange): boolean {
  const bounds = getDateRangeBounds(range);
  if (!bounds.from && !bounds.to) return true;
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (bounds.from && d < bounds.from) return false;
  if (bounds.to && d > bounds.to) return false;
  return true;
}

export function dateRangeLabel(range: DateRange): string {
  switch (range.preset) {
    case 'all':   return 'Tout le temps';
    case 'today': return "Aujourd'hui";
    case '7d':    return '7 derniers jours';
    case '30d':   return '30 derniers jours';
    case '3m':    return '3 derniers mois';
    case '12m':   return '12 derniers mois';
    case 'custom': {
      if (range.from && range.to) {
        const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
        return `${fmt(range.from)} → ${fmt(range.to)}`;
      }
      return 'Personnalisé';
    }
    default: return '';
  }
}

// Sérialisation URL — permet de transmettre la période entre pages via query params
export function periodToSearchParams(range: DateRange): string {
  if (range.preset === 'all') return '';
  const params = new URLSearchParams();
  params.set('period', range.preset);
  if (range.preset === 'custom') {
    if (range.from) params.set('from', range.from.toISOString().split('T')[0]);
    if (range.to) params.set('to', range.to.toISOString().split('T')[0]);
  }
  return params.toString();
}

export function searchParamsToDateRange(params: URLSearchParams): DateRange {
  const preset = params.get('period') as DatePreset | null;
  if (!preset || preset === 'all') return DATE_RANGE_ALL;
  if (preset === 'custom') {
    const fromStr = params.get('from');
    const toStr = params.get('to');
    return {
      preset: 'custom',
      from: fromStr ? new Date(fromStr + 'T00:00:00') : null,
      to: toStr ? new Date(toStr + 'T23:59:59') : null,
    };
  }
  const { from, to } = presetToRange(preset);
  return { preset, from, to };
}

// Construire un lien avec période + params additionnels
export function buildFilteredUrl(basePath: string, range: DateRange, extra?: Record<string, string>): string {
  const params = new URLSearchParams();
  if (range.preset !== 'all') {
    params.set('period', range.preset);
    if (range.preset === 'custom') {
      if (range.from) params.set('from', range.from.toISOString().split('T')[0]);
      if (range.to) params.set('to', range.to.toISOString().split('T')[0]);
    }
  }
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => params.set(k, v));
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
