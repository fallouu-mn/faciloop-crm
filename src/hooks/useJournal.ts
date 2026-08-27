import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as journalService from '@/services/journal';
import type { ActionLog } from '@/types/crm';

export function useJournal() {
  const { user } = useAuth();
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = user.role === 'commercial' && user.authId
        ? await journalService.getActionLogsByUser(user.authId)
        : await journalService.getActionLogs(user.organizationId);
      setActions(data);
    } catch (e: any) {
      setError(e.message || 'Erreur chargement journal');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const log = async (logEntry: Omit<ActionLog, 'id' | 'created_at'>) => {
    if (!user) return;
    const entry = await journalService.createActionLog(logEntry);
    setActions(prev => [entry, ...prev]);
    return entry;
  };

  return { actions, loading, error, refetch: fetch, log };
}
