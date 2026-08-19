import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  PhoneCall, 
  Users, 
  Globe2 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'mensuel' | 'annuel'>('annuel');
  const [currency, setCurrency] = useState<'XOF' | 'EUR'>('XOF');

  const plans = [
    {
      name: 'SaaS Starter',
      description: 'Idéal pour les petites équipes commerciales et TPE.',
      priceXOF: billingCycle === 'annuel' ? '250 000 FCFA' : '25 000 FCFA',
      priceEUR: billingCycle === 'annuel' ? '380 €' : '38 €',
      period: billingCycle === 'annuel' ? '/ an' : '/ mois',
      features: [
        'Jusqu’à 3 utilisateurs',
        '1000 prospects gérés',
        'Pipeline Kanban standard (12 étapes)',
        'Historique des relances quotidiennes',
        'Détection anti-doublon par téléphone',
        'Export CSV'
      ],
      popular: false,
      cta: 'Démarrer gratuitement'
    },
    {
      name: 'SaaS Business Pro',
      description: 'Pour les PME et équipes en forte croissance.',
      priceXOF: billingCycle === 'annuel' ? '750 000 FCFA' : '75 000 FCFA',
      priceEUR: billingCycle === 'annuel' ? '1 140 €' : '114 €',
      period: billingCycle === 'annuel' ? '/ an' : '/ mois',
      features: [
        'Jusqu’à 10 utilisateurs',
        'Prospects illimités',
        'Pipeline Kanban + Déclencheur WhatsApp direct',
        'Dashboard statistiques & Recharts',
        'Import & Export CSV/Excel avec mapping',
        'Gestion des objectifs par commercial',
        'Support prioritaire 24/7'
      ],
      popular: true,
      cta: 'Souscrire maintenant'
    },
    {
      name: 'SaaS Enterprise',
      description: 'Pour grands groupes, multi-filiales & agences.',
      priceXOF: 'Sur devis',
      priceEUR: 'Sur devis',
      period: '',
      features: [
        'Utilisateurs illimités',
        'Pipelines multiples personnalisables',
        'Champs personnalisés sur-mesure',
        'Intégration API REST & Webhooks',
        'Module Facturation & Devis PDF',
        'Calcul des commissions commerciales',
        'Accompagnement dédié & Formation'
      ],
      popular: false,
      cta: 'Contacter l’équipe'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-faciloop text-white shadow-lg">
              <span className="text-2xl font-black">F</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gradient-faciloop">Faciloop CRM</span>
          </div>

          <nav className="hidden items-center gap-8 md:flex text-sm font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
            <a href="#demo" className="hover:text-foreground transition-colors">Démo CRM</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-input bg-card px-4 py-2.5 text-xs font-bold text-foreground shadow-sm hover:bg-muted transition-all"
            >
              Espace Client
            </Link>
            <Link
              to="/login"
              className="rounded-xl bg-gradient-faciloop px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
            >
              Essai Gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary mb-6"
          >
            <Zap className="h-4 w-4" />
            <span>Nouveau : Version SaaS Multi-Entreprises 2.0 disponible</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-tight"
          >
            Boostez votre pipeline commercial avec le CRM B2B{' '}
            <span className="text-gradient-faciloop">100% Multi-Entreprises</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Conçu pour les équipes commerciales en Afrique et à l’international. Suivez vos prospects, automatisez vos relances quotidiennes et signez plus de contrats sans friction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-faciloop text-white font-extrabold text-sm shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Accéder à la plateforme</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-border bg-card text-foreground font-bold text-sm hover:bg-muted transition-all"
            >
              Voir la démo interactive
            </a>
          </motion.div>

          {/* Key Metrics Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur">
              <div className="text-2xl font-black text-primary">+120%</div>
              <div className="text-xs text-muted-foreground mt-1">Taux de relance effective</div>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur">
              <div className="text-2xl font-black text-emerald-500">100%</div>
              <div className="text-xs text-muted-foreground mt-1">Isolation Multi-Tenant RLS</div>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur">
              <div className="text-2xl font-black text-amber-500">0 Doublon</div>
              <div className="text-xs text-muted-foreground mt-1">Contrôle téléphone instantané</div>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur">
              <div className="text-2xl font-black text-purple-500">&lt; 30 sec</div>
              <div className="text-xs text-muted-foreground mt-1">Prise en main commercial</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Fonctionnalités Clés</h2>
            <p className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Tout ce dont votre équipe commerciale a besoin
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 font-bold">
                <Kanban className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Pipeline Kanban 12 Étapes</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Visualisez l'avancement de vos prospects en colonnes interactives. Glissez-déposez vos cartes et attribuez un motif obligatoire en cas de perte.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 font-bold">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Déclencheur WhatsApp Direct</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Lancez des messages pré-remplis en un clic sur WhatsApp Web ou Mobile pour relancer immédiatement vos prospects sans perdre de temps.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 font-bold">
                <CalendarClock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Priorités & Relances du Jour</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Ne manquez aucun rendez-vous. Recevez les alertes des relances du jour et des retards pour agir au moment précis.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Isolation Multi-Tenant</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Données scellées par entreprise au niveau de la base de données. Contrôle d'accès par rôle (Commercial, Admin Org, Super-Admin).
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 font-bold">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Analytics & Recharts</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Suivez le chiffre d'affaires généré, les conversions et comparez les performances de votre équipe commerciale en temps réel.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-4 font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Import / Export CSV & Excel</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Importez vos listes avec mapping interactif de colonnes et vérification des doublons sur le numéro de téléphone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Tarifs Transparents</h2>
            <p className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Des formules adaptées à chaque taille d'entreprise
            </p>

            {/* Cycle & Currency Toggle */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="flex items-center rounded-xl bg-muted p-1 text-xs font-bold">
                <button
                  onClick={() => setBillingCycle('mensuel')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    billingCycle === 'mensuel' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setBillingCycle('annuel')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    billingCycle === 'annuel' ? 'bg-gradient-faciloop text-white shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Annuel (-20%)
                </button>
              </div>

              <div className="flex items-center rounded-xl bg-muted p-1 text-xs font-bold">
                <button
                  onClick={() => setCurrency('XOF')}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    currency === 'XOF' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  FCFA (XOF)
                </button>
                <button
                  onClick={() => setCurrency('EUR')}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    currency === 'EUR' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  EUR (€)
                </button>
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative rounded-3xl p-8 border ${
                  plan.popular
                    ? 'border-primary bg-card shadow-2xl shadow-primary/10 ring-2 ring-primary'
                    : 'border-border bg-card shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-faciloop text-[10px] font-black uppercase text-white shadow-md">
                    Formule la plus choisie
                  </div>
                )}

                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-2 min-h-[32px]">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-foreground">
                    {currency === 'XOF' ? plan.priceXOF : plan.priceEUR}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3 text-xs text-foreground font-medium">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/login"
                  className={`mt-8 w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                    plan.popular
                      ? 'bg-gradient-faciloop text-white shadow-lg shadow-primary/25 hover:opacity-95'
                      : 'border border-input bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-faciloop flex items-center justify-center text-white font-bold">
              F
            </div>
            <span className="font-bold text-foreground">Faciloop CRM SaaS</span>
            <span>© 2026 Digit’Advisor SAS. Tous droits réservés.</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <a href="#features" className="hover:text-foreground">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-foreground">Tarifs</a>
            <Link to="/login" className="hover:text-foreground">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
