import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Prospect, MotifPerte, PipelineStepId, ModePaiement } from '../../types/crm';
import {
  DndContext,
  DragOverlay,
  closestCorners,
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
  CalendarClock,
  Settings2,
  Circle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useProspects } from '@/hooks/commercial/useProspects';
import { useEtapesPipeline, getEtapeLabel } from '@/hooks/useEtapesPipeline';
import { GestionEtapesModal } from '@/components/common/GestionEtapesModal';
import { toast } from 'sonner';

interface ColumnDef {
  id: PipelineStepId;
  title: string;
  color: string;
  badgeBg: string;
  icon: React.ComponentType<{ className?: string }>;
  emptyText: string;
  emptyHint: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Inbox, PhoneCall, Sparkles, Calendar, Clock, FileText, CalendarClock, Trophy, FolderX, Circle,
};

function resolveIcon(name: string): React.ComponentType<{ className?: string }> {
  return ICON_MAP[name] || Circle;
}

// Stylized Draggable Prospect Card Component
const DraggableProspectCard: React.FC<{ prospect: Prospect; basePath?: string; activeCurrency?: Currency }> = ({ prospect, basePath = '/app/prospects', activeCurrency = 'XOF' }) => {
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
                to={`${basePath}/${prospect.id}`}
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
          {prospect.budget_estime ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-black">
              ≈ {formatMoney(prospect.budget_estime, activeCurrency)}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-muted-foreground">Budget non renseigné</span>
          )}

          <span className="text-xs font-bold text-muted-foreground capitalize flex items-center gap-1 shrink-0">
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

const getColumnEmptyText = (col: ColumnDef, isEn: boolean): string => {
  return isEn ? `No prospect in "${col.title}"` : `Aucun prospect dans « ${col.title} »`;
};

const getColumnEmptyHint = (col: ColumnDef, isEn: boolean): string => {
  return isEn ? 'Drag and drop prospects here' : 'Glissez-déposez des prospects ici';
};

// Vertical Droppable Zone (wraps each stage in vertical view for DnD)
const VerticalDropZone: React.FC<{ col: ColumnDef; isExpanded: boolean; isEn: boolean; children: React.ReactNode }> = ({ col, isExpanded, isEn, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-3xl border ${col.color} border-t-4 bg-card shadow-md overflow-hidden transition-all duration-300 ${
        isOver ? 'ring-4 ring-primary/30 border-primary scale-[1.005] shadow-2xl bg-primary/5' : 'border-border/80'
      }`}
    >
      {isOver && !isExpanded && (
        <div className="p-3 bg-primary/10 text-center text-xs font-bold text-primary animate-pulse flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          {isEn ? `Drop here to move to "${col.title}"` : `Déposer ici pour déplacer vers « ${col.title} »`}
        </div>
      )}
      {children}
    </div>
  );
};

// Onboarding Empty State Component per Column
const KanbanEmptyState: React.FC<{ col: ColumnDef; prospectsPath?: string; isEn?: boolean }> = ({ col, prospectsPath = '/app/prospects', isEn = false }) => {
  const IconComponent = col.icon;
  return (
    <div className="h-40 sm:h-44 rounded-2xl border-2 border-dashed border-border/70 bg-card/30 flex flex-col items-center justify-center p-4 text-center space-y-2 group hover:border-primary/40 transition-colors">
      <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:scale-110 group-hover:text-primary transition-all">
        <IconComponent className="w-5 h-5" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-xs font-extrabold text-foreground">{getColumnEmptyText(col, isEn)}</h4>
        <p className="text-xs text-muted-foreground font-semibold leading-tight max-w-[180px] mx-auto">
          {getColumnEmptyHint(col, isEn)}
        </p>
      </div>

      {col.id === 'nouveau' && (
        <Link
          to={prospectsPath}
          className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-black hover:bg-primary/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isEn ? 'Create prospect' : 'Créer un prospect'}</span>
        </Link>
      )}
    </div>
  );
};

// Droppable Column Component for Horizontal View
const DroppableColumn: React.FC<{ col: ColumnDef; prospects: Prospect[]; basePath?: string; activeCurrency?: Currency; isEn?: boolean }> = ({ col, prospects, basePath = '/app/prospects', activeCurrency = 'XOF', isEn = false }) => {
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
            <span>{isEn ? 'Drop here to update stage ✨' : "Déposer ici pour mettre à jour l'étape ✨"}</span>
          </div>
        )}

        {prospects.length === 0 ? (
          <KanbanEmptyState col={col} prospectsPath={basePath} isEn={isEn} />
        ) : (
          prospects.map((p) => <DraggableProspectCard key={p.id} prospect={p} basePath={basePath} activeCurrency={activeCurrency} />)
        )}
      </div>
    </div>
  );
};

// ─── Currency helpers ─────────────────────────────────────────
type Currency = 'XOF' | 'EUR' | 'USD';
const CURRENCY_LABELS: Record<Currency, string> = { XOF: 'FCFA', EUR: 'EUR', USD: 'USD' };
const EXCHANGE_RATES: Record<Currency, number> = { XOF: 1, EUR: 1 / 655.957, USD: 1 / 600 };

function formatMoney(amount: number, curr: Currency): string {
  return Math.round(amount * EXCHANGE_RATES[curr]).toLocaleString('fr-FR') + ' ' + CURRENCY_LABELS[curr];
}

export const ProspectKanban: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, prospects, myProspects, commerciaux, updateProspectStatus, convertProspectToClient, orgOffers, currency, setCurrency } = useAuth();
  const { prospects: apiProspects, updatePipeline: apiUpdatePipeline } = useProspects();
  const { etapes, loading: etapesLoading, create: createEtape, update: updateEtape, remove: removeEtape, reorder: reorderEtapes } = useEtapesPipeline();
  const navigate = useNavigate();

  const isEn = i18n.language?.startsWith('en');
  const isAdmin = user?.role === 'admin_org' || user?.role === 'super_admin';
  const [etapesModalOpen, setEtapesModalOpen] = useState(false);

  const columns: ColumnDef[] = etapes.map((e, idx) => ({
    id: e.nom,
    title: `${idx + 1}. ${getEtapeLabel(e, isEn)}`,
    color: e.couleur,
    badgeBg: e.badge_bg,
    icon: resolveIcon(e.icone),
    emptyText: '',
    emptyHint: '',
  }));

  // Admin sees all org prospects; commercial sees only their own
  const baseProspects = isAdmin
    ? (apiProspects.length > 0 ? apiProspects : prospects)
    : (apiProspects.length > 0 ? apiProspects : myProspects);

  // Commercial filter (admin only)
  const [filterCommercial, setFilterCommercial] = useState('');
  const effectiveProspects = (isAdmin && filterCommercial)
    ? baseProspects.filter(p => p.commercial_id === filterCommercial)
    : baseProspects;
  const prospectBasePath = isAdmin ? '/admin/prospects' : '/app/prospects';
  const activeCurrency = (Object.entries(CURRENCY_LABELS).find(([, v]) => v === currency)?.[0] || 'XOF') as Currency;

  const [activeProspect, setActiveProspect] = useState<Prospect | null>(null);

  // View Mode: 'horizontal' (classic kanban board) by default vs 'vertical' (stacked stages card view)
  const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>('horizontal');
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});

  const toggleStageExpand = (stageId: string) => {
    setExpandedStages(prev => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  // Modal States
  const [lossModalOpen, setLossModalOpen] = useState<boolean>(false);
  const [convertModalOpen, setConvertModalOpen] = useState<boolean>(false);
  const [pendingProspectId, setPendingProspectId] = useState<string | null>(null);
  const [selectedMotif, setSelectedMotif] = useState<MotifPerte>('prix_trop_eleve');

  // Conversion form state — uses org-specific offers (not SaaS platform offers)
  const activeOrgOffers = orgOffers.filter(o => o.actif);
  const [convOffre, setConvOffre] = useState<string>(activeOrgOffers[0]?.nom || '');
  const [convFrequence, setConvFrequence] = useState<string>('mensuel');
  const [convMontant, setConvMontant] = useState<string>('');
  const [convDebut, setConvDebut] = useState<string>(new Date().toISOString().split('T')[0]);
  const [convFin, setConvFin] = useState<string>('');
  const [convPaiement, setConvPaiement] = useState<ModePaiement>('wave');

  // Auto-calculate montant from org offer tarifs
  const selectedOrgOffer = activeOrgOffers.find(o => o.nom === convOffre);
  const autoMontant = selectedOrgOffer?.tarifs[convFrequence as keyof typeof selectedOrgOffer.tarifs] || 0;

  // DnD Sensors for desktop mouse & mobile touch
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = effectiveProspects.find(p => p.id === active.id);
    if (found) setActiveProspect(found);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProspect(null);

    if (!over) return;

    const prospectId = active.id as string;
    const overId = over.id as string;

    const isColumnId = columns.some(c => c.id === overId);
    let targetStep: PipelineStepId;

    if (isColumnId) {
      targetStep = overId;
    } else {
      const targetProspect = effectiveProspects.find(p => p.id === overId);
      if (!targetProspect) return;
      targetStep = targetProspect.statut_pipeline;
    }

    const currentProspect = effectiveProspects.find(p => p.id === prospectId);
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
      toast.success('Étape mise à jour !');
    }
  };

  const confirmLoss = () => {
    if (pendingProspectId) {
      updateProspectStatus(pendingProspectId, 'perdu', selectedMotif);
      setLossModalOpen(false);
      setPendingProspectId(null);
      toast.success('Prospect marqué comme perdu.');
    }
  };

  const confirmConvert = () => {
    if (pendingProspectId) {
      const montant = convMontant ? Number(convMontant) : autoMontant;
      convertProspectToClient(pendingProspectId, convOffre, {
        frequence: convFrequence,
        montant,
        modePaiement: convPaiement
      });
      setConvertModalOpen(false);
      setPendingProspectId(null);
      setConvMontant('');
      setConvOffre(activeOrgOffers[0]?.nom || '');
      setConvFrequence('mensuel');
      toast.success('Prospect converti en client !');
      navigate(user?.role === 'admin_org' ? '/admin/clients' : '/app/prospects');
    }
  };

  if (etapesLoading && etapes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-sm text-muted-foreground font-semibold animate-pulse">
          {isEn ? 'Loading pipeline...' : 'Chargement du pipeline...'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header with Responsive View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground">
              {isEn ? 'Customer Journey' : 'Parcours Client'}
            </h1>
            {isAdmin ? (
              <select
                value={filterCommercial}
                onChange={e => setFilterCommercial(e.target.value)}
                className="h-7 px-2 rounded-xl border border-input bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Tous les commerciaux</option>
                {commerciaux.filter(c => c.statut === 'actif').map(c => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                ))}
              </select>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-black flex items-center gap-1">
                <Lock className="w-3 h-3" /> {isEn ? 'Personal Portfolio' : 'Portefeuille Personnel'}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-0.5">
            {isEn 
              ? 'Ergonomic vertical or horizontal board view of your customer journey'
              : 'Suivi ergonomique vertical ou tableau horizontal de votre parcours client'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Currency Toggle */}
          <div className="flex items-center rounded-2xl bg-muted/80 p-1 border border-border/80 text-xs font-black shrink-0">
            {(['XOF', 'EUR', 'USD'] as Currency[]).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(CURRENCY_LABELS[c])}
                className={`rounded-xl px-2.5 py-1 text-[10px] sm:text-xs font-black transition-all ${
                  currency === CURRENCY_LABELS[c]
                    ? 'bg-gradient-faciloop text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {CURRENCY_LABELS[c]}
              </button>
            ))}
          </div>

          {/* Manage Stages Button (admin only) */}
          {isAdmin && (
            <button
              onClick={() => setEtapesModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-border/80 bg-muted/80 text-xs font-extrabold text-foreground hover:bg-muted transition-all shrink-0"
              title={isEn ? 'Manage pipeline stages' : 'Gérer les étapes'}
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">{isEn ? 'Stages' : 'Étapes'}</span>
            </button>
          )}

          {/* View Mode Toggle Switcher */}
          <div className="flex items-center rounded-2xl bg-muted p-1 border border-border/80 text-xs font-extrabold">
            
            <button
              onClick={() => setViewMode('horizontal')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                viewMode === 'horizontal'
                  ? 'bg-gradient-faciloop text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={isEn ? "Horizontal Multi-Column Board View" : "Vue Tableau Horizontale Multi-Colonnes"}
            >
              <Columns className="w-4 h-4" />
              <span className="hidden sm:inline">{isEn ? 'Horizontal' : 'Horizontale'}</span>
            </button>

            <button
              onClick={() => setViewMode('vertical')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                viewMode === 'vertical'
                  ? 'bg-gradient-faciloop text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={isEn ? "Vertical Stage-by-Stage View (Ideal on Mobile)" : "Vue Étape par Étape Verticale (Idéale sur Mobile)"}
            >
              <List className="w-4 h-4" />
              <span>{isEn ? 'Vertical' : 'Verticale'}</span>
            </button>
          </div>

          {/* <Link
            to={prospectBasePath}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-faciloop px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-primary/25 hover:opacity-95 active:scale-95 transition-all shrink-0"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Nouveau Prospect</span>
          </Link> */}
        </div>
      </div>

      {/* VIEW MODE 1: VERTICAL ACCORDION STACK WITH DnD (Professional UX) */}
      {viewMode === 'vertical' ? (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="space-y-4">
            {columns.map((col) => {
              const colProspects = effectiveProspects.filter(p => p.statut_pipeline === col.id);
              const totalBudget = colProspects.reduce((sum, p) => sum + (p.budget_estime || 0), 0);
              const isExpanded = expandedStages[col.id] ?? true;

              return (
                <VerticalDropZone key={col.id} col={col} isExpanded={isExpanded} isEn={isEn}>
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
                        <div className="text-xs font-semibold text-muted-foreground">
                          <span>{colProspects.length} prospect(s)</span>
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
                          <KanbanEmptyState col={col} prospectsPath={prospectBasePath} isEn={isEn} />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {colProspects.map((prospect) => (
                              <DraggableProspectCard key={prospect.id} prospect={prospect} basePath={prospectBasePath} activeCurrency={activeCurrency} />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </VerticalDropZone>
              );
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
      ) : (
        /* VIEW MODE 2: HORIZONTAL KANBAN BOARD (DndContext) */
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
            {columns.map((col) => {
              const colProspects = effectiveProspects.filter(p => p.statut_pipeline === col.id);
              return <DroppableColumn key={col.id} col={col} prospects={colProspects} basePath={prospectBasePath} activeCurrency={activeCurrency} isEn={isEn} />;
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

      {/* Gestion Etapes Pipeline Modal */}
      {isAdmin && (
        <GestionEtapesModal
          isOpen={etapesModalOpen}
          onClose={() => setEtapesModalOpen(false)}
          etapes={etapes}
          onCreate={createEtape}
          onUpdate={updateEtape}
          onDelete={removeEtape}
          onReorder={reorderEtapes}
          prospectCountByEtape={Object.fromEntries(
            etapes.map(e => [e.nom, effectiveProspects.filter(p => p.statut_pipeline === e.nom).length])
          )}
          isEn={isEn}
        />
      )}

      {/* Convert to Client Bottom Sheet Modal - Full Faciloop-dev Form */}
      <AnimatePresence>
        {convertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-left relative font-sans max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto sm:hidden mb-1" />

              <div className="flex items-center gap-3 text-emerald-500">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10">
                  <UserCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Convertir en client</h3>
                  <p className="text-[10px] text-muted-foreground">Création de l'abonnement actif</p>
                </div>
              </div>

              {/* Prospect info */}
              {pendingProspectId && (() => {
                const prospect = effectiveProspects.find(p => p.id === pendingProspectId);
                return prospect ? (
                  <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                    <p className="text-xs font-bold text-foreground">{prospect.entreprise || `${prospect.prenom} ${prospect.nom}`}</p>
                    <p className="text-[10px] text-muted-foreground">{prospect.telephone} · {prospect.pays}{prospect.ville ? `, ${prospect.ville}` : ''}</p>
                  </div>
                ) : null;
              })()}

              <div className="space-y-3">
                {/* Offre — utilise les offres propres à l'organisation */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Offre d'abonnement *</label>
                  {activeOrgOffers.length === 0 ? (
                    <p className="text-xs text-amber-600 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
                      Aucune offre configurée. Créez vos offres dans Abonnements.
                    </p>
                  ) : (
                    <select
                      value={convOffre}
                      onChange={(e) => { setConvOffre(e.target.value); setConvMontant(''); }}
                      className="w-full p-3 rounded-xl border border-input bg-background text-xs font-bold text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      {activeOrgOffers.map(offer => (
                        <option key={offer.id} value={offer.nom}>{offer.nom}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Periodicite + Montant */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Périodicité</label>
                    <select
                      value={convFrequence}
                      onChange={(e) => { setConvFrequence(e.target.value); setConvMontant(''); }}
                      className="w-full p-3 rounded-xl border border-input bg-background text-xs font-bold text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="mensuel">Mensuel</option>
                      <option value="trimestriel">Trimestriel</option>
                      <option value="annuel">Annuel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Montant (FCFA)</label>
                    <input
                      type="number"
                      value={convMontant}
                      onChange={(e) => setConvMontant(e.target.value)}
                      placeholder={autoMontant.toLocaleString('fr-FR')}
                      className="w-full p-3 rounded-xl border border-input bg-background text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                {/* Auto-calculated price info */}
                <p className="text-[11px] text-muted-foreground">
                  Tarif configuré : <span className="font-bold text-foreground">{autoMontant.toLocaleString('fr-FR')} FCFA</span>
                  {convMontant && Number(convMontant) !== autoMontant && (
                    <span className="text-amber-600 ml-1">(montant modifié manuellement)</span>
                  )}
                </p>

                {/* Mode de paiement */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Mode de paiement</label>
                  <select
                    value={convPaiement}
                    onChange={(e) => setConvPaiement(e.target.value as ModePaiement)}
                    className="w-full p-3 rounded-xl border border-input bg-background text-xs font-bold text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="wave">Wave</option>
                    <option value="orange_money">Orange Money</option>
                    <option value="paytech">PayTech</option>
                    <option value="stripe">Stripe</option>
                    <option value="virement">Virement</option>
                    <option value="especes">Espèces</option>
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Date début *</label>
                    <input
                      type="date"
                      value={convDebut}
                      onChange={(e) => setConvDebut(e.target.value)}
                      className="w-full p-3 rounded-xl border border-input bg-background text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Date fin</label>
                    <input
                      type="date"
                      value={convFin}
                      onChange={(e) => setConvFin(e.target.value)}
                      className="w-full p-3 rounded-xl border border-input bg-background text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
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
                  disabled={!convOffre || !convDebut}
                  className="w-full sm:w-1/2 py-3 rounded-2xl bg-emerald-500 text-white text-xs font-extrabold hover:bg-emerald-600 shadow-md shadow-emerald-500/25 disabled:opacity-50"
                >
                  Confirmer la conversion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
