import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, TrendingUp, Users, CheckCircle2, ChevronDown, ChevronUp, Calendar, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { CurrencyToggle } from '../../components/common/CurrencyToggle';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';
import { CommissionEntry } from '../../lib/mockAdminOrg';
import { motion, AnimatePresence } from 'framer-motion';

const COMMISSION_RATES: Record<string, number> = {
  mensuel: 5,
  trimestriel: 8,
  annuel: 10,
};

const PERIODICITE_COLORS: Record<string, string> = {
  mensuel: 'bg-blue-500/10 text-blue-600',
  trimestriel: 'bg-purple-500/10 text-purple-600',
  annuel: 'bg-emerald-500/10 text-emerald-600',
};

function getLastMonths(count: number): { value: string; label: string }[] {
  const months = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return months;
}

export const CommissionsPage: React.FC = () => {
  const { t } = useTranslation('admin');
  const { commissions, markCommissionVersee } = useAuth();
  const [devise, setDevise] = useState<DeviseCode>('XOF');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [expandedCommercial, setExpandedCommercial] = useState<string | null>(null);

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', devise), devise);
  const months = useMemo(() => getLastMonths(12), []);

  const filtered = useMemo(() => {
    if (selectedMonth === 'all') return commissions;
    return commissions.filter(c => c.dateVente.startsWith(selectedMonth));
  }, [selectedMonth, commissions]);

  const totalAVerser = filtered.filter(c => c.statut === 'a_verser').reduce((s, c) => s + c.montantCommission, 0);
  const totalVerse = filtered.filter(c => c.statut === 'verse').reduce((s, c) => s + c.montantCommission, 0);
  const totalCA = filtered.reduce((s, c) => s + c.montantVente, 0);
  const totalGlobal = filtered.reduce((s, c) => s + c.montantCommission, 0);

  const parCommercial = useMemo(() => {
    const map = new Map<string, { id: string; nom: string; total: number; aVerser: number; ventes: number; ca: number; entries: CommissionEntry[] }>();
    filtered.forEach(c => {
      const existing = map.get(c.commercialId);
      if (existing) {
        existing.total += c.montantCommission;
        existing.ca += c.montantVente;
        existing.ventes += 1;
        if (c.statut === 'a_verser') existing.aVerser += c.montantCommission;
        existing.entries.push(c);
      } else {
        map.set(c.commercialId, {
          id: c.commercialId,
          nom: c.commercialNom,
          total: c.montantCommission,
          ca: c.montantVente,
          ventes: 1,
          aVerser: c.statut === 'a_verser' ? c.montantCommission : 0,
          entries: [c],
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filtered]);

  const uniqueCommercials = new Set(filtered.map(c => c.commercialId)).size;

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground">
              {t('adminOrg.commissions.title')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Wallet className="w-3 h-3" /> {t('adminOrg.commissions.badge')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-0.5">
            {t('adminOrg.commissions.subtitle')}
          </p>
        </div>
        <CurrencyToggle value={devise} onChange={setDevise} />
      </div>

      {/* Month Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{t('adminOrg.commissions.periodLabel')}</span>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 rounded-xl border border-input bg-card text-xs font-bold text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="all">{t('adminOrg.commissions.allPeriods')}</option>
          {months.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div whileHover={{ y: -3, scale: 1.01 }} className="rounded-3xl border border-border/80 bg-gradient-to-br from-pink-500/5 to-pink-500/10 p-4 sm:p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{t('adminOrg.commissions.kpi.toVerify')}</span>
            <div className="rounded-2xl bg-pink-500/10 p-2 text-pink-500 shadow-sm">
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-black text-pink-600">{fmt(totalAVerser)}</span>
        </motion.div>

        <motion.div whileHover={{ y: -3, scale: 1.01 }} className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{t('adminOrg.commissions.kpi.revenue')}</span>
            <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-500 shadow-sm">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-black text-foreground">{fmt(totalCA)}</span>
        </motion.div>

        <motion.div whileHover={{ y: -3, scale: 1.01 }} className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{t('adminOrg.commissions.kpi.salesReps')}</span>
            <div className="rounded-2xl bg-blue-500/10 p-2 text-blue-500 shadow-sm">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-black text-foreground">{uniqueCommercials}</span>
        </motion.div>

        <motion.div whileHover={{ y: -3, scale: 1.01 }} className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{t('adminOrg.commissions.kpi.sales')}</span>
            <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-500 shadow-sm">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-black text-foreground">{filtered.length}</span>
        </motion.div>
      </div>

      {/* Par commercial — Accordion */}
      <div className="space-y-3">
        <h2 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
          {t('adminOrg.commissions.detailTitle')}
        </h2>

        <div className="space-y-3">
          {parCommercial.map((comm) => {
            const isOpen = expandedCommercial === comm.id;
            return (
              <div key={comm.id} className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedCommercial(isOpen ? null : comm.id)}
                  className="w-full p-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-faciloop text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                      {comm.nom.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-extrabold text-foreground">{comm.nom}</p>
                      <p className="text-xs text-muted-foreground font-semibold">
                        {comm.ventes} {t('adminOrg.commissions.salesCount')} · {t('adminOrg.commissions.caLabel')} {fmt(comm.ca)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">{fmt(comm.total)}</p>
                      {comm.aVerser > 0 && (
                        <p className="text-[10px] font-bold text-amber-600">{fmt(comm.aVerser)} {t('adminOrg.commissions.toPay')}</p>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/60"
                    >
                      <div className="p-4 space-y-2.5 bg-muted/20">
                        {comm.entries.map((entry) => (
                          <div key={entry.id} className="p-3 rounded-xl border border-border/60 bg-card flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-foreground truncate">{entry.clientNom}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${PERIODICITE_COLORS[entry.periodicite] || 'bg-muted text-muted-foreground'}`}>
                                  {entry.periodicite}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-semibold">
                                  {entry.formule} · {entry.tauxCommission}%
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-black text-foreground">{fmt(entry.montantCommission)}</p>
                              <p className="text-[10px] text-muted-foreground">sur {fmt(entry.montantVente)}</p>
                            </div>
                            {entry.statut === 'a_verser' ? (
                              <button
                                onClick={() => { markCommissionVersee(entry.id); toast.success(t('adminOrg.commissions.paid')); }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-bold hover:bg-emerald-500/20 transition-colors shrink-0"
                              >
                                <Check className="w-3 h-3" /> {t('adminOrg.commissions.markPaid')}
                              </button>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-emerald-500/10 text-emerald-600">
                                {t('adminOrg.commissions.paid')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {parCommercial.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground rounded-2xl border-2 border-dashed border-border">
              {t('adminOrg.commissions.empty')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
