import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as objectifsService from '@/services/objectifs';
import type { ObjectifCommercial } from '@/types/crm';

export function useObjectifs() {
  const { user } = useAuth();
  const [objectifs, setObjectifs] = useState<ObjectifCommercial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = user.role === 'commercial' && user.commercialId
        ? await objectifsService.getObjectifsByCommercial(user.commercialId)
        : await objectifsService.getObjectifs(user.organizationId);
      setObjectifs(data);
    } catch (e: any) {
      setError(e.message || 'Erreur chargement objectifs');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (objectif: Omit<ObjectifCommercial, 'id' | 'created_at'>) => {
    const created = await objectifsService.createObjectif(objectif);
    setObjectifs(prev => [created, ...prev]);
    return created;
  };

  const update = async (id: string, updates: Partial<ObjectifCommercial>) => {
    const updated = await objectifsService.updateObjectif(id, updates);
    setObjectifs(prev => prev.map(o => o.id === id ? updated : o));
    return updated;
  };

  const remove = async (id: string) => {
    await objectifsService.deleteObjectif(id);
    setObjectifs(prev => prev.filter(o => o.id !== id));
  };

  return { objectifs, loading, error, refetch: fetch, create, update, remove };
}
