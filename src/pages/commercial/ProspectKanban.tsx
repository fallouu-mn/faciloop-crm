import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Prospect, MotifPerte } from '../../types/crm';
import { 
  Kanban, 
  Plus, 
  AlertTriangle, 
  Building2, 
  Clock, 
  X, 
  Check, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ColumnDef {
  id: string;
  title: string;
  color: string;
}

export const ProspectKanban: React.FC = () => {
  const { prospects, updateProspectStatus } = useAuth();

  // 12 Pipeline Steps
  const columns: ColumnDef[] = [
    { id: 'nouveau', title: '1. Nouveau Prospect', color: 'border-blue-500' },
    { id: 'a_contacter', title: '2. À contacter', color: 'border-sky-500' },
    { id: 'contacte', title: '3. Contacté', color: 'border-cyan-500' },
    { id: 'qualification', title: '4. Qualification', color: 'border-indigo-500' },
    { id: 'demo_rdv', title: '5. Démo / RDV', color: 'border-purple-500' },
    { id: 'proposition', title: '6. Proposition', color: 'border-fuchsia-500' },
    { id: 'devis_envoye', title: '7. Devis Envoyé', color: 'border-amber-500' },
    { id: 'negociation', title: '8. Négociation', color: 'border-orange-500' },
    { id: 'decision', title: '9. En Décision', color: 'border-yellow-500' },
    { id: 'contrat_envoye', title: '10. Contrat Envoyé', color: 'border-teal-500' },
    { id: 'gagne', title: '11. Gagné (Client)', color: 'border-emerald-500' },
    { id: 'perdu', title: '12. Perdu', color: 'border-rose-500' }
  ];

  // Loss Modal State
  const [lossModalOpen, setLossModalOpen] = useState<boolean>(false);
  const [targetProspectId, setTargetProspectId] = useState<string | null>(null);
  const [selectedMotif, setSelectedMotif] = useState<MotifPerte>('prix_trop_eleve');

  const handleMoveStep = (prospectId: string, currentStep: string, direction: 'prev' | 'next') => {
    const currentIndex = columns.findIndex(c => c.id === currentStep);
    let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= columns.length) targetIndex = columns.length - 1;

    const targetStep = columns[targetIndex].id;

    if (targetStep === 'perdu') {
      setTargetProspectId(prospectId);
      setLossModalOpen(true);
    } else {
      updateProspectStatus(prospectId, targetStep);
    }
  };

  const confirmLoss = () => {
    if (targetProspectId) {
      updateProspectStatus(targetProspectId, 'perdu', selectedMotif);
      setLossModalOpen(false);
      setTargetProspectId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Pipeline Commercial Kanban (12 Colonnes)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Faites glisser ou déplacer vos opportunités d'une étape à l'autre
          </p>
        </div>

        <Link
          to="/app/prospects"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau Prospect</span>
        </Link>
      </div>

      {/* 12 Columns Horizontal Scroll Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
        {columns.map((col) => {
          const colProspects = prospects.filter(p => p.statut_pipeline === col.id);

          return (
            <div
              key={col.id}
              className={`w-72 shrink-0 rounded-2xl border bg-card/60 p-4 backdrop-blur flex flex-col space-y-3 snap-start border-t-4 ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-foreground truncate">{col.title}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                  {colProspects.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 space-y-3 min-h-[350px]">
                {colProspects.length === 0 ? (
                  <div className="h-32 rounded-xl border border-dashed border-border/80 flex items-center justify-center text-[10px] text-muted-foreground">
                    Aucun prospect
                  </div>
                ) : (
                  colProspects.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all space-y-2 card-lift"
                    >
                      <div className="flex items-start justify-between">
                        <Link
                          to={`/app/prospects/${p.id}`}
                          className="font-bold text-xs text-foreground hover:text-primary transition-colors"
                        >
                          {p.prenom} {p.nom}
                        </Link>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                        <Building2 className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{p.entreprise}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[10px]">
                        <span className="text-muted-foreground">Tel: {p.telephone}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveStep(p.id, col.id, 'prev')}
                            className="p-1 rounded bg-muted hover:bg-primary/20 hover:text-primary transition-colors"
                            title="Reculer"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveStep(p.id, col.id, 'next')}
                            className="p-1 rounded bg-muted hover:bg-primary/20 hover:text-primary transition-colors"
                            title="Avancer"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Loss Reason Selection Modal */}
      {lossModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Passage en Prospect Perdu</span>
              </div>
              <button onClick={() => setLossModalOpen(false)} className="rounded-lg p-1 hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Veuillez sélectionner obligatoirement le motif d'abandon ou de perte de cette opportunité commerciale :
            </p>

            <div className="space-y-2 text-xs">
              {[
                { id: 'prix_trop_eleve', label: 'Prix trop élevé' },
                { id: 'concurrent', label: 'Parti chez un concurrent' },
                { id: 'pas_de_besoin_actuel', label: 'Pas de besoin actuel' },
                { id: 'injoignable', label: 'Prospect injoignable' },
                { id: 'mauvais_timing', label: 'Mauvais timing / Projet reporté' },
                { id: 'autre', label: 'Autre motif' }
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedMotif === m.id
                      ? 'border-rose-500 bg-rose-500/10 text-foreground font-bold'
                      : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  <input
                    type="radio"
                    name="motif"
                    checked={selectedMotif === m.id}
                    onChange={() => setSelectedMotif(m.id as MotifPerte)}
                    className="accent-rose-500"
                  />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setLossModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl border border-input text-xs font-bold hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={confirmLoss}
                className="w-1/2 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 shadow-md"
              >
                Confirmer la perte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
