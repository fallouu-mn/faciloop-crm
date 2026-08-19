import React, { useState } from 'react';
import { mockOrganizations } from '../../lib/mockData';
import { Organization, TenantStatut } from '../../types/crm';
import { Building2, Plus, ShieldAlert, Check, X, Lock } from 'lucide-react';

export const DashboardSuperAdmin: React.FC = () => {
  const [orgs, setOrgs] = useState<Organization[]>(mockOrganizations);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [nomOrg, setNomOrg] = useState<string>('');
  const [devise, setDevise] = useState<string>('XOF');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPhone, setAdminPhone] = useState<string>('');

  const toggleStatus = (id: string, current: TenantStatut) => {
    const next: TenantStatut = current === 'actif' ? 'suspendu' : 'actif';
    setOrgs(prev => prev.map(o => (o.id === id ? { ...o, statut: next } : o)));
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      nom: nomOrg,
      devise_defaut: devise,
      statut: 'actif',
      created_at: new Date().toISOString()
    };
    setOrgs([newOrg, ...orgs]);
    setIsModalOpen(false);
    setNomOrg('');
    setAdminEmail('');
    setAdminPhone('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Super-Admin (Digit'Advisor)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gestion globale des entreprises clientes (Tenants Multi-Entreprises)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          <span>Créer un espace Entreprise</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card">
          <span className="text-xs font-bold uppercase text-muted-foreground">Organisations Actives</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-500">
            {orgs.filter(o => o.statut === 'actif').length}
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card">
          <span className="text-xs font-bold uppercase text-muted-foreground">Comptes Suspendus</span>
          <div className="mt-2 text-2xl font-extrabold text-rose-500">
            {orgs.filter(o => o.statut === 'suspendu').length}
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card">
          <span className="text-xs font-bold uppercase text-muted-foreground">Total Plateforme</span>
          <div className="mt-2 text-2xl font-extrabold text-foreground">{orgs.length}</div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">Entreprise (Tenant)</th>
              <th className="p-4">Devise</th>
              <th className="p-4">Date de Création</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Action Super-Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orgs.map((org) => (
              <tr key={org.id} className="hover:bg-muted/30">
                <td className="p-4 font-bold text-foreground">{org.nom}</td>
                <td className="p-4 text-muted-foreground">{org.devise_defaut}</td>
                <td className="p-4 text-muted-foreground">{org.created_at.split('T')[0]}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    org.statut === 'actif' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {org.statut}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleStatus(org.id, org.statut)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      org.statut === 'actif' ? 'hover:bg-rose-500/10 text-rose-500 border-rose-500/30' : 'hover:bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    }`}
                  >
                    {org.statut === 'actif' ? 'Suspendre (Impayé)' : 'Activer'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal New Tenant */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Créer un Espace Entreprise</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nom de l'Entreprise Client</label>
                <input
                  type="text"
                  required
                  value={nomOrg}
                  onChange={(e) => setNomOrg(e.target.value)}
                  placeholder="Ex: Sénégal Distribution SA"
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Devise</label>
                <select
                  value={devise}
                  onChange={(e) => setDevise(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium"
                >
                  <option value="XOF">FCFA (XOF)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar ($)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Email de l'Admin Org Initial</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@senegaldistribution.sn"
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-faciloop text-white font-bold shadow-md hover:opacity-95"
              >
                Générer l'espace Tenant
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
