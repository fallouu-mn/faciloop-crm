import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Kanban,
  MessageSquare,
  ShieldCheck,
  CalendarClock,
  BarChart3,
  Building2,
  Check,
  ArrowRight,
  Sparkles,
  Play,
  ArrowUpRight,
  LockKeyhole,
  Crown,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FaciloopBrand } from '../../components/common/FaciloopBrand';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { FadeInOnScroll } from '../../components/common/FadeInOnScroll';
import { FormuleConfig, getFormules } from '../../services/formulesSaas';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<string>('mensuel');
  const [currency, setCurrency] = useState<DeviseCode>('XOF');
  const [demoStep, setDemoStep] = useState<number>(1);
  const [formules, setFormules] = useState<FormuleConfig[]>([]);
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);

  useEffect(() => {
    getFormules().then(data => setFormules(data.filter(f => f.isActive))).catch(() => {});
  }, []);

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', currency), currency);

  const isEn = i18n.language?.startsWith('en');

  const PERIODICITES = [
    { code: 'mensuel', label: 'Mensuel' },
    { code: 'trimestriel', label: 'Trimestriel' },
    { code: 'annuel', label: 'Annuel' },
  ];

  const periodLabels: Record<string, string> = {
    mensuel: isEn ? '/month' : '/mois',
    trimestriel: isEn ? '/3 months' : '/3 mois',
    annuel: isEn ? '/year' : '/an',
  };

  const getPrice = (f: FormuleConfig) => {
    if (billingCycle === 'mensuel') return f.pricing.mensuel;
    if (billingCycle === 'trimestriel') return f.pricing.trimestriel;
    return f.pricing.annuel;
  };

  const getNormalPrice = (f: FormuleConfig) => {
    if (billingCycle === 'trimestriel') return f.pricing.trimestriel_normal;
    if (billingCycle === 'annuel') return f.pricing.annuel_normal;
    return 0;
  };

  const getRemise = (f: FormuleConfig) => {
    if (billingCycle === 'trimestriel') return f.pricing.trimestriel_remise;
    if (billingCycle === 'annuel') return f.pricing.annuel_remise;
    return 0;
  };

  const offerFeatures: Record<string, string[]> = {
    Pro: isEn ? [
      "Up to 3 sales reps",
      "Customizable sales pipeline",
      "Automated follow-ups",
      "Anti-duplicate detection",
      "CSV Export",
      "Standard support",
    ] : [
      "Jusqu'à 3 commerciaux",
      'Pipeline commercial personnalisable',
      'Relances automatiques',
      'Détection anti-doublon',
      'Export CSV',
      'Support standard',
    ],
    Business: isEn ? [
      "Up to 10 sales reps",
      "All Pro features",
      "Team objectives",
      "Action audit log",
      "CSV Import & deduplication",
      "Advanced analytics dashboard",
      "Responsive WhatsApp support",
    ] : [
      "Jusqu'à 10 commerciaux",
      'Toutes les fonctionnalités Pro',
      'Objectifs d\'équipe',
      'Journal des actions',
      'Import CSV & dédoublonnage',
      'Dashboard statistiques avancées',
      'Support réactif par WhatsApp',
    ],
    Premium: isEn ? [
      "Unlimited sales reps",
      "All Business features",
      "Custom reports",
      "Dedicated account manager",
      "Onboarding & Training",
    ] : [
      'Commerciaux illimités',
      'Toutes les fonctionnalités Business',
      'Rapports personnalisés',
      'Account manager dédié',
      'Accompagnement & Formation',
    ],
  };

  const offerColors: Record<string, { gradient: string; border: string }> = {
    Pro: { gradient: 'from-amber-400 to-amber-500', border: 'border-amber-400/30' },
    Business: { gradient: 'from-orange-500 to-amber-500', border: 'border-orange-500/30' },
    Premium: { gradient: 'from-orange-600 to-orange-700', border: 'border-orange-600/30' },
  };

  const features = [
    {
      icon: Kanban,
      title: isEn ? 'Customizable Sales Pipeline' : 'Pipeline Commercial Personnalisable',
      desc: isEn
        ? 'Visualize your opportunities with drag-and-drop, loss reason tracking, and client conversion.'
        : 'Visualisez vos opportunités avec le glisser-déposer, le suivi des motifs de perte et la conversion client.',
    },
    {
      icon: MessageSquare,
      title: isEn ? 'Integrated WhatsApp' : 'WhatsApp Intégré',
      desc: isEn
        ? 'Launch pre-filled WhatsApp conversations in 1 click right from the prospect card.'
        : 'Lancez des conversations WhatsApp pré-remplies en 1 clic depuis la fiche prospect.',
    },
    {
      icon: CalendarClock,
      title: isEn ? 'Organized Follow-ups' : 'Relances Organisées',
      desc: isEn
        ? 'Stay in control of today\'s meetings and never miss a follow-up.'
        : 'Gardez le contrôle sur les RDV du jour et ne manquez aucune relance.',
    },
    {
      icon: ShieldCheck,
      title: isEn ? 'Secure Data & Portfolios' : 'Données & Portefeuilles Sécurisés',
      desc: isEn
        ? 'Each sales rep only sees their own portfolio. Admins get a full team overview.'
        : 'Chaque commercial accède uniquement à son portefeuille. L\'admin dispose d\'une vue globale sur toute l\'équipe.',
    },
    {
      icon: BarChart3,
      title: isEn ? 'Dashboard & Analytics' : 'Tableau de Bord & Statistiques',
      desc: isEn
        ? 'Track revenue, conversions, and compare sales team performance with dynamic charts.'
        : 'Suivez le CA, les conversions et comparez vos équipes avec des graphiques dynamiques.',
    },
    {
      icon: Building2,
      title: isEn ? 'CSV Import & Assignment' : 'Import CSV & Attribution',
      desc: isEn
        ? 'Import prospect lists with duplicate detection and bulk assignment to your team.'
        : 'Importez des listes de prospects avec détection des doublons et attribution en masse à votre équipe.',
    },
  ];

  const pipelineSteps = isEn ? [
    'New', 'To Contact', 'Contacted', 'Interested', 'Meeting Set', 'Demo Done',
    'Trial Ongoing', 'Proposal', 'Payment Pending', 'Won Client', 'To Follow-up', 'Lost',
  ] : [
    'Nouveau', 'À contacter', 'Contacté', 'Intéressé', 'RDV programmé', 'Démo réalisée',
    'Essai en cours', 'Proposition', 'Paiement att.', 'Client gagné', 'À relancer', 'Perdu',
  ];

  const stepDescriptions = isEn ? [
    "New Prospect: Automatic import with phone cleaning (E.164 +221) and anti-duplicate check.",
    "To Contact: Prospect is ready for first contact by the sales representative.",
    "Contacted: First exchange completed, qualifying interest.",
    "Interested: Prospect confirmed interest in the Faciloop solution.",
    "Meeting Set: Meeting date scheduled with automatic notification.",
    "Demo Done: Product demonstration completed, awaiting feedback.",
    "Trial Ongoing: Prospect is testing the platform.",
    "Proposal: Quotation sent, pending agreement.",
    "Payment Pending: Invoice sent, awaiting payment.",
    "Won Client: Deal closed! Converted into an active client.",
    "To Follow-up: Prospect on hold for scheduled later follow-up.",
    "Lost Prospect: Mandatory loss reason for continuous improvement.",
  ] : [
    "Nouveau Prospect : Import automatique avec nettoyage téléphone (E.164 +221) et anti-doublon.",
    "À Contacter : Le prospect est prêt pour la première prise de contact par le commercial.",
    "Contacté : Premier échange effectué, le commercial qualifie l'intérêt.",
    "Intéressé : Le prospect a confirmé son intérêt pour la solution Faciloop.",
    "RDV Programmé : Date de rendez-vous fixée avec notification automatique.",
    "Démo Réalisée : Démonstration produit effectuée, en attente de retour.",
    "Essai en Cours : Le prospect teste actuellement la plateforme.",
    "Proposition : Devis envoyé, en attente de validation.",
    "Paiement en Attente : Facture transmise, en attente de règlement.",
    "Client Gagné : Vente conclue ! Conversion en client actif.",
    "À Relancer Plus Tard : Prospect mis en veille pour relance ultérieure programmée.",
    "Prospect Perdu : Motif de perte obligatoire pour l'amélioration continue.",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 max-w-6xl mx-auto">
          <Link to="/" className="flex items-center">
            <FaciloopBrand className="h-8 sm:h-10" />
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageToggle className="scale-[0.85] sm:scale-100 origin-right" />
            <ThemeToggle />

            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <LockKeyhole className="h-4 w-4" />
              <span>{isEn ? 'Log in' : 'Connexion'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <FadeInOnScroll>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isEn ? 'Simple CRM for SMBs' : 'CRM simple pour TPE / PME'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight max-w-4xl mx-auto">
              {isEn ? (
                <>
                  The simple CRM to better track your prospects and{' '}
                  <span className="text-gradient-faciloop">grow your sales</span>
                </>
              ) : (
                <>
                  Le CRM simple pour mieux suivre vos prospects et{' '}
                  <span className="text-gradient-faciloop">développer vos ventes</span>
                </>
              )}
            </h1>

            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
              {isEn
                ? 'Centralize your prospects, organize follow-ups, track your sales team and manage your sales from one platform.'
                : 'Centralisez vos prospects, organisez les relances, suivez vos commerciaux et pilotez vos ventes depuis une seule plateforme.'}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-gradient-faciloop text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity"
              >
                <span>{isEn ? 'Access Platform' : 'Accéder à la plateforme'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="/demo/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-full border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors"
              >
                <Play className="w-4 h-4 text-primary fill-primary" />
                <span>{isEn ? 'View Demo' : 'Voir la démo'}</span>
              </a>
            </div>
          </FadeInOnScroll>

          {/* Metrics */}
          <FadeInOnScroll delay={200}>
            <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
              {[
                { icon: '📋', label: isEn ? 'Centralized prospects' : 'Prospects centralisés' },
                { icon: '🔔', label: isEn ? 'Organized follow-ups' : 'Relances organisées' },
                { icon: '👥', label: isEn ? 'Team oversight' : 'Équipe pilotée' },
                { icon: '🔒', label: isEn ? 'Secure data' : 'Données sécurisées' },
              ].map((stat, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-card text-center">
                  <div className="text-2xl sm:text-3xl">{stat.icon}</div>
                  <div className="text-xs text-muted-foreground mt-1.5 font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <FadeInOnScroll>
            <div className="text-center mb-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                {isEn ? 'CUSTOMIZABLE SALES PIPELINE' : 'Pipeline Commercial Personnalisable'}
              </p>
              <h2 className="text-xl sm:text-3xl font-bold text-foreground">
                {isEn ? 'Your sales pipeline in action' : 'Votre pipeline commercial en action'}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isEn ? '12 stages included by default — adapt them to your sales process' : '12 étapes incluses par défaut — adaptez-les à votre processus commercial'}
              </p>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={100}>
            <div className="p-4 sm:p-6 rounded-xl border border-border bg-card">
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-4">
                {pipelineSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setDemoStep(idx + 1)}
                    className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      demoStep === idx + 1
                        ? 'bg-gradient-faciloop text-white shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {idx + 1}. {step}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary">
                    {isEn ? `Step #${demoStep}` : `Étape #${demoStep}`}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {stepDescriptions[demoStep - 1]}
                </p>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <FadeInOnScroll>
            <div className="text-center mb-8 sm:mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                {isEn ? 'KEY FEATURES' : 'Fonctionnalités Clés'}
              </p>
              <h2 className="text-xl sm:text-3xl font-bold text-foreground">
                {isEn ? "Designed for your sales reps' efficiency" : "Conçu pour l'efficacité de vos commerciaux"}
              </h2>
            </div>
          </FadeInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {features.map((feat, idx) => (
              <FadeInOnScroll key={idx} delay={idx * 80}>
                <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <feat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{feat.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <FadeInOnScroll>
            <div className="text-center mb-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                {isEn ? 'TRANSPARENT PRICING' : 'Tarifs Transparents'}
              </p>
              <h2 className="text-xl sm:text-3xl font-bold text-foreground">
                {isEn ? 'A plan tailored for every stage' : 'Une formule adaptée à chaque étape'}
              </h2>

              {/* Toggles */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="inline-flex items-center rounded-full bg-muted p-1 border border-border text-sm">
                  {PERIODICITES.map((p) => (
                    <button
                      key={p.code}
                      onClick={() => setBillingCycle(p.code)}
                      className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                        billingCycle === p.code
                          ? 'bg-gradient-faciloop text-white shadow-sm'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {isEn ? (p.code === 'mensuel' ? 'Monthly' : p.code === 'trimestriel' ? 'Quarterly' : 'Annual') : p.label}
                      {p.code === 'annuel' ? '' : p.code === 'trimestriel' ? ' ' : ''}
                    </button>
                  ))}
                </div>

                <div className="inline-flex items-center rounded-full bg-muted p-0.5 sm:p-1 border border-border shrink-0">
                  {(['XOF', 'EUR', 'USD'] as DeviseCode[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                        currency === c ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'
                      }`}
                    >
                      {c === 'XOF' ? 'FCFA' : c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FadeInOnScroll>

          {/* Plans from FORMULES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {formules.map((f, idx) => {
              const color = offerColors[f.code];
              const isPopular = f.code === 'Business';
              const price = getPrice(f);
              const normalPrice = getNormalPrice(f);
              const remise = getRemise(f);

              return (
                <FadeInOnScroll key={f.code} delay={idx * 100}>
                  <div
                    className={`rounded-xl overflow-hidden border flex flex-col justify-between h-full ${
                      isPopular
                        ? `${color.border} bg-card shadow-lg ring-2 ring-orange-500/20`
                        : 'border-border bg-card'
                    }`}
                  >
                    {/* Card Gradient Header */}
                    <div className={`px-5 py-4 bg-gradient-to-r ${color.gradient} text-white`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="h-5 w-5" />
                          <span className="text-lg font-bold">{f.label}</span>
                        </div>
                        {isPopular && (
                          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                            {isEn ? 'Recommended' : 'Recommandé'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/80 mt-1">
                        {isEn
                          ? f.code === 'Pro' ? 'Ideal for small sales teams' : f.code === 'Business' ? 'For growing businesses' : 'Complete solution for large organizations'
                          : f.description}
                      </p>
                    </div>

                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      {/* Price */}
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-bold text-foreground">
                            {fmt(price)}
                          </span>
                          <span className="text-sm text-muted-foreground">{periodLabels[billingCycle]}</span>
                        </div>
                        {remise > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground line-through">{fmt(normalPrice)}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold">
                              -{remise}%
                            </span>
                          </div>
                        )}
                        {billingCycle === 'mensuel' && f.pricing.mensuel_premier_mois && (
                          <div className="mt-1">
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold">
                              {isEn ? `1st month: ${fmt(f.pricing.mensuel_premier_mois)}` : `1er mois: ${fmt(f.pricing.mensuel_premier_mois)}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="mt-5 space-y-2.5 border-t border-border pt-5 flex-1">
                        {(offerFeatures[f.code] || []).map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-sm text-foreground">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <div className="mt-6">
                        {f.code === 'Premium' ? (
                          <a
                            href={`https://wa.me/221711387878?text=${encodeURIComponent(isEn ? 'Hello, I would like information about the Premium plan.' : 'Bonjour, je souhaite des informations sur l\'offre Premium.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all border border-border text-foreground hover:bg-muted"
                          >
                            <span>{isEn ? 'Contact our team' : 'Contacter notre équipe'}</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        ) : (
                          <Link
                            to="/signup"
                            className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all ${
                              isPopular
                                ? 'bg-gradient-faciloop text-white shadow-md hover:opacity-90'
                                : 'border border-border text-foreground hover:bg-muted'
                            }`}
                          >
                            <span>
                              {isPopular
                                ? (isEn ? 'Subscribe Now' : 'Souscrire maintenant')
                                : (isEn ? 'Get started' : "S'inscrire")}
                            </span>
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeInOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trial CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <FadeInOnScroll>
            <div className="p-6 sm:p-10 rounded-xl border border-border bg-card">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {isEn ? 'Ready to transform your sales prospecting?' : 'Prêt à transformer votre prospection ?'}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
                {isEn
                  ? 'Set up your pipeline in less than 2 minutes.'
                  : "Configurez votre pipeline en moins de 2 minutes."}
              </p>

              <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-foreground">
                {(isEn
                  ? ['Customizable pipeline', 'Built-in WhatsApp', 'Secure data', 'Dedicated support']
                  : ['Pipeline personnalisable', 'WhatsApp intégré', 'Données sécurisées', 'Support dédié']
                ).map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-faciloop text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity"
                >
                  <span>{isEn ? 'Create my free account' : 'Créer mon compte gratuitement'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-10">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <FaciloopBrand className="h-7 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {isEn
              ? 'The simple CRM to centralize your prospects and grow your sales.'
              : 'Le CRM simple pour centraliser vos prospects et développer vos ventes.'}
          </p>

          {/* Social links */}
          <div className="flex items-center justify-center gap-4">
            <a href="https://www.instagram.com/faciloop_app" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0h.003zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@faciloop" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="TikTok">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/faciloop" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://www.facebook.com/faciloop" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Facebook">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground border-t border-border/50 pt-4 max-w-md mx-auto">
            <a href="mailto:contact@faciloop.com" className="hover:text-foreground transition-colors">
              contact@faciloop.com
            </a>
            <span className="hidden sm:inline">|</span>
            <a href="tel:+33614578547" className="hover:text-foreground transition-colors">
              🇫🇷 +33 6 14 57 85 47
            </a>
            <span className="hidden sm:inline">|</span>
            <a href="tel:+221711387878" className="hover:text-foreground transition-colors">
              🇸🇳 +221 71 138 78 78
            </a>
          </div>

          {/* Legal */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              {isEn ? 'Privacy Policy' : 'Confidentialité'}
            </Link>
            <span>|</span>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              {isEn ? 'Terms of Service' : 'CGU'}
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            {isEn ? "© 2026 Digit'Advisor. All rights reserved." : "© 2026 Digit'Advisor. Tous droits réservés."}
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp Button (Left) */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2">
        {showWhatsAppMenu && (
          <div className="w-56 rounded-2xl border border-border/70 bg-background/95 p-2 shadow-xl backdrop-blur">
            {[
              { flag: '🇫🇷', label: 'Support France', phone: '33614578547', message: 'Bonjour, je suis intéressé par Faciloopro.' },
              { flag: '🇸🇳', label: 'Support Sénégal', phone: '221711387878', message: 'Bonjour, je suis intéressé par Faciloopro.' },
            ].map((opt) => (
              <a
                key={opt.phone}
                href={`https://wa.me/${opt.phone}?text=${encodeURIComponent(opt.message)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowWhatsAppMenu(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted transition-colors"
              >
                <span className="text-lg leading-none">{opt.flag}</span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">+{opt.phone}</span>
                </span>
              </a>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowWhatsAppMenu(o => !o)}
          className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          aria-label="WhatsApp"
        >
          <svg className="h-5 w-5 sm:h-7 sm:w-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
