import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as etapesService from '@/services/etapesPipeline';
import type { EtapePipeline } from '@/services/etapesPipeline';

export type { EtapePipeline };

const DEFAULT_LABELS_EN: Record<string, string> = {
  nouveau: 'New',
  a_contacter: 'To Contact',
  contacte: 'Contacted',
  interesse: 'Interested',
  rdv_programme: 'Meeting Set',
  demo_realisee: 'Demo Done',
  essai_en_cours: 'Trial Ongoing',
  proposition: 'Proposal',
  paiement_att: 'Payment Pending',
  gagne: 'Won Client',
  a_relancer: 'To Follow-up',
  perdu: 'Lost',
};

export function getEtapeLabel(etape: EtapePipeline, isEn: boolean): string {
  if (isEn && DEFAULT_LABELS_EN[etape.nom]) return DEFAULT_LABELS_EN[etape.nom];
  return etape.label;
}

export function getEtapeLabelByNom(nom: string, etapes: EtapePipeline[], isEn: boolean): string {
  const etape = etapes.find(e => e.nom === nom);
  if (!etape) return nom.replace(/_/g, ' ');
  return getEtapeLabel(etape, isEn);
}

export function useEtapesPipeline() {
  const { user } = useAuth();
  const [etapes, setEtapes] = useState<EtapePipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user?.organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await etapesService.getEtapesPipeline(user.organizationId);
      setEtapes(data);
    } catch (e: any) {
      setError(e.message || 'Erreur chargement étapes pipeline');
    } finally {
      setLoading(false);
    }
  }, [user?.organizationId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (etape: Pick<EtapePipeline, 'nom' | 'label' | 'couleur' | 'badge_bg' | 'icone'>) => {
    if (!user?.organizationId) throw new Error('Pas d\'organisation');
    const maxOrdre = etapes.length > 0 ? Math.max(...etapes.map(e => e.ordre)) : 0;
    const created = await etapesService.createEtape({
      ...etape,
      organization_id: user.organizationId,
      ordre: maxOrdre + 1,
    });
    setEtapes(prev => [...prev, created].sort((a, b) => a.ordre - b.ordre));
    return created;
  };

  const update = async (id: string, updates: Partial<Pick<EtapePipeline, 'label' | 'couleur' | 'badge_bg' | 'icone'>>) => {
    const updated = await etapesService.updateEtape(id, updates);
    setEtapes(prev => prev.map(e => e.id === id ? updated : e));
    return updated;
  };

  const remove = async (id: string) => {
    await etapesService.deleteEtape(id);
    setEtapes(prev => prev.filter(e => e.id !== id));
  };

  const reorder = async (reordered: EtapePipeline[]) => {
    const withNewOrdre = reordered.map((e, i) => ({ ...e, ordre: i + 1 }));
    setEtapes(withNewOrdre);
    await etapesService.reorderEtapes(withNewOrdre.map(e => ({ id: e.id, ordre: e.ordre })));
  };

  return { etapes, loading, error, refetch: fetch, create, update, remove, reorder };
}
