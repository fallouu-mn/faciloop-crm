import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import * as prospectsService from '@/services/commercial/prospects.service';
import type { Prospect } from '@/types/crm';

const AUTO_REFETCH_INTERVAL = 3000; // 3 secondes

export function useProspects() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const organizationId = user?.organizationId || '';
  const commercialId = user?.role === 'commercial' ? user?.commercialId : undefined;

  const query = useQuery({
    queryKey: ['commercial', 'prospects', organizationId, commercialId],
    queryFn: () => prospectsService.getProspects(organizationId, commercialId),
    enabled: !!organizationId,
    refetchInterval: AUTO_REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  const createMutation = useMutation({
    mutationFn: (prospect: Omit<Prospect, 'id' | 'created_at'>) =>
      prospectsService.createProspect({
        ...prospect,
        organization_id: organizationId,
        commercial_id: prospect.commercial_id || commercialId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success('Prospect créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la création du prospect');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Prospect> }) =>
      prospectsService.updateProspect(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success('Prospect mis à jour');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la mise à jour du prospect');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => prospectsService.deleteProspect(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success('Prospect supprimé');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la suppression du prospect');
    },
  });

  const updatePipelineMutation = useMutation({
    mutationFn: ({ id, statut_pipeline }: { id: string; statut_pipeline: string }) =>
      prospectsService.updateProspectPipeline(id, statut_pipeline),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success('Étape du pipeline mise à jour');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la mise à jour du pipeline');
    },
  });

  const reassignMutation = useMutation({
    mutationFn: ({ ids, newCommercialId, newCommercialNom }: { ids: string[]; newCommercialId: string; newCommercialNom?: string }) =>
      prospectsService.reassignProspects(ids, newCommercialId, newCommercialNom),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success('Prospect(s) réattribué(s) avec succès');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la réattribution');
    },
  });

  const importMutation = useMutation({
    mutationFn: (prospectsData: Omit<Prospect, 'id' | 'created_at'>[]) =>
      prospectsService.importProspects(prospectsData),
    onSuccess: (imported) => {
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      queryClient.refetchQueries({ queryKey: ['commercial'] });
      toast.success(`${imported.length} prospect(s) importé(s) avec succès`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de l\'importation');
    },
  });

  return {
    prospects: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    createProspect: createMutation.mutateAsync,
    updateProspect: (id: string, updates: Partial<Prospect>) => updateMutation.mutateAsync({ id, updates }),
    deleteProspect: deleteMutation.mutateAsync,
    updatePipeline: (id: string, statut_pipeline: string) => updatePipelineMutation.mutateAsync({ id, statut_pipeline }),
    reassignProspects: (ids: string[], newCommercialId: string, newCommercialNom?: string) =>
      reassignMutation.mutateAsync({ ids, newCommercialId, newCommercialNom }),
    importProspects: importMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useProspectDetail(id?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['commercial', 'prospect', id],
    queryFn: () => (id ? prospectsService.getProspectById(id) : null),
    enabled: !!id,
    refetchInterval: AUTO_REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  return {
    prospect: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
