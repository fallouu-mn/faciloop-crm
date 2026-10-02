import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  DEFAULT_SOURCES,
  getCustomSources,
  addCustomSource,
  updateCustomSource,
  deleteCustomSource,
  type SourceOption,
  type SourceCustomRow,
} from '@/services/sourcesConfig';

export function useSourcesConfig() {
  const { user } = useAuth();
  const orgId = user?.organizationId;
  const queryClient = useQueryClient();

  const { data: customRows = [], isLoading } = useQuery({
    queryKey: ['sources_custom', orgId],
    queryFn: () => getCustomSources(orgId!),
    enabled: !!orgId,
    staleTime: 60_000,
  });

  const allSources: SourceOption[] = (() => {
    const custom: SourceOption[] = customRows.map(r => ({
      value: r.value,
      label: r.label,
      actif: r.actif,
      ordre: r.ordre,
    }));
    const customValues = new Set(custom.map(c => c.value));
    const defaults = DEFAULT_SOURCES.filter(d => !customValues.has(d.value)).map(d => ({ ...d }));
    return [...defaults, ...custom]
      .filter(s => s.actif)
      .sort((a, b) => a.ordre - b.ordre);
  })();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['sources_custom', orgId] });

  const addSource = useMutation({
    mutationFn: (source: { value: string; label: string; ordre?: number }) =>
      addCustomSource({
        organization_id: orgId!,
        value: source.value,
        label: source.label,
        actif: true,
        ordre: source.ordre ?? allSources.length,
      }),
    onSuccess: invalidate,
  });

  const editSource = useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<Pick<SourceCustomRow, 'label' | 'actif' | 'ordre'>>) =>
      updateCustomSource(id, updates),
    onSuccess: invalidate,
  });

  const removeSource = useMutation({
    mutationFn: (id: string) => deleteCustomSource(id),
    onSuccess: invalidate,
  });

  return {
    sources: allSources,
    customRows,
    isLoading,
    addSource,
    editSource,
    removeSource,
  };
}
