import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import * as objectifsService from '@/services/commercial/objectifs.service';
import type { ObjectifCommercial } from '@/types/crm';

const AUTO_REFETCH_INTERVAL = 3000; // 3 secondes

export function useObjectifs() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const organizationId = user?.organizationId || '';
  const commercialId = user?.role === 'commercial' ? user?.commercialId : undefined;

  const query = useQuery({
    queryKey: ['commercial', 'objectifs', organizationId, commercialId],
    queryFn: () => objectifsService.getObjectifs(organizationId, commercialId),
    enabled: !!organizationId,
    refetchInterval: AUTO_REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  const createMutation = useMutation({
    mutationFn: (objectif: Omit<ObjectifCommercial, 'id' | 'created_at'>) =>
      objectifsService.createObjectif({
        ...objectif,
        organization_id: organizationId,
        commercial_id: objectif.commercial_id || commercialId || '',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success('Objectif ajouté avec succès');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la création de l\'objectif');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ObjectifCommercial> }) =>
      objectifsService.updateObjectif(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success('Objectif mis à jour');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la mise à jour de l\'objectif');
    },
  });

  return {
    objectifs: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createObjectif: createMutation.mutateAsync,
    updateObjectif: (id: string, updates: Partial<ObjectifCommercial>) => updateMutation.mutateAsync({ id, updates }),
  };
}
