import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Clock, ShieldCheck, CheckCircle2, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LanguageToggle } from '../../components/common/LanguageToggle';

export const PendingActivationPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const regData = location.state || JSON.parse(localStorage.getItem('faciloop_pending_registration') || '{}');

  const companyName = regData.entreprise || 'Votre Entreprise';
  const superAdminPhone = '221711387878';

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Bonjour, je viens de créer le compte de mon entreprise "${companyName}" sur Faciloop CRM. Pouvez-vous procéder à l'activation de mon accès ? Merci.`
    );
    window.open(`https://wa.me/${superAdminPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-primary/20 selection:text-primary">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-70 sm:w-[400px] h-70 sm:h-[400px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-center space-y-6 relative"
      >
        {/* Faciloop Header Logo */}
        <div className="flex justify-center mb-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-faciloop flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <span className="text-2xl font-black">F</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gradient-faciloop">faciloop</span>
          </Link>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-black">
          <Clock className="w-4 h-4 animate-spin-slow shrink-0" />
          <span>{t('auth.pendingTitle')}</span>
        </div>

        {/* Main Title & Explanation */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-foreground">
            {t('auth.pendingTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold leading-relaxed max-w-md mx-auto">
            {t('auth.pendingDescription')}
          </p>
        </div>

        {/* WhatsApp Direct Activation Trigger */}
        <div className="p-4 sm:p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 text-left">
          <div className="flex items-center gap-2.5 text-emerald-600 font-extrabold text-xs">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div>{t('auth.contactWhatsApp')}</div>
              <div className="text-[11px] font-semibold text-muted-foreground">Activation rapide par message direct</div>
            </div>
          </div>

          <button
            onClick={handleWhatsAppContact}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4.5 h-4.5 fill-white" />
            <span>{t('auth.contactWhatsApp')} (+221 71 138 78 78)</span>
          </button>
        </div>

        {/* Action Options */}
        <div className="pt-2">
          <Link
            to="/login"
            className="w-full py-3.5 rounded-2xl border border-input text-xs sm:text-sm font-extrabold text-foreground hover:bg-muted active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{t('auth.goToLogin')}</span>
            <ArrowRight className="w-4 h-4 text-primary" />
          </Link>
        </div>
      </motion.div>

      {/* Floating Language Switcher Pill */}
      <div className="fixed bottom-4 right-4 z-50">
        <LanguageToggle />
      </div>
    </div>
  );
};
