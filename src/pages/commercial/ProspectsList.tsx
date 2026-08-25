import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProspectSource } from '../../types/crm';
import { mockCommerciaux } from '../../lib/mockData';
import { formatPhoneNumber } from '../../lib/phoneUtils';
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
  ArrowRightLeft,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const PAYS = ['Sénégal', "Côte d'Ivoire", 'Mali', 'Burkina Faso', 'Guinée', 'Cameroun', 'Bénin', 'Togo', 'Niger', 'France', 'Autre'];
const SECTEURS = ['Commerce / Distribution', 'Télécommunications', 'Services', 'Industrie', 'Immobilier', 'Logistique / Transport', 'Agroalimentaire', 'BTP / Construction', 'Technologie / IT', 'Textile / Confection', 'Éducation / Formation', 'Santé', 'Autre'];

export const ProspectsList: React.FC = () => {
  const { user, myProspects, prospects, addProspect, reassignProspects, orgOffers } = useAuth();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState<string>('');
  const [filterStep, setFilterStep] = useState<string>(searchParams.get('statut') || 'all');
  const [filterSource, setFilterSource] = useState<string>('all');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals State
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState<boolean>(false);
  const [targetCommercialId, setTargetCommercialId] = useState<string>(mockCommerciaux[0].id);

  const activeOrgOffers = orgOffers.filter((o: any) => o.actif !== false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Prospect Form State (matches admin org full form)
  const [newNom, setNewNom] = useState<string>('');
  const [newPrenom, setNewPrenom] = useState<string>('');
  const [newEntreprise, setNewEntreprise] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newWhatsapp, setNewWhatsapp] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPays, setNewPays] = useState<string>('Sénégal');
  const [newVille, setNewVille] = useState<string>('');
  const [newAdresse, setNewAdresse] = useState<string>('');
  const [newSecteur, setNewSecteur] = useState<string>('');
  const [newSource, setNewSource] = useState<ProspectSource>('prospection_directe');
  const [newFormule, setNewFormule] = useState<string>('');
  const [newBudget, setNewBudget] = useState<string>('');
  const [newCommentaire, setNewCommentaire] = useState<string>('');
  const [newRelance, setNewRelance] = useState<string>('');

  const [duplicateAlert, setDuplicateAlert] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Phone input duplicate checker (checks across whole org using formatPhoneNumber)
  const handlePhoneChange = (val: string) => {
    setNewPhone(val);
    const formatted = formatPhoneNumber(val);
    if (formatted.length >= 8) {
      const exists = prospects.some(p => formatPhoneNumber(p.telephone) === formatted);
      setDuplicateAlert(exists);
    } else {
      setDuplicateAlert(false);
    }
  };

  const resetNewForm = () => {
    setNewNom(''); setNewPrenom(''); setNewEntreprise(''); setNewPhone('');
    setNewWhatsapp(''); setNewEmail(''); setNewPays('Sénégal'); setNewVille('');
    setNewAdresse(''); setNewSecteur(''); setNewSource('prospection_directe');
    setNewFormule(''); setNewBudget(''); setNewCommentaire(''); setNewRelance('');
    setDuplicateAlert(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newNom && !newEntreprise) || !newPhone || !newPays) return;

    const res = addProspect({
      nom: newNom || newEntreprise,
      prenom: newPrenom || undefined,
      entreprise: newEntreprise || newNom,
      telephone: newPhone,
      whatsapp: newWhatsapp || undefined,
      email: newEmail || undefined,
      pays: newPays,
      ville: newVille || undefined,
      adresse: newAdresse || undefined,
      secteur_activite: newSecteur || undefined,
      source: newSource,
      formule_envisagee: newFormule || undefined,
      budget_estime: newBudget ? Number(newBudget) : undefined,
      commentaire: newCommentaire || undefined,
      date_prochaine_relance: newRelance || undefined,
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
      resetNewForm();
    }
  };

  // ─── Import/Export CSV ─────────────────────────────────
  const handleExportCSV = () => {
    const csvHeaders = 'Nom;Prenom;Entreprise;Telephone;WhatsApp;Email;Pays;Ville;Source;Etape_Pipeline;Formule;Budget_Estime\n';
    const csvRows = myProspects
      .map(p => `"${p.nom}";"${p.prenom || ''}";"${p.entreprise}";"${p.telephone}";"${p.whatsapp || ''}";"${p.email || ''}";"${p.pays || ''}";"${p.ville || ''}";"${p.source}";"${p.statut_pipeline}";"${p.formule_envisagee || ''}";"${p.budget_estime || ''}"`)
      .join('\n');

    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mes_prospects_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const lines = content.split(/\r\n|\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) return;

      const delimiter = lines[0].includes(';') ? ';' : ',';
      const rawHeaders = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/"/g, ''));

      const nomIdx = rawHeaders.findIndex(h => h.includes('nom') || h.includes('contact'));
      const prenomIdx = rawHeaders.findIndex(h => h.includes('prenom') || h.includes('first'));
      const entrepriseIdx = rawHeaders.findIndex(h => h.includes('entreprise') || h.includes('societe'));
      const phoneIdx = rawHeaders.findIndex(h => h.includes('tel') || h.includes('phone') || h.includes('mobile'));
      const sourceIdx = rawHeaders.findIndex(h => h.includes('source') || h.includes('canal'));

      let imported = 0;
      let skipped = 0;

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(delimiter).map(p => p.trim().replace(/"/g, ''));
        const nom = nomIdx !== -1 ? parts[nomIdx] : parts[0] || 'Inconnu';
        const prenom = prenomIdx !== -1 ? parts[prenomIdx] : '';
        const entreprise = entrepriseIdx !== -1 ? parts[entrepriseIdx] : parts[1] || '';
        const telephone = phoneIdx !== -1 ? parts[phoneIdx] : parts[2] || '';
        const source = (sourceIdx !== -1 ? parts[sourceIdx] : 'prospection_directe') as ProspectSource;

        if (!telephone) { skipped++; continue; }

        const res = addProspect({
          nom: nom || entreprise,
          prenom: prenom || undefined,
          entreprise: entreprise || nom,
          telephone,
          source: source || 'prospection_directe',
          statut_pipeline: 'nouveau',
          commercial_id: user?.id,
          commercial_nom: user ? `${user.prenom} ${user.nom}` : undefined
        });

        if (res.success) imported++;
        else skipped++;
      }

      showToast(`Import terminé : ${imported} prospects créés, ${skipped} ignorés (doublons/invalides)`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
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
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header (Stacked buttons on Mobile, Row on Desktop) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
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
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gérez, recherchez et réattribuez les opportunités de l'entreprise
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* CDC 3.1 Bulk Reassign Action Button */}
          {isAdminRole && selectedIds.length > 0 && (
            <button
              onClick={() => setIsReassignModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-white px-4 py-2.5 text-xs font-extrabold shadow-lg shadow-amber-500/25 hover:bg-amber-600 transition-all animate-pulse"
            >
              <ArrowRightLeft className="h-4 w-4 shrink-0" />
              <span>Réattribuer la sélection ({selectedIds.length})</span>
            </button>
          )}

          {/* Import / Export CSV */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-input bg-card px-3 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all"
              title="Exporter mes prospects en CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <label
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-input bg-card px-3 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
              title="Importer des prospects depuis un fichier CSV"
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Import</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Nouveau Prospect</span>
          </button>
        </div>
      </div>

      {/* Success Toast Banner */}
      {toastMessage && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2 shadow-md">
          <Check className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Controls Bar: Search & Filters (Full-width responsive inputs on Mobile) */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, entreprise ou téléphone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2">
          <select
            value={filterStep}
            onChange={(e) => setFilterStep(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-input bg-card text-xs font-semibold text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
          >
            <option value="all">Toutes les étapes</option>
            <option value="nouveau">Nouveau</option>
            <option value="a_contacter">À contacter</option>
            <option value="contacte">Contacté</option>
            <option value="interesse">Intéressé</option>
            <option value="rdv_programme">RDV programmé</option>
            <option value="demo_realisee">Démo réalisée</option>
            <option value="essai_en_cours">Essai en cours</option>
            <option value="proposition">Proposition</option>
            <option value="paiement_att">Paiement att.</option>
            <option value="gagne">Client gagné</option>
            <option value="a_relancer">À relancer</option>
            <option value="perdu">Perdu</option>
          </select>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-input bg-card text-xs font-semibold text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
          >
            <option value="all">Toutes les sources</option>
            <option value="site_web">Site Web</option>
            <option value="prospection_directe">Prospection Directe</option>
            <option value="recommandation">Recommandation</option>
            <option value="reseaux_sociaux">Réseaux Sociaux</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="evenement">Événement</option>
            <option value="autre">Autre</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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

      {/* Mobile Stacked Cards View (p-3.5 paddings, w-5 h-5 checkboxes for easy thumb target) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map((p) => {
          const isSelected = selectedIds.includes(p.id);
          return (
            <div key={p.id} className={`p-3.5 rounded-2xl border bg-card space-y-2.5 shadow-sm ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(p.id)}
                    className="w-5 h-5 rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground">{p.prenom} {p.nom}</h3>
                    <p className="text-xs font-medium text-muted-foreground">{p.entreprise}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                  p.statut_pipeline === 'gagne' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                }`}>
                  {p.statut_pipeline.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pl-8">
                <span className="font-medium text-foreground">{p.telephone}</span>
                <span className="font-extrabold text-primary text-[11px]">{p.commercial_nom}</span>
              </div>

              <div className="pt-2 border-t border-border/60 flex justify-end pl-8">
                <Link
                  to={`/app/prospects/${p.id}`}
                  className="w-full py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>Ouvrir Fiche Prospect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* CDC 3.1 Bulk Reattribution Modal (Stacked buttons on Mobile) */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2.5 rounded-2xl bg-amber-500/10">
                <ArrowRightLeft className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-foreground">Réattribution en Masse</h3>
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
                className="w-full p-3 rounded-xl border border-input bg-background font-bold text-xs text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                {mockCommerciaux.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.prenom} {c.nom} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => setIsReassignModalOpen(false)}
                className="w-full sm:w-1/2 py-2.5 rounded-xl border border-input text-xs font-bold hover:bg-muted text-foreground transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmReassign}
                className="w-full sm:w-1/2 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all"
              >
                Confirmer la réattribution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Creation Modal (same structure as admin org) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Nouveau Prospect</h2>
              <button onClick={() => { setIsNewModalOpen(false); resetNewForm(); }} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {duplicateAlert && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Attention : Ce numéro existe déjà dans l'organisation !</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {/* Section: Identité */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Identité</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Nom *</label>
                    <input type="text" value={newNom} onChange={(e) => setNewNom(e.target.value)}
                      placeholder="Diop" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Prénom</label>
                    <input type="text" value={newPrenom} onChange={(e) => setNewPrenom(e.target.value)}
                      placeholder="Moussa" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Entreprise *</label>
                  <input type="text" value={newEntreprise} onChange={(e) => setNewEntreprise(e.target.value)}
                    placeholder="Dakar Tech Ltd" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              {/* Section: Contact */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Téléphone *</label>
                    <input type="tel" value={newPhone} onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+221 77 123 45 67" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">WhatsApp</label>
                    <input type="tel" value={newWhatsapp} onChange={(e) => setNewWhatsapp(e.target.value)}
                      placeholder="+221 77 123 45 67" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">Email</label>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="contact@entreprise.sn" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
              </div>

              {/* Section: Localisation */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Localisation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Pays *</label>
                    <select value={newPays} onChange={(e) => setNewPays(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      {PAYS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Ville</label>
                    <input type="text" value={newVille} onChange={(e) => setNewVille(e.target.value)}
                      placeholder="Dakar" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Adresse</label>
                    <input type="text" value={newAdresse} onChange={(e) => setNewAdresse(e.target.value)}
                      placeholder="Quartier, rue..." className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
              </div>

              {/* Section: Qualification */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Qualification</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Secteur d'activité</label>
                    <select value={newSecteur} onChange={(e) => setNewSecteur(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      <option value="">— Sélectionner —</option>
                      {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Source</label>
                    <select value={newSource} onChange={(e) => setNewSource(e.target.value as ProspectSource)}
                      className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      <option value="prospection_directe">Prospection directe</option>
                      <option value="site_web">Site web</option>
                      <option value="recommandation">Recommandation</option>
                      <option value="reseaux_sociaux">Réseaux sociaux</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="evenement">Événement</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Formule envisagée</label>
                    <select value={newFormule} onChange={(e) => setNewFormule(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      <option value="">— Aucune —</option>
                      {activeOrgOffers.map(o => <option key={o.id} value={o.nom}>{o.nom}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Budget estimé (FCFA)</label>
                    <input type="number" value={newBudget} onChange={(e) => setNewBudget(e.target.value)}
                      placeholder="500000" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
              </div>

              {/* Section: Notes & Relance */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notes & Relance</h3>
                <div>
                  <label className="block font-semibold mb-1">Commentaire</label>
                  <textarea value={newCommentaire} onChange={(e) => setNewCommentaire(e.target.value)}
                    rows={2} placeholder="Notes internes..."
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Date prochaine relance</label>
                  <input type="date" value={newRelance} onChange={(e) => setNewRelance(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <button type="submit"
                disabled={(!newNom && !newEntreprise) || !newPhone || !newPays}
                className="w-full py-3 rounded-xl bg-gradient-faciloop text-white font-bold shadow-md hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Créer le prospect
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
