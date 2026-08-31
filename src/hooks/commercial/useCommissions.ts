import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import * as commissionsService from '@/services/commercial/commissions.service';
import type { Commission } from '@/types/crm';

const AUTO_REFETCH_INTERVAL = 3000; // 3 secondes

export function useCommissions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const organizationId = user?.organizationId || '';
  const commercialId = user?.role === 'commercial' ? user?.commercialId : undefined;

  const query = useQuery({
    queryKey: ['commercial', 'commissions', organizationId, commercialId],
    queryFn: () => commissionsService.getCommissions(organizationId, commercialId),
    enabled: !!organizationId,
    refetchInterval: AUTO_REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  const createMutation = useMutation({
    mutationFn: (commission: Omit<Commission, 'id' | 'created_at'>) =>
      commissionsService.createCommission({
        ...commission,
        organization_id: organizationId,
        commercial_id: commission.commercial_id || commercialId || '',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success('Commission enregistrée');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de l\'enregistrement de la commission');
    },
  });

  return {
    commissions: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createCommission: createMutation.mutateAsync,
  };
}
