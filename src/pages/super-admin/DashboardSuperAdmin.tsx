import React, { useState } from 'react';
import { mockOrganizations } from '../../lib/mockData';
import { Organization, TenantStatut } from '../../types/crm';
import { Building2, Plus, ShieldAlert, Check, X, Lock, Globe2, Clock, Power, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header Banner (Stacked on Mobile, Row on Desktop) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Super-Admin (Digit'Advisor)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
              Console Plateforme SaaS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gestion globale des entreprises clientes (Tenants Multi-Entreprises)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Créer un espace Entreprise</span>
        </button>
      </div>

      {/* Overview Cards Grid (2 cols on Mobile, 3 on Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Organisations Actives</span>
            <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-500 shadow-sm">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-500">
              {orgs.filter(o => o.statut === 'actif').length}
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Opérationnelles
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-rose-500">Comptes Suspendus</span>
            <div className="rounded-2xl bg-rose-500/10 p-2 text-rose-500 shadow-sm">
              <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-black text-rose-500">
              {orgs.filter(o => o.statut === 'suspendu').length}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
              Impayés / Pause
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="col-span-2 sm:col-span-1 rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Total Plateforme</span>
            <div className="rounded-2xl bg-primary/10 p-2 text-primary shadow-sm">
              <Globe2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-black text-foreground">
              {orgs.length}
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Multi-Tenant
            </span>
          </div>
        </motion.div>
      </div>

      {/* Desktop Organizations Table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-xs min-w-[650px]">
          <thead className="border-b border-border/80 bg-muted/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">Entreprise (Tenant)</th>
              <th className="p-4">Devise</th>
              <th className="p-4">Date de Création</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Action Super-Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-[11px]">
            {orgs.map((org) => (
              <tr key={org.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 font-extrabold text-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-faciloop text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                      {org.nom[0]}
                    </div>
                    <span>{org.nom}</span>
                  </div>
                </td>
                <td className="p-4 font-semibold text-muted-foreground">{org.devise_defaut}</td>
                <td className="p-4 text-muted-foreground font-medium">{org.created_at.split('T')[0]}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    org.statut === 'actif' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {org.statut}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleStatus(org.id, org.statut)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all ${
                      org.statut === 'actif'
                        ? 'hover:bg-rose-500/10 text-rose-500 border-rose-500/30'
                        : 'hover:bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
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

      {/* Mobile Stacked Organizations Cards (Solves Screenshot) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {orgs.map((org) => (
          <div key={org.id} className="p-4 rounded-2xl border border-border/80 bg-card space-y-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-faciloop text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                  {org.nom[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">{org.nom}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium pt-0.5">
                    <span className="bg-muted px-2 py-0.5 rounded-md font-bold text-foreground">Devise: {org.devise_defaut}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> {org.created_at.split('T')[0]}</span>
                  </div>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                org.statut === 'actif' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {org.statut}
              </span>
            </div>

            <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] font-semibold text-muted-foreground">Action Super-Admin :</span>
              <button
                onClick={() => toggleStatus(org.id, org.statut)}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 active:scale-95 ${
                  org.statut === 'actif'
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{org.statut === 'actif' ? 'Suspendre (Impayé)' : 'Activer'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal New Tenant (Stacked Buttons on Mobile) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-foreground">Créer un Espace Entreprise</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nom de l'Entreprise Client *</label>
                <input
                  type="text"
                  required
                  value={nomOrg}
                  onChange={(e) => setNomOrg(e.target.value)}
                  placeholder="Ex: Sénégal Distribution SA"
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Devise</label>
                <select
                  value={devise}
                  onChange={(e) => setDevise(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground"
                >
                  <option value="XOF">FCFA (XOF)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar ($)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Email de l'Admin Org Initial *</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@senegaldistribution.sn"
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-1/2 py-2.5 rounded-xl border border-input text-xs font-bold hover:bg-muted text-foreground"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-1/2 py-2.5 rounded-xl bg-gradient-faciloop text-white font-bold text-xs shadow-md shadow-primary/25 hover:opacity-95"
                >
                  Générer le Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
