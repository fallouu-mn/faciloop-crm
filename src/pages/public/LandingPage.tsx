import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Kanban, 
  MessageSquare, 
  ShieldCheck, 
  CalendarClock, 
  BarChart3, 
  Zap, 
  Check, 
  ArrowRight, 
  Users, 
  Globe2, 
  Sparkles,
  Lock,
  ArrowUpRight,
  Mail,
  Phone,
  Play,
  CheckCircle2,
  TrendingUp,
  Award,
  Crown,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'mensuel' | 'annuel'>('annuel');
  const [currency, setCurrency] = useState<'XOF' | 'EUR'>('XOF');

  // Interactive Live Kanban Demo State
  const [demoStep, setDemoStep] = useState<number>(1);
  const demoCards = [
    { title: 'Sénégal Telecom Solutions', amount: '3 500 000 FCFA', step: 'Nouveau', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
    { title: 'MaNou Fashion Services', amount: '750 000 FCFA', step: 'Devis Envoyé', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
    { title: 'Dakar Agro Tech', amount: '2 000 000 FCFA', step: 'Gagné (Client)', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' }
  ];

  const plans = [
    {
      name: 'SaaS Starter',
      badge: 'Pour petites équipes',
      description: 'Idéal pour démarrer la gestion structurée des prospects et relances.',
      priceXOF: billingCycle === 'annuel' ? '250 000 FCFA' : '25 000 FCFA',
      priceEUR: billingCycle === 'annuel' ? '380 €' : '38 €',
      period: billingCycle === 'annuel' ? '/ an' : '/ mois',
      features: [
        'Jusqu’à 3 commerciaux',
        '1000 prospects attribués',
        'Pipeline Kanban 6 étapes MVP',
        'Relances quotidiennes & Alertes',
        'Détection anti-doublon par téléphone',
        'Exportation CSV & JSON'
      ],
      popular: false,
      cta: 'Démarrer gratuitement'
    },
    {
      name: 'SaaS Business Pro',
      badge: 'Formule Recommandée',
      description: 'Pour PME & équipes commerciales en forte croissance.',
      priceXOF: billingCycle === 'annuel' ? '750 000 FCFA' : '75 000 FCFA',
      priceEUR: billingCycle === 'annuel' ? '1 140 €' : '114 €',
      period: billingCycle === 'annuel' ? '/ an' : '/ mois',
      features: [
        'Jusqu’à 10 commerciaux',
        'Prospects & Clients illimités',
        'Pipeline Kanban + Déclencheur WhatsApp direct',
        'Réattribution en masse des prospects (Admin)',
        'Dashboard statistiques Recharts',
        'Import CSV avec parsing & dédoublonnage',
        'Support prioritaire 24/7'
      ],
      popular: true,
      cta: 'Souscrire maintenant'
    },
    {
      name: 'SaaS Enterprise',
      badge: 'Sur-mesure',
      description: 'Pour grands groupes, multi-filiales & agences internationales.',
      priceXOF: 'Sur devis',
      priceEUR: 'Sur devis',
      period: '',
      features: [
        'Commerciaux illimités',
        'Pipelines multiples personnalisables',
        'Accès API REST & Webhooks',
        'Gestion multi-organisations (Super-Admin)',
        'Facturation & Devis PDF intégrés',
        'Commissions commerciales automatiques',
        'Accompagnement & Formation dédiés'
      ],
      popular: false,
      cta: 'Contacter notre équipe'
    }
  ];

  // Stagger Container Variants for Scroll Reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Top Offer Banner (Optimized & Compact for Mobile Screens) */}
      <div className="bg-gradient-faciloop py-1.5 px-3 text-center text-white text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md">
        <Sparkles className="w-3.5 h-3.5 animate-spin-slow shrink-0" />
        <span>⚡ Offre Lancement V2.0 : 14 jours d'essai gratuit !</span>
        <Link to="/login" className="underline font-black hover:text-white/80 shrink-0 ml-1">Créer mon compte →</Link>
      </div>

      {/* Header Navigation with Glassmorphism */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/85 backdrop-blur-xl transition-all font-sans">
        <div className="mx-auto flex h-14 sm:h-20 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-faciloop text-white shadow-lg shadow-primary/25 shrink-0">
              <span className="text-lg sm:text-2xl font-black">F</span>
            </div>
            <div className="flex flex-col shrink-0">
              <span className="text-sm sm:text-xl font-extrabold tracking-tight text-gradient-faciloop">Faciloop CRM</span>
              <span className="hidden sm:block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">SaaS B2B Multi-Tenant</span>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            <a href="#demo-live" className="hover:text-primary transition-colors flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-primary" /> Démo Live
            </a>
            <a href="#features" className="hover:text-primary transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Tarifs</a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/login"
              className="hidden sm:inline-block rounded-xl border border-input bg-card px-4 py-2 text-xs font-bold text-foreground shadow-sm hover:bg-muted transition-all"
            >
              Espace Client
            </Link>
            <Link
              to="/login"
              className="rounded-xl bg-gradient-faciloop px-3.5 py-1.5 sm:px-5 sm:py-2.5 text-xs font-extrabold text-white shadow-lg shadow-primary/25 hover:opacity-95 active:scale-95 transition-all shrink-0 flex items-center gap-1"
            >
              <span>Connexion</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Perfect Mobile Typography & Proportions */}
      <section className="relative pt-8 pb-16 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Glow Spheres Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-gradient-to-tr from-primary/25 via-accent/15 to-emerald-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />

        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] sm:text-xs font-extrabold text-primary mb-4 sm:mb-6 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 animate-spin-slow shrink-0" />
            <span>✨ CRM B2B Multi-Entreprises 2.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-5xl lg:text-7xl font-black tracking-tight text-foreground max-w-5xl mx-auto leading-[1.2] sm:leading-[1.1]"
          >
            Le CRM commercial B2B conçu pour accélérer vos ventes et{' '}
            <span className="text-gradient-faciloop">convertir vos prospects</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 sm:mt-6 text-xs sm:text-xl text-muted-foreground max-w-2xl sm:max-w-3xl mx-auto font-semibold leading-relaxed"
          >
            Suivi de portefeuille par commercial, pipeline Kanban 6 étapes, relances quotidiennes et déclencheur WhatsApp direct en 1 clic.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 max-w-xs sm:max-w-none mx-auto"
          >
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-gradient-faciloop text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Accéder à la plateforme</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#demo-live"
              className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl border border-border bg-card/80 backdrop-blur text-foreground font-bold text-xs sm:text-sm hover:bg-muted transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-primary fill-primary" />
              <span>Tester le Kanban en direct</span>
            </a>
          </motion.div>

          {/* Floating Live Product Mockup Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 sm:mt-20 relative max-w-5xl mx-auto"
          >
            {/* Ambient Border Glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-faciloop opacity-20 blur-xl pointer-events-none" />

            {/* Central Interactive CRM Mockup Card */}
            <div className="relative rounded-2xl sm:rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl shadow-2xl p-3 sm:p-6 overflow-hidden space-y-3 sm:space-y-4">
              {/* Fake Browser Window Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-2 sm:pb-3 text-xs">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-muted-foreground ml-1 truncate max-w-[140px] sm:max-w-none">
                    app.faciloop.com/app/kanban
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] sm:text-[10px] font-black uppercase shrink-0">
                  ● Workspace Active
                </span>
              </div>

              {/* Mini Interactive Kanban Columns Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-left">
                {demoCards.map((card, idx) => (
                  <div key={idx} className={`p-3 sm:p-4 rounded-2xl border ${card.color} bg-card space-y-1.5 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">{card.step}</span>
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <h4 className="font-extrabold text-xs text-foreground">{card.title}</h4>
                    <div className="text-xs font-black text-foreground">{card.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Key Metrics Strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 max-w-4xl mx-auto"
          >
            {[
              { val: '+120%', label: 'Taux de relance effective', color: 'text-primary' },
              { val: '100%', label: 'Isolation Multi-Tenant RLS', color: 'text-emerald-500' },
              { val: '0 Doublon', label: 'Anti-doublon téléphone', color: 'text-amber-500' },
              { val: '< 30 sec', label: 'Prise en main commercial', color: 'text-purple-500' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -3, scale: 1.02 }}
                className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-md space-y-0.5"
              >
                <div className={`text-xl sm:text-3xl font-black ${stat.color}`}>{stat.val}</div>
                <div className="text-[10px] sm:text-xs font-bold text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live Interactive Kanban Demo Showcase Section */}
      <section id="demo-live" className="py-14 sm:py-20 border-t border-border/60 bg-muted/20 relative">
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
          <div className="max-w-3xl mx-auto space-y-2">
            <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary">Expérience Utilisateur Interactive</h2>
            <p className="text-2xl sm:text-5xl font-black tracking-tight text-foreground">
              Le Pipeline Kanban 6 Étapes en Action
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
              Découvrez la fluidité du glisser-déposer et de la boucle d'action WhatsApp
            </p>
          </div>

          <div className="p-4 sm:p-8 rounded-3xl border border-border/80 bg-card shadow-2xl max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {['1. Qualification', '2. À Contacter', '3. Démo / RDV', '4. Devis Envoyé', '5. Gagné (Client)', '6. Motif Perte'].map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setDemoStep(idx + 1)}
                  className={`px-3 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all ${
                    demoStep === idx + 1
                      ? 'bg-gradient-faciloop text-white shadow-md'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-muted/40 border border-border/60 text-left space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-primary">Étape Active #{demoStep}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black">
                  ✔ Conforme au CDC
                </span>
              </div>
              <h3 className="text-sm sm:text-lg font-black text-foreground leading-snug">
                {demoStep === 1 && "Importation & Anti-Doublon : Le prospect est automatiquement nettoyé (E.164 +221) et vérifié."}
                {demoStep === 2 && "Relance Quotidienne : Le commercial déclenche l'appel ou WhatsApp direct."}
                {demoStep === 3 && "Fixation de Démo : La date de relance est mise à jour avec notification."}
                {demoStep === 4 && "Transmission de l'Offre : Suivi du devis avec mise en avant du budget estimé."}
                {demoStep === 5 && "Vente Conclue ! Le prospect bascule en Client Faciloop et génère l'accès."}
                {demoStep === 6 && "Sauvegarde des Motifs de Perte : Formulaire obligatoire pour l'amélioration continue."}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-16 sm:py-24 relative">
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary">Fonctionnalités Clés</h2>
            <p className="mt-2 text-2xl sm:text-5xl font-black tracking-tight text-foreground">
              Conçu pour l'efficacité de vos commerciaux
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mt-10 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8"
          >
            {[
              {
                icon: Kanban,
                color: 'bg-blue-500/10 text-blue-500',
                title: 'Pipeline Kanban 6 Étapes MVP',
                desc: 'Visualisez vos opportunités selon le modèle standard du CDC. Glissez-déposez vos cartes avec déclenchement automatique des modales de motif de perte et de conversion.'
              },
              {
                icon: MessageSquare,
                color: 'bg-emerald-500/10 text-emerald-500',
                title: 'Déclencheur WhatsApp Direct',
                desc: 'Lancez des conversations directes avec des messages pré-remplis sur WhatsApp en 1 clic depuis la fiche prospect ou la liste des relances.'
              },
              {
                icon: CalendarClock,
                color: 'bg-amber-500/10 text-amber-500',
                title: 'Priorités & Relances Quotidiennes',
                desc: 'Gardez le contrôle sur les rendez-vous prévus aujourd\'hui et éliminez les relances en retard grâce à une vue synthétique par commercial.'
              },
              {
                icon: ShieldCheck,
                color: 'bg-purple-500/10 text-purple-500',
                title: 'Isolation Portefeuille & Multi-Tenant',
                desc: 'Isolation stricte des prospects attribués à chaque commercial. L\'Admin conserve une vue globale et un contrôle total sur l\'organisation.'
              },
              {
                icon: BarChart3,
                color: 'bg-rose-500/10 text-rose-500',
                title: 'Tableau de Bord & Analytics Recharts',
                desc: 'Suivez le chiffre d\'affaires, les conversions et comparez les résultats de vos équipes grâce à des graphiques dynamiques.'
              },
              {
                icon: Building2,
                color: 'bg-cyan-500/10 text-cyan-500',
                title: 'Import CSV & Réattribution Masse',
                desc: 'Importez des listes CSV avec séparateurs automatiques, détection des doublons téléphoniques et attribution en masse aux commerciaux.'
              }
            ].map((feat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-md hover:shadow-2xl hover:border-primary/40 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${feat.color} flex items-center justify-center mb-4 sm:mb-6 font-extrabold shadow-md`}>
                  <feat.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-foreground group-hover:text-primary transition-colors">{feat.title}</h3>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground font-semibold leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary">Tarifs Transparents</h2>
            <p className="mt-2 text-2xl sm:text-5xl font-black tracking-tight text-foreground">
              Une formule adaptée à chaque étape
            </p>

            {/* Fluid Toggle Controls */}
            <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Billing Cycle Toggle */}
              <div className="relative flex items-center rounded-2xl bg-muted p-1.5 text-xs font-bold border border-border w-full sm:w-auto justify-center">
                <button
                  onClick={() => setBillingCycle('mensuel')}
                  className="relative z-10 px-4 py-2 transition-colors text-foreground"
                >
                  {billingCycle === 'mensuel' && (
                    <motion.div
                      layoutId="billing-pill"
                      className="absolute inset-0 bg-card rounded-xl shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={billingCycle === 'mensuel' ? 'text-foreground font-black' : 'text-muted-foreground'}>Mensuel</span>
                </button>

                <button
                  onClick={() => setBillingCycle('annuel')}
                  className="relative z-10 px-4 py-2 transition-colors text-foreground"
                >
                  {billingCycle === 'annuel' && (
                    <motion.div
                      layoutId="billing-pill"
                      className="absolute inset-0 bg-gradient-faciloop rounded-xl shadow-md -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={billingCycle === 'annuel' ? 'text-white font-black' : 'text-muted-foreground'}>
                    Annuel (-20%)
                  </span>
                </button>
              </div>

              {/* Currency Toggle */}
              <div className="relative flex items-center rounded-2xl bg-muted p-1.5 text-xs font-bold border border-border w-full sm:w-auto justify-center">
                <button
                  onClick={() => setCurrency('XOF')}
                  className="relative z-10 px-4 py-2 transition-colors"
                >
                  {currency === 'XOF' && (
                    <motion.div
                      layoutId="currency-pill"
                      className="absolute inset-0 bg-primary rounded-xl shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={currency === 'XOF' ? 'text-white font-black' : 'text-muted-foreground'}>FCFA (XOF)</span>
                </button>

                <button
                  onClick={() => setCurrency('EUR')}
                  className="relative z-10 px-4 py-2 transition-colors"
                >
                  {currency === 'EUR' && (
                    <motion.div
                      layoutId="currency-pill"
                      className="absolute inset-0 bg-primary rounded-xl shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={currency === 'EUR' ? 'text-white font-black' : 'text-muted-foreground'}>EUR (€)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mt-10 sm:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`relative rounded-3xl p-6 sm:p-8 border backdrop-blur-xl transition-all duration-300 flex flex-col justify-between ${
                  plan.popular
                    ? 'border-primary bg-card/90 shadow-2xl shadow-primary/15 ring-2 ring-primary'
                    : 'border-border/80 bg-card/70 shadow-lg'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-primary">{plan.badge}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-foreground mt-2">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-2 leading-relaxed">{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-foreground">
                      {currency === 'XOF' ? plan.priceXOF : plan.priceEUR}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">{plan.period}</span>
                  </div>

                  <ul className="mt-6 space-y-3 border-t border-border/60 pt-6">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5 text-xs text-foreground font-bold">
                        <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 sm:mt-8">
                  <Link
                    to="/login"
                    className={`w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                      plan.popular
                        ? 'bg-gradient-faciloop text-white shadow-xl shadow-primary/30 hover:opacity-95'
                        : 'border border-input bg-card text-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-card/90 pt-12 pb-8 backdrop-blur-xl font-sans">
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
            {/* Brand Column */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-faciloop flex items-center justify-center text-white font-black text-base shadow-md shrink-0">
                  F
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold tracking-tight text-gradient-faciloop">Faciloop CRM SaaS</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Par Digit'Advisor SAS</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground font-semibold max-w-sm leading-relaxed">
                Solution CRM B2B multi-entreprises développée pour dynamiser la prospection, le suivi de pipeline et l'automatisation des relances commerciales en Afrique et à l'international.
              </p>

              {/* International Contact Line */}
              <div className="space-y-2 pt-2 text-xs font-bold text-foreground">
                <a
                  href="mailto:contact@faciloop.com"
                  className="flex items-center gap-2 hover:text-primary transition-colors inline-block mr-4"
                >
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span>contact@faciloop.com</span>
                </a>

                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground pt-1">
                  <a href="tel:+33614578547" className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <span>🇫🇷 +33 6 14 57 85 47</span>
                  </a>
                  <span>•</span>
                  <a href="tel:+221711387878" className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <span>🇸🇳 +221 71 138 78 78</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Links Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Navigation</h4>
              <ul className="space-y-2.5 font-bold text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités CRM</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Tarifs Transparents</a></li>
                <li><Link to="/login" className="hover:text-foreground transition-colors">Espace Client & Connexion</Link></li>
                <li><Link to="/login" className="hover:text-foreground transition-colors">Demander une Démo</Link></li>
              </ul>
            </div>

            {/* Legal & Compliance Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Légal & Sécurité</h4>
              <ul className="space-y-2.5 font-bold text-muted-foreground">
                <li>
                  <a
                    href="https://faciloop.digitadvisor.sn/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors flex items-center gap-1.5"
                  >
                    <span>Confidentialité</span>
                    <ArrowUpRight className="w-3 h-3 text-primary" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://faciloop.digitadvisor.sn/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors flex items-center gap-1.5"
                  >
                    <span>CGU (Conditions Générales)</span>
                    <ArrowUpRight className="w-3 h-3 text-primary" />
                  </a>
                </li>
                <li><span className="text-[11px] font-bold text-muted-foreground">Isolation RLS Supabase Active</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-muted-foreground">
            <div>
              © 2026 Digit'Advisor. Tous droits réservés.
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span>CRM SaaS B2B Multi-Tenant</span>
              <span>•</span>
              <span>Dakar • Paris</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
