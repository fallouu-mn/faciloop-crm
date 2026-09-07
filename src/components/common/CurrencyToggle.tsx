import React from 'react';
import { DeviseCode, DEVISES } from '../../lib/currency';

interface Props {
  value: DeviseCode;
  onChange: (devise: DeviseCode) => void;
}

export const CurrencyToggle: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="inline-flex items-center rounded-full bg-muted p-0.5 sm:p-1 border border-border shrink-0 w-fit">
      {DEVISES.map((d) => (
        <button
          key={d.code}
          onClick={() => onChange(d.code)}
          className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
            value === d.code
              ? 'bg-gradient-faciloop shadow-sm text-white'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
};
