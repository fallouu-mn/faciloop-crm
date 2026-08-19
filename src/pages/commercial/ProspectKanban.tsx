import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Prospect, MotifPerte, PipelineStepId } from '../../types/crm';
import { 
  DndContext, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  TouchSensor, 
  DragEndEvent, 
  DragStartEvent, 
  useDroppable, 
  useDraggable 
} from '@dnd-kit/core';
import { 
  Plus, 
  AlertTriangle, 
  Building2, 
  X, 
  Lock, 
  UserCheck, 
  GripVertical,
  Inbox,
  PhoneCall,
  Calendar,
  FileText,
  Trophy,
  FolderX,
  Sparkles,
  ArrowUpRight,
  Clock,
  MessageSquare
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ColumnDef {
  id: PipelineStepId;
  title: string;
  color: string;
  badgeBg: string;
  icon: React.ComponentType<{ className?: string }>;
  emptyText: string;
  emptyHint: string;
}

// CDC 3.4 Phase 1 MVP: 6 Strict Steps with tailored UX Onboarding Icons & Hints
const columns: ColumnDef[] = [
  { 
    id: 'nouveau', 
    title: '1. Nouveau Prospect', 
    color: 'border-blue-500', 
    badgeBg: 'bg-blue-500/10 text-blue-500',
    icon: Inbox,
    emptyText: 'Aucun nouveau prospect',
    emptyHint: 'Ajoutez une nouvelle cible ou importez un fichier CSV'
  },
  { 
    id: 'a_contacter', 
    title: '2. À contacter / Contacté', 
    color: 'border-sky-500', 
    badgeBg: 'bg-sky-500/10 text-sky-500',
    icon: PhoneCall,
    emptyText: 'Aucun prospect à relancer',
    emptyHint: 'Glissez un nouveau prospect ici après le premier appel'
  },
  { 
    id: 'demo_rdv', 
    title: '3. Démonstration / RDV', 
    color: 'border-purple-500', 
    badgeBg: 'bg-purple-500/10 text-purple-500',
    icon: Calendar,
    emptyText: 'Aucune démo planifiée',
    emptyHint: 'Déposez ici les prospects ayant accepté un rendez-vous'
  },
  { 
    id: 'devis_envoye', 
    title: '4. Devis / Proposition', 
    color: 'border-amber-500', 
    badgeBg: 'bg-amber-500/10 text-amber-500',
    icon: FileText,
    emptyText: 'Aucune offre en cours',
    emptyHint: 'Glissez un prospect lorsque le devis a été transmis'
  },
  { 
    id: 'gagne', 
    title: '5. Gagné (Client)', 
    color: 'border-emerald-500', 
    badgeBg: 'bg-emerald-500/10 text-emerald-500',
    icon: Trophy,
    emptyText: 'Pas encore de contrat signé',
    emptyHint: 'Déposez ici pour déclencher la conversion en Client'
  },
  { 
    id: 'perdu', 
    title: '6. Perdu', 
    color: 'border-rose-500', 
    badgeBg: 'bg-rose-500/10 text-rose-500',
    icon: FolderX,
    emptyText: 'Aucune opportunité perdue',
    emptyHint: 'Déposer ici pour saisir obligatoirement un motif de perte'
  }
];

// Stylized Draggable Prospect Card Component with Motion & Polish
const DraggableProspectCard: React.FC<{ prospect: Prospect }> = ({ prospect }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: prospect.id,
    data: { prospect }
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.3 : 1
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className={`p-4 rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-xl hover:border-primary/40 transition-all space-y-3 cursor-grab active:cursor-grabbing select-none group relative overflow-hidden ${
          isDragging ? 'ring-2 ring-primary opacity-30' : ''
        }`}
      >
        {/* Subtle Ambient Top Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-faciloop opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Card Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div {...listeners} {...attributes} className="p-1 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors cursor-grab">
              <GripVertical className="w-4 h-4" />
            </div>
            <div>
              <Link
                to={`/app/prospects/${prospect.id}`}
                className="font-extrabold text-xs text-foreground group-hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>{prospect.prenom} {prospect.nom}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate max-w-[140px]">{prospect.entreprise}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges & Financial Info */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold">
            {prospect.budget_estime ? `${(prospect.budget_estime).toLocaleString()} FCFA` : 'Prospect Qualifié'}
          </span>

          <span className="text-[10px] font-semibold text-muted-foreground capitalize flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-emerald-500" />
            {prospect.source.replace('_', ' ')}
          </span>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border/60 text-[10px]">
          <span className="text-muted-foreground font-medium">Tel: {prospect.telephone}</span>
          <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-md">{prospect.commercial_nom || 'Moi'}</span>
        </div>
      </motion.div>
    </div>
  );
};

// Onboarding Empty State Component per Column
const KanbanEmptyState: React.FC<{ col: ColumnDef }> = ({ col }) => {
  const IconComponent = col.icon;
  return (
    <div className="h-44 rounded-2xl border-2 border-dashed border-border/70 bg-card/30 flex flex-col items-center justify-center p-4 text-center space-y-2 group hover:border-primary/40 transition-colors">
      <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:scale-110 group-hover:text-primary transition-all">
        <IconComponent className="w-5 h-5" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-xs font-bold text-foreground">{col.emptyText}</h4>
        <p className="text-[10px] text-muted-foreground leading-tight max-w-[180px] mx-auto">
          {col.emptyHint}
        </p>
      </div>

      {col.id === 'nouveau' && (
        <Link
          to="/app/prospects"
          className="mt-1 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-extrabold hover:bg-primary/20 transition-all"
        >
          <Plus className="w-3 h-3" />
          <span>Créer un prospect</span>
        </Link>
      )}
    </div>
  );
};

// Droppable Column Component with Illuminated Drop Zone Feedback
const DroppableColumn: React.FC<{ col: ColumnDef; prospects: Prospect[] }> = ({ col, prospects }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-72 sm:w-80 shrink-0 rounded-3xl border bg-card/60 p-4 backdrop-blur-xl flex flex-col space-y-4 snap-start border-t-4 transition-all duration-300 ${col.color} ${
        isOver
          ? 'bg-primary/10 ring-4 ring-primary/30 border-primary scale-[1.01] shadow-2xl'
          : 'border-border/80 shadow-md'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <col.icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-extrabold text-foreground truncate">{col.title}</span>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${col.badgeBg}`}>
          {prospects.length}
        </span>
      </div>

      {/* Column Droppable Area */}
      <div className="flex-1 space-y-3 min-h-[420px] relative">
        {isOver && (
          <div className="absolute inset-0 z-20 rounded-2xl border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm flex flex-col items-center justify-center text-primary font-bold text-xs gap-2 animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin-slow" />
            <span>Déposer ici pour mettre à jour l'étape ✨</span>
          </div>
        )}

        {prospects.length === 0 ? (
          <KanbanEmptyState col={col} />
        ) : (
          prospects.map((p) => <DraggableProspectCard key={p.id} prospect={p} />)
        )}
      </div>
    </div>
  );
};

export const ProspectKanban: React.FC = () => {
  const { user, myProspects, updateProspectStatus, convertProspectToClient } = useAuth();
  const navigate = useNavigate();

  const [activeProspect, setActiveProspect] = useState<Prospect | null>(null);

  // Modal States
  const [lossModalOpen, setLossModalOpen] = useState<boolean>(false);
  const [convertModalOpen, setConvertModalOpen] = useState<boolean>(false);
  const [pendingProspectId, setPendingProspectId] = useState<string | null>(null);
  const [selectedMotif, setSelectedMotif] = useState<MotifPerte>('prix_trop_eleve');
  const [selectedFormule, setSelectedFormule] = useState<string>('SaaS Business Pro');

  // DnD Sensors for desktop mouse & mobile touch
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = myProspects.find(p => p.id === active.id);
    if (found) setActiveProspect(found);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProspect(null);

    if (!over) return;

    const prospectId = active.id as string;
    const targetStep = over.id as PipelineStepId;

    const currentProspect = myProspects.find(p => p.id === prospectId);
    if (!currentProspect || currentProspect.statut_pipeline === targetStep) return;

    // CDC 3.4 Business Rules on Drag Drop
    if (targetStep === 'perdu') {
      setPendingProspectId(prospectId);
      setLossModalOpen(true);
    } else if (targetStep === 'gagne') {
      setPendingProspectId(prospectId);
      setConvertModalOpen(true);
    } else {
      updateProspectStatus(prospectId, targetStep);
    }
  };

  const confirmLoss = () => {
    if (pendingProspectId) {
      updateProspectStatus(pendingProspectId, 'perdu', selectedMotif);
      setLossModalOpen(false);
      setPendingProspectId(null);
    }
  };

  const confirmConvert = () => {
    if (pendingProspectId) {
      convertProspectToClient(pendingProspectId, selectedFormule);
      setConvertModalOpen(false);
      setPendingProspectId(null);
      navigate('/admin/clients');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Pipeline Commercial Kanban (6 Étapes MVP)
            </h1>
            {user?.role === 'commercial' && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Portefeuille Personnel
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Glissez-déposez vos opportunités commerciales entre les 6 colonnes du CDC
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

      {/* DndContext Board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
          {columns.map((col) => {
            const colProspects = myProspects.filter(p => p.statut_pipeline === col.id);
            return <DroppableColumn key={col.id} col={col} prospects={colProspects} />;
          })}
        </div>

        {/* Polished Drag Overlay during active drag (Slight Tilt, High Elevation & Glow) */}
        <DragOverlay>
          {activeProspect ? (
            <div className="p-4 rounded-2xl border-2 border-primary bg-card shadow-2xl rotate-3 scale-105 ring-4 ring-primary/20 space-y-3 w-72 cursor-grabbing z-50">
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-xs text-foreground">
                  {activeProspect.prenom} {activeProspect.nom}
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  En déplacement...
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>{activeProspect.entreprise}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Mandatory Loss Reason Selection Modal */}
      {lossModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Motif de Perte Obligatoire</span>
            </div>

            <p className="text-xs text-muted-foreground">
              Veuillez sélectionner le motif d'abandon ou de perte de cette opportunité :
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
                onClick={() => { setLossModalOpen(false); setPendingProspectId(null); }}
                className="w-1/2 py-2.5 rounded-xl border text-xs font-bold hover:bg-muted"
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

      {/* Client Conversion Modal triggered when dropped into Gagné */}
      {convertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
              <UserCheck className="w-5 h-5" />
              <span>Conversion en Client Faciloop</span>
            </div>

            <p className="text-xs text-muted-foreground">
              Félicitations pour cette vente ! Choisissez la formule SaaS souscrite par le client :
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Formule SaaS Souscrite</label>
                <select
                  value={selectedFormule}
                  onChange={(e) => setSelectedFormule(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium"
                >
                  <option value="SaaS Starter">SaaS Starter (250 000 FCFA/an)</option>
                  <option value="SaaS Business Pro">SaaS Business Pro (750 000 FCFA/an)</option>
                  <option value="SaaS Enterprise">SaaS Enterprise (Sur-mesure)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => { setConvertModalOpen(false); setPendingProspectId(null); }}
                className="w-1/2 py-2.5 rounded-xl border text-xs font-bold hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={confirmConvert}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 shadow-md"
              >
                Valider la conversion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
