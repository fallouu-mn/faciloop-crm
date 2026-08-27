import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'fr';

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-full bg-background/80 backdrop-blur-md border border-border/80 shadow-md text-xs font-bold ${className}`}
    >
      <button
        type="button"
        onClick={() => changeLang('fr')}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
          currentLang.startsWith('fr')
            ? 'bg-primary text-primary-foreground font-black shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <span className="text-[10px]">🇫🇷</span>
        <span>FR</span>
      </button>

      <button
        type="button"
        onClick={() => changeLang('wo')}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
          currentLang.startsWith('wo')
            ? 'bg-primary text-primary-foreground font-black shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <span className="text-[10px]">🇸🇳</span>
        <span>WO</span>
      </button>

      <button
        type="button"
        onClick={() => changeLang('en')}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
          currentLang.startsWith('en')
            ? 'bg-primary text-primary-foreground font-black shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <span className="text-[10px]">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
};
