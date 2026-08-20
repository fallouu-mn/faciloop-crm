import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockPaiements } from '../../lib/mockData';
import { Paiement, ModePaiement } from '../../types/crm';
import { Receipt, Download, CheckCircle2, Clock, DollarSign, Wallet, ShieldCheck, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const PaiementsPage: React.FC = () => {
  const { currency } = useAuth();
  const [paiements, setPaiements] = useState<Paiement[]>(mockPaiements);
  const [filterMode, setFilterMode] = useState<string>('all');

  const totalAttendu = paiements.reduce((acc, p) => acc + p.montant_attendu, 0);
  const totalRecouvre = paiements.reduce((acc, p) => acc + p.montant_paye, 0);
  const totalRestant = paiements.reduce((acc, p) => acc + p.montant_restant, 0);

  const filtered = paiements.filter(p => filterMode === 'all' || p.mode_paiement === filterMode);

  const handleDownloadInvoice = (pay: Paiement) => {
    alert(`Génération de la Facture PDF #${pay.id.toUpperCase()} pour ${pay.entreprise} (${pay.montant_paye.toLocaleString()} ${currency})... Téléchargement démarré.`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Suivi des Paiements & Factures
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Receipt className="w-3 h-3" /> Comptabilité SaaS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Historique des règlements de l'abonnement et téléchargement des pièces justificatives PDF
          </p>
        </div>

        <button
          onClick={() => alert("Génération du relevé comptable global au format Excel...")}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
        >
          <Download className="h-4 w-4 shrink-0" />
          <span>Télécharger Relevé Globale</span>
        </button>
      </div>

      {/* Financial Overview Metrics Cards Grid (1 col on mobile, 3 on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Total Encaissé</span>
            <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-500 shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-500 pt-1">
            {totalRecouvre.toLocaleString()} <span className="text-xs font-extrabold">{currency}</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Reste à Recouvrer</span>
            <div className="rounded-2xl bg-amber-500/10 p-2 text-amber-500 shadow-sm">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 pt-1">
            {totalRestant.toLocaleString()} <span className="text-xs font-extrabold">{currency}</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Moyen de Règlement Phare</span>
            <div className="rounded-2xl bg-primary/10 p-2 text-primary shadow-sm">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground pt-1">
            Wave Senegal 🌊
          </div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
          Liste des Transactions ({filtered.length})
        </span>

        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value)}
          className="px-3 py-2 rounded-xl border border-input bg-card text-xs font-semibold text-foreground focus:outline-none"
        >
          <option value="all">Tous les moyens de paiement</option>
          <option value="wave">Wave Sénégal</option>
          <option value="orange_money">Orange Money</option>
          <option value="paytech">PayTech API</option>
          <option value="stripe">Carte bancaire (Stripe)</option>
          <option value="virement">Virement bancaire</option>
        </select>
      </div>

      {/* Desktop Invoices Table */}
      <div className="hidden md:block overflow-x-auto rounded-3xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="border-b border-border/80 bg-muted/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">Réf. Facture</th>
              <th className="p-4">Entreprise Client</th>
              <th className="p-4">Montant Payé</th>
              <th className="p-4">Moyen de Règlement</th>
              <th className="p-4">Réf. Transaction</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Facture PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-[11px]">
            {filtered.map((pay) => (
              <tr key={pay.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 font-mono font-bold text-primary flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>FACT-2026-0814</span>
                </td>
                <td className="p-4 font-extrabold text-foreground">{pay.entreprise}</td>
                <td className="p-4 font-extrabold text-emerald-500">
                  {pay.montant_paye.toLocaleString()} {currency}
                </td>
                <td className="p-4 uppercase font-bold text-muted-foreground">{pay.mode_paiement.replace('_', ' ')}</td>
                <td className="p-4 font-mono text-muted-foreground">{pay.reference_transaction || 'WV-894739201'}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-[10px] uppercase">
                    {pay.statut}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDownloadInvoice(pay)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-input bg-card hover:bg-muted text-xs font-bold text-foreground transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Invoices Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map((pay) => (
          <div key={pay.id} className="p-4 rounded-2xl border border-border/80 bg-card space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-primary flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                FACT-2026-0814
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-[10px] uppercase">
                {pay.statut}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
              <span className="font-extrabold text-foreground">{pay.entreprise}</span>
              <span className="font-extrabold text-emerald-500 text-sm">
                {pay.montant_paye.toLocaleString()} {currency}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Mode : <strong className="uppercase text-foreground font-bold">{pay.mode_paiement.replace('_', ' ')}</strong></span>
              <span className="font-mono">Réf: {pay.reference_transaction || 'WV-894739201'}</span>
            </div>

            <div className="pt-2 border-t border-border/60 flex justify-end">
              <button
                onClick={() => handleDownloadInvoice(pay)}
                className="w-full py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Télécharger Facture PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
