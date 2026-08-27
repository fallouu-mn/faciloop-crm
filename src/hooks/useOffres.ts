import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as offresService from '@/services/offres';

interface Offre {
  id: string;
  organization_id: string;
  nom: string;
  description?: string;
  tarif_mensuel: number;
  tarif_trimestriel: number;
  tarif_annuel: number;
  actif: boolean;
  created_at: string;
}

export function useOffres() {
  const { user } = useAuth();
  const [offres, setOffres] = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await offresService.getOffres(user.organizationId);
      setOffres(data as Offre[]);
    } catch (e: any) {
      setError(e.message || 'Erreur chargement offres');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (offre: Omit<Offre, 'id' | 'created_at'>) => {
    const created = await offresService.createOffre(offre) as Offre;
    setOffres(prev => [created, ...prev]);
    return created;
  };

  const update = async (id: string, updates: Partial<Offre>) => {
    const updated = await offresService.updateOffre(id, updates) as Offre;
    setOffres(prev => prev.map(o => o.id === id ? updated : o));
    return updated;
  };

  const remove = async (id: string) => {
    await offresService.deleteOffre(id);
    setOffres(prev => prev.filter(o => o.id !== id));
  };

  const toggle = async (id: string, actif: boolean) => {
    const updated = await offresService.toggleOffreActif(id, actif) as Offre;
    setOffres(prev => prev.map(o => o.id === id ? updated : o));
    return updated;
  };

  const activeOffres = offres.filter(o => o.actif);

  return { offres, activeOffres, loading, error, refetch: fetch, create, update, remove, toggle };
}
