import React, { useState } from 'react';
import { X, Plus, GripVertical, Pencil, Trash2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { EtapePipeline } from '@/services/etapesPipeline';

const COULEURS = [
  { couleur: 'border-blue-500', badge: 'bg-blue-500/10 text-blue-500', label: 'Bleu' },
  { couleur: 'border-sky-500', badge: 'bg-sky-500/10 text-sky-500', label: 'Ciel' },
  { couleur: 'border-indigo-500', badge: 'bg-indigo-500/10 text-indigo-500', label: 'Indigo' },
  { couleur: 'border-cyan-500', badge: 'bg-cyan-500/10 text-cyan-500', label: 'Cyan' },
  { couleur: 'border-purple-500', badge: 'bg-purple-500/10 text-purple-500', label: 'Violet' },
  { couleur: 'border-teal-500', badge: 'bg-teal-500/10 text-teal-500', label: 'Teal' },
  { couleur: 'border-amber-500', badge: 'bg-amber-500/10 text-amber-500', label: 'Ambre' },
  { couleur: 'border-orange-500', badge: 'bg-orange-500/10 text-orange-500', label: 'Orange' },
  { couleur: 'border-emerald-500', badge: 'bg-emerald-500/10 text-emerald-500', label: 'Émeraude' },
  { couleur: 'border-yellow-500', badge: 'bg-yellow-500/10 text-yellow-500', label: 'Jaune' },
  { couleur: 'border-rose-500', badge: 'bg-rose-500/10 text-rose-500', label: 'Rose' },
  { couleur: 'border-pink-500', badge: 'bg-pink-500/10 text-pink-500', label: 'Pink' },
  { couleur: 'border-lime-500', badge: 'bg-lime-500/10 text-lime-500', label: 'Lime' },
  { couleur: 'border-red-500', badge: 'bg-red-500/10 text-red-500', label: 'Rouge' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  etapes: EtapePipeline[];
  onCreate: (etape: Pick<EtapePipeline, 'nom' | 'label' | 'couleur' | 'badge_bg' | 'icone'>) => Promise<EtapePipeline>;
  onUpdate: (id: string, updates: Partial<Pick<EtapePipeline, 'label' | 'couleur' | 'badge_bg' | 'icone'>>) => Promise<EtapePipeline>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (reordered: EtapePipeline[]) => Promise<void>;
  prospectCountByEtape?: Record<string, number>;
  isEn?: boolean;
}

export const GestionEtapesModal: React.FC<Props> = ({
  isOpen, onClose, etapes, onCreate, onUpdate, onDelete, onReorder, prospectCountByEtape = {}, isEn = false,
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [newCouleurIdx, setNewCouleurIdx] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editCouleurIdx, setEditCouleurIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const slugify = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    const nom = slugify(newLabel.trim());
    if (etapes.some(e => e.nom === nom)) {
      toast.error(isEn ? 'A stage with this name already exists' : 'Une étape avec ce nom existe déjà');
      return;
    }
    setLoading(true);
    try {
      const c = COULEURS[newCouleurIdx];
      await onCreate({ nom, label: newLabel.trim(), couleur: c.couleur, badge_bg: c.badge, icone: 'Circle' });
      setNewLabel('');
      toast.success(isEn ? 'Stage created' : 'Étape créée');
    } catch {
      toast.error(isEn ? 'Error creating stage' : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editLabel.trim()) return;
    setLoading(true);
    try {
      const c = COULEURS[editCouleurIdx];
      await onUpdate(id, { label: editLabel.trim(), couleur: c.couleur, badge_bg: c.badge });
      setEditingId(null);
      toast.success(isEn ? 'Stage updated' : 'Étape modifiée');
    } catch {
      toast.error(isEn ? 'Error updating stage' : 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (etape: EtapePipeline) => {
    if (etapes.length <= 2) {
      toast.error(isEn ? 'You must keep at least 2 stages' : 'Vous devez garder au moins 2 étapes');
      return;
    }
    setConfirmDeleteId(etape.id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setLoading(true);
    try {
      await onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
      toast.success(isEn ? 'Stage deleted' : 'Étape supprimée');
    } catch {
      toast.error(isEn ? 'Error deleting stage' : 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (etape: EtapePipeline) => {
    setEditingId(etape.id);
    setEditLabel(etape.label);
    const idx = COULEURS.findIndex(c => c.couleur === etape.couleur);
    setEditCouleurIdx(idx >= 0 ? idx : 0);
  };

  const moveEtape = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= etapes.length) return;
    const reordered = [...etapes];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    try {
      await onReorder(reordered);
    } catch {
      toast.error(isEn ? 'Error reordering' : 'Erreur lors du réordonnancement');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl shadow-2xl font-sans max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border/60">
          <div className="sm:hidden w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto absolute top-2 left-1/2 -translate-x-1/2" />
          <h3 className="font-extrabold text-base text-foreground">
            {isEn ? 'Manage Pipeline Stages' : 'Gérer les étapes du pipeline'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Stage List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5">
          {etapes.map((etape, idx) => (
            <div
              key={etape.id}
              className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                editingId === etape.id ? 'border-primary bg-primary/5' : 'border-border/60 bg-card hover:bg-muted/40'
              }`}
            >
              {/* Drag Handle + Order */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  className="cursor-grab text-muted-foreground hover:text-foreground"
                  onMouseDown={() => setDragIdx(idx)}
                  title={isEn ? 'Drag to reorder' : 'Glisser pour réordonner'}
                >
                  <GripVertical className="w-4 h-4" />
                </button>
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveEtape(idx, idx - 1)}
                    disabled={idx === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-[10px] leading-none"
                  >▲</button>
                  <button
                    onClick={() => moveEtape(idx, idx + 1)}
                    disabled={idx === etapes.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-[10px] leading-none"
                  >▼</button>
                </div>
              </div>

              {/* Color indicator */}
              <div className={`w-3 h-8 rounded-full ${etape.couleur.replace('border-', 'bg-')} shrink-0`} />

              {editingId === etape.id ? (
                <>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    className="flex-1 h-8 px-2 rounded-lg border border-input bg-background text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/30"
                    autoFocus
                  />
                  <select
                    value={editCouleurIdx}
                    onChange={e => setEditCouleurIdx(Number(e.target.value))}
                    className="h-8 px-1 rounded-lg border border-input bg-background text-[10px] font-bold text-foreground"
                  >
                    {COULEURS.map((c, i) => (
                      <option key={i} value={i}>{c.label}</option>
                    ))}
                  </select>
                  <button onClick={() => handleUpdate(etape.id)} disabled={loading} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-foreground truncate block">{idx + 1}. {etape.label}</span>
                    {etape.is_default && (
                      <span className="text-[9px] text-muted-foreground font-medium">
                        {isEn ? 'Default' : 'Par défaut'}
                      </span>
                    )}
                  </div>
                  <button onClick={() => startEdit(etape)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground shrink-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => requestDelete(etape)} disabled={loading} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Delete Confirmation */}
        {confirmDeleteId && (() => {
          const etape = etapes.find(e => e.id === confirmDeleteId);
          const count = etape ? (prospectCountByEtape[etape.nom] || 0) : 0;
          return (
            <div className="px-5 py-3 border-t border-rose-500/30 bg-rose-500/5 space-y-2">
              <p className="text-xs font-bold text-rose-600">
                {isEn
                  ? `Delete "${etape?.label}"?${count > 0 ? ` ${count} prospect(s) will become invisible in the pipeline.` : ''}`
                  : `Supprimer « ${etape?.label} » ?${count > 0 ? ` ${count} prospect(s) deviendront invisibles dans le pipeline.` : ''}`
                }
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-3 py-1.5 rounded-lg border border-input text-xs font-bold text-foreground hover:bg-muted"
                >
                  {isEn ? 'Cancel' : 'Annuler'}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 disabled:opacity-50"
                >
                  {isEn ? 'Confirm delete' : 'Confirmer la suppression'}
                </button>
              </div>
            </div>
          );
        })()}

        {/* Create New Stage */}
        <div className="px-5 py-4 border-t border-border/60 space-y-3">
          <p className="text-xs font-bold text-foreground">{isEn ? 'Add a new stage' : 'Ajouter une nouvelle étape'}</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder={isEn ? 'Stage name...' : "Nom de l'étape..."}
              className="flex-1 h-9 px-3 rounded-xl border border-input bg-background text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <select
              value={newCouleurIdx}
              onChange={e => setNewCouleurIdx(Number(e.target.value))}
              className="h-9 px-2 rounded-xl border border-input bg-background text-[10px] font-bold text-foreground"
            >
              {COULEURS.map((c, i) => (
                <option key={i} value={i}>{c.label}</option>
              ))}
            </select>
            <button
              onClick={handleCreate}
              disabled={loading || !newLabel.trim()}
              className="h-9 px-4 rounded-xl bg-gradient-faciloop text-white text-xs font-extrabold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              {isEn ? 'Add' : 'Ajouter'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
