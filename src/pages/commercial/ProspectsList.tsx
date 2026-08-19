import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProspectSource } from '../../types/crm';
import { 
  Users, 
  Search, 
  Plus, 
  AlertTriangle, 
  X, 
  Check, 
  ArrowRight,
  Eye,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProspectsList: React.FC = () => {
  const { user, myProspects, prospects, addProspect } = useAuth();

  const [search, setSearch] = useState<string>('');
  const [filterStep, setFilterStep] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');

  // Modal State for New Prospect
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newNom, setNewNom] = useState<string>('');
  const [newPrenom, setNewPrenom] = useState<string>('');
  const [newEntreprise, setNewEntreprise] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newSource, setNewSource] = useState<ProspectSource>('prospection_directe');
  const [newFormule, setNewFormule] = useState<string>('SaaS Pro');

  const [duplicateAlert, setDuplicateAlert] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Phone input duplicate checker (checks across whole org for anti-duplicate compliance)
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
      setSuccessMessage('Prospect créé et attribué à votre portefeuille !');
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsModalOpen(false);
      setNewNom('');
      setNewPrenom('');
      setNewEntreprise('');
      setNewPhone('');
    }
  };

  // CDC 3.2: Filtered strictly on myProspects for Commercial role
  const filtered = myProspects.filter(p => {
    const matchSearch =
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.entreprise.toLowerCase().includes(search.toLowerCase()) ||
      p.telephone.includes(search);
    const matchStep = filterStep === 'all' || p.statut_pipeline === filterStep;
    const matchSource = filterSource === 'all' || p.source === filterSource;
    return matchSearch && matchStep && matchSource;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Mon Portefeuille Prospects ({filtered.length})
            </h1>
            {user?.role === 'commercial' && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Isolation Active
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Vue strictement restreinte à vos prospects attribués ({user?.prenom} {user?.nom})
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau Prospect</span>
        </button>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{successMessage}</span>
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
              <th className="p-4">Prospect / Entreprise</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4">Étape Pipeline</th>
              <th className="p-4">Source</th>
              <th className="p-4">Responsable</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
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
                <td className="p-4 font-semibold text-primary">{p.commercial_nom || 'Moi'}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map((p) => (
          <div key={p.id} className="p-4 rounded-2xl border border-border bg-card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">{p.prenom} {p.nom}</h3>
                <p className="text-xs text-muted-foreground">{p.entreprise}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                p.statut_pipeline === 'gagne' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
              }`}>
                {p.statut_pipeline.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Tel: {p.telephone}</span>
              <span className="capitalize">Source: {p.source}</span>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Link
                to={`/app/prospects/${p.id}`}
                className="w-full py-2 rounded-xl bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Ouvrir Fiche Prospect</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Nouveau Prospect (Mes Ventes)</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Phone Duplicate Alert */}
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
                Créer et attribuer à mon portefeuille
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
