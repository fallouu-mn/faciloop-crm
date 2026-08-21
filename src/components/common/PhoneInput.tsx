import { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, Search, Check } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

interface CountryGroup {
  name: string;
  countries: Country[];
}

const COUNTRY_GROUPS: CountryGroup[] = [
  {
    name: 'Afrique de l\'Ouest',
    countries: [
      { code: 'SN', name: 'Sénégal', flag: '🇸🇳', dialCode: '221' },
      { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', dialCode: '225' },
      { code: 'ML', name: 'Mali', flag: '🇲🇱', dialCode: '223' },
      { code: 'GN', name: 'Guinée', flag: '🇬🇳', dialCode: '224' },
      { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', dialCode: '226' },
      { code: 'BJ', name: 'Bénin', flag: '🇧🇯', dialCode: '229' },
      { code: 'TG', name: 'Togo', flag: '🇹🇬', dialCode: '228' },
      { code: 'NE', name: 'Niger', flag: '🇳🇪', dialCode: '227' },
      { code: 'MR', name: 'Mauritanie', flag: '🇲🇷', dialCode: '222' },
      { code: 'GM', name: 'Gambie', flag: '🇬🇲', dialCode: '220' },
      { code: 'GW', name: 'Guinée-Bissau', flag: '🇬🇼', dialCode: '245' },
      { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '234' },
      { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '233' },
    ],
  },
  {
    name: 'Afrique Centrale',
    countries: [
      { code: 'CM', name: 'Cameroun', flag: '🇨🇲', dialCode: '237' },
    ],
  },
  {
    name: 'Europe',
    countries: [
      { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '33' },
      { code: 'BE', name: 'Belgique', flag: '🇧🇪', dialCode: '32' },
      { code: 'CH', name: 'Suisse', flag: '🇨🇭', dialCode: '41' },
      { code: 'ES', name: 'Espagne', flag: '🇪🇸', dialCode: '34' },
      { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '351' },
    ],
  },
  {
    name: 'Amériques',
    countries: [
      { code: 'US', name: 'États-Unis', flag: '🇺🇸', dialCode: '1' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '1' },
    ],
  },
];

const ALL_COUNTRIES: Country[] = COUNTRY_GROUPS.flatMap(g => g.countries);

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PhoneInput({ value, onChange, placeholder = '77 123 45 67', disabled = false }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(ALL_COUNTRIES[0]);
  const [localNumber, setLocalNumber] = useState(value);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setOpen(false);
    setSearch('');
    const cleaned = localNumber.replace(/\D/g, '');
    onChange(cleaned ? `${country.dialCode}${cleaned}` : '');
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = e.target.value.replace(/[^0-9]/g, '');
    setLocalNumber(filtered);
    onChange(filtered ? `${selectedCountry.dialCode}${filtered}` : '');
  };

  const normalizeSearch = (text: string): string =>
    text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const filteredGroups = COUNTRY_GROUPS.map(group => ({
    ...group,
    countries: group.countries.filter(country => {
      if (!search.trim()) return true;
      const q = normalizeSearch(search.trim());
      return (
        normalizeSearch(country.name).includes(q) ||
        country.code.toLowerCase().includes(q) ||
        country.dialCode.includes(q) ||
        `+${country.dialCode}`.includes(q)
      );
    }),
  })).filter(group => group.countries.length > 0);

  return (
    <div className="flex gap-2">
      {/* Country selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          disabled={disabled}
          className="flex items-center gap-1.5 h-10 px-3 rounded-md border border-input bg-background text-sm font-medium hover:bg-muted transition-colors shrink-0 w-[110px] justify-between"
        >
          <span className="flex items-center gap-1.5 truncate">
            <span>{selectedCountry.flag}</span>
            <span>+{selectedCountry.dialCode}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 w-[260px] rounded-md border border-border bg-card shadow-lg z-50 overflow-hidden">
            {/* Search */}
            <div className="flex items-center border-b border-border px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground mr-2" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Rechercher un pays..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            {/* Country list */}
            <div className="max-h-[260px] overflow-y-auto p-1">
              {filteredGroups.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun pays trouvé</p>
              )}
              {filteredGroups.map((group) => (
                <div key={group.name}>
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">{group.name}</p>
                  {group.countries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors text-left"
                    >
                      <span>{country.flag}</span>
                      <span className="font-medium">+{country.dialCode}</span>
                      <span className="text-muted-foreground flex-1 truncate">{country.name}</span>
                      {selectedCountry.code === country.code && (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phone number input */}
      <input
        type="tel"
        placeholder={placeholder}
        value={localNumber}
        onChange={handleLocalChange}
        disabled={disabled}
        className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
      />
    </div>
  );
}
