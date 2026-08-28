import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as paiementsService from '@/services/paiements';
import type { Paiement } from '@/types/crm';

export function usePaiements() {
  const { user } = useAuth();
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await paiementsService.getPaiements(user.organizationId);
      setPaiements(data);
    } catch (e: any) {
      setError(e.message || 'Erreur chargement paiements');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (paiement: Omit<Paiement, 'id' | 'created_at'>) => {
    const created = await paiementsService.createPaiement(paiement);
    setPaiements(prev => [created, ...prev]);
    return created;
  };

  const update = async (id: string, updates: Partial<Paiement>) => {
    const updated = await paiementsService.updatePaiement(id, updates);
    setPaiements(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const validate = async (id: string, reference?: string) => {
    const updated = await paiementsService.validatePaiement(id, reference);
    setPaiements(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const remove = async (id: string) => {
    await paiementsService.deletePaiement(id);
    setPaiements(prev => prev.filter(p => p.id !== id));
  };

  return { paiements, loading, error, refetch: fetch, create, update, validate, remove };
}
