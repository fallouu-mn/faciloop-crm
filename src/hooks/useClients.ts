import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as clientsService from '@/services/clients';
import type { ClientFaciloop } from '@/types/crm';

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientFaciloop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = user.role === 'commercial' && user.commercialId
        ? await clientsService.getClientsByCommercial(user.commercialId)
        : await clientsService.getClients(user.organizationId);
      setClients(data);
    } catch (e: any) {
      setError(e.message || 'Erreur chargement clients');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (client: Omit<ClientFaciloop, 'id' | 'created_at'>) => {
    const created = await clientsService.createClient(client);
    setClients(prev => [created, ...prev]);
    return created;
  };

  const update = async (id: string, updates: Partial<ClientFaciloop>) => {
    const updated = await clientsService.updateClient(id, updates);
    setClients(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const remove = async (id: string) => {
    await clientsService.deleteClient(id);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return { clients, loading, error, refetch: fetch, create, update, remove };
}
