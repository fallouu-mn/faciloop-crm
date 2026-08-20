import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  CalendarClock, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Plus, 
  ArrowUpRight,
  Phone,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useSpring, useTransform } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Animated Count-Up Number Component
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

// Custom Glassmorphism Recharts Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2.5 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl space-y-0.5 text-xs font-sans">
        <p className="font-extrabold text-foreground">{label}</p>
        <p className="text-primary font-black flex items-center gap-1">
          <span>{payload[0].value.toLocaleString()} FCFA</span>
        </p>
      </div>
    );
  }
  return null;
};

// Skeleton Loader Component for Mobile-First Onboarding
const DashboardSkeleton: React.FC = () => (
  <div className="space-y-4 sm:space-y-6 animate-pulse">
    <div className="h-8 sm:h-10 bg-muted/60 rounded-2xl w-2/3 sm:w-1/3" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-28 sm:h-32 bg-muted/50 rounded-3xl border border-border/60" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2 h-64 sm:h-72 bg-muted/40 rounded-3xl border border-border/60" />
      <div className="h-64 sm:h-72 bg-muted/40 rounded-3xl border border-border/60" />
    </div>
  </div>
);

export const DashboardCommercial: React.FC = () => {
  const { user, myProspects, myRelances, currency, setCurrency } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simulate quick initial loading skeleton for elite SaaS feel
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Strict CDC 3.2: Metrics calculation based ONLY on assigned portfolio
  const totalProspects = myProspects.length;
  const relancesAujourdhui = myRelances.filter(r => r.date === new Date().toISOString().split('T')[0]);
  const relancesEnRetard = myRelances.filter(r => r.statut === 'en_retard');
  const ventesConclues = myProspects.filter(p => p.statut_pipeline === 'gagne').length;

  // Mock Performance Sales Chart Data
  const salesChartData = [
    { day: 'Lun', sales: 250000 },
    { day: 'Mar', sales: 400000 },
    { day: 'Mer', sales: 300000 },
    { day: 'Jeu', sales: 750000 },
    { day: 'Ven', sales: 900000 },
    { day: 'Sam', sales: 600000 },
    { day: 'Dim', sales: 1150000 }
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header matching exact Model App Screenshot layout */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Bonjour, Moussa 👋 */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Bonjour, {user?.prenom || 'Moussa'} 👋
            </h1>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
              Centre de Commandement
            </span>
          </div>

          {/* Right: Currency Switcher Pill (FCFA | EUR | USD) matching screenshot */}
          <div className="flex items-center rounded-2xl bg-muted/80 p-1 border border-border/80 text-xs font-black shrink-0">
            <button
              onClick={() => setCurrency('XOF')}
              className={`rounded-xl px-2.5 py-1 text-[10px] sm:text-xs font-black transition-all ${
                currency === 'XOF'
                  ? 'bg-gradient-faciloop text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              FCFA
            </button>
            <button
              onClick={() => setCurrency('EUR')}
              className={`rounded-xl px-2.5 py-1 text-[10px] sm:text-xs font-black transition-all ${
                currency === 'EUR'
                  ? 'bg-gradient-faciloop text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EUR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`rounded-xl px-2.5 py-1 text-[10px] sm:text-xs font-black transition-all ${
                currency === 'USD'
                  ? 'bg-gradient-faciloop text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              USD
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
          Vos priorités, relances et performance de vente aujourd'hui
        </p>

        {/* Prominent Full-Width CTA Button + Nouveau Prospect */}
        <div>
          <Link
            to="/app/prospects"
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-faciloop py-3.5 px-4 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition-all"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Nouveau prospect</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1 */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="p-5 rounded-3xl border border-border/80 bg-card shadow-md relative overflow-hidden space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Mes Prospects</span>
            <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-foreground">
              <AnimatedNumber value={totalProspects} />
            </span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12% ce mois
            </span>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="p-5 rounded-3xl border border-border/80 bg-card shadow-md relative overflow-hidden space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Relances Auj.</span>
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-500">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-foreground">
              <AnimatedNumber value={relancesAujourdhui.length} />
            </span>
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
              À jour
            </span>
          </div>
        </motion.div>

        {/* Card 3 (Relances en retard - Highlighted Alert) */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className={`p-5 rounded-3xl border ${
            relancesEnRetard.length > 0 ? 'border-rose-500/50 bg-rose-500/5' : 'border-border/80 bg-card'
          } shadow-md relative overflow-hidden space-y-2`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500">Relances en Retard</span>
            <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-500">
              <AnimatedNumber value={relancesEnRetard.length} />
            </span>
            {relancesEnRetard.length > 0 && (
              <span className="text-[10px] font-black text-white bg-rose-500 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                URGENT
              </span>
            )}
          </div>
        </motion.div>

        {/* Card 4 */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="p-5 rounded-3xl border border-border/80 bg-card shadow-md relative overflow-hidden space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Ventes Conclues</span>
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-foreground">
              <AnimatedNumber value={ventesConclues} />
            </span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Convertis
            </span>
          </div>
        </motion.div>
      </div>

      {/* Main Content Layout: Priorities List + Recharts Performance Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Priorities of the Day List */}
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
            {myRelances.slice(0, 3).map((relance) => (
              <div
                key={relance.id}
                className="p-4 rounded-2xl border border-border/60 bg-muted/30 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm text-foreground">{relance.prospect_nom}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">({relance.prospect_entreprise})</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold">{relance.notes}</p>
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
                    href={`https://wa.me/${(relance.prospect_telephone || '221770000000').replace(/\s+/g, '')}?text=Bonjour%20${encodeURIComponent(relance.prospect_nom || 'Prospect')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WA</span>
                  </a>
                  <a
                    href={`tel:${relance.prospect_telephone || ''}`}
                    className="p-2 rounded-xl border border-input text-foreground hover:bg-muted active:scale-95 transition-all"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Dynamic Sales Performance Chart */}
        <div className="p-5 sm:p-6 rounded-3xl border border-border/80 bg-card shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CA Ventes Hebdomadaire</span>
            <h3 className="text-2xl font-black text-primary">
              3 377 923 {currency === 'XOF' ? 'FCFA' : currency}
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
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" stroke="#FF8A00" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
