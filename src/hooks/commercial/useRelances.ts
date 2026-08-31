import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import * as relancesService from '@/services/commercial/relances.service';
import type { Relance } from '@/types/crm';

const AUTO_REFETCH_INTERVAL = 3000; // 3 secondes

export function useRelances() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const organizationId = user?.organizationId || '';
  const commercialId = user?.role === 'commercial' ? user?.commercialId : undefined;

  const query = useQuery({
    queryKey: ['commercial', 'relances', organizationId, commercialId],
    queryFn: () => relancesService.getRelances(organizationId, commercialId),
    enabled: !!organizationId,
    refetchInterval: AUTO_REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  const createMutation = useMutation({
    mutationFn: (relance: Omit<Relance, 'id' | 'created_at'>) =>
      relancesService.createRelance({
        ...relance,
        organization_id: organizationId,
        commercial_id: relance.commercial_id || commercialId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success('Relance programmée avec succès');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la création de la relance');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Relance> }) =>
      relancesService.updateRelance(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success('Relance mise à jour');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la mise à jour de la relance');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => relancesService.deleteRelance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success('Relance supprimée');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la suppression de la relance');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => relancesService.completeRelance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success('Relance marquée comme réalisée');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la validation de la relance');
    },
  });

  return {
    relances: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    createRelance: createMutation.mutateAsync,
    updateRelance: (id: string, updates: Partial<Relance>) => updateMutation.mutateAsync({ id, updates }),
    deleteRelance: deleteMutation.mutateAsync,
    completeRelance: completeMutation.mutateAsync,
  };
}
