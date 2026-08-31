import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import * as paiementsService from '@/services/commercial/paiements.service';
import type { Paiement } from '@/types/crm';

const AUTO_REFETCH_INTERVAL = 3000; // 3 secondes

export function usePaiements() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const organizationId = user?.organizationId || '';
  const commercialId = user?.role === 'commercial' ? user?.commercialId : undefined;

  const query = useQuery({
    queryKey: ['commercial', 'paiements', organizationId, commercialId],
    queryFn: () => paiementsService.getPaiements(organizationId, commercialId),
    enabled: !!organizationId,
    refetchInterval: AUTO_REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  const createMutation = useMutation({
    mutationFn: (paiement: Omit<Paiement, 'id' | 'created_at'>) =>
      paiementsService.createPaiement({
        ...paiement,
        organization_id: organizationId,
        commercial_id: paiement.commercial_id || commercialId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success('Paiement enregistré avec succès');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de l\'enregistrement du paiement');
    },
  });

  return {
    paiements: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createPaiement: createMutation.mutateAsync,
  };
}
