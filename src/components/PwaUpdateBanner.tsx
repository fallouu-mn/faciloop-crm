import { RefreshCw, X, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PwaUpdateBannerProps {
  countdown: number | null;
  onApply: () => void;
  onDismiss: () => void;
}

export function PwaUpdateBanner({ countdown, onApply, onDismiss }: PwaUpdateBannerProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const t = isEn
    ? {
        title: 'Update Available!',
        desc: 'A new version of Faciloopro CRM is ready. Click to install.',
        btn: 'Update Now',
        cancel: 'Later',
        autoReload: 'Automatic reload in',
      }
    : {
        title: 'Mise à jour disponible !',
        desc: "Une nouvelle version de Faciloopro CRM est prête. Cliquez pour l'installer.",
        btn: 'Mettre à jour',
        cancel: 'Plus tard',
        autoReload: 'Rechargement automatique dans',
      };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-card/90 backdrop-blur-md p-4 shadow-2xl transition-all duration-300 hover:border-primary/40">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <RefreshCw className="h-5 w-5" style={{ animation: 'spin 6s linear infinite' }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground text-sm tracking-tight">{t.title}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.desc}</p>
            {countdown !== null && (
              <p className="text-[10px] text-primary/80 font-medium mt-1.5 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                {t.autoReload} {countdown}s...
              </p>
            )}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={onApply}
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold text-xs rounded-lg px-3 py-1.5 shadow-sm transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t.btn}
              </button>
              <button
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground text-xs rounded-lg px-3 py-1.5 transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="shrink-0 text-muted-foreground/60 hover:text-foreground p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
