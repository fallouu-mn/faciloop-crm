import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  Users,
  UserCheck,
  TrendingUp,
  Plus,
  FileSpreadsheet,
  UserPlus,
  Sparkles,
  CheckCircle2,
  Award,
  Crown,
  ArrowRight,
  Calendar,
  PieChart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type PeriodFilter = 'mois' | 'trimestre' | 'annee' | 'personnalise';

function getDateRange(
  period: PeriodFilter,
  customStart: string,
  customEnd: string,
): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  if (period === 'mois') {
    const start = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m + 1, 0).getDate();
    const end = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { start, end };
  }
  if (period === 'trimestre') {
    const qStart = Math.floor(m / 3) * 3;
    const qEnd = qStart + 2;
    const start = `${y}-${String(qStart + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(y, qEnd + 1, 0).getDate();
    const end = `${y}-${String(qEnd + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { start, end };
  }
  if (period === 'annee') {
    return { start: `${y}-01-01`, end: `${y}-12-31` };
  }
  return { start: customStart, end: customEnd };
}

// Normalise ISO timestamps to YYYY-MM-DD before comparing
function normalizeDate(d: string): string {
  if (!d) return '';
  return d.split('T')[0];
}

function inRange(date: string, start: string, end: string): boolean {
  if (!start || !end) return true;
  const d = normalizeDate(date);
  return d >= start && d <= end;
}

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));
  useEffect(() => { spring.set(value); }, [value, spring]);
  return <motion.span>{display}</motion.span>;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl space-y-1 text-xs font-sans">
        <p className="font-extrabold text-foreground">{label}</p>
        <div className="space-y-0.5 pt-1 text-[11px]">
          <p className="text-blue-500 font-bold">Prospects gérés : {payload[0]?.value}</p>
          <p className="text-emerald-500 font-bold">Ventes réalisées : {payload[1]?.value}</p>
        </div>
      </div>
    );
  }
  return null;
};

const DashboardAdminSkeleton: React.FC = () => (
  <div className="space-y-4 sm:space-y-6 animate-pulse font-sans">
    <div className="h-8 sm:h-10 bg-muted/60 rounded-2xl w-2/3 sm:w-1/3" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-28 sm:h-32 bg-muted/50 rounded-3xl border border-border/60" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2 h-72 bg-muted/40 rounded-3xl border border-border/60" />
      <div className="h-72 bg-muted/40 rounded-3xl border border-border/60" />
    </div>
  </div>
);


export const DashboardAdminOrg: React.FC = () => {
  const { t } = useTranslation('admin');
  const { user, currentOrg, prospects, clients, commerciaux, paiements } = useAuth();
  const [currency, setCurrency] = useState<DeviseCode>('XOF');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<PeriodFilter>('mois');
  const [customStart, setCustomStart] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-01-01`;
  });
  const [customEnd, setCustomEnd] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-12-31`;
  });

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', currency), currency);

  const PERIOD_LABELS: Record<PeriodFilter, string> = {
    mois: t('adminOrg.dashboard.period.mois'),
    trimestre: t('adminOrg.dashboard.period.trimestre'),
    annee: t('adminOrg.dashboard.period.annee'),
    personnalise: t('adminOrg.dashboard.period.personnalise'),
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const { start, end } = useMemo(
    () => getDateRange(period, customStart, customEnd),
    [period, customStart, customEnd],
  );

  // All period-filtered slices — single source of truth for the whole page
  const prospectsInPeriod = useMemo(
    () => prospects.filter((p) => inRange(p.created_at, start, end)),
    [prospects, start, end],
  );

  const clientsInPeriod = useMemo(
    () => clients.filter((c) => inRange(c.created_at, start, end)),
    [clients, start, end],
  );

  const paiementsInPeriod = useMemo(
    () => paiements.filter((p) => p.statut === 'valide' && inRange(p.date_paiement, start, end)),
    [paiements, start, end],
  );

  const totalProspects = prospectsInPeriod.length;
  const totalClients = clientsInPeriod.length;
  const conversionRate = totalProspects > 0 ? Math.round((totalClients / totalProspects) * 100) : 0;
  const totalCA = paiementsInPeriod.reduce((sum, p) => sum + (p.montant_paye || 0), 0);

  const teamData = useMemo(
    () =>
      commerciaux
        .filter((c) => c.statut === 'actif')
        .map((c) => {
          const myProspects = prospectsInPeriod.filter((p) => p.commercial_id === c.id);
          const myClients = clientsInPeriod.filter((cl) => cl.commercial_id === c.id);
          const myCA = paiementsInPeriod
            .filter((p) => p.commercial_id === c.id)
            .reduce((sum, p) => sum + (p.montant_paye || 0), 0);
          const conversion =
            myProspects.length > 0 ? Math.round((myClients.length / myProspects.length) * 100) : 0;
          return {
            id: c.id,
            name: `${c.prenom} ${c.nom}`,
            email: c.email,
            prospects: myProspects.length,
            ventes: myClients.length,
            ca: myCA,
            conversion,
          };
        })
        .sort((a, b) => b.ca - a.ca),
    [commerciaux, prospectsInPeriod, clientsInPeriod, paiementsInPeriod],
  );

  const repartitionFormule = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of clientsInPeriod) {
      const key = c.formule_souscrite || 'Autre';
      map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map)
      .map(([formule, nombre]) => ({ formule, nombre }))
      .sort((a, b) => b.nombre - a.nombre);
  }, [clientsInPeriod]);

  const repartitionSecteur = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of clientsInPeriod) {
      const key = c.secteur_activite || 'Non défini';
      map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map)
      .map(([secteur, nombre]) => ({ secteur, nombre }))
      .sort((a, b) => b.nombre - a.nombre)
      .slice(0, 5);
  }, [clientsInPeriod]);

  if (isLoading) return <DashboardAdminSkeleton />;

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground">
              {t('adminOrg.dashboard.greeting')}, {user?.prenom || 'Admin'} 👋
            </h1>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
              {t('adminOrg.dashboard.managementPrefix')} {currentOrg?.nom || ''}
            </span>
          </div>
          <div className="flex items-center rounded-2xl bg-muted/80 p-1 border border-border/80 text-xs font-black shrink-0">
            {(['XOF', 'EUR', 'USD'] as DeviseCode[]).map((d) => (
              <button
                key={d}
                onClick={() => setCurrency(d)}
                className={`rounded-xl px-2.5 py-1 text-[10px] sm:text-xs font-black transition-all ${
                  currency === d
                    ? 'bg-gradient-faciloop text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {d === 'XOF' ? 'FCFA' : d}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
          {t('adminOrg.dashboard.subtitle')}
        </p>
      </div>

      {/* Period Filter + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1 rounded-2xl bg-muted/80 p-1 border border-border/80 flex-wrap">
          {(['mois', 'trimestre', 'annee', 'personnalise'] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all whitespace-nowrap ${
                period === p
                  ? 'bg-gradient-faciloop text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/import-export"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-input bg-card px-3 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-foreground shadow-sm hover:bg-muted transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>{t('actions.importCsv')}</span>
          </Link>
          <Link
            to="/admin/equipe"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-faciloop px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-extrabold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            <span>{t('adminOrg.dashboard.newSalesRep')}</span>
          </Link>
        </div>
      </div>

      {/* Custom date range */}
      {period === 'personnalise' && (
        <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4 rounded-2xl border border-primary/30 bg-primary/5">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs font-bold text-primary">{t('adminOrg.dashboard.customPeriod')}</span>
          <div className="flex flex-wrap items-center gap-3 ml-auto sm:ml-0">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">{t('adminOrg.dashboard.from')}</label>
              <input
                type="date"
                value={customStart}
                max={customEnd || undefined}
                onChange={(e) => setCustomStart(e.target.value)}
                style={{ colorScheme: 'auto' }}
                className="min-w-[140px] h-9 px-2 rounded-lg border border-input bg-card text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">{t('adminOrg.dashboard.to')}</label>
              <input
                type="date"
                value={customEnd}
                min={customStart || undefined}
                onChange={(e) => setCustomEnd(e.target.value)}
                style={{ colorScheme: 'auto' }}
                className="min-w-[140px] h-9 px-2 rounded-lg border border-input bg-card text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all space-y-2 sm:space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              {t('adminOrg.dashboard.totalProspects')}
            </span>
            <div className="rounded-2xl bg-blue-500/10 p-2 sm:p-2.5 text-blue-500 shadow-sm">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-foreground">
              <AnimatedNumber value={totalProspects} />
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
              {PERIOD_LABELS[period]}
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all space-y-2 sm:space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              {t('adminOrg.dashboard.activeClients')}
            </span>
            <div className="rounded-2xl bg-emerald-500/10 p-2 sm:p-2.5 text-emerald-500 shadow-sm">
              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-500">
              <AnimatedNumber value={totalClients} />
            </span>
            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3" /> {PERIOD_LABELS[period]}
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all space-y-2 sm:space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              {t('adminOrg.dashboard.conversionRate')}
            </span>
            <div className="rounded-2xl bg-purple-500/10 p-2 sm:p-2.5 text-purple-500 shadow-sm">
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-foreground">
              <AnimatedNumber value={conversionRate} />%
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">
              {PERIOD_LABELS[period]}
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all space-y-2 sm:space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              {t('adminOrg.dashboard.revenue')}
            </span>
            <div className="rounded-2xl bg-emerald-500/10 p-2 sm:p-2.5 text-emerald-500 shadow-sm">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-xl sm:text-xl font-black text-foreground truncate max-w-[160px]">
              {fmt(totalCA)}
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {PERIOD_LABELS[period]}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Leaderboard + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>{t('adminOrg.dashboard.leaderboard')} — {PERIOD_LABELS[period]}</span>
            </h2>
            <Link to="/admin/equipe" className="text-[11px] sm:text-xs font-bold text-primary hover:underline">
              {t('adminOrg.dashboard.manageTeam')}
            </Link>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-3xl border border-border/80 bg-card shadow-sm">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead className="border-b border-border/80 bg-muted/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">{t('adminOrg.dashboard.col.commercial')}</th>
                  <th className="p-4">{t('adminOrg.dashboard.col.prospects')}</th>
                  <th className="p-4">{t('adminOrg.dashboard.col.sales')}</th>
                  <th className="p-4">{t('adminOrg.dashboard.col.revenue')}</th>
                  <th className="p-4 text-right">{t('adminOrg.dashboard.col.convRate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-[11px]">
                {teamData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground text-xs">
                      {t('adminOrg.dashboard.noActiveSalesRep')}
                    </td>
                  </tr>
                ) : (
                  teamData.map((comm, idx) => (
                    <tr key={comm.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-extrabold text-foreground">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white shadow-md ${
                              idx === 0 ? 'bg-amber-500' : 'bg-gradient-faciloop'
                            }`}
                          >
                            {idx === 0 ? '👑' : comm.name[0]}
                          </div>
                          <div>
                            <div>{comm.name}</div>
                            <div className="text-[10px] font-normal text-muted-foreground">{comm.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-foreground">{comm.prospects}</td>
                      <td className="p-4 font-bold text-emerald-500">{comm.ventes}</td>
                      <td className="p-4 font-extrabold text-foreground">{fmt(comm.ca)}</td>
                      <td className="p-4 text-right">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-[10px]">
                          {comm.conversion}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-2.5 md:hidden">
            {teamData.map((comm, idx) => (
              <div key={comm.id} className="p-3.5 rounded-2xl border border-border/80 bg-card space-y-2 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-md shrink-0 ${
                        idx === 0 ? 'bg-amber-500' : 'bg-gradient-faciloop'
                      }`}
                    >
                      {idx === 0 ? '👑' : comm.name[0]}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-foreground">{comm.name}</h3>
                      <p className="text-[10px] font-medium text-muted-foreground truncate max-w-[170px]">{comm.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-[10px]">
                    {comm.conversion}% conv.
                  </span>
                </div>
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <div className="text-[11px]">
                    <span className="text-muted-foreground font-medium">Ventes: </span>
                    <strong className="text-emerald-500 font-extrabold">{comm.ventes} / {comm.prospects}</strong>
                  </div>
                  <div className="font-extrabold text-foreground text-xs">{fmt(comm.ca)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>{t('adminOrg.dashboard.compareChart')}</span>
          </h2>
          <div className="p-4 sm:p-5 rounded-3xl border border-border/80 bg-card shadow-sm space-y-3 sm:space-y-4">
            <div className="h-56 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="prospects" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Prospects" />
                  <Bar dataKey="ventes" fill="#10b981" radius={[6, 6, 0, 0]} name="Ventes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Link
              to="/admin/prospects"
              className="w-full py-2.5 sm:py-3 rounded-2xl bg-gradient-faciloop text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
            >
              <span>{t('adminOrg.dashboard.viewAllProspects')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Répartitions */}
      {(repartitionFormule.length > 0 || repartitionSecteur.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {repartitionFormule.length > 0 && (
            <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-primary" />
                {t('adminOrg.dashboard.byFormule')}
              </h3>
              <div className="space-y-2">
                {repartitionFormule.map(({ formule, nombre }) => {
                  const pct = totalClients > 0 ? Math.round((nombre / totalClients) * 100) : 0;
                  return (
                    <div key={formule} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{formule}</span>
                        <span className="text-muted-foreground font-bold">
                          {nombre} {nombre > 1 ? t('adminOrg.dashboard.clients') : t('adminOrg.dashboard.client')} · {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-faciloop transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {repartitionSecteur.length > 0 && (
            <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                {t('adminOrg.dashboard.bySector')}
              </h3>
              <div className="space-y-2">
                {repartitionSecteur.map(({ secteur, nombre }) => {
                  const pct = totalClients > 0 ? Math.round((nombre / totalClients) * 100) : 0;
                  return (
                    <div key={secteur} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{secteur}</span>
                        <span className="text-muted-foreground font-bold">
                          {nombre} · {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
