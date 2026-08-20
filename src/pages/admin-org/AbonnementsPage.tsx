import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockAbonnements } from '../../lib/mockData';
import { Abonnement } from '../../types/crm';
import { CreditCard, Check, Sparkles, ShieldCheck, Zap, ArrowRight, Calendar, Users, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const AbonnementsPage: React.FC = () => {
  const { currentOrg, currency } = useAuth();
  const [abonnements, setAbonnements] = useState<Abonnement[]>(mockAbonnements);
  const [selectedPlan, setSelectedPlan] = useState<string>('SaaS Business Pro');

  // Active current plan details
  const currentPlan = {
    name: 'SaaS Business Pro',
    priceXOF: '75 000 FCFA / mois',
    priceEUR: '114 € / mois',
    renewalDate: '14 Août 2027',
    seatsUsed: 3,
    seatsTotal: 10,
    features: [
      'Jusqu’à 10 commerciaux',
      'Prospects & Clients illimités',
      'Pipeline Kanban + Déclencheur WhatsApp direct',
      'Réattribution en masse des prospects (Admin)',
      'Dashboard statistiques Recharts',
      'Import CSV avec parsing & dédoublonnage',
      'Support prioritaire 24/7'
    ]
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Gestion de l'Abonnement SaaS
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Formule Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Formule souscrite, sièges commerciaux attribués et options de renouvellement
          </p>
        </div>

        <button
          onClick={() => alert("Demande de mise à niveau transmise à l'équipe Faciloop SaaS. Un conseiller va vous contacter sous 24h.")}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>Changer de formule (Upgrade)</span>
        </button>
      </div>

      {/* Current Active Plan Overview Card */}
      <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-5 sm:p-7 shadow-lg relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <CreditCard className="w-48 h-48 text-primary" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-faciloop text-white text-[10px] font-black uppercase tracking-widest">
                Compte Enterprise Active
              </span>
              <span className="text-xs font-bold text-muted-foreground">Tenant ID: {currentOrg?.id || 'org-client-1'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">{currentPlan.name}</h2>
            <p className="text-xs text-muted-foreground font-medium">
              Espace de travail : <strong>{currentOrg?.nom || "Teranga Logistique SA"}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-primary">
              {currency === 'EUR' ? currentPlan.priceEUR : currentPlan.priceXOF}
            </div>
            <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1 sm:justify-end">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>Prochain renouvellement : <strong>{currentPlan.renewalDate}</strong></span>
            </div>
          </div>
        </div>

        {/* Seats Capacity Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span>Utilisation des sièges commerciaux</span>
            </span>
            <span className="text-primary font-black">
              {currentPlan.seatsUsed} / {currentPlan.seatsTotal} commerciaux actifs ({(currentPlan.seatsUsed / currentPlan.seatsTotal) * 100}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-muted/60 overflow-hidden p-0.5 border border-border/60">
            <div
              className="h-full rounded-full bg-gradient-faciloop transition-all duration-500"
              style={{ width: `${(currentPlan.seatsUsed / currentPlan.seatsTotal) * 100}%` }}
            />
          </div>
        </div>

        {/* Active Features Checklist */}
        <div className="pt-2 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Fonctionnalités incluses dans votre offre :
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-semibold text-foreground">
            {currentPlan.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/60 shadow-sm">
                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscriptions History List */}
      <div className="space-y-3">
        <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-foreground">
          Historique des Engagements & Abonnements
        </h2>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-sm">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="border-b border-border/80 bg-muted/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4">Entreprise Client</th>
                <th className="p-4">Formule</th>
                <th className="p-4">Périodicité</th>
                <th className="p-4">Montant</th>
                <th className="p-4">Échéance</th>
                <th className="p-4 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-[11px]">
              {abonnements.map((ab) => (
                <tr key={ab.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-extrabold text-foreground">{ab.entreprise}</td>
                  <td className="p-4 font-bold text-primary">{ab.formule_souscrite}</td>
                  <td className="p-4 capitalize text-muted-foreground font-semibold">{ab.periodicite}</td>
                  <td className="p-4 font-extrabold text-foreground">{ab.prix.toLocaleString()} {ab.devise}</td>
                  <td className="p-4 text-muted-foreground font-medium">{ab.date_echeance}</td>
                  <td className="p-4 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-[10px] uppercase">
                      {ab.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {abonnements.map((ab) => (
            <div key={ab.id} className="p-4 rounded-2xl border border-border/80 bg-card space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-foreground">{ab.entreprise}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-[10px] uppercase">
                  {ab.statut}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                <span>Formule : <strong className="text-primary font-bold">{ab.formule_souscrite}</strong></span>
                <span className="font-extrabold text-foreground">{ab.prix.toLocaleString()} {ab.devise}</span>
              </div>
              <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1">
                <span>Période : {ab.periodicite}</span>
                <span>Échéance : {ab.date_echeance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
