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
      <div className="p-3 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl space-y-1 text-xs font-sans">
        <p className="font-extrabold text-foreground">{label}</p>
        <p className="text-primary font-black flex items-center gap-1">
          <span>{payload[0].value.toLocaleString()} FCFA</span>
        </p>
      </div>
    );
  }
  return null;
};

// Skeleton Loader Component for Elite Onboarding
const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-10 bg-muted/60 rounded-2xl w-1/3" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-muted/50 rounded-3xl border border-border/60" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-72 bg-muted/40 rounded-3xl border border-border/60" />
      <div className="h-72 bg-muted/40 rounded-3xl border border-border/60" />
    </div>
  </div>
);

export const DashboardCommercial: React.FC = () => {
  const { user, myProspects, myRelances } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simulate quick 800ms initial loading skeleton for elite SaaS feel
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
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
    <div className="space-y-6 font-sans">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Bonjour, {user?.prenom || 'Commercial'} 👋
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
              Centre de Commandement
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Vos priorités, relances et performance de vente aujourd'hui
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/prospects"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:opacity-95 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau prospect</span>
          </Link>
        </div>
      </div>

      {/* Animated Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Mes Prospects</span>
            <div className="rounded-2xl bg-blue-500/10 p-2.5 text-blue-500 shadow-sm">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-black text-foreground">
              <AnimatedNumber value={totalProspects} />
            </span>
            <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" /> +12% ce mois
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Relances Auj.</span>
            <div className="rounded-2xl bg-amber-500/10 p-2.5 text-amber-500 shadow-sm">
              <CalendarClock className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-black text-foreground">
              <AnimatedNumber value={relancesAujourdhui.length} />
            </span>
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {relancesAujourdhui.length > 0 ? 'À effectuer' : 'À jour'}
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-5 shadow-sm hover:shadow-xl transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-500">Relances en Retard</span>
            <div className="rounded-2xl bg-rose-500/10 p-2.5 text-rose-500 shadow-sm animate-bounce">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-black text-rose-500">
              <AnimatedNumber value={relancesEnRetard.length} />
            </span>
            <span className="text-[10px] font-black text-white bg-rose-500 px-2.5 py-0.5 rounded-full shadow-md shadow-rose-500/30">
              URGENT
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Ventes Conclues</span>
            <div className="rounded-2xl bg-emerald-500/10 p-2.5 text-emerald-500 shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-black text-foreground">
              <AnimatedNumber value={ventesConclues} />
            </span>
            <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3" /> Convertis
            </span>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Priorities List & Recharts Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priorities List with Instant Direct Action Triggers */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Mes Priorités du Jour</span>
            </h2>
            <Link to="/app/relances" className="text-xs font-bold text-primary hover:underline">
              Voir toutes mes relances →
            </Link>
          </div>

          <div className="space-y-3">
            {myRelances.length === 0 ? (
              <div className="p-8 rounded-3xl border-2 border-dashed border-border/80 bg-card/40 text-center space-y-1">
                <p className="text-xs font-bold text-foreground">Aucune relance programmée pour le moment.</p>
                <p className="text-[11px] text-muted-foreground">Toutes vos actions quotidiennes sont à jour !</p>
              </div>
            ) : (
              myRelances.map((relance) => {
                const isLate = relance.statut === 'en_retard';
                return (
                  <motion.div
                    key={relance.id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isLate ? 'border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/20' : 'border-border/80'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-foreground">{relance.prospect_nom}</span>
                        <span className="text-xs text-muted-foreground">({relance.prospect_entreprise})</span>
                        {isLate && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase shadow-sm">
                            En retard
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">{relance.commentaire || relance.motif}</p>
                      <div className="flex items-center gap-3 text-[10px] font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> {relance.heure || '09:00'}</span>
                        <span className="capitalize bg-muted px-2 py-0.5 rounded-md">Canal: {relance.canal}</span>
                      </div>
                    </div>

                    {/* Instant Direct Action Triggers */}
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`https://wa.me/${relance.prospect_nom}?text=${encodeURIComponent(
                          `Bonjour ${relance.prospect_nom}, je suis ${user?.prenom || 'commercial'} de Faciloop. Je vous relance au sujet de notre opportunité.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-600 flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href="tel:+221770000000"
                        className="p-2 rounded-xl border border-input bg-card text-foreground hover:bg-muted text-xs font-bold transition-all"
                        title="Appeler"
                      >
                        <Phone className="w-3.5 h-3.5 text-primary" />
                      </a>

                      <Link
                        to={`/app/prospects/${relance.prospect_id}`}
                        className="px-3 py-2 rounded-xl border border-input bg-card text-xs font-bold hover:bg-muted transition-all"
                      >
                        Fiche
                      </Link>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Polished Recharts Sales Performance */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Performance Financière (Semaine)</span>
          </h2>

          <div className="p-5 rounded-3xl border border-border/80 bg-card shadow-sm space-y-4">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-bold">
              <span className="text-muted-foreground">Objectif Hebdo</span>
              <span className="text-emerald-500">4 350 000 FCFA</span>
            </div>

            <Link
              to="/app/pipeline"
              className="w-full py-3 rounded-2xl bg-gradient-faciloop text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
            >
              <span>Ouvrir mon Kanban 6 Étapes</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
