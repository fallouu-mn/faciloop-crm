import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import * as interactionsService from '@/services/commercial/interactions.service';
import type { Interaction } from '@/types/crm';

const AUTO_REFETCH_INTERVAL = 3000; // 3 secondes

export function useInteractions(prospectId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['commercial', 'interactions', prospectId],
    queryFn: () => (prospectId ? interactionsService.getInteractions(prospectId) : []),
    enabled: !!prospectId,
    refetchInterval: AUTO_REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  const createMutation = useMutation({
    mutationFn: (interaction: Omit<Interaction, 'id' | 'created_at'>) =>
      interactionsService.createInteraction({
        ...interaction,
        organization_id: user?.organizationId || interaction.organization_id || '',
        commercial_id: interaction.commercial_id || (user?.role === 'commercial' ? user?.commercialId : undefined),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success('Interaction enregistrée');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de l\'enregistrement de l\'interaction');
    },
  });

  return {
    interactions: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createInteraction: createMutation.mutateAsync,
  };
}
