import React, { useState } from 'react';
import { mockCommerciaux } from '../../lib/mockData';
import { Commercial } from '../../types/crm';
import { UserPlus, UserCheck, Shield, X, Check } from 'lucide-react';

export const EquipeCommerciale: React.FC = () => {
  const [team, setTeam] = useState<Commercial[]>(mockCommerciaux);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [nom, setNom] = useState<string>('');
  const [prenom, setPrenom] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');

  const toggleStatus = (id: string) => {
    setTeam(prev =>
      prev.map(c => (c.id === id ? { ...c, statut: c.statut === 'actif' ? 'inactif' : 'actif' } : c))
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: Commercial = {
      id: `comm-${Date.now()}`,
      organization_id: 'org-faciloop-client-1',
      nom,
      prenom,
      email,
      telephone,
      statut: 'actif',
      created_at: new Date().toISOString()
    };
    setTeam([newMember, ...team]);
    setIsModalOpen(false);
    setNom('');
    setPrenom('');
    setEmail('');
    setTelephone('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Gestion de l'Équipe Commerciale
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gérez l'accès des commerciaux de votre entreprise
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:opacity-95"
        >
          <UserPlus className="h-4 w-4" />
          <span>Ajouter un commercial</span>
        </button>
      </div>

      {/* Team Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">Commercial</th>
              <th className="p-4">Email</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {team.map((comm) => (
              <tr key={comm.id} className="hover:bg-muted/30">
                <td className="p-4 font-bold text-foreground">
                  {comm.prenom} {comm.nom}
                </td>
                <td className="p-4 text-muted-foreground">{comm.email}</td>
                <td className="p-4 font-medium text-foreground">{comm.telephone}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    comm.statut === 'actif' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {comm.statut}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleStatus(comm.id)}
                    className="px-3 py-1.5 rounded-lg border text-xs font-bold hover:bg-muted"
                  >
                    {comm.statut === 'actif' ? 'Désactiver' : 'Activer'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Commercial Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Créer un Compte Commercial</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Abdoulaye"
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Sarr"
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Professionnel</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abdoulaye@entreprise.sn"
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Téléphone Mobile</label>
                <input
                  type="tel"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+221 77 000 11 22"
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-faciloop text-white font-bold shadow-md hover:opacity-95"
              >
                Créer l'accès commercial
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
