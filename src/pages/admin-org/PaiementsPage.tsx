import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Paiement, ModePaiement } from '../../types/crm';
import { CurrencyToggle } from '../../components/common/CurrencyToggle';
import { SelectCustom } from '../../components/common/SelectCustom';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';
import { Receipt, Download, CheckCircle2, Clock, FileText, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const PAYMENT_ICONS: Record<string, { icon: string | null; label: string; color: string }> = {
  wave: { icon: '/icons/Wave.png', label: 'Wave', color: 'bg-blue-500/10' },
  orange_money: { icon: '/icons/OM.jpeg', label: 'Orange Money', color: 'bg-orange-500/10' },
  paytech: { icon: null, label: 'PayTech', color: 'bg-violet-500/10' },
  stripe: { icon: null, label: 'Stripe', color: 'bg-indigo-500/10' },
  virement: { icon: null, label: 'Virement', color: 'bg-emerald-500/10' },
  espece: { icon: '/icons/free-money.png', label: 'Espèces', color: 'bg-amber-500/10' },
};

export const PaiementsPage: React.FC = () => {
  const { currency, paiements } = useAuth();
  const [filterMode, setFilterMode] = useState<string>('all');
  const [devise, setDevise] = useState<DeviseCode>('XOF');

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', devise), devise);

  const getPaymentIcon = (mode: string) => {
    const info = PAYMENT_ICONS[mode];
    if (!info) return null;
    if (info.icon) {
      return <img src={info.icon} alt={info.label} className="w-5 h-5 rounded-md object-cover" />;
    }
    return <CreditCard className="w-4 h-4 text-muted-foreground" />;
  };

  const totalAttendu = paiements.reduce((acc, p) => acc + p.montant_attendu, 0);
  const totalRecouvre = paiements.reduce((acc, p) => acc + p.montant_paye, 0);
  const totalRestant = paiements.reduce((acc, p) => acc + p.montant_restant, 0);

  const filtered = paiements.filter(p => filterMode === 'all' || p.mode_paiement === filterMode);

  const handleDownloadInvoice = (pay: Paiement) => {
    const lines = [
      `FACTURE - ${pay.entreprise}`,
      `Référence: FACT-2026-${pay.id.slice(0, 4).toUpperCase()}`,
      `Date: ${new Date().toLocaleDateString('fr-FR')}`,
      '',
      `Client: ${pay.entreprise}`,
      `Montant attendu: ${pay.montant_attendu.toLocaleString('fr-FR')} FCFA`,
      `Montant payé: ${pay.montant_paye.toLocaleString('fr-FR')} FCFA`,
      `Reste à payer: ${pay.montant_restant.toLocaleString('fr-FR')} FCFA`,
      `Mode de paiement: ${PAYMENT_ICONS[pay.mode_paiement]?.label || pay.mode_paiement}`,
      `Statut: ${pay.statut}`,
      `Référence transaction: ${pay.reference_transaction || 'N/A'}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Facture-${pay.entreprise.replace(/\s+/g, '_')}-${pay.id.slice(0, 6)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadReleve = () => {
    const BOM = '﻿';
    const separator = ';';
    const headers = ['Référence', 'Entreprise', 'Montant Attendu (FCFA)', 'Montant Payé (FCFA)', 'Reste (FCFA)', 'Mode Paiement', 'Statut', 'Référence Transaction'];
    const rows = filtered.map(p => [
      `FACT-2026-${p.id.slice(0, 4).toUpperCase()}`,
      p.entreprise,
      p.montant_attendu.toString(),
      p.montant_paye.toString(),
      p.montant_restant.toString(),
      PAYMENT_ICONS[p.mode_paiement]?.label || p.mode_paiement,
      p.statut,
      p.reference_transaction || '',
    ]);
    const csv = BOM + [headers.join(separator), ...rows.map(r => r.join(separator))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Releve-Paiements-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

        <div className="flex items-center gap-2">
          <CurrencyToggle value={devise} onChange={setDevise} />
          <button
            onClick={handleDownloadReleve}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Relevé</span>
          </button>
        </div>
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
            {fmt(totalRecouvre)}
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
            {fmt(totalRestant)}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Moyen de Règlement Phare</span>
            <div className="rounded-2xl bg-blue-500/10 p-1.5 shadow-sm overflow-hidden">
              <img src="/icons/Wave.png" alt="Wave" className="h-7 w-7 rounded-lg object-cover" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xl sm:text-2xl font-black text-foreground">Wave Sénégal</span>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
          Liste des Transactions ({filtered.length})
        </span>

        <SelectCustom
          value={filterMode}
          onChange={setFilterMode}
          className="w-48"
          options={[
            { value: 'all', label: 'Tous les moyens' },
            { value: 'wave', label: 'Wave Sénégal', icon: <img src="/icons/Wave.png" className="w-4 h-4 rounded" /> },
            { value: 'orange_money', label: 'Orange Money', icon: <img src="/icons/OM.jpeg" className="w-4 h-4 rounded" /> },
            { value: 'paytech', label: 'PayTech API' },
            { value: 'stripe', label: 'Carte bancaire (Stripe)' },
            { value: 'virement', label: 'Virement bancaire' },
          ]}
        />
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
                  {fmt(pay.montant_paye)}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getPaymentIcon(pay.mode_paiement)}
                    <span className="font-bold text-foreground text-xs">{PAYMENT_ICONS[pay.mode_paiement]?.label || pay.mode_paiement}</span>
                  </div>
                </td>
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
                {fmt(pay.montant_paye)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                {getPaymentIcon(pay.mode_paiement)}
                <strong className="text-foreground font-bold">{PAYMENT_ICONS[pay.mode_paiement]?.label || pay.mode_paiement}</strong>
              </span>
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
