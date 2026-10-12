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
      { code: 'CF', name: 'Centrafrique', flag: '🇨🇫', dialCode: '236' },
      { code: 'TD', name: 'Tchad', flag: '🇹🇩', dialCode: '235' },
      { code: 'CG', name: 'Congo', flag: '🇨🇬', dialCode: '242' },
      { code: 'CD', name: 'Congo (RDC)', flag: '🇨🇩', dialCode: '243' },
      { code: 'GA', name: 'Gabon', flag: '🇬🇦', dialCode: '241' },
      { code: 'GQ', name: 'Guinée équatoriale', flag: '🇬🇶', dialCode: '240' },
    ],
  },
  {
    name: 'Afrique de l\'Est',
    countries: [
      { code: 'LR', name: 'Libéria', flag: '🇱🇷', dialCode: '231' },
      { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', dialCode: '232' },
      { code: 'CV', name: 'Cap-Vert', flag: '🇨🇻', dialCode: '238' },
    ],
  },
  {
    name: 'Afrique du Nord',
    countries: [
      { code: 'MA', name: 'Maroc', flag: '🇲🇦', dialCode: '212' },
      { code: 'TN', name: 'Tunisie', flag: '🇹🇳', dialCode: '216' },
      { code: 'DZ', name: 'Algérie', flag: '🇩🇿', dialCode: '213' },
      { code: 'EG', name: 'Égypte', flag: '🇪🇬', dialCode: '20' },
      { code: 'LY', name: 'Libye', flag: '🇱🇾', dialCode: '218' },
    ],
  },
  {
    name: 'Afrique Australe',
    countries: [
      { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦', dialCode: '27' },
      { code: 'AO', name: 'Angola', flag: '🇦🇴', dialCode: '244' },
      { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', dialCode: '258' },
      { code: 'ZM', name: 'Zambie', flag: '🇿🇲', dialCode: '260' },
      { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', dialCode: '263' },
      { code: 'BW', name: 'Botswana', flag: '🇧🇼', dialCode: '267' },
      { code: 'NA', name: 'Namibie', flag: '🇳🇦', dialCode: '264' },
      { code: 'MW', name: 'Malawi', flag: '🇲🇼', dialCode: '265' },
      { code: 'LS', name: 'Lesotho', flag: '🇱🇸', dialCode: '266' },
      { code: 'SZ', name: 'Eswatini', flag: '🇸🇿', dialCode: '268' },
    ],
  },
  {
    name: 'Europe de l\'Ouest',
    countries: [
      { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '33' },
      { code: 'BE', name: 'Belgique', flag: '🇧🇪', dialCode: '32' },
      { code: 'CH', name: 'Suisse', flag: '🇨🇭', dialCode: '41' },
      { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧', dialCode: '44' },
      { code: 'DE', name: 'Allemagne', flag: '🇩🇪', dialCode: '49' },
    ],
  },
  {
    name: 'Europe du Sud',
    countries: [
      { code: 'ES', name: 'Espagne', flag: '🇪🇸', dialCode: '34' },
      { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '351' },
      { code: 'IT', name: 'Italie', flag: '🇮🇹', dialCode: '39' },
      { code: 'GR', name: 'Grèce', flag: '🇬🇷', dialCode: '30' },
      { code: 'MT', name: 'Malte', flag: '🇲🇹', dialCode: '356' },
      { code: 'CY', name: 'Chypre', flag: '🇨🇾', dialCode: '357' },
      { code: 'SM', name: 'Saint-Marin', flag: '🇸🇲', dialCode: '378' },
      { code: 'VA', name: 'Vatican', flag: '🇻🇦', dialCode: '379' },
    ],
  },
  {
    name: 'Europe du Nord',
    countries: [
      { code: 'SE', name: 'Suède', flag: '🇸🇪', dialCode: '46' },
      { code: 'NO', name: 'Norvège', flag: '🇳🇴', dialCode: '47' },
      { code: 'DK', name: 'Danemark', flag: '🇩🇰', dialCode: '45' },
      { code: 'FI', name: 'Finlande', flag: '🇫🇮', dialCode: '358' },
      { code: 'IS', name: 'Islande', flag: '🇮🇸', dialCode: '354' },
    ],
  },
  {
    name: 'Europe de l\'Est',
    countries: [
      { code: 'PL', name: 'Pologne', flag: '🇵🇱', dialCode: '48' },
      { code: 'RO', name: 'Roumanie', flag: '🇷🇴', dialCode: '40' },
      { code: 'CZ', name: 'Tchéquie', flag: '🇨🇿', dialCode: '420' },
      { code: 'HU', name: 'Hongrie', flag: '🇭🇺', dialCode: '36' },
      { code: 'BG', name: 'Bulgarie', flag: '🇧🇬', dialCode: '359' },
      { code: 'SK', name: 'Slovaquie', flag: '🇸🇰', dialCode: '421' },
      { code: 'HR', name: 'Croatie', flag: '🇭🇷', dialCode: '385' },
      { code: 'RS', name: 'Serbie', flag: '🇷🇸', dialCode: '381' },
      { code: 'UA', name: 'Ukraine', flag: '🇺🇦', dialCode: '380' },
      { code: 'BY', name: 'Biélorussie', flag: '🇧🇾', dialCode: '375' },
      { code: 'MD', name: 'Moldavie', flag: '🇲🇩', dialCode: '373' },
      { code: 'RU', name: 'Russie', flag: '🇷🇺', dialCode: '7' },
      { code: 'TR', name: 'Turquie', flag: '🇹🇷', dialCode: '90' },
      { code: 'GE', name: 'Géorgie', flag: '🇬🇪', dialCode: '995' },
      { code: 'AM', name: 'Arménie', flag: '🇦🇲', dialCode: '374' },
      { code: 'AZ', name: 'Azerbaïdjan', flag: '🇦🇿', dialCode: '994' },
      { code: 'XK', name: 'Kosovo', flag: '🇽🇰', dialCode: '383' },
    ],
  },
  {
    name: 'Amériques',
    countries: [
      { code: 'US', name: 'États-Unis', flag: '🇺🇸', dialCode: '1' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '1' },
      { code: 'MX', name: 'Mexique', flag: '🇲🇽', dialCode: '52' },
      { code: 'GT', name: 'Guatemala', flag: '🇬🇹', dialCode: '502' },
      { code: 'BZ', name: 'Belize', flag: '🇧🇿', dialCode: '501' },
      { code: 'SV', name: 'Salvador', flag: '🇸🇻', dialCode: '503' },
      { code: 'HN', name: 'Honduras', flag: '🇭🇳', dialCode: '504' },
      { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', dialCode: '505' },
      { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', dialCode: '506' },
      { code: 'PA', name: 'Panama', flag: '🇵🇦', dialCode: '507' },
    ],
  },
  {
    name: 'Caraïbes',
    countries: [
      { code: 'HT', name: 'Haïti', flag: '🇭🇹', dialCode: '509' },
      { code: 'CU', name: 'Cuba', flag: '🇨🇺', dialCode: '53' },
      { code: 'DO', name: 'Rep. dominicaine', flag: '🇩🇴', dialCode: '1809' },
      { code: 'jm', name: 'Jamaique', flag: '🇯🇲', dialCode: '1876' },
      { code: 'tt', name: 'Trinite-et-Tobago', flag: '🇹🇹', dialCode: '1868' },
      { code: 'bb', name: 'Barbade', flag: '🇧🇧', dialCode: '1246' },
      { code: 'bs', name: 'Bahamas', flag: '🇧🇸', dialCode: '1242' },
      { code: 'ag', name: 'Antigua-et-Barbuda', flag: '🇦🇬', dialCode: '1268' },
      { code: 'dm', name: 'Dominique', flag: '🇩🇲', dialCode: '1767' },
      { code: 'gd', name: 'Grenade', flag: '🇬🇩', dialCode: '1473' },
      { code: 'kn', name: 'Saint-Kitts-et-Nevis', flag: '🇰🇳', dialCode: '1869' },
      { code: 'lc', name: 'Sainte-Lucie', flag: '🇱🇨', dialCode: '1758' },
      { code: 'vc', name: 'Saint-Vincent', flag: '🇻🇨', dialCode: '1784' },
      { code: 'gp', name: 'Guadeloupe', flag: '🇬🇵', dialCode: '590' },
      { code: 'mq', name: 'Martinique', flag: '🇲🇶', dialCode: '596' },
      { code: 'pr', name: 'Porto Rico', flag: '🇵🇷', dialCode: '1787' },
      { code: 'aw', name: 'Aruba', flag: '🇦🇼', dialCode: '297' },
      { code: 'cw', name: 'Curacao', flag: '🇨🇼', dialCode: '599' },
    ],
  },
  {
    name: 'Amérique du Sud',
    countries: [
      { code: 'BR', name: 'Brésil', flag: '🇧🇷', dialCode: '55' },
      { code: 'AR', name: 'Argentine', flag: '🇦🇷', dialCode: '54' },
      { code: 'CO', name: 'Colombie', flag: '🇨🇴', dialCode: '57' },
      { code: 'PE', name: 'Pérou', flag: '🇵🇪', dialCode: '51' },
      { code: 'CL', name: 'Chili', flag: '🇨🇱', dialCode: '56' },
      { code: 'VE', name: 'Venezuela', flag: '🇻🇪', dialCode: '58' },
      { code: 'EC', name: 'Équateur', flag: '🇪🇨', dialCode: '593' },
      { code: 'UY', name: 'Uruguay', flag: '🇺🇾', dialCode: '598' },
      { code: 'PY', name: 'Paraguay', flag: '🇵🇾', dialCode: '595' },
      { code: 'BO', name: 'Bolivie', flag: '🇧🇴', dialCode: '591' },
      { code: 'GY', name: 'Guyana', flag: '🇬🇾', dialCode: '592' },
      { code: 'SR', name: 'Suriname', flag: '🇸🇷', dialCode: '597' },
      { code: 'GF', name: 'Guyane française', flag: '🇬🇫', dialCode: '594' },
    ],
  },
  {
    name: 'Moyen-Orient',
    countries: [
      { code: 'SA', name: 'Arabie saoudite', flag: '🇸🇦', dialCode: '966' },
      { code: 'AE', name: 'Emirats arabes unis', flag: '🇦🇪', dialCode: '971' },
      { code: 'QA', name: 'Qatar', flag: '🇶🇦', dialCode: '974' },
      { code: 'KW', name: 'Koweit', flag: '🇰🇼', dialCode: '965' },
      { code: 'BH', name: 'Bahrein', flag: '🇧🇭', dialCode: '973' },
      { code: 'OM', name: 'Oman', flag: '🇴🇲', dialCode: '968' },
      { code: 'JO', name: 'Jordanie', flag: '🇯🇴', dialCode: '962' },
      { code: 'LB', name: 'Liban', flag: '🇱🇧', dialCode: '961' },
      { code: 'IQ', name: 'Irak', flag: '🇮🇶', dialCode: '964' },
      { code: 'SY', name: 'Syrie', flag: '🇸🇾', dialCode: '963' },
      { code: 'IL', name: 'Israel', flag: '🇮🇱', dialCode: '972' },
      { code: 'PS', name: 'Palestine', flag: '🇵🇸', dialCode: '970' },
      { code: 'IR', name: 'Iran', flag: '🇮🇷', dialCode: '98' },
      { code: 'YE', name: 'Yemen', flag: '🇾🇪', dialCode: '967' },
    ],
  },
  {
    name: 'Asie du Sud',
    countries: [
      { code: 'IN', name: 'Inde', flag: '🇮🇳', dialCode: '91' },
      { code: 'PK', name: 'Pakistan', flag: '🇵🇰', dialCode: '92' },
      { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', dialCode: '880' },
      { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', dialCode: '94' },
      { code: 'NP', name: 'Népal', flag: '🇳🇵', dialCode: '977' },
    ],
  },
  {
    name: 'Asie de l\'Est',
    countries: [
      { code: 'CN', name: 'Chine', flag: '🇨🇳', dialCode: '86' },
      { code: 'JP', name: 'Japon', flag: '🇯🇵', dialCode: '81' },
      { code: 'KR', name: 'Corée du Sud', flag: '🇰🇷', dialCode: '82' },
      { code: 'KP', name: 'Coree du Nord', flag: '🇰🇵', dialCode: '850' },
      { code: 'TW', name: 'Taiwan', flag: '🇹🇼', dialCode: '886' },
      { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', dialCode: '852' },
      { code: 'MO', name: 'Macao', flag: '🇲🇴', dialCode: '853' },
      { code: 'MN', name: 'Mongolie', flag: '🇲🇳', dialCode: '976' },
    ],
  },
  {
    name: 'Asie du Sud-Est',
    countries: [
      { code: 'TH', name: 'Thailande', flag: '🇹🇭', dialCode: '66' },
      { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '84' },
      { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '63' },
      { code: 'MY', name: 'Malaisie', flag: '🇲🇾', dialCode: '60' },
      { code: 'SG', name: 'Singapour', flag: '🇸🇬', dialCode: '65' },
      { code: 'ID', name: 'Indonesie', flag: '🇮🇩', dialCode: '62' },
      { code: 'MM', name: 'Myanmar', flag: '🇲🇲', dialCode: '95' },
      { code: 'KH', name: 'Cambodge', flag: '🇰🇭', dialCode: '855' },
      { code: 'LA', name: 'Laos', flag: '🇱🇦', dialCode: '856' },
      { code: 'BN', name: 'Brunei', flag: '🇧🇳', dialCode: '673' },
    ],
  },
  {
    name: 'Asie Centrale',
    countries: [
      { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', dialCode: '7' },
      { code: 'UZ', name: 'Ouzbekistan', flag: '🇺🇿', dialCode: '998' },
      { code: 'TM', name: 'Turkménistan', flag: '🇹🇲', dialCode: '993' },
      { code: 'KG', name: 'Kirghizistan', flag: '🇰🇬', dialCode: '996' },
      { code: 'TJ', name: 'Tadjikistan', flag: '🇹🇯', dialCode: '992' },
    ],
  },
  {
    name: 'Océanie',
    countries: [
      { code: 'AU', name: 'Australie', flag: '🇦🇺', dialCode: '61' },
      { code: 'NZ', name: 'Nouvelle-Zelande', flag: '🇳🇿', dialCode: '64' },
      { code: 'FJ', name: 'Fidji', flag: '🇫🇯', dialCode: '679' },
      { code: 'PG', name: 'Papouasie-N.-Guinee', flag: '🇵🇬', dialCode: '675' },
      { code: 'WS', name: 'Samoa', flag: '🇼🇸', dialCode: '685' },
      { code: 'TO', name: 'Tonga', flag: '🇹🇴', dialCode: '676' },
      { code: 'VU', name: 'Vanuatu', flag: '🇻🇺', dialCode: '678' },
      { code: 'SB', name: 'Iles Salomon', flag: '🇸🇧', dialCode: '677' },
      { code: 'Ki', name: 'Kiribati', flag: '🇰🇮', dialCode: '686' },
      { code: 'FM', name: 'Micronesie', flag: '🇫🇲', dialCode: '691' },
      { code: 'MH', name: 'Iles Marshall', flag: '🇲🇭', dialCode: '692' },
      { code: 'PW', name: 'Palaos', flag: '🇵🇼', dialCode: '680' },
      { code: 'NR', name: 'Nauru', flag: '🇳🇷', dialCode: '674' },
      { code: 'TV', name: 'Tuvalu', flag: '🇹🇻', dialCode: '688' },
      { code: 'PF', name: 'Polynesie francaise', flag: '🇵🇫', dialCode: '689' },
      { code: 'NC', name: 'Nouvelle-Caledonie', flag: '🇳🇨', dialCode: '687' },
      { code: 'GU', name: 'Guam', flag: '🇬🇺', dialCode: '1671' },
    ],
  },
  {
    name: 'Territoires d\'outre-mer',
    countries: [
      { code: 'RE', name: 'La Reunion', flag: '🇾🇹', dialCode: '262' },
      { code: 'TF', name: 'Mayotte', flag: '🇾🇹', dialCode: '262' },
      { code: 'PM', name: 'Saint-Pierre-et-Miquelon', flag: '🇵🇲', dialCode: '508' },
      { code: 'WF', name: 'Wallis-et-Futuna', flag: '🇼🇫', dialCode: '681' },
      { code: 'GI', name: 'Gibraltar', flag: '🇬🇮', dialCode: '350' },
      { code: 'FO', name: 'Iles Feroe', flag: '🇫🇴', dialCode: '298' },
      { code: 'GL', name: 'Groenland', flag: '🇬🇱', dialCode: '299' },
      { code: 'BM', name: 'Bermudes', flag: '🇧🇲', dialCode: '1441' },
      { code: 'KY', name: 'Iles Caimans', flag: '🇰🇾', dialCode: '1345' },
      { code: 'VG', name: 'Iles Vierges brit.', flag: '🇻🇬', dialCode: '1284' },
      { code: 'VI', name: 'Iles Vierges amer.', flag: '🇻🇮', dialCode: '1340' },
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
