import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Building2, 
  Plus, 
  ArrowRightLeft, 
  FileSpreadsheet, 
  UserPlus, 
  Sparkles, 
  CheckCircle2, 
  Award,
  Crown,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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

// Skeleton Loader Component for Mobile-First Onboarding
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
  const { t, i18n } = useTranslation();
  const { user, currentOrg, prospects, clients, commerciaux } = useAuth();
  const [currency, setCurrency] = useState<DeviseCode>('XOF');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isEn = i18n.language?.startsWith('en');

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', currency as DeviseCode), currency as DeviseCode);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const totalProspects = prospects.length;
  const totalClients = clients.length;
  const conversionRate = totalProspects > 0 ? Math.round((totalClients / totalProspects) * 100) : 0;
  const totalCA = clients.reduce((acc, c) => acc + (c.montant_paye || 0), 0);

  const teamData = commerciaux
    .filter(c => c.statut === 'actif')
    .map(c => {
      const myProspects = prospects.filter(p => p.commercial_id === c.id);
      const myClients = clients.filter(cl => cl.commercial_id === c.id);
      const ca = myClients.reduce((sum, cl) => sum + (cl.montant_paye || 0), 0);
      const conversion = myProspects.length > 0 ? Math.round((myClients.length / myProspects.length) * 100) : 0;
      return { id: c.id, name: `${c.prenom} ${c.nom}`, email: c.email, prospects: myProspects.length, ventes: myClients.length, ca, conversion };
    })
    .sort((a, b) => b.ca - a.ca);

  if (isLoading) {
    return <DashboardAdminSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header Banner matching exact Model App Screenshot layout */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Bonjour, Admin 👋 */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground">
              {isEn ? 'Hello' : 'Bonjour'}, {user?.prenom || 'Admin'} 👋
            </h1>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
              {isEn ? 'Management' : 'Direction'} {currentOrg?.nom || "Teranga Logistique"}
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
          {isEn ? 'Global sales overview and team performance' : "Vue d'ensemble de l'activité commerciale globale et performance d'équipe"}
        </p>
      </div>

        {/* Action Buttons Header Bar */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link
            to="/admin/import-export"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-input bg-card px-3 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-foreground shadow-sm hover:bg-muted transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>{isEn ? 'Import CSV' : 'Import CSV'}</span>
          </Link>

          <Link
            to="/admin/equipe"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-faciloop px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-extrabold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            <span>{isEn ? '+ New Sales Rep' : 'Nouveau Commercial'}</span>
          </Link>
        </div>

      {/* Animated Metrics Cards Grid (1 col on Mobile, 2 on Tablet, 4 on Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all space-y-2 sm:space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              {isEn ? 'Total Prospects' : 'Total Prospects'}
            </span>
            <div className="rounded-2xl bg-blue-500/10 p-2 sm:p-2.5 text-blue-500 shadow-sm">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-foreground">
              <AnimatedNumber value={totalProspects} />
            </span>
            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" /> {isEn ? '+18% this month' : '+18% ce mois'}
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all space-y-2 sm:space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              {isEn ? 'Active Clients' : 'Clients Actifs'}
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
              <Sparkles className="h-3 w-3" /> Convertis
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all space-y-2 sm:space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Taux de Conversion</span>
            <div className="rounded-2xl bg-purple-500/10 p-2 sm:p-2.5 text-purple-500 shadow-sm">
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-foreground">
              <AnimatedNumber value={conversionRate} />%
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">
              Objectif 30%
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all space-y-2 sm:space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Chiffre d'Affaires</span>
            <div className="rounded-2xl bg-emerald-500/10 p-2 sm:p-2.5 text-emerald-500 shadow-sm">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-xl sm:text-xl font-black text-foreground truncate max-w-[160px]">
              {fmt(totalCA)}
            </span>
            {/* <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Converti
            </span> */}
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Commercial Leaderboard & Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Commercial Team Leaderboard */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Classement & Performance de l'Équipe</span>
            </h2>
            <Link to="/admin/equipe" className="text-[11px] sm:text-xs font-bold text-primary hover:underline">
              Gérer l'équipe →
            </Link>
          </div>

          {/* Desktop Leaderboard Table */}
          <div className="hidden md:block overflow-x-auto rounded-3xl border border-border/80 bg-card shadow-sm">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead className="border-b border-border/80 bg-muted/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">Commercial</th>
                  <th className="p-4">Prospects Gérés</th>
                  <th className="p-4">Ventes</th>
                  <th className="p-4">Chiffre d'Affaires</th>
                  <th className="p-4 text-right">Taux Conv.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-[11px]">
                {teamData.map((comm, idx) => (
                  <tr key={comm.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-extrabold text-foreground">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white shadow-md ${
                          idx === 0 ? 'bg-amber-500' : 'bg-gradient-faciloop'
                        }`}>
                          {idx === 0 ? '👑' : `${comm.name[0]}`}
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Leaderboard Cards */}
          <div className="grid grid-cols-1 gap-2.5 md:hidden">
            {teamData.map((comm, idx) => (
              <div key={comm.id} className="p-3.5 rounded-2xl border border-border/80 bg-card space-y-2 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-md shrink-0 ${
                      idx === 0 ? 'bg-amber-500' : 'bg-gradient-faciloop'
                    }`}>
                      {idx === 0 ? '👑' : `${comm.name[0]}`}
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
                  <div className="font-extrabold text-foreground text-xs">
                    {fmt(comm.ca)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Polished Recharts Sales Performance */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>Comparaison Volume & Ventes</span>
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
              <span>Consulter tous les prospects</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
