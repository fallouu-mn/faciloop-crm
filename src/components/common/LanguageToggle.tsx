import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'fr';

  const changeLang = (lang: 'fr' | 'en') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-full bg-card/90 backdrop-blur-xl border border-border/80 shadow-xl text-xs font-extrabold ${className}`}
    >
      <button
        type="button"
        onClick={() => changeLang('fr')}
        className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
          currentLang.startsWith('fr')
            ? 'bg-gradient-faciloop text-white font-black shadow-md'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        }`}
      >
        <span className="text-[11px]">🇫🇷</span>
        <span>FR</span>
      </button>

      <button
        type="button"
        onClick={() => changeLang('en')}
        className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
          currentLang.startsWith('en')
            ? 'bg-gradient-faciloop text-white font-black shadow-md'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        }`}
      >
        <span className="text-[11px]">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
};
