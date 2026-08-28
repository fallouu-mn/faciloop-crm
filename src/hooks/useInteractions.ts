import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as interactionsService from '@/services/interactions';
import type { Interaction } from '@/types/crm';

export function useInteractions(prospectId?: string) {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let data: Interaction[];
      if (prospectId) {
        data = await interactionsService.getInteractionsByProspect(prospectId);
      } else if (user.role === 'commercial' && user.commercialId) {
        data = await interactionsService.getInteractionsByCommercial(user.commercialId);
      } else {
        data = await interactionsService.getInteractions(user.organizationId);
      }
      setInteractions(data);
    } catch (e: any) {
      setError(e.message || 'Erreur chargement interactions');
    } finally {
      setLoading(false);
    }
  }, [user, prospectId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (interaction: Omit<Interaction, 'id' | 'created_at'>) => {
    const created = await interactionsService.createInteraction(interaction);
    setInteractions(prev => [created, ...prev]);
    return created;
  };

  const update = async (id: string, updates: Partial<Interaction>) => {
    const updated = await interactionsService.updateInteraction(id, updates);
    setInteractions(prev => prev.map(i => i.id === id ? updated : i));
    return updated;
  };

  const remove = async (id: string) => {
    await interactionsService.deleteInteraction(id);
    setInteractions(prev => prev.filter(i => i.id !== id));
  };

  return { interactions, loading, error, refetch: fetch, create, update, remove };
}
