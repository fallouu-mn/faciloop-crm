import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRelances } from '../../hooks/commercial';
import { toast } from 'sonner';
import {
  Plus, CheckCircle2, X, Ban, Phone, MessageCircle, Mail, MapPin,
  Clock, AlertTriangle, CalendarCheck, CalendarClock, Eye, Bell, Calendar, Pencil,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  fullName, orFallback, formatDateWithTime, toDateTimeLocal, splitDateTimeLocal,
} from '../../utils/formatters';
import type { Relance, RelanceStatut, RelanceCanal } from '../../types/crm';

// ─── helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0];

function getEffectiveStatut(r: Relance): RelanceStatut {
  if (r.statut === 'realisee' || r.statut === 'annulee') return r.statut;
  if (r.date < TODAY) return 'en_retard';
  return r.statut; // 'prevue'
}

function getWeekEnd(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

const MONTH_START = TODAY.slice(0, 7) + '-01';

const CANAL_ICONS: Record<RelanceCanal, React.ReactNode> = {
  appel:    <Phone className="w-3.5 h-3.5 text-primary" />,
  whatsapp: <MessageCircle className="w-3.5 h-3.5 text-primary" />,
  email:    <Mail className="w-3.5 h-3.5 text-primary" />,
  visite:   <MapPin className="w-3.5 h-3.5 text-primary" />,
  autre:    <CalendarClock className="w-3.5 h-3.5 text-primary" />,
};

type Tab = 'toutes' | 'aujourd_hui' | 'en_retard' | 'a_venir' | 'realisees' | 'annulees';

// ─── component ────────────────────────────────────────────────────────────────

export const RelancesPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const { user, prospects, myProspects, commerciaux, relances, addRelance, completeRelance, cancelRelance } = useAuth();
  const { updateRelance } = useRelances();
  const isAdmin = user?.role === 'admin_org' || user?.role === 'super_admin';

  const canalLabels: Record<RelanceCanal, string> = useMemo(() => ({
    appel:    isEn ? 'Call' : 'Appel',
    whatsapp: 'WhatsApp',
    email:    'Email',
    visite:   isEn ? 'Visit' : 'Visite',
    autre:    isEn ? 'Other' : 'Autre',
  }), [isEn]);

  const tabLabels: Record<Tab, string> = useMemo(() => ({
    toutes:      isEn ? 'All' : 'Toutes',
    aujourd_hui: isEn ? 'Today' : "Aujourd'hui",
    en_retard:   isEn ? 'Overdue' : 'En retard',
    a_venir:     isEn ? 'Upcoming' : 'À venir',
    realisees:   isEn ? 'Completed' : 'Réalisées',
    annulees:    isEn ? 'Cancelled' : 'Annulées',
  }), [isEn]);

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRelanceForView, setSelectedRelanceForView] = useState<Relance | null>(null);
  const [formProspectId, setFormProspectId] = useState('');
  const [formCommercialId, setFormCommercialId] = useState(commerciaux[0]?.id || '');
  // Retour client n°10 : créneau horaire unique (date + heure) en un seul champ.
  const [formDateTime, setFormDateTime] = useState(`${TODAY}T09:30`);
  const [formCanal, setFormCanal] = useState<RelanceCanal>('whatsapp');
  const [formCommentaire, setFormCommentaire] = useState('');

  // Secondary filters
  const [activeTab, setActiveTab] = useState<Tab>('toutes');
  const [filterCommercial, setFilterCommercial] = useState('');
  const [filterCanal, setFilterCanal] = useState('');

  // Edit relance state
  const [editRelanceId, setEditRelanceId] = useState<string | null>(null);
  // Retour client n°10 : créneau horaire unique (date + heure) en un seul champ.
  const [erDateTime, setErDateTime] = useState('');
  const [erCanal, setErCanal] = useState<RelanceCanal>('appel');
  const [erMotif, setErMotif] = useState('');
  const [erCommercialId, setErCommercialId] = useState('');
  const [erSaving, setErSaving] = useState(false);

  // CDC 3.2: Filter base dataset based on user role
  // Retour client n°11 : l'onglet Relances inclut aussi les prospects ayant une
  // relance programmée (RDV programmé, à relancer, date de prochaine relance
  // renseignée) même s'ils n'ont pas encore de ligne dans la table `relances`.
  const baseRelances = useMemo<Relance[]>(() => {
    const scopedRelances = isAdmin
      ? relances
      : relances.filter(r => r.commercial_id === user?.id || r.commercial_id === user?.commercialId);

    const scopedProspects = isAdmin ? prospects : myProspects;

    const synthetic: Relance[] = scopedProspects
      .filter(p => {
        if (p.statut_pipeline === 'gagne' || p.statut_pipeline === 'perdu') return false;
        return !!p.date_prochaine_relance
          || p.statut_pipeline === 'rdv_programme'
          || p.statut_pipeline === 'a_relancer';
      })
      .map(p => {
        const date = p.date_prochaine_relance || TODAY;
        return { p, date };
      })
      // Pas de doublon si une relance réelle existe déjà pour ce prospect à cette date
      .filter(({ p, date }) => !relances.some(r => r.prospect_id === p.id && r.date === date))
      .map(({ p, date }): Relance => ({
        id: `synthetic-${p.id}`,
        organization_id: p.organization_id,
        prospect_id: p.id,
        commercial_id: p.commercial_id,
        prospect_nom: fullName(p, orFallback(p.entreprise, p.telephone)),
        prospect_entreprise: p.entreprise || '',
        date,
        canal: 'autre',
        motif: p.statut_pipeline === 'rdv_programme'
          ? (isEn ? 'Meeting scheduled' : 'RDV programmé')
          : p.statut_pipeline === 'a_relancer'
            ? (isEn ? 'To follow up' : 'À relancer')
            : (isEn ? 'Next follow-up' : 'Prochaine relance'),
        commentaire: isEn
          ? 'Scheduled from the prospect file (read-only)'
          : 'Programmé depuis la fiche prospect (lecture seule)',
        statut: 'prevue',
        created_at: p.created_at,
        _synthetic: true,
      }));

    return [...scopedRelances, ...synthetic];
  }, [relances, isAdmin, user, prospects, myProspects, isEn]);

  // ── KPI calculations
  const kpiAujourdhui = useMemo(() => baseRelances.filter(r => r.date === TODAY && (r.statut === 'prevue' || r.statut === 'en_retard')).length, [baseRelances]);
  const kpiEnRetard = useMemo(() => baseRelances.filter(r => getEffectiveStatut(r) === 'en_retard').length, [baseRelances]);
  const kpiRealiseesMois = useMemo(() => baseRelances.filter(r => r.statut === 'realisee' && r.date >= MONTH_START).length, [baseRelances]);
  const kpiAVenir = useMemo(() => baseRelances.filter(r => r.date > TODAY && r.date <= getWeekEnd() && (r.statut === 'prevue' || r.statut === 'en_retard')).length, [baseRelances]);

  // ── filter logic
  const filtered = useMemo(() => {
    return baseRelances.filter(r => {
      const eff = getEffectiveStatut(r);
      if (activeTab === 'aujourd_hui' && r.date !== TODAY) return false;
      if (activeTab === 'en_retard' && eff !== 'en_retard') return false;
      if (activeTab === 'a_venir' && r.date <= TODAY) return false;
      if (activeTab === 'realisees' && r.statut !== 'realisee') return false;
      if (activeTab === 'annulees' && r.statut !== 'annulee') return false;

      if (filterCommercial && r.commercial_id !== filterCommercial) return false;
      // Les relances issues de la fiche prospect n'ont pas de canal réel :
      // elles ne sont donc jamais rattachées à un filtre de canal.
      if (filterCanal && (r._synthetic || r.canal !== filterCanal)) return false;

      return true;
    });
  }, [baseRelances, activeTab, filterCommercial, filterCanal]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    toutes:      baseRelances.length,
    aujourd_hui: kpiAujourdhui,
    en_retard:   kpiEnRetard,
    a_venir:     kpiAVenir,
    realisees:   baseRelances.filter(r => r.statut === 'realisee').length,
    annulees:    baseRelances.filter(r => r.statut === 'annulee').length,
  }), [baseRelances, kpiAujourdhui, kpiEnRetard, kpiAVenir]);

  // ── modal prospect list
  const modalProspects = isAdmin ? prospects : myProspects;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const p = modalProspects.find(x => x.id === formProspectId);
    if (!p) return;
    // Retour client n°10 : on découpe le créneau horaire unique en date + heure.
    const { date, heure } = splitDateTimeLocal(formDateTime);
    if (!date) return;
    addRelance({
      prospect_id: p.id,
      prospect_nom: fullName(p, ''),
      prospect_entreprise: p.entreprise || '',
      date,
      heure,
      canal: formCanal,
      motif: formCommentaire,
      commentaire: formCommentaire,
      statut: 'prevue',
      commercial_id: isAdmin ? formCommercialId : user?.commercialId,
    } as any);
    setIsModalOpen(false);
    setFormProspectId('');
    setFormCommentaire('');
    setFormCommercialId(commerciaux[0]?.id || '');
    toast.success(isEn ? 'Follow-up scheduled!' : 'Relance programmée !');
  };

  function openEditRelance(rel: Relance) {
    setEditRelanceId(rel.id);
    // Retour client n°10 : le créneau horaire unique reprend date + heure.
    setErDateTime(toDateTimeLocal(rel.date, rel.heure));
    setErCanal(rel.canal);
    setErMotif(rel.motif || rel.commentaire || '');
    setErCommercialId(rel.commercial_id || '');
  }

  async function handleSaveEditRelance(e: React.FormEvent) {
    e.preventDefault();
    if (!editRelanceId) return;
    const { date, heure } = splitDateTimeLocal(erDateTime);
    if (!date) return;
    setErSaving(true);
    try {
      await updateRelance(editRelanceId, {
        date,
        heure,
        canal: erCanal,
        motif: erMotif,
        commentaire: erMotif,
        ...(isAdmin && erCommercialId ? { commercial_id: erCommercialId } : {}),
      });
      toast.success(isEn ? 'Follow-up updated!' : 'Relance mise à jour !');
      setEditRelanceId(null);
    } finally {
      setErSaving(false);
    }
  }

  // ── date color
  function dateBadgeClass(date: string): string {
    if (date < TODAY) return 'text-red-500';
    if (date === TODAY) return 'text-amber-500';
    return 'text-muted-foreground';
  }

  // ── statut badge
  function statutBadge(eff: RelanceStatut) {
    switch (eff) {
      case 'en_retard': return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">
          <AlertTriangle className="w-3 h-3" /> {isEn ? 'Overdue' : 'En retard'}
        </span>
      );
      case 'prevue': return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold">
          <Clock className="w-3 h-3" /> {isEn ? 'Scheduled' : 'Prévue'}
        </span>
      );
      case 'realisee': return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
          <CheckCircle2 className="w-3 h-3" /> {isEn ? 'Completed' : 'Réalisée'}
        </span>
      );
      case 'annulee': return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
          <Ban className="w-3 h-3" /> {isEn ? 'Cancelled' : 'Annulée'}
        </span>
      );
    }
  }

  return (
    <div className="space-y-5 font-sans">

      {/* ── Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {isEn ? 'Follow-ups' : 'Relances'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            {isEn ? 'Track and manage prospect follow-ups' : 'Suivez et gérez vos relances prospects'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{isEn ? '+ Schedule Follow-up' : 'Programmer une relance'}</span>
        </button>
      </div>

      {/* ── KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">{isEn ? 'TODAY' : "AUJOURD'HUI"}</p>
          <p className="text-2xl font-black text-amber-600">{kpiAujourdhui}</p>
          <p className="text-[10px] text-muted-foreground">{isEn ? 'Scheduled follow-ups' : 'Relances prévues'}</p>
        </div>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-3.5 space-y-1">
          <p className="text-[11px] font-bold text-red-500 uppercase tracking-wide">{isEn ? 'OVERDUE' : 'EN RETARD'}</p>
          <p className="text-2xl font-black text-red-500">{kpiEnRetard}</p>
          <p className="text-[10px] text-muted-foreground">{isEn ? 'Pending / Missed' : 'Non réalisées'}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">{isEn ? 'THIS MONTH' : 'CE MOIS'}</p>
          <p className="text-2xl font-black text-emerald-600">{kpiRealiseesMois}</p>
          <p className="text-[10px] text-muted-foreground">{isEn ? 'Completed' : 'Réalisées'}</p>
        </div>
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-3.5 space-y-1">
          <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wide">{isEn ? 'THIS WEEK' : 'CETTE SEMAINE'}</p>
          <p className="text-2xl font-black text-blue-500">{kpiAVenir}</p>
          <p className="text-[10px] text-muted-foreground">{isEn ? 'Upcoming (7d)' : 'À venir (7j)'}</p>
        </div>
      </div>

      {/* ── Filters row */}
      <div className="flex flex-col gap-3">
        {/* 6 tabs */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-muted/80 p-1 border border-border/80 w-fit">
          {(Object.keys(tabLabels) as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-faciloop text-white shadow-md'
                  : tab === 'en_retard' && tabCounts[tab] > 0
                  ? 'text-red-500 hover:text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tabLabels[tab]}
              {tabCounts[tab] > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                  activeTab === tab
                    ? 'bg-white/25 text-white'
                    : tab === 'en_retard'
                    ? 'bg-red-500/15 text-red-500'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* secondary filters */}
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <select
              value={filterCommercial}
              onChange={e => setFilterCommercial(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-input bg-card text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/40"
            >
              <option value="">{isEn ? 'All sales reps' : 'Tous les commerciaux'}</option>
              {commerciaux.filter(c => c.statut === 'actif').map(c => (
                <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
              ))}
            </select>
          )}
          <select
            value={filterCanal}
            onChange={e => setFilterCanal(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-input bg-card text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/40"
          >
            <option value="">{isEn ? 'All channels' : 'Tous les canaux'}</option>
            {(Object.keys(canalLabels) as RelanceCanal[]).map(c => (
              <option key={c} value={c}>{canalLabels[c]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-border text-muted-foreground text-sm">
            {isEn ? 'No follow-up for this filter.' : 'Aucune relance pour ce filtre.'}
          </div>
        ) : (
          filtered.map(relance => {
            const eff = getEffectiveStatut(relance);
            // Retour client n°11 : les relances issues de la fiche prospect sont en lecture seule.
            const isSynthetic = !!relance._synthetic;
            const isActionable = !isSynthetic && eff !== 'realisee' && eff !== 'annulee';
            const comm = isAdmin
              ? commerciaux.find(c => c.id === relance.commercial_id)
              : null;

            return (
              <div
                key={relance.id}
                className={`p-4 rounded-2xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  eff === 'en_retard'
                    ? 'border-red-500/40 bg-red-500/[0.03]'
                    : eff === 'realisee'
                    ? 'border-emerald-500/30 opacity-75'
                    : eff === 'annulee'
                    ? 'border-border opacity-60'
                    : isSynthetic
                    ? 'border-dashed border-primary/40'
                    : 'border-border'
                }`}
              >
                <div className="space-y-1.5 text-xs min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-foreground truncate">
                      {relance.prospect_nom || orFallback(relance.prospect_entreprise)}
                    </span>
                    {relance.prospect_entreprise && (
                      <span className="text-muted-foreground truncate">({relance.prospect_entreprise})</span>
                    )}
                    {statutBadge(eff)}
                    {isSynthetic && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold"
                        title={isEn ? 'Scheduled from the prospect file' : 'Programmé depuis la fiche prospect'}
                      >
                        <CalendarClock className="w-3 h-3" />
                        {isEn ? 'From prospect file' : 'Fiche prospect'}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{relance.commentaire || relance.motif}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
                    <span className={`flex items-center gap-1 ${dateBadgeClass(relance.date)}`}>
                      <CalendarCheck className="w-3 h-3" />
                      {formatDateWithTime(relance.date, relance.heure, isEn ? 'en' : 'fr')}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      {!isSynthetic && (
                        <>
                          {CANAL_ICONS[relance.canal]}
                          {canalLabels[relance.canal]}
                        </>
                      )}
                    </span>
                    {comm && (
                      <span className="text-muted-foreground">
                        {comm.prenom} {comm.nom}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isActionable && (
                    <>
                      <button
                        onClick={() => openEditRelance(relance)}
                        className="p-1.5 rounded-xl border border-input text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                        title={isEn ? 'Edit' : 'Modifier'}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { completeRelance(relance.id); toast.success(isEn ? 'Follow-up completed!' : 'Relance marquée effectuée !'); }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-[11px] shadow hover:bg-emerald-600 flex items-center gap-1 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Complete' : 'Effectuée'}</span>
                      </button>
                      <button
                        onClick={() => { cancelRelance(relance.id); toast.success(isEn ? 'Follow-up cancelled.' : 'Relance annulée.'); }}
                        className="px-3 py-1.5 rounded-xl border border-input text-[11px] font-bold text-muted-foreground hover:text-red-500 hover:border-red-500/50 flex items-center gap-1 transition-all"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Cancel' : 'Annuler'}</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedRelanceForView(relance)}
                    className="px-3 py-1.5 rounded-xl border border-input text-[11px] font-bold text-foreground hover:bg-muted flex items-center gap-1 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span>{isEn ? 'View' : 'Voir'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-foreground">
                  {isEn ? 'Schedule a Follow-up' : 'Programmer une relance'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              {isAdmin && (
                <div>
                  <label className="block font-semibold mb-1">Commercial *</label>
                  <select
                    required
                    value={formCommercialId}
                    onChange={e => setFormCommercialId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Sélectionner un commercial</option>
                    {commerciaux.map(c => (
                      <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block font-semibold mb-1">
                  {isEn ? 'Prospect' : 'Prospect à relancer'} *
                </label>
                <select
                  required
                  value={formProspectId}
                  onChange={e => setFormProspectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">Sélectionner un prospect</option>
                  {modalProspects.map(p => (
                    <option key={p.id} value={p.id}>
                      {fullName(p)}{p.entreprise ? ` — ${p.entreprise}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {isEn ? 'Date & Time *' : 'Date & Heure *'}
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formDateTime}
                  onChange={e => setFormDateTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Canal *</label>
                <select
                  value={formCanal}
                  onChange={e => setFormCanal(e.target.value as RelanceCanal)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {(Object.keys(canalLabels) as RelanceCanal[]).map(c => (
                    <option key={c} value={c}>{canalLabels[c]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Motif / Commentaire *</label>
                <input
                  type="text"
                  required
                  value={formCommentaire}
                  onChange={e => setFormCommentaire(e.target.value)}
                  placeholder="Ex : Confirmer le RDV de la semaine prochaine"
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!formProspectId || !formCommentaire || (isAdmin && !formCommercialId)}
                className="w-full py-3 rounded-xl bg-gradient-faciloop text-white font-bold shadow-md hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isEn ? 'Confirm Follow-up' : 'Valider la relance'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Édition Relance */}
      {editRelanceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Pencil className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-foreground">
                  {isEn ? 'Edit Follow-up' : 'Modifier la relance'}
                </h2>
              </div>
              <button onClick={() => setEditRelanceId(null)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRelance} className="space-y-3 text-xs">
              {isAdmin && (
                <div>
                  <label className="block font-semibold mb-1">Commercial *</label>
                  <select
                    required
                    value={erCommercialId}
                    onChange={e => setErCommercialId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">{isEn ? 'Select a sales rep' : 'Sélectionner un commercial'}</option>
                    {commerciaux.map(c => (
                      <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block font-semibold mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {isEn ? 'Date & Time *' : 'Date & Heure *'}
                </label>
                <input
                  type="datetime-local"
                  required
                  value={erDateTime}
                  onChange={e => setErDateTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Canal *</label>
                <select
                  value={erCanal}
                  onChange={e => setErCanal(e.target.value as RelanceCanal)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {(Object.keys(canalLabels) as RelanceCanal[]).map(c => (
                    <option key={c} value={c}>{canalLabels[c]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Motif / Commentaire *</label>
                <input
                  type="text"
                  required
                  value={erMotif}
                  onChange={e => setErMotif(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={erSaving || !erDateTime || !erMotif || (isAdmin && !erCommercialId)}
                className="w-full py-3 rounded-xl bg-gradient-faciloop text-white font-bold shadow-md hover:opacity-95 transition-all disabled:opacity-50"
              >
                {erSaving ? (isEn ? 'Saving...' : 'Enregistrement...') : (isEn ? 'Save Changes' : 'Enregistrer les modifications')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Détails Relance */}
      {selectedRelanceForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {isEn ? 'Follow-up Details' : 'Détails de la relance'}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedRelanceForView.prospect_nom || orFallback(selectedRelanceForView.prospect_entreprise)}
                    {selectedRelanceForView.prospect_entreprise ? ` — ${selectedRelanceForView.prospect_entreprise}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRelanceForView(null)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60">
                <span className="font-semibold text-muted-foreground">{isEn ? 'Status:' : 'Statut :'}</span>
                <div>{statutBadge(getEffectiveStatut(selectedRelanceForView))}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" />
                    {isEn ? 'Date & Time' : 'Date & Heure'}
                  </span>
                  <p className="font-bold text-foreground">
                    {formatDateWithTime(selectedRelanceForView.date, selectedRelanceForView.heure, isEn ? 'en' : 'fr')}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-primary" />
                    {isEn ? 'Channel' : 'Canal'}
                  </span>
                  <p className="font-bold text-foreground flex items-center gap-1">
                    {CANAL_ICONS[selectedRelanceForView.canal]}
                    {canalLabels[selectedRelanceForView.canal]}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground">{isEn ? 'Note / Motif:' : 'Motif / Commentaire :'}</span>
                <p className="font-medium text-foreground whitespace-pre-wrap">
                  {selectedRelanceForView.commentaire || selectedRelanceForView.motif || (isEn ? 'No note specified' : 'Aucun commentaire spécifié')}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground">{isEn ? 'Sales Rep:' : 'Commercial responsable :'}</span>
                <span className="font-bold text-foreground">
                  {commerciaux.find(c => c.id === selectedRelanceForView.commercial_id)
                    ? `${commerciaux.find(c => c.id === selectedRelanceForView.commercial_id)?.prenom} ${commerciaux.find(c => c.id === selectedRelanceForView.commercial_id)?.nom}`
                    : (isEn ? 'Commercial' : 'Commercial')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Link
                to={`/${isAdmin ? 'admin' : 'app'}/prospects/${selectedRelanceForView.prospect_id}`}
                className="flex-1 py-2.5 rounded-xl bg-gradient-faciloop text-white font-bold text-xs shadow-md text-center hover:opacity-95 transition-all"
              >
                {isEn ? 'Open Prospect File' : 'Ouvrir fiche prospect'}
              </Link>
              <button
                onClick={() => setSelectedRelanceForView(null)}
                className="px-4 py-2.5 rounded-xl border border-input text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
              >
                {isEn ? 'Close' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
