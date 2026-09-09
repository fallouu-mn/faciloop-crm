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
  const { currency, paiements, currentOrg, user } = useAuth();
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
    const isPaid = pay.montant_restant <= 0;
    const orgName = currentOrg?.nom || 'Mon Entreprise';
    const orgPhone = currentOrg?.telephone || '';
    const orgEmail = currentOrg?.email || '';
    const orgAddress = [currentOrg?.adresse, currentOrg?.ville, currentOrg?.pays].filter(Boolean).join(', ');
    const logoUrl = currentOrg?.logo_url || '';
    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="Logo" style="max-height:60px;max-width:160px;object-fit:contain;" />`
      : `<div style="font-size:28px;font-weight:900;background:linear-gradient(135deg,#FF6A00,#FFBD22);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Faciloop CRM</div>`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Facture ${ref}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 780px; margin: 0 auto; padding: 40px 32px; color: #1a1a2e; font-size: 13px; line-height: 1.5; }

    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .header-left { flex: 1; }
    .header-right { text-align: right; }
    .invoice-title { font-size: 32px; font-weight: 800; color: #1a1a2e; letter-spacing: -0.5px; }
    .invoice-meta { margin-top: 8px; font-size: 12px; color: #888; }
    .invoice-meta strong { color: #444; font-weight: 600; }

    .separator { height: 3px; background: linear-gradient(90deg, #FF6A00, #FFBD22); border-radius: 2px; margin: 24px 0; }

    .parties { display: flex; gap: 24px; margin-bottom: 28px; }
    .party-box { flex: 1; padding: 18px 20px; border-radius: 12px; border: 1px solid #e8e8e8; background: #fafafa; }
    .party-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin-bottom: 8px; }
    .party-name { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 6px; }
    .party-info { font-size: 11.5px; color: #666; line-height: 1.7; }
    .party-info span { display: block; }

    .amount-card { background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%); border-radius: 14px; padding: 24px 28px; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .amount-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; margin-bottom: 4px; }
    .amount-value { font-size: 28px; font-weight: 800; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-paid { background: rgba(40,160,80,0.2); color: #28a050; }
    .status-pending { background: rgba(200,140,30,0.2); color: #c88c1e; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead th { text-align: left; padding: 12px 16px; background: #f4f4f7; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #888; border-bottom: 2px solid #e0e0e0; }
    thead th:last-child { text-align: right; }
    tbody td { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    tbody td:last-child { text-align: right; font-weight: 600; }
    tbody tr:hover { background: #fafafa; }

    .totals { display: flex; justify-content: flex-end; margin-bottom: 28px; }
    .totals-box { width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #555; }
    .totals-row.main { border-top: 2px solid #1a1a2e; padding-top: 12px; margin-top: 4px; font-size: 15px; font-weight: 700; color: #1a1a2e; }
    .totals-row .paid { color: #28a050; font-weight: 700; }
    .totals-row .due { color: #c83737; font-weight: 700; }

    .payment-box { padding: 16px 20px; border-radius: 12px; background: #f8f8fb; border: 1px solid #e8e8e8; display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
    .payment-icon { width: 40px; height: 40px; border-radius: 10px; background: #1a1a2e; display: flex; align-items: center; justify-content: center; }
    .payment-icon svg { width: 20px; height: 20px; fill: white; }
    .payment-details { font-size: 12px; color: #555; }
    .payment-details strong { color: #1a1a2e; }

    .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e8e8e8; }
    .footer-legal { font-size: 10px; color: #aaa; margin-bottom: 6px; }
    .footer-brand { font-size: 10px; color: #bbb; font-weight: 600; }

    @media print {
      body { padding: 20px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      ${logoHtml}
    </div>
    <div class="header-right">
      <div class="invoice-title">FACTURE</div>
      <div class="invoice-meta">
        <div>N° <strong>${ref}</strong></div>
        <div>Date : <strong>${pay.date_paiement || dateStr}</strong></div>
      </div>
    </div>
  </div>

  <div class="separator"></div>

  <div class="parties">
    <div class="party-box">
      <div class="party-label">Émetteur</div>
      <div class="party-name">${orgName}</div>
      <div class="party-info">
        ${orgPhone ? `<span>📞 ${orgPhone}</span>` : ''}
        ${orgEmail ? `<span>✉ ${orgEmail}</span>` : ''}
        ${orgAddress ? `<span>📍 ${orgAddress}</span>` : ''}
      </div>
    </div>
    <div class="party-box">
      <div class="party-label">Client</div>
      <div class="party-name">${pay.entreprise}</div>
      <div class="party-info">
        <span>Réf. transaction : ${pay.reference_transaction || '—'}</span>
      </div>
    </div>
  </div>

  <div class="amount-card">
    <div>
      <div class="amount-label">Montant total</div>
      <div class="amount-value">${fmtPdf(pay.montant_attendu)}</div>
    </div>
    <span class="status-badge ${isPaid ? 'status-paid' : 'status-pending'}">
      ${isPaid ? '✓ PAYÉ' : '⏳ EN ATTENTE'}
    </span>
  </div>

  <table>
    <thead>
      <tr>
        <th>Désignation</th>
        <th>Mode de paiement</th>
        <th>Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Abonnement — ${pay.entreprise}</td>
        <td>${PAYMENT_ICONS[pay.mode_paiement]?.label || pay.mode_paiement}</td>
        <td>${fmtPdf(pay.montant_attendu)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-box">
      <div class="totals-row">
        <span>Montant attendu</span>
        <span>${fmtPdf(pay.montant_attendu)}</span>
      </div>
      <div class="totals-row">
        <span>Montant payé</span>
        <span class="paid">${fmtPdf(pay.montant_paye)}</span>
      </div>
      ${pay.montant_restant > 0 ? `
      <div class="totals-row">
        <span>Reste à payer</span>
        <span class="due">${fmtPdf(pay.montant_restant)}</span>
      </div>` : ''}
      <div class="totals-row main">
        <span>Total TTC</span>
        <span>${fmtPdf(pay.montant_attendu)}</span>
      </div>
    </div>
  </div>

  <div class="payment-box">
    <div class="payment-icon">
      <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM4 10h16v2H4z"/></svg>
    </div>
    <div class="payment-details">
      <strong>Paiement</strong><br/>
      Mode : ${PAYMENT_ICONS[pay.mode_paiement]?.label || pay.mode_paiement} &bull;
      Statut : ${isPaid ? 'Payé' : 'En attente'} &bull;
      Date : ${pay.date_paiement || dateStr}
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand">Généré par Faciloop CRM — ${orgName}</div>
  </div>

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
