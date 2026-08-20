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
  MessageSquare,
  Columns,
  List,
  ChevronDown,
  ChevronUp,
  Phone,
  ArrowRight,
  CalendarClock,
  CreditCard
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

// Complete 12 Pipeline Stages matching model app
const columns: ColumnDef[] = [
  { 
    id: 'nouveau', 
    title: '1. Nouveau', 
    color: 'border-blue-500', 
    badgeBg: 'bg-blue-500/10 text-blue-500',
    icon: Inbox,
    emptyText: 'Aucun nouveau prospect',
    emptyHint: 'Ajoutez une nouvelle cible ou importez un fichier CSV'
  },
  { 
    id: 'a_contacter', 
    title: '2. À contacter', 
    color: 'border-sky-500', 
    badgeBg: 'bg-sky-500/10 text-sky-500',
    icon: PhoneCall,
    emptyText: 'Aucun prospect à contacter',
    emptyHint: 'Prospects prêts pour la première prise de contact'
  },
  { 
    id: 'contacte', 
    title: '3. Contacté', 
    color: 'border-indigo-500', 
    badgeBg: 'bg-indigo-500/10 text-indigo-500',
    icon: PhoneCall,
    emptyText: 'Aucun prospect contacté',
    emptyHint: 'Premier échange ou appel effectué'
  },
  { 
    id: 'interesse', 
    title: '4. Intéressé', 
    color: 'border-cyan-500', 
    badgeBg: 'bg-cyan-500/10 text-cyan-500',
    icon: Sparkles,
    emptyText: 'Aucun prospect intéressé',
    emptyHint: 'Prospect ayant confirmé son intérêt pour Faciloop'
  },
  { 
    id: 'rdv_programme', 
    title: '5. RDV programmé', 
    color: 'border-purple-500', 
    badgeBg: 'bg-purple-500/10 text-purple-500',
    icon: Calendar,
    emptyText: 'Aucun RDV planifié',
    emptyHint: 'Déposez ici les prospects ayant fixé un rendez-vous'
  },
  { 
    id: 'demo_realisee', 
    title: '6. Démo réalisée', 
    color: 'border-violet-500', 
    badgeBg: 'bg-violet-500/10 text-violet-500',
    icon: Calendar,
    emptyText: 'Aucune démo réalisée',
    emptyHint: 'Démonstration produit effectuée'
  },
  { 
    id: 'essai_en_cours', 
    title: '7. Essai en cours', 
    color: 'border-teal-500', 
    badgeBg: 'bg-teal-500/10 text-teal-500',
    icon: Clock,
    emptyText: 'Aucun essai en cours',
    emptyHint: 'Prospect testant actuellement la plateforme'
  },
  { 
    id: 'proposition', 
    title: '8. Proposition', 
    color: 'border-amber-500', 
    badgeBg: 'bg-amber-500/10 text-amber-500',
    icon: FileText,
    emptyText: 'Aucune offre transmise',
    emptyHint: 'Devis commercial ou proposition tarifaire envoyée'
  },
  { 
    id: 'paiement_att', 
    title: '9. Paiement att.', 
    color: 'border-orange-500', 
    badgeBg: 'bg-orange-500/10 text-orange-500',
    icon: CalendarClock,
    emptyText: 'Aucun paiement en attente',
    emptyHint: 'Facture transmise, en attente de règlement'
  },
  { 
    id: 'gagne', 
    title: '10. Client gagné', 
    color: 'border-emerald-500', 
    badgeBg: 'bg-emerald-500/10 text-emerald-500',
    icon: Trophy,
    emptyText: 'Pas encore de contrat signé',
    emptyHint: 'Déposez ici pour déclencher la conversion en Client'
  },
  { 
    id: 'a_relancer', 
    title: '11. À relancer', 
    color: 'border-yellow-500', 
    badgeBg: 'bg-yellow-500/10 text-yellow-500',
    icon: CalendarClock,
    emptyText: 'Aucune relance en attente',
    emptyHint: 'Prospect à relancer plus tard'
  },
  { 
    id: 'perdu', 
    title: '12. Perdu', 
    color: 'border-rose-500', 
    badgeBg: 'bg-rose-500/10 text-rose-500',
    icon: FolderX,
    emptyText: 'Aucune opportunité perdue',
    emptyHint: 'Déposer ici pour saisir obligatoirement un motif de perte'
  }
];

// Stylized Draggable Prospect Card Component
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
        {/* Ambient Top Border Accent */}
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
                className="font-extrabold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>{prospect.prenom} {prospect.nom}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate max-w-[150px]">{prospect.entreprise}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges & Financial Info */}
        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-black">
            {prospect.budget_estime ? `${(prospect.budget_estime).toLocaleString()} FCFA` : 'Prospect Qualifié'}
          </span>

          <span className="text-xs font-bold text-muted-foreground capitalize flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
            {prospect.source.replace('_', ' ')}
          </span>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border/60 text-xs">
          <span className="text-muted-foreground font-bold">Tel: {prospect.telephone}</span>
          <span className="font-extrabold text-foreground bg-muted px-2 py-0.5 rounded-md">{prospect.commercial_nom || 'Moi'}</span>
        </div>
      </motion.div>
    </div>
  );
};

// Onboarding Empty State Component per Column
const KanbanEmptyState: React.FC<{ col: ColumnDef }> = ({ col }) => {
  const IconComponent = col.icon;
  return (
    <div className="h-40 sm:h-44 rounded-2xl border-2 border-dashed border-border/70 bg-card/30 flex flex-col items-center justify-center p-4 text-center space-y-2 group hover:border-primary/40 transition-colors">
      <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:scale-110 group-hover:text-primary transition-all">
        <IconComponent className="w-5 h-5" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-xs font-extrabold text-foreground">{col.emptyText}</h4>
        <p className="text-xs text-muted-foreground font-semibold leading-tight max-w-[180px] mx-auto">
          {col.emptyHint}
        </p>
      </div>

      {col.id === 'nouveau' && (
        <Link
          to="/app/prospects"
          className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-black hover:bg-primary/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Créer un prospect</span>
        </Link>
      )}
    </div>
  );
};

// Droppable Column Component for Horizontal View
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
          <span className="text-xs sm:text-sm font-extrabold text-foreground truncate">{col.title}</span>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${col.badgeBg}`}>
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

  // View Mode: 'vertical' (stacked stages card view for optimum UX) vs 'horizontal' (classic kanban board)
  const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({
    nouveau: true,
    a_contacter: true,
    contacte: true,
    interesse: true,
    rdv_programme: true,
    demo_realisee: true,
    essai_en_cours: true,
    proposition: true,
    paiement_att: true,
    gagne: true,
    a_relancer: true,
    perdu: false
  });

  const toggleStageExpand = (stageId: string) => {
    setExpandedStages(prev => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  // Modal States
  const [lossModalOpen, setLossModalOpen] = useState<boolean>(false);
  const [convertModalOpen, setConvertModalOpen] = useState<boolean>(false);
  const [pendingProspectId, setPendingProspectId] = useState<string | null>(null);
  const [selectedMotif, setSelectedMotif] = useState<MotifPerte>('prix_trop_eleve');
  const [selectedFormule, setSelectedFormule] = useState<string>('SaaS Business Pro');

  // DnD Sensors for desktop mouse & mobile touch
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
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

  const handleStageChangeSelect = (prospectId: string, targetStep: PipelineStepId) => {
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
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header with Responsive View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Pipeline Commercial Kanban (6 Étapes MVP)
            </h1>
            {user?.role === 'commercial' && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-black flex items-center gap-1">
                <Lock className="w-3 h-3" /> Portefeuille Personnel
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-0.5">
            Suivi ergonomique vertical ou tableau Kanban horizontal des 6 étapes du CDC
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle Switcher */}
          <div className="flex items-center rounded-2xl bg-muted p-1 border border-border/80 text-xs font-extrabold">
            <button
              onClick={() => setViewMode('vertical')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                viewMode === 'vertical'
                  ? 'bg-gradient-faciloop text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Vue Étape par Étape Verticale (Idéale sur Mobile)"
            >
              <List className="w-4 h-4" />
              <span>Verticale</span>
            </button>

            <button
              onClick={() => setViewMode('horizontal')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                viewMode === 'horizontal'
                  ? 'bg-gradient-faciloop text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Vue Tableau Horizontale Multi-Colonnes"
            >
              <Columns className="w-4 h-4" />
              <span className="hidden sm:inline">Horizontale</span>
            </button>
          </div>

          <Link
            to="/app/prospects"
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-faciloop px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-primary/25 hover:opacity-95 active:scale-95 transition-all shrink-0"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Nouveau Prospect</span>
          </Link>
        </div>
      </div>

      {/* VIEW MODE 1: VERTICAL ACCORDION STACK (Professional UX for Mobile & Desktop) */}
      {viewMode === 'vertical' ? (
        <div className="space-y-4">
          {columns.map((col) => {
            const colProspects = myProspects.filter(p => p.statut_pipeline === col.id);
            const totalBudget = colProspects.reduce((sum, p) => sum + (p.budget_estime || 0), 0);
            const isExpanded = expandedStages[col.id] ?? true;

            return (
              <div
                key={col.id}
                className={`rounded-3xl border ${col.color} border-t-4 bg-card shadow-md overflow-hidden transition-all duration-300`}
              >
                {/* Stage Header Banner */}
                <button
                  onClick={() => toggleStageExpand(col.id)}
                  className="w-full p-4 sm:p-5 bg-card hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ${col.badgeBg} flex items-center justify-center font-black shrink-0`}>
                      <col.icon className="w-5 h-5" />
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-foreground">{col.title}</h3>
                      <div className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                        <span>{colProspects.length} prospect(s)</span>
                        {totalBudget > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-500 font-extrabold">{totalBudget.toLocaleString()} FCFA</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${col.badgeBg}`}>
                      {colProspects.length}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Vertical Stage Content List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-border/60 p-4 sm:p-5 bg-muted/20"
                    >
                      {colProspects.length === 0 ? (
                        <KanbanEmptyState col={col} />
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {colProspects.map((prospect) => (
                            <div
                              key={prospect.id}
                              className="p-4 rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-lg transition-all space-y-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <Link
                                    to={`/app/prospects/${prospect.id}`}
                                    className="font-extrabold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1"
                                  >
                                    <span>{prospect.prenom} {prospect.nom}</span>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                                  </Link>
                                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span>{prospect.entreprise}</span>
                                  </p>
                                </div>

                                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-black text-xs shrink-0">
                                  {prospect.budget_estime ? `${prospect.budget_estime.toLocaleString()} FCFA` : 'N/D'}
                                </span>
                              </div>

                              {/* Stage Change Dropdown Selector */}
                              <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <a
                                    href={`https://wa.me/${(prospect.telephone || '').replace(/\s+/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold flex items-center gap-1"
                                    title="WhatsApp Direct"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>

                                  <a
                                    href={`tel:${prospect.telephone}`}
                                    className="p-2 rounded-xl border border-input text-foreground hover:bg-muted transition-all text-xs font-bold flex items-center gap-1"
                                    title="Appeler"
                                  >
                                    <Phone className="w-3.5 h-3.5 text-primary" />
                                  </a>
                                </div>

                                {/* Step Selector */}
                                <select
                                  value={prospect.statut_pipeline}
                                  onChange={(e) => handleStageChangeSelect(prospect.id, e.target.value as PipelineStepId)}
                                  className="px-2.5 py-1.5 rounded-xl border border-input bg-background text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/50"
                                >
                                  {columns.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW MODE 2: HORIZONTAL KANBAN BOARD (DndContext) */
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
            {columns.map((col) => {
              const colProspects = myProspects.filter(p => p.statut_pipeline === col.id);
              return <DroppableColumn key={col.id} col={col} prospects={colProspects} />;
            })}
          </div>

          <DragOverlay>
            {activeProspect ? (
              <div className="w-72 p-4 rounded-2xl border-2 border-primary bg-card shadow-2xl space-y-3 opacity-90 scale-105">
                <div className="font-extrabold text-sm text-foreground">{activeProspect.prenom} {activeProspect.nom}</div>
                <div className="text-xs font-bold text-primary">{activeProspect.entreprise}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Loss Reason Bottom Sheet Modal on Mobile */}
      <AnimatePresence>
        {lossModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-left relative font-sans"
            >
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto sm:hidden mb-1" />

              <div className="flex items-center gap-3 text-rose-500">
                <div className="p-2.5 rounded-2xl bg-rose-500/10">
                  <AlertTriangle className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="font-extrabold text-base text-foreground">Motif de Perte Obligatoire (CDC 3.4)</h3>
              </div>

              <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                Conformément aux règles métier du CDC, veuillez sélectionner le motif principal de perte pour alimenter le journal statistique.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-foreground">Motif de perte</label>
                <select
                  value={selectedMotif}
                  onChange={(e) => setSelectedMotif(e.target.value as MotifPerte)}
                  className="w-full p-3 rounded-2xl border border-input bg-background text-xs font-bold text-foreground"
                >
                  <option value="prix_trop_eleve">Prix trop élevé / Hors budget</option>
                  <option value="concurrent">Parti chez un concurrent</option>
                  <option value="pas_de_besoin_actuel">Pas de besoin actuel / Projet reporté</option>
                  <option value="injoignable">Injoignable après plusieurs relances</option>
                  <option value="mauvais_timing">Mauvais timing commercial</option>
                  <option value="autre">Autre motif</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => setLossModalOpen(false)}
                  className="w-full sm:w-1/2 py-3 rounded-2xl border border-input text-xs font-bold hover:bg-muted text-foreground"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmLoss}
                  className="w-full sm:w-1/2 py-3 rounded-2xl bg-rose-500 text-white text-xs font-extrabold hover:bg-rose-600 shadow-md shadow-rose-500/20"
                >
                  Valider la perte
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Convert to Client Bottom Sheet Modal on Mobile */}
      <AnimatePresence>
        {convertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-left relative font-sans"
            >
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto sm:hidden mb-1" />

              <div className="flex items-center gap-3 text-emerald-500">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10">
                  <UserCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="font-extrabold text-base text-foreground">Félicitations ! Conversion Client</h3>
              </div>

              <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                Ce prospect va être automatiquement converti en Client officiel Faciloop CRM et son accès sera généré.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-foreground">Formule SaaS Souscrite</label>
                <select
                  value={selectedFormule}
                  onChange={(e) => setSelectedFormule(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-input bg-background text-xs font-bold text-foreground"
                >
                  <option value="SaaS Starter">SaaS Starter (250 000 FCFA/an)</option>
                  <option value="SaaS Business Pro">SaaS Business Pro (750 000 FCFA/an)</option>
                  <option value="SaaS Enterprise">SaaS Enterprise (Sur-mesure)</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => setConvertModalOpen(false)}
                  className="w-full sm:w-1/2 py-3 rounded-2xl border border-input text-xs font-bold hover:bg-muted text-foreground"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmConvert}
                  className="w-full sm:w-1/2 py-3 rounded-2xl bg-emerald-500 text-white text-xs font-extrabold hover:bg-emerald-600 shadow-md shadow-emerald-500/25"
                >
                  Confirmer la vente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
