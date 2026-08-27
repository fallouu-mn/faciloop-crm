import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as relancesService from '@/services/relances';
import type { Relance } from '@/types/crm';

export function useRelances() {
  const { user } = useAuth();
  const [relances, setRelances] = useState<Relance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = user.role === 'commercial' && user.commercialId
        ? await relancesService.getRelancesByCommercial(user.commercialId)
        : await relancesService.getRelances(user.organizationId);
      setRelances(data);
    } catch (e: any) {
      setError(e.message || 'Erreur chargement relances');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (relance: Omit<Relance, 'id' | 'created_at'>) => {
    const created = await relancesService.createRelance(relance);
    setRelances(prev => [created, ...prev]);
    return created;
  };

  const update = async (id: string, updates: Partial<Relance>) => {
    const updated = await relancesService.updateRelance(id, updates);
    setRelances(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  };

  const complete = async (id: string) => {
    const updated = await relancesService.completeRelance(id);
    setRelances(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  };

  const remove = async (id: string) => {
    await relancesService.deleteRelance(id);
    setRelances(prev => prev.filter(r => r.id !== id));
  };

  return { relances, loading, error, refetch: fetch, create, update, complete, remove };
}
