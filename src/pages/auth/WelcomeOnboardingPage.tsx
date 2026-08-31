import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Crown, 
  Sparkles, 
  ShoppingBag, 
  Wallet, 
  CreditCard, 
  Calendar, 
  Gift, 
  Check, 
  ArrowRight, 
  Building2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const WelcomeOnboardingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'welcome_choice' | 'onboarding_details'>('welcome_choice');

  const firstName = user?.prenom || 'Mame';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-primary/20 selection:text-primary">
      {/* Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 sm:w-[600px] h-80 sm:h-[600px] bg-primary/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-70 sm:w-[400px] h-70 sm:h-[400px] bg-amber-500/15 rounded-full blur-[160px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* Step 1: Welcome Choice */}
        {step === 'welcome_choice' && (
          <motion.div
            key="welcome_choice"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-center space-y-6 relative"
          >
            {/* Logo */}
            <div className="flex justify-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-11 h-11 rounded-2xl bg-gradient-faciloop flex items-center justify-center text-white shadow-lg shadow-primary/25">
                  <span className="text-2xl font-black">F</span>
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-gradient-faciloop">faciloop</span>
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                {isEn ? 'Welcome to Faciloop!' : 'Bienvenue sur Faciloop !'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
                {isEn ? 'How would you like to get started?' : 'Comment souhaitez-vous démarrer ?'}
              </p>
            </div>

            {/* Option Cards */}
            <div className="space-y-3 pt-2 text-left">
              {/* Option 1: Choisir un abonnement */}
              <button
                onClick={() => setStep('onboarding_details')}
                className="w-full p-4 rounded-2xl border border-border bg-card hover:border-amber-500/50 hover:bg-amber-500/5 transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground group-hover:text-amber-500 transition-colors">
                      {isEn ? 'Choose a plan' : 'Choisir un abonnement'}
                    </h3>
                    <p className="text-xs text-muted-foreground font-semibold">
                      {isEn ? 'Access all features right now' : 'Accédez à toutes les fonctionnalités dès maintenant'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* Option 2: Commencer l'essai gratuit */}
              <button
                onClick={() => setStep('onboarding_details')}
                className="w-full p-4 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-muted text-foreground flex items-center justify-center shadow-sm shrink-0 border border-border">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors">
                      {isEn ? 'Start free trial' : "Commencer l'essai gratuit"}
                    </h3>
                    <p className="text-xs text-muted-foreground font-semibold">
                      {isEn ? 'Test the app with no commitment' : "Testez l'application sans engagement"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Onboarding Details */}
        {step === 'onboarding_details' && (
          <motion.div
            key="onboarding_details"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-center space-y-6 relative"
          >
            {/* Header Logo & Greeting */}
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-faciloop flex items-center justify-center text-white shadow-lg">
                  <span className="text-xl font-black">F</span>
                </div>
                <span className="text-xl font-extrabold tracking-tight text-gradient-faciloop">faciloop</span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-500">
                <Sparkles className="w-4 h-4" />
                <span>{isEn ? 'Discover Faciloop' : 'Découvrez Faciloop'}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                {isEn ? `Welcome ${firstName}!` : `Bienvenue ${firstName} !`}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
                {isEn ? 'The tool that protects your business daily' : "L'outil qui protège votre business au quotidien"}
              </p>
            </div>

            {/* 4 Feature Value Highlight Cards */}
            <div className="space-y-2.5 text-left text-xs font-extrabold">
              <div className="p-3.5 rounded-2xl border border-border/80 bg-muted/30 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-foreground">
                  {isEn ? 'Manage your sales and track your revenue' : "Gérez vos ventes et suivez votre chiffre d'affaires"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-border/80 bg-muted/30 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-foreground">
                  {isEn ? 'Track your credits and follow up via WhatsApp' : 'Suivez vos crédits et relancez par WhatsApp'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-border/80 bg-muted/30 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-foreground">
                  {isEn ? 'Stay in control of your down payments' : 'Gardez le contrôle sur vos acomptes'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-border/80 bg-muted/30 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-foreground">
                  {isEn ? 'Schedule your client meetings' : 'Planifiez vos rendez-vous clients'}
                </span>
              </div>
            </div>

            {/* Trial Offer Box */}
            <div className="p-4 sm:p-5 rounded-3xl border border-amber-500/30 bg-amber-500/5 text-left space-y-2">
              <div className="flex items-center gap-2 text-amber-500 font-black text-xs">
                <Gift className="w-4 h-4" />
                <span>{isEn ? 'Your trial period' : "Votre période d'essai"}</span>
              </div>
              <div className="text-xl font-black text-amber-500">
                {isEn ? '30 days free' : '30 jours offerts'}
              </div>
              
              <div className="text-xs text-muted-foreground font-semibold pt-1">
                {isEn ? 'Included in your trial:' : 'Inclus dans votre essai :'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs font-bold text-foreground pt-1">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isEn ? 'Direct sales' : 'Ventes directes'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isEn ? 'Client credits' : 'Crédits clients'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isEn ? 'Down payments' : 'Acomptes'}</span>
                </div>
              </div>
            </div>

            {/* Main CTA Button & Link */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="w-full py-4 rounded-2xl bg-gradient-faciloop text-white font-black text-sm shadow-xl shadow-primary/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{isEn ? 'Start the adventure!' : "Démarrer l'aventure !"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/admin/parametres"
                className="block text-xs font-extrabold text-amber-500 hover:underline"
              >
                {isEn ? 'Complete my company details' : 'Compléter les infos de mon entreprise'}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
