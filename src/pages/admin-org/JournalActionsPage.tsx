import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ActionLogType } from '../../types/crm';
import {
  History,
  Clock,
  Activity,
  ArrowRight,
  UserPlus,
  UserCheck,
  FolderX,
  ArrowRightLeft,
  Target,
  CreditCard,
  Settings,
  Package,
  FileText,
  Filter,
  Search,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const ACTION_TYPE_CONFIG: Record<ActionLogType, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  prospect_created: { icon: UserPlus, color: 'bg-blue-500/10 text-blue-500', label: 'Création prospect' },
  prospect_updated: { icon: FileText, color: 'bg-sky-500/10 text-sky-500', label: 'Modification prospect' },
  prospect_pipeline_move: { icon: ArrowRightLeft, color: 'bg-purple-500/10 text-purple-500', label: 'Pipeline' },
  prospect_converted: { icon: UserCheck, color: 'bg-emerald-500/10 text-emerald-500', label: 'Conversion' },
  prospect_lost: { icon: FolderX, color: 'bg-rose-500/10 text-rose-500', label: 'Perte prospect' },
  client_created: { icon: UserCheck, color: 'bg-emerald-500/10 text-emerald-500', label: 'Création client' },
  client_updated: { icon: FileText, color: 'bg-teal-500/10 text-teal-500', label: 'Modification client' },
  offer_created: { icon: Package, color: 'bg-amber-500/10 text-amber-500', label: 'Création offre' },
  offer_updated: { icon: Package, color: 'bg-amber-500/10 text-amber-500', label: 'Modification offre' },
  offer_deleted: { icon: Package, color: 'bg-rose-500/10 text-rose-500', label: 'Suppression offre' },
  subscription_created: { icon: CreditCard, color: 'bg-indigo-500/10 text-indigo-500', label: 'Nouvel abonnement' },
  subscription_updated: { icon: CreditCard, color: 'bg-indigo-500/10 text-indigo-500', label: 'Modif. abonnement' },
  objectif_created: { icon: Target, color: 'bg-orange-500/10 text-orange-500', label: 'Objectif défini' },
  objectif_updated: { icon: Target, color: 'bg-orange-500/10 text-orange-500', label: 'Objectif modifié' },
  payment_received: { icon: CreditCard, color: 'bg-emerald-500/10 text-emerald-500', label: 'Paiement' },
  payment_updated: { icon: CreditCard, color: 'bg-amber-500/10 text-amber-500', label: 'Modif. paiement' },
  org_settings_updated: { icon: Settings, color: 'bg-slate-500/10 text-slate-500', label: 'Paramètres org.' },
  commercial_added: { icon: Users, color: 'bg-blue-500/10 text-blue-500', label: 'Ajout commercial' },
  commercial_removed: { icon: Users, color: 'bg-rose-500/10 text-rose-500', label: 'Retrait commercial' },
  prospect_reassigned: { icon: ArrowRightLeft, color: 'bg-amber-500/10 text-amber-500', label: 'Réattribution' },
  other: { icon: Activity, color: 'bg-muted text-muted-foreground', label: 'Autre' },
};

const FILTER_CATEGORIES = [
  { value: 'all', label: 'Toutes les actions' },
  { value: 'prospect', label: 'Prospects' },
  { value: 'client', label: 'Clients' },
  { value: 'offer', label: 'Offres' },
  { value: 'payment', label: 'Paiements' },
  { value: 'objectif', label: 'Objectifs' },
  { value: 'org', label: 'Organisation' },
];

export const JournalActionsPage: React.FC = () => {
  const { actionLogs } = useAuth();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const sorted = useMemo(() =>
    [...actionLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [actionLogs]
  );

  const filtered = useMemo(() => {
    return sorted.filter(log => {
      const matchSearch = !search ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.utilisateur_nom.toLowerCase().includes(search.toLowerCase()) ||
        (log.cible || '').toLowerCase().includes(search.toLowerCase());

      let matchCategory = true;
      if (filterCategory !== 'all') {
        if (filterCategory === 'prospect') {
          matchCategory = log.action_type.startsWith('prospect_');
        } else if (filterCategory === 'client') {
          matchCategory = log.action_type.startsWith('client_');
        } else if (filterCategory === 'offer') {
          matchCategory = log.action_type.startsWith('offer_') || log.action_type.startsWith('subscription_');
        } else if (filterCategory === 'payment') {
          matchCategory = log.action_type.startsWith('payment_');
        } else if (filterCategory === 'objectif') {
          matchCategory = log.action_type.startsWith('objectif_');
        } else if (filterCategory === 'org') {
          matchCategory = log.action_type === 'org_settings_updated' || log.action_type === 'commercial_added' || log.action_type === 'commercial_removed' || log.action_type === 'prospect_reassigned';
        }
      }
      return matchSearch && matchCategory;
    });
  }, [sorted, search, filterCategory]);

  const groupByDate = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(log => {
      if (!groups[log.date]) groups[log.date] = [];
      groups[log.date].push(log);
    });
    return groups;
  }, [filtered]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Journal d'Activité
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <History className="w-3 h-3" /> Audit Log
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-0.5">
            Historique chronologique des modifications et opérations critiques effectuées par l'équipe
          </p>
        </div>
        <div className="text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border/60">
          {filtered.length} événement(s)
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par action, utilisateur ou cible..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-input bg-card text-xs font-bold text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            {FILTER_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline chronologique groupée par jour */}
      <div className="space-y-6">
        {Object.entries(groupByDate).map(([date, logs]) => (
          <div key={date} className="space-y-3">
            {/* Date header */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground bg-background px-3 py-1 rounded-full border border-border/60">
                {formatDate(date)}
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            {/* Events for this day */}
            <div className="space-y-2.5">
              {logs.map((log, idx) => {
                const config = ACTION_TYPE_CONFIG[log.action_type] || ACTION_TYPE_CONFIG.other;
                const IconComp = config.icon;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-4 rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl ${config.color} flex items-center justify-center shrink-0`}>
                        <IconComp className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-black text-foreground">{log.utilisateur_nom}</span>
                            <span className="text-[10px] font-bold text-muted-foreground">—</span>
                            <span className="text-xs font-bold text-primary truncate">{log.action}</span>
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {log.heure}
                          </span>
                        </div>

                        {log.cible && (
                          <p className="text-xs font-semibold text-foreground">
                            Élément : <span className="font-bold">{log.cible}</span>
                          </p>
                        )}

                        {(log.ancienne_valeur || log.nouvelle_valeur) && (
                          <div className="flex items-center gap-2 text-[11px] p-2 rounded-xl bg-muted/50 border border-border/40">
                            {log.ancienne_valeur && (
                              <span className="text-muted-foreground line-through">{log.ancienne_valeur}</span>
                            )}
                            {log.ancienne_valeur && log.nouvelle_valeur && (
                              <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                            )}
                            {log.nouvelle_valeur && (
                              <span className="font-bold text-emerald-600">{log.nouvelle_valeur}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-10 text-center rounded-3xl border-2 border-dashed border-border space-y-2">
            <History className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-sm font-bold text-foreground">Aucun événement trouvé</p>
            <p className="text-xs text-muted-foreground">Modifiez vos filtres pour voir l'historique d'activité.</p>
          </div>
        )}
      </div>
    </div>
  );
};
