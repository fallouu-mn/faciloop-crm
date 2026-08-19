import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, UserCheck, TrendingUp, DollarSign, Building2 } from 'lucide-react';

export const DashboardAdminOrg: React.FC = () => {
  const { currentOrg, prospects, clients, currency } = useAuth();

  const totalProspects = prospects.length;
  const totalClients = clients.length;
  const totalCA = clients.reduce((acc, c) => acc + (c.montant_paye || 0), 0);

  // Performance comparison data for Recharts
  const teamData = [
    { name: 'Moussa Diop', prospects: 12, ventes: 4, ca: 3500000 },
    { name: 'Awa Sow', prospects: 8, ventes: 6, ca: 4200000 },
    { name: 'Ibrahima Ndiaye', prospects: 5, ventes: 2, ca: 1500000 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Dashboard Admin - {currentOrg?.nom || "Teranga Logistique SA"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Vue d'ensemble de l'activité commerciale globale et statistiques d'équipe
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase">Total Prospects</span>
          <div className="mt-2 text-2xl font-extrabold text-foreground">{totalProspects}</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase">Clients Actifs</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-500">{totalClients}</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase">Taux de conversion</span>
          <div className="mt-2 text-2xl font-extrabold text-primary">
            {totalProspects > 0 ? Math.round((totalClients / totalProspects) * 100) : 0}%
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase">Chiffre d'Affaires</span>
          <div className="mt-2 text-2xl font-extrabold text-foreground">
            {totalCA.toLocaleString()} {currency}
          </div>
        </div>
      </div>

      {/* Recharts Performance Comparison */}
      <div className="p-6 rounded-3xl border border-border bg-card space-y-4">
        <h2 className="text-base font-bold text-foreground">Comparaison de la Performance des Commerciaux</h2>
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teamData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} />
              <YAxis stroke="#888888" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff' }}
              />
              <Bar dataKey="prospects" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Prospects gérés" />
              <Bar dataKey="ventes" fill="#10b981" radius={[6, 6, 0, 0]} name="Ventes réalisées" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
