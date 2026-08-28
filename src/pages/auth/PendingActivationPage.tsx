import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Clock, ShieldCheck, CheckCircle2, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LanguageToggle } from '../../components/common/LanguageToggle';

export const PendingActivationPage: React.FC = () => {
  const { t, i18n } = useTranslation('auth');
  const isEn = i18n.language?.startsWith('en');
  const location = useLocation();
  const navigate = useNavigate();
  const regData = location.state || JSON.parse(localStorage.getItem('faciloop_pending_registration') || '{}');

  const companyName = regData.entreprise || (isEn ? 'Your Company' : 'Votre Entreprise');
  const superAdminPhone = '221711387878';

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      isEn
        ? `Hello, I just created my company account "${companyName}" on Faciloop CRM. Could you please activate my access? Thank you.`
        : `Bonjour, je viens de créer le compte de mon entreprise "${companyName}" sur Faciloop CRM. Pouvez-vous procéder à l'activation de mon accès ? Merci.`
    );
    window.open(`https://wa.me/${superAdminPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-primary/20 selection:text-primary">
      {/* Background Decorative Ambient Blur Gradients */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-70 sm:w-[400px] h-70 sm:h-[400px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-extrabold">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span>{isEn ? 'Status: Pending Validation' : 'Statut : Validation en cours'}</span>
        </div>

        {/* Main Title & Explanation */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-foreground">
            {isEn ? 'Registration Submitted!' : 'Inscription enregistrée !'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold leading-relaxed max-w-md mx-auto">
            {isEn ? (
              <>Your company account for <strong className="text-foreground">{companyName}</strong> has been created. Our team will validate your access within <strong>24 hours</strong>.</>
            ) : (
              <>Le compte d'entreprise pour <strong className="text-foreground">{companyName}</strong> a été créé. Notre équipe valide votre accès sous <strong>24h</strong>.</>
            )}
          </p>
        </div>

        {/* Professional 3-Step Progress Tracker */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-left space-y-3">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            {isEn ? 'Activation Process' : "Processus d'activation"}
          </div>
          <div className="space-y-2.5 text-xs font-bold">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{isEn ? '1. Account Creation (Completed)' : '1. Création du compte (Effectuée)'}</span>
            </div>
            <div className="flex items-center gap-3 text-amber-500">
              <Clock className="w-4 h-4 shrink-0 animate-spin-slow" />
              <span>{isEn ? '2. Admin Verification (In progress - max 24h)' : '2. Vérification administrateur (En cours - max 24h)'}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground opacity-60">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{isEn ? '3. Access Activation & Notification' : '3. Activation des accès & Notification'}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Direct Activation Express Card */}
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
              <div className="p-2 rounded-xl bg-emerald-500/10 shrink-0">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <div className="font-extrabold text-sm">{isEn ? 'Instant WhatsApp Activation' : 'Activation Instantanée WhatsApp'}</div>
                <div className="text-[11px] font-medium text-muted-foreground mt-0.5">
                  {isEn ? 'Get access unlocked in less than 15 minutes' : 'Débloquez votre accès en moins de 15 minutes'}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleWhatsAppContact}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4.5 h-4.5 fill-white" />
            <span>{isEn ? 'Contact Support (+221 71 138 78 78)' : 'Contacter le Support (+221 71 138 78 78)'}</span>
          </button>
        </div>

        {/* Go to Login Button */}
        <div className="pt-1">
          <Link
            to="/login"
            className="w-full py-3.5 rounded-xl border border-input text-xs sm:text-sm font-extrabold text-foreground hover:bg-muted active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{t('goToLogin')}</span>
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
