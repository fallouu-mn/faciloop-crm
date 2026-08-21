import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DateRange, DatePreset, DATE_PRESETS, DATE_RANGE_ALL, presetToRange } from '../../lib/dateFilter';

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export const PeriodFilter: React.FC<Props> = ({ value, onChange }) => {
  const [customFrom, setCustomFrom] = useState(
    value.preset === 'custom' && value.from ? value.from.toISOString().split('T')[0] : ''
  );
  const [customTo, setCustomTo] = useState(
    value.preset === 'custom' && value.to ? value.to.toISOString().split('T')[0] : ''
  );

  function handlePreset(preset: DatePreset) {
    if (preset === 'custom') {
      onChange({ preset: 'custom', from: null, to: null });
      return;
    }
    const { from, to } = presetToRange(preset);
    onChange({ preset, from, to });
  }

  function applyCustom() {
    const from = customFrom ? new Date(customFrom + 'T00:00:00') : null;
    const to = customTo ? new Date(customTo + 'T23:59:59') : null;
    onChange({ preset: 'custom', from, to });
  }

  function reset() {
    setCustomFrom('');
    setCustomTo('');
    onChange(DATE_RANGE_ALL);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {DATE_PRESETS.map(p => (
          <button
            key={p.value}
            type="button"
            onClick={() => handlePreset(p.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all whitespace-nowrap ${
              value.preset === p.value
                ? 'bg-gradient-faciloop text-white border-transparent shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-foreground/30'
            }`}
          >
            {p.label}
          </button>
        ))}
        {value.preset !== 'all' && (
          <button
            type="button"
            onClick={reset}
            aria-label="Réinitialiser"
            className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center bg-muted/60 text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {value.preset === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={e => setCustomFrom(e.target.value)}
            className="flex-1 h-9 rounded-lg border border-border bg-muted/40 px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="text-xs text-muted-foreground shrink-0">→</span>
          <input
            type="date"
            value={customTo}
            onChange={e => setCustomTo(e.target.value)}
            className="flex-1 h-9 rounded-lg border border-border bg-muted/40 px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            type="button"
            onClick={applyCustom}
            className="shrink-0 h-9 px-3 rounded-lg text-xs font-bold bg-gradient-faciloop text-white"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};
