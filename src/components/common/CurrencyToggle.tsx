import React from 'react';
import { DeviseCode, DEVISES } from '../../lib/currency';

interface Props {
  value: DeviseCode;
  onChange: (devise: DeviseCode) => void;
}

export const CurrencyToggle: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="inline-flex items-center rounded-full bg-muted p-1 border border-border text-sm">
      {DEVISES.map((d) => (
        <button
          key={d.code}
          onClick={() => onChange(d.code)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
