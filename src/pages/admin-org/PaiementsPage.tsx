import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Paiement, ModePaiement } from '../../types/crm';
import { CurrencyToggle } from '../../components/common/CurrencyToggle';
import { SelectCustom } from '../../components/common/SelectCustom';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';
import { Receipt, Download, CheckCircle2, FileText, CreditCard } from 'lucide-react';
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
  const { t } = useTranslation('admin');
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
    const ref = `FACT-2026-${pay.id.slice(0, 4).toUpperCase()}`;
    const dateStr = new Date().toLocaleDateString('fr-FR');
    const fmtPdf = (n: number) => formatAmount(convertAmount(n, 'XOF', devise), devise);
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Facture ${ref}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; color: #111; font-size: 14px; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .sub { color: #666; margin-bottom: 30px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { text-align: left; padding: 10px 12px; background: #f4f4f4; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; background: #d1fae5; color: #065f46; }
    .total { font-size: 18px; font-weight: bold; color: #059669; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <h1>Faciloop CRM</h1>
  <div class="sub">Facture générée le ${dateStr}</div>
  <table>
    <tr><th>Référence</th><td><strong>${ref}</strong></td></tr>
    <tr><th>Client</th><td>${pay.entreprise}</td></tr>
    <tr><th>Date</th><td>${pay.date_paiement || dateStr}</td></tr>
    <tr><th>Mode de paiement</th><td>${PAYMENT_ICONS[pay.mode_paiement]?.label || pay.mode_paiement}</td></tr>
    <tr><th>Référence transaction</th><td>${pay.reference_transaction || '—'}</td></tr>
    <tr><th>Statut</th><td><span class="badge">${pay.statut}</span></td></tr>
  </table>
  <table style="margin-top:20px">
    <tr><th>Montant attendu</th><td>${fmtPdf(pay.montant_attendu)}</td></tr>
    <tr><th>Montant payé</th><td class="total">${fmtPdf(pay.montant_paye)}</td></tr>
    <tr><th>Reste à payer</th><td>${fmtPdf(pay.montant_restant)}</td></tr>
  </table>
  <script>window.onload = () => window.print();<\/script>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const handleDownloadReleve = () => {
    const BOM = '﻿';
    const separator = ';';
    const deviseLabel = devise;
    const convert = (n: number) => Math.round(convertAmount(n, 'XOF', devise));
    const headers = [
      'Référence', 'Entreprise',
      `Montant Attendu (${deviseLabel})`, `Montant Payé (${deviseLabel})`, `Reste (${deviseLabel})`,
      'Mode Paiement', 'Statut', 'Date Paiement', 'Référence Transaction',
    ];
    const rows = filtered.map(p => [
      `FACT-2026-${p.id.slice(0, 4).toUpperCase()}`,
      p.entreprise,
      convert(p.montant_attendu).toString(),
      convert(p.montant_paye).toString(),
      convert(p.montant_restant).toString(),
      PAYMENT_ICONS[p.mode_paiement]?.label || p.mode_paiement,
      p.statut,
      p.date_paiement || '',
      p.reference_transaction || '',
    ]);
    const csv = BOM + [headers.join(separator), ...rows.map(r => r.join(separator))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Releve-Paiements-${devise}-${new Date().toISOString().split('T')[0]}.csv`;
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
              {t('adminOrg.paiements.title')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Receipt className="w-3 h-3" /> {t('adminOrg.paiements.badge')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t('adminOrg.paiements.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CurrencyToggle value={devise} onChange={setDevise} />
          <button
            onClick={handleDownloadReleve}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>{t('adminOrg.paiements.downloadReleve')}</span>
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
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{t('adminOrg.paiements.kpi.collected')}</span>
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
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{t('adminOrg.paiements.kpi.transactions')}</span>
            <div className="rounded-2xl bg-blue-500/10 p-2 text-blue-500 shadow-sm">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-500 pt-1">
            {paiements.length}
          </div>
          <p className="text-[10px] text-muted-foreground font-semibold">{t('adminOrg.paiements.kpi.subscriptions')}</p>
        </motion.div>

        {/* <motion.div
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
        </motion.div> */}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
          {t('adminOrg.paiements.list')} ({filtered.length})
        </span>

        <SelectCustom
          value={filterMode}
          onChange={setFilterMode}
          className="w-48"
          options={[
            { value: 'all', label: t('adminOrg.paiements.filterAll') },
            { value: 'wave', label: 'Wave Sénégal', icon: <img src="/icons/Wave.png" className="w-4 h-4 rounded" /> },
            { value: 'orange_money', label: 'Orange Money', icon: <img src="/icons/OM.jpeg" className="w-4 h-4 rounded" /> },
            { value: 'paytech', label: 'PayTech API' },
            { value: 'stripe', label: t('adminOrg.paiements.modes.card') },
            { value: 'virement', label: t('adminOrg.paiements.modes.transfer') },
          ]}
        />
      </div>

      {/* Desktop Invoices Table */}
      <div className="hidden md:block overflow-x-auto rounded-3xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="border-b border-border/80 bg-muted/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">{t('adminOrg.paiements.col.ref')}</th>
              <th className="p-4">{t('adminOrg.paiements.col.company')}</th>
              <th className="p-4">{t('adminOrg.paiements.col.amount')}</th>
              <th className="p-4">{t('adminOrg.paiements.col.mode')}</th>
              <th className="p-4">{t('adminOrg.paiements.col.transactionRef')}</th>
              <th className="p-4">{t('adminOrg.paiements.col.status')}</th>
              <th className="p-4 text-right">{t('adminOrg.paiements.col.invoice')}</th>
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
                    <span>{t('adminOrg.paiements.downloadPdf')}</span>
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
                <span>{t('adminOrg.paiements.downloadInvoice')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
