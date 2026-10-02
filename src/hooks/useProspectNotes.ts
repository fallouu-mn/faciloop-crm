import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getNotesByProspect, createNote, deleteNote, type ProspectNote } from '@/services/prospectNotes';
import { createNotification } from '@/services/notifications';

export function useProspectNotes(prospectId?: string) {
  const { user, prospects } = useAuth();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['prospect_notes', prospectId],
    queryFn: () => getNotesByProspect(prospectId!),
    enabled: !!prospectId,
    refetchInterval: 10_000,
  });

  const addNote = useMutation({
    mutationFn: (params: { contenu: string; mentionedUserIds: string[] }) =>
      createNote({
        prospect_id: prospectId!,
        organization_id: user!.organizationId,
        author_id: user!.id,
        author_nom: `${user!.prenom} ${user!.nom}`,
        contenu: params.contenu,
        mentioned_user_ids: params.mentionedUserIds,
      }),
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prospect_notes', prospectId] });

      if (variables.mentionedUserIds.length > 0) {
        const prospect = prospects.find(p => p.id === prospectId);
        const prospectLabel = prospect
          ? (prospect.prenom || prospect.nom ? `${prospect.prenom || ''} ${prospect.nom || ''}`.trim() : prospect.entreprise || '')
          : '';

        for (const uid of variables.mentionedUserIds) {
          if (uid === user!.id) continue;
          createNotification({
            organization_id: user!.organizationId,
            commercial_id: uid,
            type: 'mention',
            titre: 'Vous avez été mentionné',
            message: `${user!.prenom} ${user!.nom} vous a mentionné sur la fiche de ${prospectLabel}`,
            lien: user!.role === 'admin_org' ? `/admin/prospects/${prospectId}` : `/app/prospects/${prospectId}`,
            lue: false,
          }).catch(() => {});
        }
      }
    },
  });

  const removeNote = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prospect_notes', prospectId] }),
  });

  return { notes, isLoading, addNote, removeNote };
}
