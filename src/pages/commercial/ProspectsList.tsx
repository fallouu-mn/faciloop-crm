import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProspectSource } from '../../types/crm';
import { mockCommerciaux } from '../../lib/mockData';
import { 
  Users, 
  Search, 
  Plus, 
  AlertTriangle, 
  X, 
  Check, 
  ArrowRight,
  Eye,
  Lock,
  UserCheck,
  ArrowRightLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProspectsList: React.FC = () => {
  const { user, myProspects, prospects, addProspect, reassignProspects } = useAuth();

  const [search, setSearch] = useState<string>('');
  const [filterStep, setFilterStep] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals State
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState<boolean>(false);
  const [targetCommercialId, setTargetCommercialId] = useState<string>(mockCommerciaux[0].id);

  // New Prospect Form State
  const [newNom, setNewNom] = useState<string>('');
  const [newPrenom, setNewPrenom] = useState<string>('');
  const [newEntreprise, setNewEntreprise] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newSource, setNewSource] = useState<ProspectSource>('prospection_directe');
  const [newFormule, setNewFormule] = useState<string>('SaaS Pro');

  const [duplicateAlert, setDuplicateAlert] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Phone input duplicate checker (checks across whole org)
  const handlePhoneChange = (val: string) => {
    setNewPhone(val);
    const clean = val.replace(/\s+/g, '');
    if (clean.length >= 8) {
      const exists = prospects.some(p => p.telephone.replace(/\s+/g, '') === clean);
      setDuplicateAlert(exists);
    } else {
      setDuplicateAlert(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNom || !newEntreprise || !newPhone) return;

    const res = addProspect({
      nom: newNom,
      prenom: newPrenom,
      entreprise: newEntreprise,
      telephone: newPhone,
      source: newSource,
      formule_envisagee: newFormule,
      statut_pipeline: 'nouveau',
      commercial_id: user?.id,
      commercial_nom: user ? `${user.prenom} ${user.nom}` : undefined
    });

    if (res.duplicate) {
      setDuplicateAlert(true);
      return;
    }

    if (res.success) {
      showToast('Prospect créé et attribué avec succès !');
      setIsNewModalOpen(false);
      setNewNom('');
      setNewPrenom('');
      setNewEntreprise('');
      setNewPhone('');
    }
  };

  // CDC 3.2: Filtered strictly on myProspects for Commercial role, or all for Admin
  const filtered = myProspects.filter(p => {
    const matchSearch =
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.entreprise.toLowerCase().includes(search.toLowerCase()) ||
      p.telephone.includes(search);
    const matchStep = filterStep === 'all' || p.statut_pipeline === filterStep;
    const matchSource = filterSource === 'all' || p.source === filterSource;
    return matchSearch && matchStep && matchSource;
  });

  // Bulk Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmReassign = () => {
    const targetComm = mockCommerciaux.find(c => c.id === targetCommercialId) || mockCommerciaux[0];
    const commNom = `${targetComm.prenom} ${targetComm.nom}`;

    reassignProspects(selectedIds, targetComm.id, commNom);
    showToast(`${selectedIds.length} prospects réattribués avec succès à ${commNom} !`);
    setSelectedIds([]);
    setIsReassignModalOpen(false);
  };

  const isAdminRole = user?.role === 'admin_org' || user?.role === 'super_admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Liste des Prospects ({filtered.length})
            </h1>
            {user?.role === 'commercial' ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Portefeuille Personnel
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Vue globale Admin
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gérez, recherchez et réattribuez les opportunités de l'entreprise
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* CDC 3.1 Bulk Reassign Action Button (Visible for Admin Org & Super Admin when at least 1 item is selected) */}
          {isAdminRole && selectedIds.length > 0 && (
            <button
              onClick={() => setIsReassignModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 text-white px-4 py-2.5 text-xs font-bold shadow-lg shadow-amber-500/25 hover:bg-amber-600 transition-all animate-pulse"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>Réattribuer la sélection ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Prospect</span>
          </button>
        </div>
      </div>

      {/* Success Toast Banner */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2 shadow-md">
          <Check className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Controls Bar: Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, entreprise ou téléphone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterStep}
            onChange={(e) => setFilterStep(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-input bg-card text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="all">Toutes les étapes</option>
            <option value="nouveau">Nouveau Prospect</option>
            <option value="a_contacter">À contacter</option>
            <option value="demo_rdv">Démo / RDV</option>
            <option value="devis_envoye">Devis Envoyé</option>
            <option value="gagne">Gagné (Client)</option>
            <option value="perdu">Perdu</option>
          </select>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-input bg-card text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="all">Toutes les sources</option>
            <option value="site_web">Site Web</option>
            <option value="prospection_directe">Prospection Directe</option>
            <option value="recommandation">Recommandation</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer"
                />
              </th>
              <th className="p-4">Prospect / Entreprise</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4">Étape Pipeline</th>
              <th className="p-4">Source</th>
              <th className="p-4">Commercial Attribué</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <tr key={p.id} className={`hover:bg-muted/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(p.id)}
                      className="w-4 h-4 rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="p-4 font-bold text-foreground">
                    <div>{p.prenom} {p.nom}</div>
                    <div className="text-[11px] font-normal text-muted-foreground">{p.entreprise}</div>
                  </td>
                  <td className="p-4 font-medium text-foreground">{p.telephone}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                      p.statut_pipeline === 'gagne' ? 'bg-emerald-500/10 text-emerald-500' :
                      p.statut_pipeline === 'perdu' ? 'bg-rose-500/10 text-rose-500' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {p.statut_pipeline.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 capitalize text-muted-foreground">{p.source.replace('_', ' ')}</td>
                  <td className="p-4 font-semibold text-primary">{p.commercial_nom || 'Non attribué'}</td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/app/prospects/${p.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Fiche</span>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map((p) => {
          const isSelected = selectedIds.includes(p.id);
          return (
            <div key={p.id} className={`p-4 rounded-2xl border bg-card space-y-3 ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(p.id)}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{p.prenom} {p.nom}</h3>
                    <p className="text-xs text-muted-foreground">{p.entreprise}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  p.statut_pipeline === 'gagne' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                }`}>
                  {p.statut_pipeline.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pl-7">
                <span>Tel: {p.telephone}</span>
                <span className="font-bold text-primary">{p.commercial_nom}</span>
              </div>

              <div className="pt-2 border-t border-border flex justify-end pl-7">
                <Link
                  to={`/app/prospects/${p.id}`}
                  className="w-full py-2 rounded-xl bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <span>Ouvrir Fiche Prospect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* CDC 3.1 Bulk Reattribution Modal */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2.5 rounded-2xl bg-amber-500/10">
                <ArrowRightLeft className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Réattribution en Masse</h3>
                <p className="text-xs text-muted-foreground">Admin Organisation</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Vous allez réattribuer <strong>{selectedIds.length} prospect(s)</strong> sélectionné(s) au commercial de votre choix :
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground">Sélectionnez le nouveau commercial :</label>
              <select
                value={targetCommercialId}
                onChange={(e) => setTargetCommercialId(e.target.value)}
                className="w-full p-3 rounded-xl border border-input bg-background font-bold text-xs text-foreground focus:ring-2 focus:ring-primary/50"
              >
                {mockCommerciaux.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.prenom} {c.nom} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsReassignModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl border border-input text-xs font-bold hover:bg-muted text-foreground transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmReassign}
                className="w-1/2 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all"
              >
                Confirmer la réattribution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Creation Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Nouveau Prospect</h2>
              <button onClick={() => setIsNewModalOpen(false)} className="rounded-lg p-1 hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            {duplicateAlert && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Attention : Ce numéro existe déjà dans l'entreprise !</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Prénom</label>
                  <input
                    type="text"
                    value={newPrenom}
                    onChange={(e) => setNewPrenom(e.target.value)}
                    placeholder="Moussa"
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={newNom}
                    onChange={(e) => setNewNom(e.target.value)}
                    placeholder="Diop"
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Entreprise *</label>
                <input
                  type="text"
                  required
                  value={newEntreprise}
                  onChange={(e) => setNewEntreprise(e.target.value)}
                  placeholder="Dakar Tech Ltd"
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Téléphone Principal *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+221 77 000 00 00"
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Source du Prospect</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium"
                >
                  <option value="prospection_directe">Prospection Directe</option>
                  <option value="site_web">Site Web</option>
                  <option value="recommandation">Recommandation</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 rounded-xl bg-gradient-faciloop text-white font-bold shadow-md hover:opacity-95 transition-all"
              >
                Créer le prospect
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
