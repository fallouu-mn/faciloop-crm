import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProspectSource, PipelineStepId } from '../../types/crm';
import { formatPhoneNumber } from '../../lib/phoneUtils';
import { useTranslation } from 'react-i18next';
import {
  Users, Search, Plus, AlertTriangle, X,
  ArrowRight, Eye, UserCheck, ArrowRightLeft, Trash2, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

function normalize(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function relanceDateColor(date?: string): string {
  if (!date) return 'text-muted-foreground';
  const today = new Date().toISOString().split('T')[0];
  if (date < today) return 'text-red-500 font-bold';
  if (date === today) return 'text-amber-500 font-bold';
  return 'text-blue-500';
}

const SOURCES: { value: ProspectSource; label: string }[] = [
  { value: 'prospection_directe', label: 'Prospection directe' },
  { value: 'site_web', label: 'Site web' },
  { value: 'recommandation', label: 'Recommandation' },
  { value: 'reseaux_sociaux', label: 'Réseaux sociaux' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'evenement', label: 'Événement' },
  { value: 'autre', label: 'Autre' },
];

const ETAPES: { value: PipelineStepId; label: string }[] = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'a_contacter', label: 'À contacter' },
  { value: 'contacte', label: 'Contacté' },
  { value: 'interesse', label: 'Intéressé' },
  { value: 'rdv_programme', label: 'RDV programmé' },
  { value: 'demo_realisee', label: 'Démo réalisée' },
  { value: 'essai_en_cours', label: 'Essai en cours' },
  { value: 'proposition', label: 'Proposition' },
  { value: 'paiement_att', label: 'Paiement attendu' },
  { value: 'gagne', label: 'Gagné' },
  { value: 'a_relancer', label: 'À relancer' },
  { value: 'perdu', label: 'Perdu' },
];

const PAYS_DEFAUT = ['Sénégal', "Côte d'Ivoire", 'Mali', 'Burkina Faso', 'Guinée', 'Cameroun', 'Bénin', 'Togo', 'Niger', 'France', 'Autre'];
const SECTEURS = ['Commerce / Distribution', 'Télécommunications', 'Services', 'Industrie', 'Immobilier', 'Logistique / Transport', 'Agroalimentaire', 'BTP / Construction', 'Technologie / IT', 'Textile / Confection', 'Éducation / Formation', 'Santé', 'Autre'];

export const ProspectsListAdmin: React.FC = () => {
  const { t } = useTranslation('admin');
  const { prospects, addProspect, deleteProspect, reassignProspects, orgOffers, commerciaux } = useAuth();
  const activeOrgOffers = orgOffers.filter(o => o.actif);

  const [search, setSearch] = useState('');
  const [filterStep, setFilterStep] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterCommercial, setFilterCommercial] = useState('all');
  const [filterPays, setFilterPays] = useState('all');
  const [hideClosedProspects, setHideClosedProspects] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [targetCommercialId, setTargetCommercialId] = useState(commerciaux[0]?.id || '');

  // Form state
  const [fNom, setFNom] = useState('');
  const [fPrenom, setFPrenom] = useState('');
  const [fEntreprise, setFEntreprise] = useState('');
  const [fTelephone, setFTelephone] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fWhatsapp, setFWhatsapp] = useState('');
  const [fPays, setFPays] = useState('Sénégal');
  const [fVille, setFVille] = useState('');
  const [fAdresse, setFAdresse] = useState('');
  const [fSecteur, setFSecteur] = useState('');
  const [fSource, setFSource] = useState<ProspectSource>('prospection_directe');
  const [fCommercialId, setFCommercialId] = useState(commerciaux[0]?.id || '');
  const [fEtape, setFEtape] = useState<PipelineStepId>('nouveau');
  const [fFormule, setFFormule] = useState(activeOrgOffers[0]?.nom || '');
  const [fBudget, setFBudget] = useState('');
  const [fCommentaire, setFCommentaire] = useState('');
  const [fRelance, setFRelance] = useState('');

  const [duplicateAlert, setDuplicateAlert] = useState(false);

  // Dynamic pays options from real data
  const paysOptions = useMemo(() => {
    const fromData = [...new Set(prospects.map(p => p.pays).filter(Boolean))] as string[];
    const merged = [...new Set([...PAYS_DEFAUT, ...fromData])];
    return merged.sort();
  }, [prospects]);

  const handlePhoneChange = (val: string) => {
    setFTelephone(val);
    const formatted = formatPhoneNumber(val);
    if (formatted.length >= 8) {
      const exists = prospects.some(p => formatPhoneNumber(p.telephone) === formatted);
      setDuplicateAlert(exists);
    } else {
      setDuplicateAlert(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!fNom && !fEntreprise) || !fTelephone || !fPays) return;
    const commercial = commerciaux.find(c => c.id === fCommercialId);
    const res = await addProspect({
      nom: fNom || fEntreprise,
      prenom: fPrenom,
      entreprise: fEntreprise || fNom,
      telephone: fTelephone,
      email: fEmail || undefined,
      whatsapp: fWhatsapp || undefined,
      pays: fPays,
      ville: fVille || undefined,
      adresse: fAdresse || undefined,
      secteur_activite: fSecteur || undefined,
      source: fSource,
      formule_envisagee: fFormule,
      budget_estime: fBudget ? Number(fBudget) : undefined,
      commentaire: fCommentaire || undefined,
      date_prochaine_relance: fRelance || undefined,
      statut_pipeline: fEtape,
      commercial_id: fCommercialId,
      commercial_nom: commercial ? `${commercial.prenom} ${commercial.nom}` : undefined,
    });
    if (res.duplicate) { setDuplicateAlert(true); return; }
    if (res.success) {
      toast.success(t('adminOrg.prospects.toast.created'));
      setIsNewModalOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFNom(''); setFPrenom(''); setFEntreprise(''); setFTelephone('');
    setFEmail(''); setFWhatsapp(''); setFPays('Sénégal'); setFVille('');
    setFAdresse(''); setFSecteur(''); setFSource('prospection_directe');
    setFCommercialId(commerciaux[0]?.id || ''); setFEtape('nouveau');
    setFFormule(activeOrgOffers[0]?.nom || ''); setFBudget(''); setFCommentaire(''); setFRelance('');
    setDuplicateAlert(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('adminOrg.prospects.deleteConfirm'))) {
      deleteProspect(id);
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  // Use all org prospects (not myProspects which is scoped to current user)
  const filtered = useMemo(() => {
    const q = normalize(search);
    return prospects.filter(p => {
      if (hideClosedProspects && (p.statut_pipeline === 'gagne' || p.statut_pipeline === 'perdu')) return false;
      const matchSearch = !q ||
        normalize(p.nom).includes(q) ||
        normalize(p.entreprise).includes(q) ||
        p.telephone.includes(search);
      const matchStep = filterStep === 'all' || p.statut_pipeline === filterStep;
      const matchSource = filterSource === 'all' || p.source === filterSource;
      const matchComm = filterCommercial === 'all' || p.commercial_id === filterCommercial;
      const matchPays = filterPays === 'all' || p.pays === filterPays;
      return matchSearch && matchStep && matchSource && matchComm && matchPays;
    });
  }, [prospects, search, filterStep, filterSource, filterCommercial, filterPays, hideClosedProspects]);

  const hasActiveFilters = filterStep !== 'all' || filterSource !== 'all' || filterCommercial !== 'all' || filterPays !== 'all' || hideClosedProspects || search !== '';

  const resetFilters = () => {
    setSearch(''); setFilterStep('all'); setFilterSource('all');
    setFilterCommercial('all'); setFilterPays('all'); setHideClosedProspects(false);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? filtered.map(p => p.id) : []);
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleConfirmReassign = () => {
    const target = commerciaux.find(c => c.id === targetCommercialId) || commerciaux[0];
    if (!target) return;
    reassignProspects(selectedIds, target.id, `${target.prenom} ${target.nom}`);
    toast.success(`${selectedIds.length} ${t('adminOrg.prospects.toast.reassigned')}`);
    setSelectedIds([]);
    setIsReassignModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Prospects ({filtered.length}{filtered.length !== prospects.length ? `/${prospects.length}` : ''})
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> {t('adminOrg.prospects.adminView')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('adminOrg.prospects.subtitle')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsReassignModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-white px-4 py-2.5 text-xs font-bold shadow-lg animate-pulse"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>{t('adminOrg.prospects.reassignBtn')} ({selectedIds.length})</span>
            </button>
          )}
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            <span>{t('adminOrg.prospects.newBtn')}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('adminOrg.prospects.search')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2.5 rounded-xl border border-input bg-card text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1.5 shrink-0"
            >
              <X className="w-3.5 h-3.5" /> {t('adminOrg.prospects.resetFilters')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select value={filterStep} onChange={(e) => setFilterStep(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-input bg-card text-xs font-semibold text-foreground">
            <option value="all">{t('adminOrg.prospects.filterAll.stages')}</option>
            {ETAPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
          <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-input bg-card text-xs font-semibold text-foreground">
            <option value="all">{t('adminOrg.prospects.filterAll.sources')}</option>
            {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterCommercial} onChange={(e) => setFilterCommercial(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-input bg-card text-xs font-semibold text-foreground">
            <option value="all">{t('adminOrg.prospects.filterAll.commercials')}</option>
            {commerciaux.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
          </select>
          <select value={filterPays} onChange={(e) => setFilterPays(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-input bg-card text-xs font-semibold text-foreground">
            <option value="all">{t('adminOrg.prospects.filterAll.countries')}</option>
            {paysOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Active filter toggle */}
        <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-muted-foreground hover:text-foreground">
          <input
            type="checkbox"
            checked={hideClosedProspects}
            onChange={(e) => setHideClosedProspects(e.target.checked)}
            className="w-4 h-4 rounded accent-primary cursor-pointer"
          />
          <Filter className="w-3.5 h-3.5" />
          {t('adminOrg.prospects.hideClosedToggle')}
        </label>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4 w-10">
                <input type="checkbox" checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={handleSelectAll} className="w-4 h-4 rounded accent-primary cursor-pointer" />
              </th>
              <th className="p-4">{t('adminOrg.prospects.col.prospect')}</th>
              <th className="p-4">{t('adminOrg.prospects.col.phone')}</th>
              <th className="p-4">{t('adminOrg.prospects.col.stage')}</th>
              <th className="p-4">{t('adminOrg.prospects.col.source')}</th>
              <th className="p-4">{t('adminOrg.prospects.col.commercial')}</th>
              <th className="p-4">{t('adminOrg.prospects.col.followUp')}</th>
              <th className="p-4 text-right">{t('adminOrg.prospects.col.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground text-xs">
                  {t('adminOrg.prospects.empty')}
                </td>
              </tr>
            ) : filtered.map((p) => (
              <tr key={p.id} className={`hover:bg-muted/30 transition-colors ${selectedIds.includes(p.id) ? 'bg-primary/5' : ''}`}>
                <td className="p-4">
                  <input type="checkbox" checked={selectedIds.includes(p.id)}
                    onChange={() => handleSelectOne(p.id)} className="w-4 h-4 rounded accent-primary cursor-pointer" />
                </td>
                <td className="p-4">
                  <div className="font-bold text-foreground">{p.prenom} {p.nom}</div>
                  <div className="text-[11px] text-muted-foreground">{p.entreprise}</div>
                </td>
                <td className="p-4 font-medium text-foreground">{p.telephone}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                    p.statut_pipeline === 'gagne' ? 'bg-emerald-500/10 text-emerald-500' :
                    p.statut_pipeline === 'perdu' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {p.statut_pipeline.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-4 capitalize text-muted-foreground">{p.source.replace(/_/g, ' ')}</td>
                <td className="p-4 font-semibold text-primary">{p.commercial_nom || t('adminOrg.prospects.unassigned')}</td>
                <td className={`p-4 text-[11px] ${relanceDateColor(p.date_prochaine_relance)}`}>
                  {p.date_prochaine_relance || '—'}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link to={`/admin/prospects/${p.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-input px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted">
                      <Eye className="w-3.5 h-3.5" /> {t('adminOrg.prospects.openFile')}
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg border border-input hover:bg-red-500/10 hover:border-red-500/30 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">{t('adminOrg.prospects.emptyMobile')}</div>
        )}
        {filtered.map((p) => (
          <div key={p.id} className={`p-3.5 rounded-2xl border bg-card space-y-2.5 shadow-sm ${selectedIds.includes(p.id) ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={selectedIds.includes(p.id)}
                  onChange={() => handleSelectOne(p.id)} className="w-5 h-5 rounded accent-primary cursor-pointer shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-foreground">{p.prenom} {p.nom}</h3>
                  <p className="text-xs text-muted-foreground">{p.entreprise}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                p.statut_pipeline === 'gagne' ? 'bg-emerald-500/10 text-emerald-500' :
                p.statut_pipeline === 'perdu' ? 'bg-rose-500/10 text-rose-500' :
                'bg-primary/10 text-primary'
              }`}>
                {p.statut_pipeline.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pl-8">
              <span className="font-medium text-foreground">{p.telephone}</span>
              <span className="font-bold text-primary text-[11px]">{p.commercial_nom}</span>
            </div>
            {p.date_prochaine_relance && (
              <div className={`text-[11px] pl-8 ${relanceDateColor(p.date_prochaine_relance)}`}>
                {t('adminOrg.prospects.relanceLabel')} {p.date_prochaine_relance}
              </div>
            )}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 pl-8">
              <Link to={`/admin/prospects/${p.id}`}
                className="flex-1 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5">
                {t('adminOrg.prospects.openFile')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => handleDelete(p.id)}
                className="p-2 rounded-xl border border-input hover:bg-red-500/10 hover:border-red-500/30 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reassign Modal */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <ArrowRightLeft className="w-6 h-6" />
              <h3 className="font-bold text-base text-foreground">{t('adminOrg.prospects.reassignModal.title')} ({selectedIds.length})</h3>
            </div>
            <select value={targetCommercialId} onChange={(e) => setTargetCommercialId(e.target.value)}
              className="w-full p-3 rounded-xl border border-input bg-background font-bold text-xs text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
              {commerciaux.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setIsReassignModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-input text-xs font-bold hover:bg-muted">{t('adminOrg.prospects.reassignModal.cancel')}</button>
              <button onClick={handleConfirmReassign}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600">{t('adminOrg.prospects.reassignModal.confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">
                {t('adminOrg.prospects.modal.title')}
              </h2>
              <button onClick={() => { setIsNewModalOpen(false); resetForm(); }} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {duplicateAlert && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{t('adminOrg.prospects.modal.duplicate')}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {/* Identité */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t('adminOrg.prospects.modal.sectionId')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">{t('adminOrg.prospects.modal.lastName')}</label>
                    <input type="text" value={fNom} onChange={(e) => setFNom(e.target.value)}
                      placeholder="Diop" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('adminOrg.prospects.modal.firstName')} *</label>
                    <input type="text" required value={fPrenom} onChange={(e) => setFPrenom(e.target.value)}
                      placeholder="Moussa" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">{t('adminOrg.prospects.modal.company')}</label>
                  <input type="text" value={fEntreprise} onChange={(e) => setFEntreprise(e.target.value)}
                    placeholder="Dakar Tech Ltd" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t('adminOrg.prospects.modal.sectionContact')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">{t('adminOrg.prospects.modal.phone')}</label>
                    <input type="tel" value={fTelephone} onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+221 77 123 45 67" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">WhatsApp</label>
                    <input type="tel" value={fWhatsapp} onChange={(e) => setFWhatsapp(e.target.value)}
                      placeholder="+221 77 123 45 67" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">Email</label>
                    <input type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)}
                      placeholder="contact@entreprise.sn" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
              </div>

              {/* Localisation */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t('adminOrg.prospects.modal.sectionLocation')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">{t('adminOrg.prospects.modal.country')}</label>
                    <select value={fPays} onChange={(e) => setFPays(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      {paysOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('adminOrg.prospects.modal.city')}</label>
                    <input type="text" value={fVille} onChange={(e) => setFVille(e.target.value)}
                      placeholder="Dakar" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('adminOrg.prospects.modal.address')}</label>
                    <input type="text" value={fAdresse} onChange={(e) => setFAdresse(e.target.value)}
                      placeholder={t('adminOrg.prospects.modal.address')} className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
              </div>

              {/* Attribution & Pipeline */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t('adminOrg.prospects.modal.sectionPipeline')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">{t('adminOrg.prospects.modal.sector')}</label>
                    <select value={fSecteur} onChange={(e) => setFSecteur(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      <option value="">{t('adminOrg.prospects.modal.select')}</option>
                      {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Source</label>
                    <select value={fSource} onChange={(e) => setFSource(e.target.value as ProspectSource)}
                      className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('adminOrg.prospects.modal.assignedTo')}</label>
                    <select value={fCommercialId} onChange={(e) => setFCommercialId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      {commerciaux.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('adminOrg.prospects.modal.pipelineStage')}</label>
                    <select value={fEtape} onChange={(e) => setFEtape(e.target.value as PipelineStepId)}
                      className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      {ETAPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('adminOrg.prospects.modal.targetPlan')}</label>
                    <select value={fFormule} onChange={(e) => setFFormule(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      {activeOrgOffers.map(o => <option key={o.id} value={o.nom}>{o.nom}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('adminOrg.prospects.modal.budget')}</label>
                    <input type="number" value={fBudget} onChange={(e) => setFBudget(e.target.value)}
                      placeholder="500000" className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t('adminOrg.prospects.modal.sectionNotes')}
                </h3>
                <div>
                  <label className="block font-semibold mb-1">{t('adminOrg.prospects.modal.comment')}</label>
                  <textarea value={fCommentaire} onChange={(e) => setFCommentaire(e.target.value)}
                    rows={2} placeholder={t('adminOrg.prospects.modal.commentPlaceholder')}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">{t('adminOrg.prospects.modal.followUpDate')}</label>
                  <input type="date" value={fRelance} onChange={(e) => setFRelance(e.target.value)}
                    style={{ colorScheme: 'auto' }}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <button type="submit"
                className="w-full py-3 rounded-xl bg-gradient-faciloop text-white font-bold shadow-md hover:opacity-95 transition-all">
                {t('adminOrg.prospects.modal.createBtn')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
