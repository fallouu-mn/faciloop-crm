import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  DollarSign,
  Percent,
  Target,
  Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useSpring, useTransform } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';

// ─── Animated Count-Up ────────────────────────────────────────
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

// ─── Custom Tooltip ───────────────────────────────────────────
function createCustomTooltip(curr: Currency) {
  return ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2.5 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl space-y-0.5 text-xs font-sans">
          <p className="font-extrabold text-foreground">{label}</p>
          <p className="text-primary font-black">{formatMoney(payload[0].value, curr)}</p>
        </div>
      );
    }
    return null;
  };
}

// ─── Currency helpers ─────────────────────────────────────────
type Currency = 'XOF' | 'EUR' | 'USD';
const CURRENCY_LABELS: Record<Currency, string> = { XOF: 'FCFA', EUR: 'EUR', USD: 'USD' };
const EXCHANGE_RATES: Record<Currency, number> = { XOF: 1, EUR: 1 / 655.957, USD: 1 / 600 };

function formatMoney(amount: number, curr: Currency): string {
  return Math.round(amount * EXCHANGE_RATES[curr]).toLocaleString('fr-FR') + ' ' + CURRENCY_LABELS[curr];
}

// ─── Objectives helper ────────────────────────────────────────
function getProgressColor(pct: number): string {
  if (pct >= 100) return 'bg-green-500';
  if (pct >= 80) return 'bg-blue-500';
  if (pct >= 50) return 'bg-orange-500';
  return 'bg-red-500';
}

const OBJECTIF_LABELS: Record<string, string> = {
  ca: 'CA généré',
  ventes: 'Ventes conclues',
  prospects: 'Prospects créés',
  rdv: 'RDV réalisés',
};

// ─── Skeleton ─────────────────────────────────────────────────
const DashboardSkeleton: React.FC = () => (
  <div className="space-y-4 sm:space-y-6 animate-pulse">
    <div className="h-8 sm:h-10 bg-muted/60 rounded-2xl w-2/3 sm:w-1/3" />
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="h-24 sm:h-28 bg-muted/50 rounded-3xl border border-border/60" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2 h-64 sm:h-72 bg-muted/40 rounded-3xl border border-border/60" />
      <div className="h-64 sm:h-72 bg-muted/40 rounded-3xl border border-border/60" />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────
export const DashboardCommercial: React.FC = () => {
  const { user, myProspects, myRelances, commissions, objectifs, paiements, currency, setCurrency } = useAuth();
  const activeCurrency = (Object.entries(CURRENCY_LABELS).find(([, v]) => v === currency)?.[0] || 'XOF') as Currency;
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // ─── Backend-ready: all metrics computed from context data ───
  const metrics = useMemo(() => {
    const totalProspects = myProspects.length;
    const relancesEnRetard = myRelances.filter(r => r.statut === 'en_retard').length;
    const relancesAujourdhui = myRelances.filter(r => r.date === new Date().toISOString().split('T')[0]).length;
    const ventesConclues = myProspects.filter(p => p.statut_pipeline === 'gagne').length;
    const tauxConversion = totalProspects > 0 ? Math.round((ventesConclues / totalProspects) * 100) : 0;

    const myCommissions = commissions.filter(c => c.commercialId === user?.id);
    const caGenere = myCommissions.reduce((sum, c) => sum + c.montantVente, 0);
    const mesGains = myCommissions.reduce((sum, c) => sum + c.montantCommission, 0);

    const myPaiements = paiements.filter(p => p.commercial_id === user?.id);
    const montantEncaisse = myPaiements.reduce((sum, p) => sum + p.montant_paye, 0);

    return { totalProspects, relancesEnRetard, relancesAujourdhui, ventesConclues, tauxConversion, caGenere, mesGains, montantEncaisse };
  }, [myProspects, myRelances, commissions, paiements, user]);

  // ─── Objectives for current commercial ──────────────────────
  const myObjectifs = useMemo(() => {
    return objectifs.filter(o => o.commercialId === user?.id);
  }, [objectifs, user]);

  // ─── Prospect phone lookup for WA links ─────────────────────
  const getProspectPhone = (prospectId: string): string => {
    const prospect = myProspects.find(p => p.id === prospectId);
    return (prospect?.whatsapp || prospect?.telephone || '').replace(/\s+/g, '');
  };

  // ─── Chart data (TODO: replace with real data from backend) ─
  const salesChartDataRaw = [
    { day: 'Lun', sales: 250000 },
    { day: 'Mar', sales: 400000 },
    { day: 'Mer', sales: 300000 },
    { day: 'Jeu', sales: 750000 },
    { day: 'Ven', sales: 900000 },
    { day: 'Sam', sales: 600000 },
    { day: 'Dim', sales: 1150000 }
  ];
  const salesChartData = useMemo(() =>
    salesChartDataRaw.map(d => ({ ...d, sales: Math.round(d.sales * EXCHANGE_RATES[activeCurrency]) })),
    [activeCurrency]
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Bonjour, {user?.prenom || 'Moussa'}
            </h1>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
              Espace Commercial
            </span>
          </div>

          <div className="flex items-center rounded-2xl bg-muted/80 p-1 border border-border/80 text-xs font-black shrink-0">
            {(['XOF', 'EUR', 'USD'] as Currency[]).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(CURRENCY_LABELS[c])}
                className={`rounded-xl px-2.5 py-1 text-[10px] sm:text-xs font-black transition-all ${
                  currency === CURRENCY_LABELS[c]
                    ? 'bg-gradient-faciloop text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {CURRENCY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
          Vos priorités, relances et performance de vente aujourd'hui
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard icon={Users} color="blue" label="Mes Prospects" value={metrics.totalProspects} link="/app/prospects" />
        <KpiCard icon={CalendarClock} color="amber" label="Relances Auj." value={metrics.relancesAujourdhui} link="/app/relances" />
        <KpiCard icon={AlertTriangle} color="rose" label="Relances en Retard" value={metrics.relancesEnRetard} alert={metrics.relancesEnRetard > 0} link="/app/relances" />
        {/* <KpiCard icon={CheckCircle2} color="emerald" label="Ventes Conclues" value={metrics.ventesConclues} link="/app/prospects?statut=gagne" /> */}
        <KpiCard icon={TrendingUp} color="emerald" label="CA Généré" value={formatMoney(metrics.caGenere, activeCurrency)} isText />
        <KpiCard icon={DollarSign} color="amber" label="Mes Gains" value={formatMoney(metrics.mesGains, activeCurrency)} isText link="/app/gains" />
        <KpiCard icon={Percent} color="blue" label="Taux Conversion" value={`${metrics.tauxConversion}%`} isText />
      </div>

      {/* Objectives Section */}
      {/* {myObjectifs.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl border border-border/80 bg-card shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-extrabold text-sm sm:text-base text-foreground uppercase tracking-wider">
                Mes Objectifs
              </h3>
            </div>
            <Link to="/app/objectifs" className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {myObjectifs.map(obj => {
              const pct = obj.objectif > 0 ? Math.min(Math.round((obj.realise / obj.objectif) * 100), 100) : 0;
              const valueText = obj.type === 'ca'
                ? `${formatMoney(obj.realise, activeCurrency)} / ${formatMoney(obj.objectif, activeCurrency)}`
                : `${obj.realise} / ${obj.objectif}`;
              return (
                <div key={obj.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{OBJECTIF_LABELS[obj.type] || obj.type}</span>
                    <span className="text-xs font-bold tabular-nums text-foreground">{pct}%</span>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all ${getProgressColor(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground tabular-nums">{valueText}</p>
                </div>
              );
            })}
          </div>
        </div>
      )} */}

      {/* Main Content: Priorities + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Priorities */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl border border-border/80 bg-card shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-extrabold text-sm sm:text-base text-foreground uppercase tracking-wider">
                Mes Priorités du Jour
              </h3>
            </div>
            <Link to="/app/relances" className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1">
              <span>Voir toutes mes relances</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {myRelances.slice(0, 5).map((relance) => {
              const phone = getProspectPhone(relance.prospect_id);
              return (
                <div
                  key={relance.id}
                  className="p-4 rounded-2xl border border-border/60 bg-muted/30 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm text-foreground">{relance.prospect_nom}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">({relance.prospect_entreprise})</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold">{relance.motif}</p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" /> {relance.heure || '09:00'}
                      </span>
                      <span>•</span>
                      <span>Canal: {(relance.canal || 'whatsapp').replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://wa.me/${phone}?text=Bonjour%20${encodeURIComponent(relance.prospect_nom || 'Prospect')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 rounded-xl bg-[#25D366] text-white font-extrabold text-xs shadow-md shadow-[#25D366]/20 hover:bg-[#1DA851] active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      
                    </a>
                    <a
                      href={`tel:${phone}`}
                      className="p-2 rounded-xl border border-input text-foreground hover:bg-muted active:scale-95 transition-all"
                    >
                      <Phone className="w-4 h-4 text-primary" />
                    </a>
                  </div>
                </div>
              );
            })}

            {myRelances.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Aucune relance programmée aujourd'hui.</p>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="p-5 sm:p-6 rounded-3xl border border-border/80 bg-card shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CA Ventes Hebdomadaire</span>
            <h3 className="text-2xl font-black text-primary">
              {formatMoney(metrics.caGenere || 3377923, activeCurrency)}
            </h3>
            <p className="text-xs text-muted-foreground font-semibold">Tendance des ventes conclues sur 7 jours</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF3D81" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                <Tooltip content={createCustomTooltip(activeCurrency)} />
                <Area type="monotone" dataKey="sales" stroke="#FF8A00" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── KPI Card Sub-Component ───────────────────────────────────
function KpiCard({
  icon: Icon, color, label, value, alert, isText, link,
}: {
  icon: React.ElementType;
  color: string;
  label: string;
  value: number | string;
  alert?: boolean;
  isText?: boolean;
  link?: string;
}) {
  const Wrapper = link ? Link : 'div';
  const wrapperProps = link ? { to: link } : {};

  return (
    <motion.div whileHover={{ y: -3, scale: 1.01 }}>
      <Wrapper
        {...(wrapperProps as any)}
        className={`block p-5 rounded-3xl border ${
          alert ? `border-${color}-500/50 bg-${color}-500/5` : 'border-border/80 bg-card'
        } shadow-md relative overflow-hidden space-y-2`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${alert ? `text-${color}-500` : 'text-muted-foreground'}`}>
            {label}
          </span>
          <div className={`p-2 rounded-2xl bg-${color}-500/10 text-${color}-500`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          {isText ? (
            <span className={`text-xl sm:text-2xl font-black ${alert ? `text-${color}-500` : 'text-foreground'} tabular-nums`}>
              {value}
            </span>
          ) : (
            <span className={`text-3xl font-black ${alert ? `text-${color}-500` : 'text-foreground'}`}>
              <AnimatedNumber value={value as number} />
            </span>
          )}
        </div>
      </Wrapper>
    </motion.div>
  );
}
