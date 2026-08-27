import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as prospectsService from '@/services/prospects';
import type { Prospect } from '@/types/crm';

export function useProspects() {
  const { user } = useAuth();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = user.role === 'commercial' && user.commercialId
        ? await prospectsService.getProspectsByCommercial(user.commercialId)
        : await prospectsService.getProspects(user.organizationId);
      setProspects(data);
    } catch (e: any) {
      setError(e.message || 'Erreur chargement prospects');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (prospect: Omit<Prospect, 'id' | 'created_at'>) => {
    const created = await prospectsService.createProspect(prospect);
    setProspects(prev => [created, ...prev]);
    return created;
  };

  const update = async (id: string, updates: Partial<Prospect>) => {
    const updated = await prospectsService.updateProspect(id, updates);
    setProspects(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const remove = async (id: string) => {
    await prospectsService.deleteProspect(id);
    setProspects(prev => prev.filter(p => p.id !== id));
  };

  const updatePipeline = async (id: string, statut_pipeline: string) => {
    const updated = await prospectsService.updateProspectPipeline(id, statut_pipeline);
    setProspects(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  return { prospects, loading, error, refetch: fetch, create, update, remove, updatePipeline };
}
