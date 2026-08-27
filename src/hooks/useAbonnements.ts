import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as abonnementsService from '@/services/abonnements';
import type { Abonnement } from '@/types/crm';

export function useAbonnements() {
  const { user } = useAuth();
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await abonnementsService.getAbonnements(user.organizationId);
      setAbonnements(data);
    } catch (e: any) {
      setError(e.message || 'Erreur chargement abonnements');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (abonnement: Omit<Abonnement, 'id' | 'created_at'>) => {
    const created = await abonnementsService.createAbonnement(abonnement);
    setAbonnements(prev => [created, ...prev]);
    return created;
  };

  const update = async (id: string, updates: Partial<Abonnement>) => {
    const updated = await abonnementsService.updateAbonnement(id, updates);
    setAbonnements(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  };

  const remove = async (id: string) => {
    await abonnementsService.deleteAbonnement(id);
    setAbonnements(prev => prev.filter(a => a.id !== id));
  };

  return { abonnements, loading, error, refetch: fetch, create, update, remove };
}
