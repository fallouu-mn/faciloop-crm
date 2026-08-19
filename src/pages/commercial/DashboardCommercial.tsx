import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  CalendarClock, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  PhoneCall, 
  MessageSquare, 
  Plus, 
  ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardCommercial: React.FC = () => {
  const { user, prospects, relances, currency } = useAuth();

  // Metrics calculation
  const totalProspects = prospects.length;
  const relancesAujourdhui = relances.filter(r => r.date === new Date().toISOString().split('T')[0]);
  const relancesEnRetard = relances.filter(r => r.statut === 'en_retard');
  const ventesConclues = prospects.filter(p => p.statut_pipeline === 'gagne').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Bonjour, {user?.prenom || 'Commercial'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Vue d'ensemble de vos priorités et relances aujourd'hui
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/prospects"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau prospect</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 card-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mes Prospects</span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{totalProspects}</span>
            <span className="flex items-center text-xs font-bold text-emerald-500">
              <ArrowUpRight className="h-3.5 w-3.5" /> +15%
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 card-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Relances aujourd'hui</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
              <CalendarClock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{relancesAujourdhui.length}</span>
            <span className="text-xs font-semibold text-amber-500">
              {relancesAujourdhui.length > 0 ? 'À effectuer' : 'À jour'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 card-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Relances en retard</span>
            <div className="rounded-xl bg-rose-500/10 p-2 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-500">{relancesEnRetard.length}</span>
            <span className="text-xs font-bold text-rose-500">Action urgente</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 card-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ventes Conclues</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{ventesConclues}</span>
            <span className="text-xs font-bold text-emerald-500">Convertis</span>
          </div>
        </div>
      </div>

      {/* Priorities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Priorities Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Mes Priorités du Jour</h2>
            <Link to="/app/relances" className="text-xs font-bold text-primary hover:underline">
              Voir toutes les relances →
            </Link>
          </div>

          <div className="space-y-3">
            {relances.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-border text-center">
                <p className="text-xs text-muted-foreground">Aucune relance programmée pour le moment.</p>
              </div>
            ) : (
              relances.map((relance) => (
                <div
                  key={relance.id}
                  className={`p-4 rounded-2xl border bg-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    relance.statut === 'en_retard' ? 'border-rose-500/50 bg-rose-500/5' : 'border-border'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{relance.prospect_nom}</span>
                      <span className="text-xs text-muted-foreground">({relance.prospect_entreprise})</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{relance.commentaire || relance.motif}</p>
                    <div className="flex items-center gap-3 text-[10px] font-semibold text-muted-foreground">
                      <span>Heure: {relance.heure || '09:00'}</span>
                      <span className="capitalize">Canal: {relance.canal}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${relance.prospect_nom}?text=${encodeURIComponent(
                        `Bonjour ${relance.prospect_nom}, je suis Moussa de Faciloop. Je vous relance au sujet de notre opportunité.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-bold hover:bg-emerald-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <Link
                      to={`/app/prospects/${relance.prospect_id}`}
                      className="px-3 py-1.5 rounded-lg border border-input bg-card text-xs font-bold hover:bg-muted transition-all"
                    >
                      Voir fiche
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Pipelines Overview Column */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground">Aperçu du Pipeline</h2>
          <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Prospects Nouveaux</span>
              <span className="font-bold text-foreground">
                {prospects.filter(p => p.statut_pipeline === 'nouveau').length}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }} />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">À contacter / Démo</span>
              <span className="font-bold text-foreground">
                {prospects.filter(p => ['a_contacter', 'demo_rdv'].includes(p.statut_pipeline)).length}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '65%' }} />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Devis Envoyés</span>
              <span className="font-bold text-foreground">
                {prospects.filter(p => p.statut_pipeline === 'devis_envoye').length}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }} />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Gagnés (Convertis)</span>
              <span className="font-bold text-emerald-500">
                {prospects.filter(p => p.statut_pipeline === 'gagne').length}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '80%' }} />
            </div>

            <div className="pt-2">
              <Link
                to="/app/pipeline"
                className="w-full py-2.5 rounded-xl border border-primary text-primary font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/10 transition-all"
              >
                <span>Ouvrir le Kanban 12 colonnes</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
