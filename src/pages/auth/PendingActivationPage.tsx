import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { FaciloopBrand } from '../../components/common/FaciloopBrand';
import { usePlatformSettings } from '../../hooks/usePlatformSettings';

export const PendingActivationPage: React.FC = () => {
  const { t } = useTranslation('auth');
  const location = useLocation();
  const regData = location.state || JSON.parse(localStorage.getItem('faciloop_pending_registration') || '{}');

  const companyName = regData.entreprise || t('pendingCompanyFallback');
  const platformSettings = usePlatformSettings();
  const supportPhone = platformSettings.whatsapp_support
    ? platformSettings.whatsapp_support.replace(/\D/g, '')
    : '33614578547';
  const supportPhoneDisplay = platformSettings.whatsapp_support || '+33 6 14 57 85 47';

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(t('whatsappMessage', { company: companyName }));
    window.open(`https://wa.me/${supportPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-primary/20 selection:text-primary">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-70 sm:w-[400px] h-70 sm:h-[400px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-center space-y-6 relative"
      >
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <Link to="/">
            <FaciloopBrand size="lg" />
          </Link>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-black">
          <Clock className="w-4 h-4 animate-spin-slow shrink-0" />
          <span>{t('pendingTitle')}</span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-foreground">
            {t('pendingTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold leading-relaxed max-w-md mx-auto">
            {t('pendingDescription')}
          </p>
        </div>

        {/* WhatsApp */}
        <div className="p-4 sm:p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 text-left">
          <div className="flex items-center gap-2.5 text-emerald-600 font-extrabold text-xs">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div>{t('contactWhatsApp')}</div>
              <div className="text-[11px] font-semibold text-muted-foreground">{t('whatsappActivationSubtitle')}</div>
            </div>
          </div>

          <button
            onClick={handleWhatsAppContact}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4.5 h-4.5 fill-white" />
            <span>{t('contactWhatsApp')} ({supportPhoneDisplay})</span>
          </button>
        </div>

        {/* Back to login */}
        <div className="pt-2">
          <Link
            to="/login"
            className="w-full py-3.5 rounded-2xl border border-input text-xs sm:text-sm font-extrabold text-foreground hover:bg-muted active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{t('goToLogin')}</span>
            <ArrowRight className="w-4 h-4 text-primary" />
          </Link>
        </div>
      </motion.div>

      <div className="fixed bottom-4 right-4 z-50">
        <LanguageToggle />
      </div>
    </div>
  );
};
