import { useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PinInputProps {
  value: string[];
  onChange: (digits: string[]) => void;
  showPin: boolean;
  onToggleShow: () => void;
  disabled?: boolean;
  label?: string;
}

export function PinInput({ value, onChange, showPin, onToggleShow, disabled = false, label }: PinInputProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [allSelected, setAllSelected] = useState(false);

  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, inputValue: string) => {
    if (!/^\d*$/.test(inputValue)) return;

    if (allSelected) {
      const newDigits = ['', '', '', '', '', ''];
      newDigits[0] = inputValue.slice(-1);
      onChange(newDigits);
      setAllSelected(false);
      refs[1].current?.focus();
      return;
    }

    const newDigits = [...value];
    newDigits[index] = inputValue.slice(-1);
    onChange(newDigits);
    if (inputValue && index < 5) {
      refs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      setAllSelected(true);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    setAllSelected(false);
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = ['', '', '', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      onChange(newDigits);
      const focusIndex = Math.min(pasted.length, 5);
      refs[focusIndex].current?.focus();
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex items-center justify-start gap-2">
        {/* OTP Group - shared borders, rounded ends */}
        <div className="flex items-center">
          {value.map((digit, idx) => (
            <div
              key={idx}
              className={`relative flex w-10 h-12 items-center justify-center border-y border-r border-input text-sm transition-all ${
                idx === 0 ? 'rounded-l-md border-l' : ''
              }${idx === 5 ? ' rounded-r-md' : ''
              }${activeIndex === idx ? ' z-10 ring-2 ring-ring ring-offset-0' : ''
              }${allSelected ? ' bg-primary/10 ring-1 ring-primary' : ''}`}
            >
              <input
                ref={refs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={showPin ? digit : (digit ? '•' : '')}
                onChange={(e) => {
                  const val = e.target.value.replace(/•/g, '');
                  handleChange(idx, val);
                }}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onFocus={() => setActiveIndex(idx)}
                onBlur={() => { setActiveIndex(null); setAllSelected(false); }}
                onPaste={handlePaste}
                disabled={disabled}
                className="absolute inset-0 w-full h-full text-center text-sm font-medium bg-transparent focus:outline-none text-foreground disabled:opacity-50 disabled:cursor-not-allowed caret-transparent"
                aria-label={`Chiffre ${idx + 1}`}
              />
              {/* Fake caret when focused and empty */}
              {activeIndex === idx && !digit && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse h-5 w-px bg-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Eye toggle */}
        <button
          type="button"
          onClick={onToggleShow}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
