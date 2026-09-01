import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus, CheckCircle2, X, Ban, Phone, MessageCircle, Mail, MapPin,
  Clock, AlertTriangle, CalendarCheck, CalendarClock, Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  appel:    <Phone className="w-3.5 h-3.5" />,
  whatsapp: <MessageCircle className="w-3.5 h-3.5" />,
  email:    <Mail className="w-3.5 h-3.5" />,
  visite:   <MapPin className="w-3.5 h-3.5" />,
  autre:    <CalendarClock className="w-3.5 h-3.5" />,
};

const CANAL_LABELS: Record<RelanceCanal, string> = {
  appel:    'Appel',
  whatsapp: 'WhatsApp',
  email:    'Email',
  visite:   'Visite',
  autre:    'Autre',
};

type Tab = 'toutes' | 'aujourd_hui' | 'en_retard' | 'a_venir' | 'realisees' | 'annulees';

const TAB_LABELS: Record<Tab, string> = {
  toutes:      'Toutes',
  aujourd_hui: "Aujourd'hui",
  en_retard:   'En retard',
  a_venir:     'À venir',
  realisees:   'Réalisées',
  annulees:    'Annulées',
};

// ─── component ────────────────────────────────────────────────────────────────

export const RelancesPage: React.FC = () => {
  const { i18n } = useTranslation();
  const {
    user, relances, prospects, myProspects,
    addRelance, completeRelance, cancelRelance, commerciaux,
  } = useAuth();

  const isAdmin = user?.role === 'admin_org';
  const isEn = i18n.language?.startsWith('en');

  // ── filters
  const [activeTab, setActiveTab]           = useState<Tab>('toutes');
  const [filterCommercial, setFilterCommercial] = useState('');
  const [filterCanal, setFilterCanal]       = useState('');

  // ── modal state
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [formProspectId, setFormProspectId] = useState('');
  const [formDate, setFormDate]             = useState(TODAY);
  const [formHeure, setFormHeure]           = useState('09:30');
  const [formCanal, setFormCanal]           = useState<RelanceCanal>('whatsapp');
  const [formCommentaire, setFormCommentaire] = useState('');
  const [formCommercialId, setFormCommercialId] = useState<string>(() => commerciaux[0]?.id || '');

  // prospect base route depends on role
  const prospectBase = isAdmin ? '/admin/prospects' : '/app/prospects';

  // ── base list: admin sees all, commercial sees own
  const baseRelances = useMemo(() => {
    if (isAdmin) return relances;
    return relances.filter(r => r.commercial_id === user?.id || r.commercial_id === user?.commercialId);
  }, [relances, isAdmin, user]);

  // ── KPIs (computed before tab/canal filter)
  const weekEnd = getWeekEnd();
  const kpiAujourdhui   = baseRelances.filter(r => r.date === TODAY && getEffectiveStatut(r) === 'prevue').length;
  const kpiEnRetard     = baseRelances.filter(r => getEffectiveStatut(r) === 'en_retard').length;
  const kpiRealiseesMois = baseRelances.filter(r => r.statut === 'realisee' && r.date >= MONTH_START).length;
  const kpiAVenir       = baseRelances.filter(r => r.date > TODAY && r.date <= weekEnd && getEffectiveStatut(r) === 'prevue').length;

  // ── filtered list
  const filtered = useMemo(() => {
    let list = baseRelances;

    // commercial filter (admin only)
    if (isAdmin && filterCommercial) {
      list = list.filter(r => r.commercial_id === filterCommercial);
    }

    // canal filter
    if (filterCanal) {
      list = list.filter(r => r.canal === filterCanal);
    }

    // tab filter
    switch (activeTab) {
      case 'aujourd_hui':
        list = list.filter(r => r.date === TODAY && getEffectiveStatut(r) === 'prevue');
        break;
      case 'en_retard':
        list = list.filter(r => getEffectiveStatut(r) === 'en_retard');
        break;
      case 'a_venir':
        list = list.filter(r => r.date > TODAY && getEffectiveStatut(r) === 'prevue');
        break;
      case 'realisees':
        list = list.filter(r => r.statut === 'realisee');
        break;
      case 'annulees':
        list = list.filter(r => r.statut === 'annulee');
        break;
      default:
        break;
    }

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [baseRelances, activeTab, filterCommercial, filterCanal, isAdmin]);

  // badge counts per tab
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
    addRelance({
      prospect_id: p.id,
      prospect_nom: `${p.prenom || ''} ${p.nom}`.trim(),
      prospect_entreprise: p.entreprise,
      date: formDate,
      heure: formHeure,
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
  };

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
          <AlertTriangle className="w-3 h-3" /> En retard
        </span>
      );
      case 'prevue': return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold">
          <Clock className="w-3 h-3" /> Prévue
        </span>
      );
      case 'realisee': return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
          <CheckCircle2 className="w-3 h-3" /> Réalisée
        </span>
      );
      case 'annulee': return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
          <Ban className="w-3 h-3" /> Annulée
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
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">Aujourd'hui</p>
          <p className="text-2xl font-black text-amber-600">{kpiAujourdhui}</p>
          <p className="text-[10px] text-muted-foreground">Relances prévues</p>
        </div>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-3.5 space-y-1">
          <p className="text-[11px] font-bold text-red-500 uppercase tracking-wide">En retard</p>
          <p className="text-2xl font-black text-red-500">{kpiEnRetard}</p>
          <p className="text-[10px] text-muted-foreground">Non réalisées</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">Ce mois</p>
          <p className="text-2xl font-black text-emerald-600">{kpiRealiseesMois}</p>
          <p className="text-[10px] text-muted-foreground">Réalisées</p>
        </div>
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-3.5 space-y-1">
          <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wide">Cette semaine</p>
          <p className="text-2xl font-black text-blue-500">{kpiAVenir}</p>
          <p className="text-[10px] text-muted-foreground">À venir (7j)</p>
        </div>
      </div>

      {/* ── Filters row */}
      <div className="flex flex-col gap-3">
        {/* 6 tabs */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-muted/80 p-1 border border-border/80 w-fit">
          {(Object.keys(TAB_LABELS) as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-faciloop text-white shadow-md'
                  : tab === 'en_retard' && tabCounts.en_retard > 0
                  ? 'text-red-500 hover:text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {TAB_LABELS[tab]}
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
              <option value="">Tous les commerciaux</option>
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
            <option value="">Tous les canaux</option>
            {(Object.keys(CANAL_LABELS) as RelanceCanal[]).map(c => (
              <option key={c} value={c}>{CANAL_LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-border text-muted-foreground text-sm">
            Aucune relance pour ce filtre.
          </div>
        ) : (
          filtered.map(relance => {
            const eff = getEffectiveStatut(relance);
            const isActionable = eff !== 'realisee' && eff !== 'annulee';
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
                    : 'border-border'
                }`}
              >
                <div className="space-y-1.5 text-xs min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-foreground truncate">{relance.prospect_nom}</span>
                    <span className="text-muted-foreground truncate">({relance.prospect_entreprise})</span>
                    {statutBadge(eff)}
                  </div>
                  <p className="text-muted-foreground">{relance.commentaire || relance.motif}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
                    <span className={`flex items-center gap-1 ${dateBadgeClass(relance.date)}`}>
                      <CalendarCheck className="w-3 h-3" />
                      {relance.date}{relance.heure ? ` à ${relance.heure}` : ''}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      {CANAL_ICONS[relance.canal]}
                      {CANAL_LABELS[relance.canal]}
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
                        onClick={() => completeRelance(relance.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-[11px] shadow hover:bg-emerald-600 flex items-center gap-1 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Effectuée</span>
                      </button>
                      <button
                        onClick={() => cancelRelance(relance.id)}
                        className="px-3 py-1.5 rounded-xl border border-input text-[11px] font-bold text-muted-foreground hover:text-red-500 hover:border-red-500/50 flex items-center gap-1 transition-all"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Annuler</span>
                      </button>
                    </>
                  )}
                  <Link
                    to={`${prospectBase}/${relance.prospect_id}`}
                    className="px-3 py-1.5 rounded-xl border border-input text-[11px] font-bold text-foreground hover:bg-muted flex items-center gap-1 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Voir</span>
                  </Link>
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
              <h2 className="text-base font-bold text-foreground">
                {isEn ? 'Schedule a Follow-up' : 'Programmer une relance'}
              </h2>
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
                      {p.prenom} {p.nom} — {p.entreprise}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    style={{ colorScheme: 'auto' }}
                    className="w-full p-2.5 rounded-xl border border-input bg-card text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Heure</label>
                  <input
                    type="time"
                    value={formHeure}
                    onChange={e => setFormHeure(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Canal *</label>
                <select
                  value={formCanal}
                  onChange={e => setFormCanal(e.target.value as RelanceCanal)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {(Object.keys(CANAL_LABELS) as RelanceCanal[]).map(c => (
                    <option key={c} value={c}>{CANAL_LABELS[c]}</option>
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
    </div>
  );
};
