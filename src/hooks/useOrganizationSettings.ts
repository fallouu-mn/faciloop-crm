import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import * as orgSettingsService from '@/services/organizationSettings';
import { buildSourceOptions } from '@/services/organizationSettings';
import type { CustomFieldDef, OrganizationSettings } from '@/types/crm';

export interface OrganizationSettingsApi {
  isLoading: boolean;
  settings: OrganizationSettings | undefined;
  /** Schéma des champs dynamiques prospects (retour client n°4). */
  prospectFields: CustomFieldDef[];
  /** Sources = valeurs par défaut + sources custom de l'org (retour client n°6). */
  sourceOptions: { value: string; label: string }[];
  saveProspectFields: (schema: CustomFieldDef[]) => Promise<void>;
  saveCustomSources: (sources: string[]) => Promise<void>;
  refetch: () => void;
}

/**
 * Paramètres de l'organisation (champs dynamiques + sources personnalisées).
 * Partagé par les pages Paramètres, les formulaires de création et les fiches détails.
 */
export function useOrganizationSettings(): OrganizationSettingsApi {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const organizationId = user?.organizationId || '';

  const query = useQuery({
    queryKey: ['organization-settings', organizationId],
    queryFn: () => orgSettingsService.getOrganizationSettings(organizationId),
    enabled: !!organizationId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['organization-settings', organizationId] });

  const fieldsMutation = useMutation({
    mutationFn: (schema: CustomFieldDef[]) =>
      orgSettingsService.saveOrganizationSettings(organizationId, {
        prospect_custom_fields_schema: schema,
      }),
    onSuccess: () => {
      invalidate();
      toast.success('Champs personnalisés enregistrés');
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur lors de l\'enregistrement'),
  });

  const sourcesMutation = useMutation({
    mutationFn: (sources: string[]) =>
      orgSettingsService.saveOrganizationSettings(organizationId, { custom_sources: sources }),
    onSuccess: () => {
      invalidate();
      toast.success('Sources enregistrées');
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur lors de l\'enregistrement'),
  });

  const settings = query.data;
  const prospectFields = settings?.prospect_custom_fields_schema ?? [];

  return {
    isLoading: query.isLoading,
    settings,
    prospectFields,
    sourceOptions: buildSourceOptions(settings?.custom_sources ?? []),
    saveProspectFields: (schema) => fieldsMutation.mutateAsync(schema),
    saveCustomSources: (sources) => sourcesMutation.mutateAsync(sources),
    refetch: () => invalidate(),
  };
}
