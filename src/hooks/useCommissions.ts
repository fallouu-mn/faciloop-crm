import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as commissionsService from '@/services/commissions';

interface Commission {
  id: string;
  organization_id: string;
  commercial_id: string;
  commercial_nom?: string;
  client_nom: string;
  formule: string;
  periodicite: string;
  montant_vente: number;
  taux_commission: number;
  montant_commission: number;
  date_vente: string;
  statut: 'a_verser' | 'verse' | 'annule';
  created_at: string;
}

export function useCommissions() {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = user.role === 'commercial' && user.commercialId
        ? await commissionsService.getCommissionsByCommercial(user.commercialId)
        : await commissionsService.getCommissions(user.organizationId);
      setCommissions(data as Commission[]);
    } catch (e: any) {
      setError(e.message || 'Erreur chargement commissions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalAVerser = commissions
    .filter(c => c.statut === 'a_verser')
    .reduce((sum, c) => sum + c.montant_commission, 0);

  const totalVerse = commissions
    .filter(c => c.statut === 'verse')
    .reduce((sum, c) => sum + c.montant_commission, 0);

  return { commissions, totalAVerser, totalVerse, loading, error, refetch: fetch };
}
