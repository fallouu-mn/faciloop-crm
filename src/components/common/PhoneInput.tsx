import { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, Search, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
      { code: 'SN', name: 'Senegal', flag: '\u{1F1F8}\u{1F1F3}', dialCode: '221' },
      { code: 'CI', name: 'Cote d\'Ivoire', flag: '\u{1F1E8}\u{1F1EE}', dialCode: '225' },
      { code: 'ML', name: 'Mali', flag: '\u{1F1F2}\u{1F1F1}', dialCode: '223' },
      { code: 'GN', name: 'Guinee', flag: '\u{1F1EC}\u{1F1F3}', dialCode: '224' },
      { code: 'BF', name: 'Burkina Faso', flag: '\u{1F1E7}\u{1F1EB}', dialCode: '226' },
      { code: 'BJ', name: 'Benin', flag: '\u{1F1E7}\u{1F1EF}', dialCode: '229' },
      { code: 'TG', name: 'Togo', flag: '\u{1F1F9}\u{1F1EC}', dialCode: '228' },
      { code: 'NE', name: 'Niger', flag: '\u{1F1F3}\u{1F1EA}', dialCode: '227' },
      { code: 'MR', name: 'Mauritanie', flag: '\u{1F1F2}\u{1F1F7}', dialCode: '222' },
      { code: 'GM', name: 'Gambie', flag: '\u{1F1EC}\u{1F1F2}', dialCode: '220' },
      { code: 'GW', name: 'Guinee-Bissau', flag: '\u{1F1EC}\u{1F1FC}', dialCode: '245' },
      { code: 'NG', name: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', dialCode: '234' },
      { code: 'GH', name: 'Ghana', flag: '\u{1F1EC}\u{1F1ED}', dialCode: '233' },
      { code: 'LR', name: 'Liberia', flag: '\u{1F1F1}\u{1F1F7}', dialCode: '231' },
      { code: 'SL', name: 'Sierra Leone', flag: '\u{1F1F8}\u{1F1F1}', dialCode: '232' },
      { code: 'CV', name: 'Cap-Vert', flag: '\u{1F1E8}\u{1F1FB}', dialCode: '238' },
    ],
  },
  {
    name: 'Afrique Centrale',
    countries: [
      { code: 'CM', name: 'Cameroun', flag: '\u{1F1E8}\u{1F1F2}', dialCode: '237' },
      { code: 'CG', name: 'Congo', flag: '\u{1F1E8}\u{1F1EC}', dialCode: '242' },
      { code: 'CD', name: 'Congo (RDC)', flag: '\u{1F1E8}\u{1F1E9}', dialCode: '243' },
      { code: 'GA', name: 'Gabon', flag: '\u{1F1EC}\u{1F1E6}', dialCode: '241' },
      { code: 'GQ', name: 'Guinee equatoriale', flag: '\u{1F1EC}\u{1F1F6}', dialCode: '240' },
      { code: 'CF', name: 'Centrafrique', flag: '\u{1F1E8}\u{1F1EB}', dialCode: '236' },
      { code: 'TD', name: 'Tchad', flag: '\u{1F1F9}\u{1F1E9}', dialCode: '235' },
      { code: 'ST', name: 'Sao Tome-et-Principe', flag: '\u{1F1F8}\u{1F1F9}', dialCode: '239' },
    ],
  },
  {
    name: 'Afrique de l\'Est',
    countries: [
      { code: 'KE', name: 'Kenya', flag: '\u{1F1F0}\u{1F1EA}', dialCode: '254' },
      { code: 'TZ', name: 'Tanzanie', flag: '\u{1F1F9}\u{1F1FF}', dialCode: '255' },
      { code: 'UG', name: 'Ouganda', flag: '\u{1F1FA}\u{1F1EC}', dialCode: '256' },
      { code: 'RW', name: 'Rwanda', flag: '\u{1F1F7}\u{1F1FC}', dialCode: '250' },
      { code: 'BI', name: 'Burundi', flag: '\u{1F1E7}\u{1F1EE}', dialCode: '257' },
      { code: 'ET', name: 'Ethiopie', flag: '\u{1F1EA}\u{1F1F9}', dialCode: '251' },
      { code: 'ER', name: 'Erythree', flag: '\u{1F1EA}\u{1F1F7}', dialCode: '291' },
      { code: 'DJ', name: 'Djibouti', flag: '\u{1F1E9}\u{1F1EF}', dialCode: '253' },
      { code: 'SO', name: 'Somalie', flag: '\u{1F1F8}\u{1F1F4}', dialCode: '252' },
      { code: 'SS', name: 'Soudan du Sud', flag: '\u{1F1F8}\u{1F1F8}', dialCode: '211' },
      { code: 'MG', name: 'Madagascar', flag: '\u{1F1F2}\u{1F1EC}', dialCode: '261' },
      { code: 'MU', name: 'Maurice', flag: '\u{1F1F2}\u{1F1FA}', dialCode: '230' },
      { code: 'SC', name: 'Seychelles', flag: '\u{1F1F8}\u{1F1E8}', dialCode: '248' },
      { code: 'KM', name: 'Comores', flag: '\u{1F1F0}\u{1F1F2}', dialCode: '269' },
    ],
  },
  {
    name: 'Afrique du Nord',
    countries: [
      { code: 'MA', name: 'Maroc', flag: '\u{1F1F2}\u{1F1E6}', dialCode: '212' },
      { code: 'TN', name: 'Tunisie', flag: '\u{1F1F9}\u{1F1F3}', dialCode: '216' },
      { code: 'DZ', name: 'Algerie', flag: '\u{1F1E9}\u{1F1FF}', dialCode: '213' },
      { code: 'EG', name: 'Egypte', flag: '\u{1F1EA}\u{1F1EC}', dialCode: '20' },
      { code: 'LY', name: 'Libye', flag: '\u{1F1F1}\u{1F1FE}', dialCode: '218' },
      { code: 'SD', name: 'Soudan', flag: '\u{1F1F8}\u{1F1E9}', dialCode: '249' },
    ],
  },
  {
    name: 'Afrique Australe',
    countries: [
      { code: 'ZA', name: 'Afrique du Sud', flag: '\u{1F1FF}\u{1F1E6}', dialCode: '27' },
      { code: 'AO', name: 'Angola', flag: '\u{1F1E6}\u{1F1F4}', dialCode: '244' },
      { code: 'MZ', name: 'Mozambique', flag: '\u{1F1F2}\u{1F1FF}', dialCode: '258' },
      { code: 'ZM', name: 'Zambie', flag: '\u{1F1FF}\u{1F1F2}', dialCode: '260' },
      { code: 'ZW', name: 'Zimbabwe', flag: '\u{1F1FF}\u{1F1FC}', dialCode: '263' },
      { code: 'BW', name: 'Botswana', flag: '\u{1F1E7}\u{1F1FC}', dialCode: '267' },
      { code: 'NA', name: 'Namibie', flag: '\u{1F1F3}\u{1F1E6}', dialCode: '264' },
      { code: 'MW', name: 'Malawi', flag: '\u{1F1F2}\u{1F1FC}', dialCode: '265' },
      { code: 'LS', name: 'Lesotho', flag: '\u{1F1F1}\u{1F1F8}', dialCode: '266' },
      { code: 'SZ', name: 'Eswatini', flag: '\u{1F1F8}\u{1F1FF}', dialCode: '268' },
    ],
  },
  {
    name: 'Europe de l\'Ouest',
    countries: [
      { code: 'FR', name: 'France', flag: '\u{1F1EB}\u{1F1F7}', dialCode: '33' },
      { code: 'BE', name: 'Belgique', flag: '\u{1F1E7}\u{1F1EA}', dialCode: '32' },
      { code: 'CH', name: 'Suisse', flag: '\u{1F1E8}\u{1F1ED}', dialCode: '41' },
      { code: 'GB', name: 'Royaume-Uni', flag: '\u{1F1EC}\u{1F1E7}', dialCode: '44' },
      { code: 'DE', name: 'Allemagne', flag: '\u{1F1E9}\u{1F1EA}', dialCode: '49' },
      { code: 'NL', name: 'Pays-Bas', flag: '\u{1F1F3}\u{1F1F1}', dialCode: '31' },
      { code: 'LU', name: 'Luxembourg', flag: '\u{1F1F1}\u{1F1FA}', dialCode: '352' },
      { code: 'IE', name: 'Irlande', flag: '\u{1F1EE}\u{1F1EA}', dialCode: '353' },
      { code: 'AT', name: 'Autriche', flag: '\u{1F1E6}\u{1F1F9}', dialCode: '43' },
      { code: 'MC', name: 'Monaco', flag: '\u{1F1F2}\u{1F1E8}', dialCode: '377' },
      { code: 'LI', name: 'Liechtenstein', flag: '\u{1F1F1}\u{1F1EE}', dialCode: '423' },
      { code: 'AD', name: 'Andorre', flag: '\u{1F1E6}\u{1F1E9}', dialCode: '376' },
    ],
  },
  {
    name: 'Europe du Sud',
    countries: [
      { code: 'ES', name: 'Espagne', flag: '\u{1F1EA}\u{1F1F8}', dialCode: '34' },
      { code: 'PT', name: 'Portugal', flag: '\u{1F1F5}\u{1F1F9}', dialCode: '351' },
      { code: 'IT', name: 'Italie', flag: '\u{1F1EE}\u{1F1F9}', dialCode: '39' },
      { code: 'GR', name: 'Grece', flag: '\u{1F1EC}\u{1F1F7}', dialCode: '30' },
      { code: 'MT', name: 'Malte', flag: '\u{1F1F2}\u{1F1F9}', dialCode: '356' },
      { code: 'CY', name: 'Chypre', flag: '\u{1F1E8}\u{1F1FE}', dialCode: '357' },
      { code: 'SM', name: 'Saint-Marin', flag: '\u{1F1F8}\u{1F1F2}', dialCode: '378' },
      { code: 'VA', name: 'Vatican', flag: '\u{1F1FB}\u{1F1E6}', dialCode: '379' },
      { code: 'AL', name: 'Albanie', flag: '\u{1F1E6}\u{1F1F1}', dialCode: '355' },
      { code: 'MK', name: 'Macedoine du Nord', flag: '\u{1F1F2}\u{1F1F0}', dialCode: '389' },
      { code: 'ME', name: 'Montenegro', flag: '\u{1F1F2}\u{1F1EA}', dialCode: '382' },
      { code: 'BA', name: 'Bosnie-Herzegovine', flag: '\u{1F1E7}\u{1F1E6}', dialCode: '387' },
      { code: 'SI', name: 'Slovenie', flag: '\u{1F1F8}\u{1F1EE}', dialCode: '386' },
    ],
  },
  {
    name: 'Europe du Nord',
    countries: [
      { code: 'SE', name: 'Suede', flag: '\u{1F1F8}\u{1F1EA}', dialCode: '46' },
      { code: 'NO', name: 'Norvege', flag: '\u{1F1F3}\u{1F1F4}', dialCode: '47' },
      { code: 'DK', name: 'Danemark', flag: '\u{1F1E9}\u{1F1F0}', dialCode: '45' },
      { code: 'FI', name: 'Finlande', flag: '\u{1F1EB}\u{1F1EE}', dialCode: '358' },
      { code: 'IS', name: 'Islande', flag: '\u{1F1EE}\u{1F1F8}', dialCode: '354' },
      { code: 'EE', name: 'Estonie', flag: '\u{1F1EA}\u{1F1EA}', dialCode: '372' },
      { code: 'LV', name: 'Lettonie', flag: '\u{1F1F1}\u{1F1FB}', dialCode: '371' },
      { code: 'LT', name: 'Lituanie', flag: '\u{1F1F1}\u{1F1F9}', dialCode: '370' },
    ],
  },
  {
    name: 'Europe de l\'Est',
    countries: [
      { code: 'PL', name: 'Pologne', flag: '\u{1F1F5}\u{1F1F1}', dialCode: '48' },
      { code: 'RO', name: 'Roumanie', flag: '\u{1F1F7}\u{1F1F4}', dialCode: '40' },
      { code: 'CZ', name: 'Tchequie', flag: '\u{1F1E8}\u{1F1FF}', dialCode: '420' },
      { code: 'HU', name: 'Hongrie', flag: '\u{1F1ED}\u{1F1FA}', dialCode: '36' },
      { code: 'BG', name: 'Bulgarie', flag: '\u{1F1E7}\u{1F1EC}', dialCode: '359' },
      { code: 'SK', name: 'Slovaquie', flag: '\u{1F1F8}\u{1F1F0}', dialCode: '421' },
      { code: 'HR', name: 'Croatie', flag: '\u{1F1ED}\u{1F1F7}', dialCode: '385' },
      { code: 'RS', name: 'Serbie', flag: '\u{1F1F7}\u{1F1F8}', dialCode: '381' },
      { code: 'UA', name: 'Ukraine', flag: '\u{1F1FA}\u{1F1E6}', dialCode: '380' },
      { code: 'BY', name: 'Bielorussie', flag: '\u{1F1E7}\u{1F1FE}', dialCode: '375' },
      { code: 'MD', name: 'Moldavie', flag: '\u{1F1F2}\u{1F1E9}', dialCode: '373' },
      { code: 'RU', name: 'Russie', flag: '\u{1F1F7}\u{1F1FA}', dialCode: '7' },
      { code: 'TR', name: 'Turquie', flag: '\u{1F1F9}\u{1F1F7}', dialCode: '90' },
      { code: 'GE', name: 'Georgie', flag: '\u{1F1EC}\u{1F1EA}', dialCode: '995' },
      { code: 'AM', name: 'Armenie', flag: '\u{1F1E6}\u{1F1F2}', dialCode: '374' },
      { code: 'AZ', name: 'Azerbaidjan', flag: '\u{1F1E6}\u{1F1FF}', dialCode: '994' },
      { code: 'XK', name: 'Kosovo', flag: '\u{1F1FD}\u{1F1F0}', dialCode: '383' },
    ],
  },
  {
    name: 'Amerique du Nord',
    countries: [
      { code: 'US', name: 'Etats-Unis', flag: '\u{1F1FA}\u{1F1F8}', dialCode: '1' },
      { code: 'CA', name: 'Canada', flag: '\u{1F1E8}\u{1F1E6}', dialCode: '1' },
      { code: 'MX', name: 'Mexique', flag: '\u{1F1F2}\u{1F1FD}', dialCode: '52' },
    ],
  },
  {
    name: 'Amerique Centrale',
    countries: [
      { code: 'GT', name: 'Guatemala', flag: '\u{1F1EC}\u{1F1F9}', dialCode: '502' },
      { code: 'BZ', name: 'Belize', flag: '\u{1F1E7}\u{1F1FF}', dialCode: '501' },
      { code: 'SV', name: 'Salvador', flag: '\u{1F1F8}\u{1F1FB}', dialCode: '503' },
      { code: 'HN', name: 'Honduras', flag: '\u{1F1ED}\u{1F1F3}', dialCode: '504' },
      { code: 'NI', name: 'Nicaragua', flag: '\u{1F1F3}\u{1F1EE}', dialCode: '505' },
      { code: 'CR', name: 'Costa Rica', flag: '\u{1F1E8}\u{1F1F7}', dialCode: '506' },
      { code: 'PA', name: 'Panama', flag: '\u{1F1F5}\u{1F1E6}', dialCode: '507' },
    ],
  },
  {
    name: 'Caraibes',
    countries: [
      { code: 'HT', name: 'Haiti', flag: '\u{1F1ED}\u{1F1F9}', dialCode: '509' },
      { code: 'CU', name: 'Cuba', flag: '\u{1F1E8}\u{1F1FA}', dialCode: '53' },
      { code: 'DO', name: 'Rep. dominicaine', flag: '\u{1F1E9}\u{1F1F4}', dialCode: '1809' },
      { code: 'JM', name: 'Jamaique', flag: '\u{1F1EF}\u{1F1F2}', dialCode: '1876' },
      { code: 'TT', name: 'Trinite-et-Tobago', flag: '\u{1F1F9}\u{1F1F9}', dialCode: '1868' },
      { code: 'BB', name: 'Barbade', flag: '\u{1F1E7}\u{1F1E7}', dialCode: '1246' },
      { code: 'BS', name: 'Bahamas', flag: '\u{1F1E7}\u{1F1F8}', dialCode: '1242' },
      { code: 'AG', name: 'Antigua-et-Barbuda', flag: '\u{1F1E6}\u{1F1EC}', dialCode: '1268' },
      { code: 'DM', name: 'Dominique', flag: '\u{1F1E9}\u{1F1F2}', dialCode: '1767' },
      { code: 'GD', name: 'Grenade', flag: '\u{1F1EC}\u{1F1E9}', dialCode: '1473' },
      { code: 'KN', name: 'Saint-Kitts-et-Nevis', flag: '\u{1F1F0}\u{1F1F3}', dialCode: '1869' },
      { code: 'LC', name: 'Sainte-Lucie', flag: '\u{1F1F1}\u{1F1E8}', dialCode: '1758' },
      { code: 'VC', name: 'Saint-Vincent', flag: '\u{1F1FB}\u{1F1E8}', dialCode: '1784' },
      { code: 'GP', name: 'Guadeloupe', flag: '\u{1F1EC}\u{1F1F5}', dialCode: '590' },
      { code: 'MQ', name: 'Martinique', flag: '\u{1F1F2}\u{1F1F6}', dialCode: '596' },
      { code: 'PR', name: 'Porto Rico', flag: '\u{1F1F5}\u{1F1F7}', dialCode: '1787' },
      { code: 'AW', name: 'Aruba', flag: '\u{1F1E6}\u{1F1FC}', dialCode: '297' },
      { code: 'CW', name: 'Curacao', flag: '\u{1F1E8}\u{1F1FC}', dialCode: '599' },
    ],
  },
  {
    name: 'Amerique du Sud',
    countries: [
      { code: 'BR', name: 'Bresil', flag: '\u{1F1E7}\u{1F1F7}', dialCode: '55' },
      { code: 'AR', name: 'Argentine', flag: '\u{1F1E6}\u{1F1F7}', dialCode: '54' },
      { code: 'CO', name: 'Colombie', flag: '\u{1F1E8}\u{1F1F4}', dialCode: '57' },
      { code: 'PE', name: 'Perou', flag: '\u{1F1F5}\u{1F1EA}', dialCode: '51' },
      { code: 'CL', name: 'Chili', flag: '\u{1F1E8}\u{1F1F1}', dialCode: '56' },
      { code: 'VE', name: 'Venezuela', flag: '\u{1F1FB}\u{1F1EA}', dialCode: '58' },
      { code: 'EC', name: 'Equateur', flag: '\u{1F1EA}\u{1F1E8}', dialCode: '593' },
      { code: 'UY', name: 'Uruguay', flag: '\u{1F1FA}\u{1F1FE}', dialCode: '598' },
      { code: 'PY', name: 'Paraguay', flag: '\u{1F1F5}\u{1F1FE}', dialCode: '595' },
      { code: 'BO', name: 'Bolivie', flag: '\u{1F1E7}\u{1F1F4}', dialCode: '591' },
      { code: 'GY', name: 'Guyana', flag: '\u{1F1EC}\u{1F1FE}', dialCode: '592' },
      { code: 'SR', name: 'Suriname', flag: '\u{1F1F8}\u{1F1F7}', dialCode: '597' },
      { code: 'GF', name: 'Guyane francaise', flag: '\u{1F1EC}\u{1F1EB}', dialCode: '594' },
    ],
  },
  {
    name: 'Moyen-Orient',
    countries: [
      { code: 'SA', name: 'Arabie saoudite', flag: '\u{1F1F8}\u{1F1E6}', dialCode: '966' },
      { code: 'AE', name: 'Emirats arabes unis', flag: '\u{1F1E6}\u{1F1EA}', dialCode: '971' },
      { code: 'QA', name: 'Qatar', flag: '\u{1F1F6}\u{1F1E6}', dialCode: '974' },
      { code: 'KW', name: 'Koweit', flag: '\u{1F1F0}\u{1F1FC}', dialCode: '965' },
      { code: 'BH', name: 'Bahrein', flag: '\u{1F1E7}\u{1F1ED}', dialCode: '973' },
      { code: 'OM', name: 'Oman', flag: '\u{1F1F4}\u{1F1F2}', dialCode: '968' },
      { code: 'JO', name: 'Jordanie', flag: '\u{1F1EF}\u{1F1F4}', dialCode: '962' },
      { code: 'LB', name: 'Liban', flag: '\u{1F1F1}\u{1F1E7}', dialCode: '961' },
      { code: 'IQ', name: 'Irak', flag: '\u{1F1EE}\u{1F1F6}', dialCode: '964' },
      { code: 'SY', name: 'Syrie', flag: '\u{1F1F8}\u{1F1FE}', dialCode: '963' },
      { code: 'IL', name: 'Israel', flag: '\u{1F1EE}\u{1F1F1}', dialCode: '972' },
      { code: 'PS', name: 'Palestine', flag: '\u{1F1F5}\u{1F1F8}', dialCode: '970' },
      { code: 'IR', name: 'Iran', flag: '\u{1F1EE}\u{1F1F7}', dialCode: '98' },
      { code: 'YE', name: 'Yemen', flag: '\u{1F1FE}\u{1F1EA}', dialCode: '967' },
    ],
  },
  {
    name: 'Asie du Sud',
    countries: [
      { code: 'IN', name: 'Inde', flag: '\u{1F1EE}\u{1F1F3}', dialCode: '91' },
      { code: 'PK', name: 'Pakistan', flag: '\u{1F1F5}\u{1F1F0}', dialCode: '92' },
      { code: 'BD', name: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', dialCode: '880' },
      { code: 'LK', name: 'Sri Lanka', flag: '\u{1F1F1}\u{1F1F0}', dialCode: '94' },
      { code: 'NP', name: 'Nepal', flag: '\u{1F1F3}\u{1F1F5}', dialCode: '977' },
      { code: 'AF', name: 'Afghanistan', flag: '\u{1F1E6}\u{1F1EB}', dialCode: '93' },
      { code: 'BT', name: 'Bhoutan', flag: '\u{1F1E7}\u{1F1F9}', dialCode: '975' },
      { code: 'MV', name: 'Maldives', flag: '\u{1F1F2}\u{1F1FB}', dialCode: '960' },
    ],
  },
  {
    name: 'Asie de l\'Est',
    countries: [
      { code: 'CN', name: 'Chine', flag: '\u{1F1E8}\u{1F1F3}', dialCode: '86' },
      { code: 'JP', name: 'Japon', flag: '\u{1F1EF}\u{1F1F5}', dialCode: '81' },
      { code: 'KR', name: 'Coree du Sud', flag: '\u{1F1F0}\u{1F1F7}', dialCode: '82' },
      { code: 'KP', name: 'Coree du Nord', flag: '\u{1F1F0}\u{1F1F5}', dialCode: '850' },
      { code: 'TW', name: 'Taiwan', flag: '\u{1F1F9}\u{1F1FC}', dialCode: '886' },
      { code: 'HK', name: 'Hong Kong', flag: '\u{1F1ED}\u{1F1F0}', dialCode: '852' },
      { code: 'MO', name: 'Macao', flag: '\u{1F1F2}\u{1F1F4}', dialCode: '853' },
      { code: 'MN', name: 'Mongolie', flag: '\u{1F1F2}\u{1F1F3}', dialCode: '976' },
    ],
  },
  {
    name: 'Asie du Sud-Est',
    countries: [
      { code: 'TH', name: 'Thailande', flag: '\u{1F1F9}\u{1F1ED}', dialCode: '66' },
      { code: 'VN', name: 'Vietnam', flag: '\u{1F1FB}\u{1F1F3}', dialCode: '84' },
      { code: 'PH', name: 'Philippines', flag: '\u{1F1F5}\u{1F1ED}', dialCode: '63' },
      { code: 'MY', name: 'Malaisie', flag: '\u{1F1F2}\u{1F1FE}', dialCode: '60' },
      { code: 'SG', name: 'Singapour', flag: '\u{1F1F8}\u{1F1EC}', dialCode: '65' },
      { code: 'ID', name: 'Indonesie', flag: '\u{1F1EE}\u{1F1E9}', dialCode: '62' },
      { code: 'MM', name: 'Myanmar', flag: '\u{1F1F2}\u{1F1F2}', dialCode: '95' },
      { code: 'KH', name: 'Cambodge', flag: '\u{1F1F0}\u{1F1ED}', dialCode: '855' },
      { code: 'LA', name: 'Laos', flag: '\u{1F1F1}\u{1F1E6}', dialCode: '856' },
      { code: 'BN', name: 'Brunei', flag: '\u{1F1E7}\u{1F1F3}', dialCode: '673' },
      { code: 'TL', name: 'Timor oriental', flag: '\u{1F1F9}\u{1F1F1}', dialCode: '670' },
    ],
  },
  {
    name: 'Asie Centrale',
    countries: [
      { code: 'KZ', name: 'Kazakhstan', flag: '\u{1F1F0}\u{1F1FF}', dialCode: '7' },
      { code: 'UZ', name: 'Ouzbekistan', flag: '\u{1F1FA}\u{1F1FF}', dialCode: '998' },
      { code: 'TM', name: 'Turkmenistan', flag: '\u{1F1F9}\u{1F1F2}', dialCode: '993' },
      { code: 'KG', name: 'Kirghizistan', flag: '\u{1F1F0}\u{1F1EC}', dialCode: '996' },
      { code: 'TJ', name: 'Tadjikistan', flag: '\u{1F1F9}\u{1F1EF}', dialCode: '992' },
    ],
  },
  {
    name: 'Oceanie',
    countries: [
      { code: 'AU', name: 'Australie', flag: '\u{1F1E6}\u{1F1FA}', dialCode: '61' },
      { code: 'NZ', name: 'Nouvelle-Zelande', flag: '\u{1F1F3}\u{1F1FF}', dialCode: '64' },
      { code: 'FJ', name: 'Fidji', flag: '\u{1F1EB}\u{1F1EF}', dialCode: '679' },
      { code: 'PG', name: 'Papouasie-N.-Guinee', flag: '\u{1F1F5}\u{1F1EC}', dialCode: '675' },
      { code: 'WS', name: 'Samoa', flag: '\u{1F1FC}\u{1F1F8}', dialCode: '685' },
      { code: 'TO', name: 'Tonga', flag: '\u{1F1F9}\u{1F1F4}', dialCode: '676' },
      { code: 'VU', name: 'Vanuatu', flag: '\u{1F1FB}\u{1F1FA}', dialCode: '678' },
      { code: 'SB', name: 'Iles Salomon', flag: '\u{1F1F8}\u{1F1E7}', dialCode: '677' },
      { code: 'KI', name: 'Kiribati', flag: '\u{1F1F0}\u{1F1EE}', dialCode: '686' },
      { code: 'FM', name: 'Micronesie', flag: '\u{1F1EB}\u{1F1F2}', dialCode: '691' },
      { code: 'MH', name: 'Iles Marshall', flag: '\u{1F1F2}\u{1F1ED}', dialCode: '692' },
      { code: 'PW', name: 'Palaos', flag: '\u{1F1F5}\u{1F1FC}', dialCode: '680' },
      { code: 'NR', name: 'Nauru', flag: '\u{1F1F3}\u{1F1F7}', dialCode: '674' },
      { code: 'TV', name: 'Tuvalu', flag: '\u{1F1F9}\u{1F1FB}', dialCode: '688' },
      { code: 'PF', name: 'Polynesie francaise', flag: '\u{1F1F5}\u{1F1EB}', dialCode: '689' },
      { code: 'NC', name: 'Nouvelle-Caledonie', flag: '\u{1F1F3}\u{1F1E8}', dialCode: '687' },
      { code: 'GU', name: 'Guam', flag: '\u{1F1EC}\u{1F1FA}', dialCode: '1671' },
    ],
  },
  {
    name: 'Territoires d\'outre-mer',
    countries: [
      { code: 'RE', name: 'La Reunion', flag: '\u{1F1F7}\u{1F1EA}', dialCode: '262' },
      { code: 'YT', name: 'Mayotte', flag: '\u{1F1FE}\u{1F1F9}', dialCode: '262' },
      { code: 'PM', name: 'Saint-Pierre-et-Miquelon', flag: '\u{1F1F5}\u{1F1F2}', dialCode: '508' },
      { code: 'WF', name: 'Wallis-et-Futuna', flag: '\u{1F1FC}\u{1F1EB}', dialCode: '681' },
      { code: 'GI', name: 'Gibraltar', flag: '\u{1F1EC}\u{1F1EE}', dialCode: '350' },
      { code: 'FO', name: 'Iles Feroe', flag: '\u{1F1EB}\u{1F1F4}', dialCode: '298' },
      { code: 'GL', name: 'Groenland', flag: '\u{1F1EC}\u{1F1F1}', dialCode: '299' },
      { code: 'BM', name: 'Bermudes', flag: '\u{1F1E7}\u{1F1F2}', dialCode: '1441' },
      { code: 'KY', name: 'Iles Caimans', flag: '\u{1F1F0}\u{1F1FE}', dialCode: '1345' },
      { code: 'VG', name: 'Iles Vierges brit.', flag: '\u{1F1FB}\u{1F1EC}', dialCode: '1284' },
      { code: 'VI', name: 'Iles Vierges amer.', flag: '\u{1F1FB}\u{1F1EE}', dialCode: '1340' },
    ],
  },
];

const ALL_COUNTRIES: Country[] = COUNTRY_GROUPS.flatMap(g => g.countries);

/**
 * Clé de traduction d'une région, dérivée du libellé FR du groupe
 * (ex: "Afrique de l'Ouest" → "afrique_de_l_ouest").
 * Si la clé est introuvable, i18next revient au libellé FR (comportement actuel).
 */
const regionKey = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PhoneInput({ value, onChange, placeholder = '77 123 45 67', disabled = false }: PhoneInputProps) {
  const { t } = useTranslation('common');
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
                placeholder={t('phoneInput.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            {/* Country list */}
            <div className="max-h-[260px] overflow-y-auto p-1">
              {filteredGroups.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{t('phoneInput.noResults')}</p>
              )}
              {filteredGroups.map((group) => (
                <div key={group.name}>
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">{t(`phoneInput.regions.${regionKey(group.name)}`)}</p>
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
