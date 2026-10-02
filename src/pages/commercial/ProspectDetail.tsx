import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useEtapesPipeline, getEtapeLabelByNom, getEtapeLabel } from '@/hooks/useEtapesPipeline';
import { Prospect, MotifPerte, RelanceCanal } from '../../types/crm';
import { 
  Building2,
  Phone,
  Mail,
  MapPin,
  CalendarClock,
  MessageSquare,
  Plus,
  ArrowLeft,
  UserCheck,
  X,
  Check,
  History,
  PhoneCall,
  Video,
  Send,
  Sparkles,
  ArrowUpRight,
  Clock,
  Briefcase,
  Pencil,
  Save,
  Users,
  CheckCircle2,
  Trash2,
  CalendarPlus,
} from 'lucide-react';
import { WhatsAppActionModal } from '../../components/common/WhatsAppActionModal';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useProspectDetail, useInteractions, useRelances } from '@/hooks/commercial';
import { getRelancesByProspect } from '../../services/relances';
import { formatPhoneNumber, fullName, orFallback, formatDateWithTime, toDateTimeLocal, splitDateTimeLocal } from '../../utils/formatters';
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings';
import { sourceLabel } from '@/services/organizationSettings';
import { CustomFieldsForm } from '@/components/common/CustomFieldsForm';
import { MentionTextarea, extractMentionedCommerciaux } from '@/components/common/MentionTextarea';
import * as notificationsService from '../../services/notifications';
import { useProspectNotes } from '@/hooks/useProspectNotes';
import type { CustomFieldValues, NotificationItem } from '../../types/crm';

const SOURCES_DETAIL_FALLBACK = [
  { value: 'prospection_directe', label: 'Prospection directe' },
  { value: 'site_web', label: 'Site web' },
  { value: 'recommandation', label: 'Recommandation' },
  { value: 'reseaux_sociaux', label: 'Réseaux sociaux' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'evenement', label: 'Événement' },
  { value: 'autre', label: 'Autre' },
];
const SECTEURS_DETAIL = ['Commerce / Distribution', 'Télécommunications', 'Services', 'Industrie', 'Immobilier', 'Logistique / Transport', 'Agroalimentaire', 'BTP / Construction', 'Technologie / IT', 'Textile / Confection', 'Éducation / Formation', 'Santé', 'Autre'];
const PAYS_DETAIL = ['Sénégal', "Côte d'Ivoire", 'Mali', 'Burkina Faso', 'Guinée', 'Cameroun', 'Bénin', 'Togo', 'Niger', 'France', 'Autre'];

export const ProspectDetail: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const { etapes } = useEtapesPipeline();
  // Retour client n°6 : sources par défaut + sources custom de l'organisation.
  // Retour client n°4 : schéma des champs dynamiques prospects.
  const { sourceOptions, prospectFields } = useOrganizationSettings();
  const SOURCES_DETAIL = sourceOptions.length ? sourceOptions : SOURCES_DETAIL_FALLBACK;

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, prospects, interactions: authInteractions, addInteraction, convertProspectToClient, orgOffers, commerciaux, deleteProspect, updateProspect } = useAuth();
  const { prospect: dbProspect } = useProspectDetail(id);
  const { interactions: apiInteractions, createInteraction: apiCreateInteraction } = useInteractions(id);
  const { createRelance, updateRelance, completeRelance, deleteRelance } = useRelances();
  const queryClient = useQueryClient();

  const { data: rawRelances = [], isLoading: relancesLoading } = useQuery({
    queryKey: ['relances', 'prospect', id],
    queryFn: () => getRelancesByProspect(id!),
    enabled: !!id,
    refetchInterval: 5000,
  });

  const prospect = dbProspect || prospects.find(p => p.id === id);
  const prospectInteractions = apiInteractions.length > 0 ? apiInteractions : (authInteractions || []).filter((i: any) => i.prospect_id === id);
  const prospectRelances = useMemo(() => {
    const sorted = [...rawRelances].sort((a, b) => a.date.localeCompare(b.date));
    // Inject date_prochaine_relance from prospect if not already in the relances table
    const drp = prospect?.date_prochaine_relance;
    if (drp && !sorted.some(r => r.date === drp)) {
      const today = new Date().toISOString().split('T')[0];
      const synthetic = {
        id: `synthetic-${prospect!.id}`,
        date: drp,
        statut: (drp < today ? 'en_retard' : 'prevue') as any,
        canal: 'appel' as any,
        motif: '',
        heure: undefined,
        commentaire: undefined,
        _synthetic: true,
      };
      const all = [...sorted, synthetic as any];
      return all.sort((a, b) => a.date.localeCompare(b.date));
    }
    return sorted;
  }, [rawRelances, prospect]);

  const plannedRdvs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const items = prospectInteractions
      .filter((i: any) => i.type === 'rdv' || i.type === 'demonstration')
      .map((i: any) => {
        let statut = i.statut;
        if (statut === 'planifiee' && i.date < today) statut = 'en_retard';
        else if (statut === 'planifiee') statut = 'prevue';
        else if (statut === 'realisee') statut = 'realisee';
        else if (statut === 'annulee') statut = 'annulee';
        return {
          id: `rdv-${i.id}`,
          date: i.date,
          heure: i.heure,
          canal: (i.type === 'demonstration' ? 'autre' : 'visite') as any,
          motif: i.commentaire || (i.type === 'demonstration' ? (isEn ? 'Demo' : 'Démonstration') : (isEn ? 'Meeting' : 'RDV')),
          commentaire: i.commentaire,
          statut,
          _rdv: true,
          _rdvType: i.type,
        };
      });

    if (prospect?.statut_pipeline === 'rdv_programme' && items.length === 0) {
      const rdvDate = prospect.date_prochaine_relance || today;
      items.push({
        id: `rdv-synthetic-pipeline-${prospect.id}`,
        date: rdvDate,
        heure: undefined as any,
        canal: 'visite' as any,
        motif: isEn ? 'Scheduled meeting' : 'RDV programmé',
        commentaire: undefined as any,
        statut: rdvDate < today ? 'en_retard' : 'prevue',
        _rdv: true,
        _rdvType: 'rdv',
      });
    }

    return items;
  }, [prospectInteractions, isEn, prospect]);

  const allFollowUps = useMemo(() => {
    return [...prospectRelances, ...plannedRdvs].sort((a, b) => a.date.localeCompare(b.date));
  }, [prospectRelances, plannedRdvs]);

  const prospectsListPath = user?.role === 'admin_org' ? '/admin/prospects' : '/app/prospects';
  const clientsPath = user?.role === 'admin_org' ? '/admin/clients' : '/app/clients';
  const [activeTab, setActiveTab] = useState<'timeline' | 'relances' | 'notes' | 'infos'>('timeline');
  const { notes, addNote, removeNote } = useProspectNotes(id);
  const [noteText, setNoteText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const noteRef = React.useRef<HTMLTextAreaElement>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  // Retour client n°4 : valeurs des champs dynamiques en cours d'édition.
  const [editCustom, setEditCustom] = useState<CustomFieldValues>({});
  const [editForm, setEditForm] = useState<{
    nom: string; prenom: string; telephone: string; email: string; whatsapp: string;
    entreprise: string; secteur_activite: string; source: string;
    budget_estime: string; nbre_commerciaux: string; nombre_employes: string;
    commentaire: string; pays: string; ville: string; adresse: string;
    commercial_id: string; statut_pipeline: string;
    formule_envisagee: string; date_prochaine_relance: string; site_web: string;
  }>({ nom: '', prenom: '', telephone: '', email: '', whatsapp: '',
      entreprise: '', secteur_activite: '', source: '',
      budget_estime: '', nbre_commerciaux: '', nombre_employes: '',
      commentaire: '', pays: '', ville: '', adresse: '',
      commercial_id: '', statut_pipeline: '',
      formule_envisagee: '', date_prochaine_relance: '', site_web: '' });

  const startEdit = () => {
    if (!prospect) return;
    setEditForm({
      nom: prospect.nom || '',
      prenom: prospect.prenom || '',
      telephone: prospect.telephone || '',
      email: prospect.email || '',
      whatsapp: prospect.whatsapp || '',
      entreprise: prospect.entreprise || '',
      secteur_activite: prospect.secteur_activite || '',
      source: prospect.source || '',
      budget_estime: prospect.budget_estime ? String(prospect.budget_estime) : '',
      nbre_commerciaux: prospect.nbre_commerciaux ? String(prospect.nbre_commerciaux) : '',
      nombre_employes: prospect.nombre_employes ? String(prospect.nombre_employes) : '',
      commentaire: prospect.commentaire || '',
      pays: prospect.pays || '',
      ville: prospect.ville || '',
      adresse: prospect.adresse || '',
      commercial_id: prospect.commercial_id || '',
      statut_pipeline: prospect.statut_pipeline || '',
      formule_envisagee: prospect.formule_envisagee || '',
      date_prochaine_relance: prospect.date_prochaine_relance || '',
      site_web: prospect.site_web || '',
    });
    setEditCustom(prospect.custom_fields || {});
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!prospect) return;
    setEditSaving(true);
    try {
      const commercial = commerciaux.find(c => c.id === editForm.commercial_id);
      const prevDrp = prospect.date_prochaine_relance;
      // Passe par le contexte : met à jour `AuthContext.prospects` (liste admin,
      // dashboards, doublons) au lieu d'écrire en base en contournant les caches.
      await updateProspect(prospect.id, {
        nom: editForm.nom || undefined,
        prenom: editForm.prenom || undefined,
        telephone: editForm.telephone,
        email: editForm.email || undefined,
        whatsapp: editForm.whatsapp || undefined,
        entreprise: editForm.entreprise || undefined,
        secteur_activite: editForm.secteur_activite || undefined,
        source: editForm.source as any,
        statut_pipeline: editForm.statut_pipeline as any,
        commercial_id: editForm.commercial_id || undefined,
        commercial_nom: commercial ? `${commercial.prenom} ${commercial.nom}` : prospect.commercial_nom,
        formule_envisagee: editForm.formule_envisagee || undefined,
        budget_estime: editForm.budget_estime ? Number(editForm.budget_estime) : undefined,
        nbre_commerciaux: editForm.nbre_commerciaux ? Number(editForm.nbre_commerciaux) : undefined,
        nombre_employes: editForm.nombre_employes ? Number(editForm.nombre_employes) : undefined,
        commentaire: editForm.commentaire || undefined,
        pays: editForm.pays || undefined,
        ville: editForm.ville || undefined,
        adresse: editForm.adresse || undefined,
        date_prochaine_relance: editForm.date_prochaine_relance || undefined,
        site_web: editForm.site_web || undefined,
        custom_fields: editCustom,
      });
      // If date_prochaine_relance changed and is new, auto-create a formal relance entry
      const newDrp = editForm.date_prochaine_relance;
      if (newDrp && newDrp !== prevDrp && !rawRelances.some(r => r.date === newDrp)) {
        try {
          await createRelance({
            prospect_id: prospect.id,
            prospect_nom: (() => {
              const full = `${editForm.prenom || ''} ${editForm.nom || ''}`.trim();
              return full || editForm.entreprise || prospect.telephone;
            })(),
            prospect_entreprise: editForm.entreprise || '',
            organization_id: prospect.organization_id,
            commercial_id: editForm.commercial_id || prospect.commercial_id,
            date: newDrp,
            canal: 'appel',
            statut: 'prevue',
          });
          queryClient.invalidateQueries({ queryKey: ['relances', 'prospect', id] });
        } catch { /* silent — relance creation is best-effort */ }
      }
      // Le contexte est à jour ; on invalide aussi le cache React Query
      // (liste commerciale, kanban, fiche) au lieu d'attendre le polling des 3 s.
      queryClient.invalidateQueries({ queryKey: ['commercial'] });
      toast.success(isEn ? 'Prospect updated!' : 'Prospect mis à jour !');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setEditSaving(false);
    }
  };

  // Retour client n°8 — Suppression du prospect depuis sa fiche (avec confirmation)
  const handleDeleteProspect = () => {
    const label = orFallback(prospect.entreprise, fullName(prospect, prospect.telephone));
    const confirmed = window.confirm(
      isEn
        ? `Delete "${label}" permanently? This action cannot be undone.`
        : `Supprimer « ${label} » définitivement ? Cette action est irréversible.`,
    );
    if (!confirmed) return;
    deleteProspect(prospect.id);
    toast.success(isEn ? 'Prospect deleted.' : 'Prospect supprimé.');
    navigate(prospectsListPath);
  };

  // New Relance Modal State
  const [isRelanceModalOpen, setIsRelanceModalOpen] = useState(false);
  // Retour client n°10 : créneau horaire unique (date + heure) en un seul champ.
  const [rDateTime, setRDateTime] = useState('');
  const [rCanal, setRCanal] = useState<RelanceCanal>('appel');
  const [rMotif, setRMotif] = useState('');
  const [rComment, setRComment] = useState('');
  const [rSaving, setRSaving] = useState(false);

  // Edit relance modal state
  const [editRelanceId, setEditRelanceId] = useState<string | null>(null);
  // Retour client n°10 : créneau horaire unique (date + heure) en un seul champ.
  const [erDateTime, setErDateTime] = useState('');
  const [erCanal, setErCanal] = useState<RelanceCanal>('appel');
  const [erMotif, setErMotif] = useState('');
  const [erComment, setErComment] = useState('');
  const [erSaving, setErSaving] = useState(false);

  const openEditRelance = (rel: any) => {
    setEditRelanceId(rel.id);
    // Retour client n°10 : le créneau horaire unique reprend date + heure.
    setErDateTime(toDateTimeLocal(rel.date, rel.heure));
    setErCanal(rel.canal || 'appel');
    setErMotif(rel.motif || '');
    setErComment(rel.commentaire || '');
  };

  const handleSaveEditRelance = async (e: React.FormEvent) => {
    e.preventDefault();
    const { date, heure } = splitDateTimeLocal(erDateTime);
    if (!editRelanceId || !date) return;
    setErSaving(true);
    try {
      await updateRelance(editRelanceId, {
        date,
        heure,
        canal: erCanal,
        motif: erMotif || undefined,
        commentaire: erComment || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['relances', 'prospect', id] });
      setEditRelanceId(null);
    } finally {
      setErSaving(false);
    }
  };

  const handleCreateRelance = async (e: React.FormEvent) => {
    e.preventDefault();
    const { date, heure } = splitDateTimeLocal(rDateTime);
    if (!prospect || !date) return;
    setRSaving(true);
    try {
      await createRelance({
        prospect_id: prospect.id,
        prospect_nom: fullName(prospect, ''),
        prospect_entreprise: prospect.entreprise || '',
        organization_id: prospect.organization_id,
        commercial_id: prospect.commercial_id,
        date,
        heure,
        canal: rCanal,
        motif: rMotif || undefined,
        commentaire: rComment || undefined,
        statut: 'prevue',
      });
      queryClient.invalidateQueries({ queryKey: ['relances', 'prospect', id] });
      setIsRelanceModalOpen(false);
      setRDateTime(''); setRCanal('appel'); setRMotif(''); setRComment('');
    } finally {
      setRSaving(false);
    }
  };

  // Interaction Modal State
  const [isInterModalOpen, setIsInterModalOpen] = useState<boolean>(false);
  const [interType, setInterType] = useState<any>('appel');
  const [interComment, setInterComment] = useState<string>('');
  const [interNextAction, setInterNextAction] = useState<string>('');

  // Conversion Modal State
  const [isConvertModalOpen, setIsConvertModalOpen] = useState<boolean>(false);
  const activeOrgOffers = orgOffers.filter(o => o.actif);
  const [formuleSouscrite, setFormuleSouscrite] = useState<string>(activeOrgOffers[0]?.nom || '');
  const [convFrequence, setConvFrequence] = useState<'mensuel' | 'trimestriel' | 'annuel'>('mensuel');
  const [convMontant, setConvMontant] = useState<string>(() => {
    const first = orgOffers.filter(o => o.actif)[0];
    return first ? String(first.tarifs.mensuel) : '';
  });

  const getOfferTarif = (offerNom: string, freq: 'mensuel' | 'trimestriel' | 'annuel') => {
    const offer = activeOrgOffers.find(o => o.nom === offerNom);
    if (!offer) return '';
    return String(offer.tarifs[freq] || 0);
  };

  const handleOfferChange = (nom: string) => {
    setFormuleSouscrite(nom);
    setConvMontant(getOfferTarif(nom, convFrequence));
  };

  const handleFrequenceChange = (freq: 'mensuel' | 'trimestriel' | 'annuel') => {
    setConvFrequence(freq);
    setConvMontant(getOfferTarif(formuleSouscrite, freq));
  };

  // WhatsApp Action Modal State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);

  const handleWhatsAppClick = () => {
    window.open(
      `https://wa.me/${prospect?.telephone.replace(/\s+/g, '')}?text=${encodeURIComponent(
        isEn
          ? `Hello ${prospect?.prenom || prospect?.nom}, I am Moussa from Faciloopro.`
          : `Bonjour ${prospect?.prenom || prospect?.nom}, je suis Moussa de Faciloopro.`
      )}`,
      '_blank'
    );
    setIsWhatsAppModalOpen(true);
  };

  if (!prospect) {
    return (
      <div className="p-8 text-center space-y-4 font-sans">
        <p className="text-sm font-extrabold text-muted-foreground">{isEn ? 'Prospect not found.' : 'Prospect introuvable.'}</p>
        <Link to={prospectsListPath} className="text-xs font-extrabold text-primary hover:underline">
          {isEn ? '← Back to prospects list' : '← Retour à la liste des prospects'}
        </Link>
      </div>
    );
  }

  // Titre du prospect : nom complet, sinon entreprise, sinon téléphone
  // (le Point 5 autorise un prospect créé avec un seul champ de contact).
  const displayName = prospect.prenom || prospect.nom ? `${prospect.prenom || ''} ${prospect.nom || ''}`.trim() : prospect.entreprise || prospect.telephone;
  const initials = `${prospect.prenom?.[0] || ''}${prospect.nom?.[0] || ''}`.toUpperCase() || (prospect.entreprise?.[0] || prospect.telephone?.[0] || 'P').toUpperCase();

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    addInteraction({
      prospect_id: prospect.id,
      type: interType,
      statut: 'realisee',
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      commentaire: interComment,
      prochaine_action: interNextAction
    });

    // Retour client n°2 : notifier chaque commercial mentionné via @
    const mentioned = extractMentionedCommerciaux(interComment, commerciaux);
    mentioned.forEach((c) => {
      if (!c.id || c.id === user?.id) return;
      const notif: Omit<NotificationItem, 'id' | 'created_at'> = {
        organization_id: prospect.organization_id,
        commercial_id: c.id,
        type: 'mention',
        titre: isEn ? 'You have been mentioned' : 'Vous avez été mentionné',
        message: isEn
          ? `${user ? `${user.prenom} ${user.nom}` : 'A sales rep'} mentioned you on the prospect ${fullName(prospect, prospect.telephone)}.`
          : `${user ? `${user.prenom} ${user.nom}` : 'Un commercial'} vous a mentionné sur le prospect ${fullName(prospect, prospect.telephone)}.`,
        lien: `/app/prospects/${prospect.id}`,
        lue: false,
      };
      notificationsService.createNotification(notif).catch(() => {});
    });
    if (mentioned.length > 0) {
      toast.info(
        isEn
          ? `${mentioned.length} sales rep${mentioned.length > 1 ? 's' : ''} notified.`
          : `${mentioned.length} commercial${mentioned.length > 1 ? 's' : ''} notifié${mentioned.length > 1 ? 's' : ''}.`,
      );
    }

    setIsInterModalOpen(false);
    setInterComment('');
    setInterNextAction('');
    toast.success(isEn ? 'Interaction added!' : 'Interaction ajoutée !');
  };

  const handleConvert = () => {
    convertProspectToClient(prospect.id, formuleSouscrite, {
      frequence: convFrequence,
      montant: convMontant ? Number(convMontant) : undefined,
    });
    setIsConvertModalOpen(false);
    toast.success(isEn ? 'Prospect converted to client!' : 'Prospect converti en client !');
    navigate(clientsPath);
  };

  const getStageTitle = (st: string) => getEtapeLabelByNom(st, etapes, isEn);

  return (
    <div className="space-y-0 font-sans">
      {/* Full-page detail panel */}
      <div className="w-full max-w-4xl mx-auto bg-card border border-border/80 rounded-2xl shadow-sm flex flex-col overflow-hidden">

        {/* Page Header */}
        <div className="border-b border-border/60 bg-muted/30 px-4 sm:px-6 py-2.5">
          <Link to={prospectsListPath} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            {isEn ? 'Back to prospects list' : 'Retour à la liste des prospects'}
          </Link>
        </div>

        {/* Drawer Header (High Visibility Typography) */}
        <div className="sticky top-0 z-20 border-b border-border/80 bg-card/95 backdrop-blur-xl p-4 sm:p-6 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Avatar Pill with Gradient */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-faciloop text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-lg shadow-primary/20 shrink-0">
              {initials}
            </div>

            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-xl font-black text-foreground">{displayName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary">
                  {getStageTitle(prospect.statut_pipeline)}
                </span>
              </div>
              <p className="text-xs font-bold text-muted-foreground flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  {orFallback(prospect.entreprise)}
                </span>
                <span>•</span>
                <span>{prospect.secteur_activite || (isEn ? 'General' : 'Général')}</span>
              </p>
            </div>
          </div>

          
        </div>

        {/* Quick Action Bar (Generous Touch Paddings for Walking Commercials) */}
        <div className="p-3.5 sm:p-6 border-b border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppClick}
              title="WhatsApp Direct"
              className="p-2.5 rounded-2xl bg-[#25D366] text-white shadow-md shadow-emerald-500/20 hover:bg-[#1ebe5d] flex items-center justify-center transition-all active:scale-95"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </button>

            <a
              href={`tel:${prospect.telephone}`}
              className="p-3 rounded-2xl border border-input bg-card text-foreground hover:bg-muted text-xs font-extrabold transition-all active:scale-95"
              title={isEn ? "Call" : "Appeler"}
            >
              <Phone className="w-4 h-4 text-primary" />
            </a>

            <a
              href={`mailto:${prospect.email || ''}`}
              className="p-3 rounded-2xl border border-input bg-card text-foreground hover:bg-muted text-xs font-extrabold transition-all active:scale-95"
              title={isEn ? "Send email" : "Envoyer un e-mail"}
            >
              <Mail className="w-4 h-4 text-primary" />
            </a>
          </div>

          {prospect.statut_pipeline !== 'gagne' && (
            <button
              onClick={() => setIsConvertModalOpen(true)}
              className="px-4 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-faciloop text-white text-xs font-extrabold shadow-lg shadow-primary/25 hover:opacity-95 flex items-center gap-1.5 transition-all ml-auto sm:ml-0 active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">{isEn ? 'Convert to Client' : 'Convertir en Client'}</span>
              <span className="sm:hidden">{isEn ? 'Convert' : 'Convertir'}</span>
            </button>
          )}
        </div>

        {/* Fluid Tab Switcher */}
        <div className="px-3 sm:px-6 pt-3 border-b border-border/80 bg-card overflow-x-auto">
          <div className="relative flex gap-1 sm:gap-2 text-xs font-extrabold min-w-max">
            {[
              { id: 'timeline', label: `${isEn ? 'History' : 'Historique'} (${prospectInteractions.length})` },
              { id: 'relances', label: `${isEn ? 'Follow-ups / Meetings' : 'Relances / RDV'} (${allFollowUps.length})` },
              { id: 'notes', label: `Notes (${notes.length})` },
              { id: 'infos', label: isEn ? 'Information' : 'Informations' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className="relative z-10 px-3.5 sm:px-4 py-3 text-foreground transition-colors"
              >
                {activeTab === t.id && (
                  <motion.div
                    layoutId="prospect-tab-pill"
                    className="absolute inset-0 border-b-2 border-primary -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={activeTab === t.id ? 'text-primary font-black' : 'text-muted-foreground'}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Contents Area */}
        <div className="p-4 sm:p-6 flex-1 space-y-4 sm:space-y-6">
          {/* Tab 1: Vertical Timeline of Interactions */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {isEn ? 'TIMELINE OF EXCHANGES' : 'Frise Chronologique des Échanges'}
                </h3>
                <button
                  onClick={() => setIsInterModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-primary text-white font-extrabold text-xs shadow-md shadow-primary/20 hover:opacity-95 flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Log an interaction' : 'Consigner un échange'}</span>
                </button>
              </div>

              {prospectInteractions.length === 0 ? (
                <div className="p-6 sm:p-8 rounded-3xl border-2 border-dashed border-border text-center space-y-2">
                  <History className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-xs font-black text-foreground">
                    {isEn ? 'No interaction logged yet.' : 'Aucune interaction consignée pour le moment.'}
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {isEn 
                      ? 'Record your calls, demos or WhatsApp exchanges to maintain a smooth history.' 
                      : 'Enregistrez vos appels, démos ou échanges WhatsApp pour conserver un historique fluide.'}
                  </p>
                </div>
              ) : (
                <div className="relative pl-5 sm:pl-6 space-y-4 sm:space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
                  {prospectInteractions.map((inter) => {
                    const getIcon = () => {
                      if (inter.type === 'whatsapp') return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
                      if (inter.type === 'demonstration') return <Video className="w-3.5 h-3.5 text-purple-500" />;
                      if (inter.type === 'email') return <Send className="w-3.5 h-3.5 text-blue-500" />;
                      return <PhoneCall className="w-3.5 h-3.5 text-amber-500" />;
                    };

                    return (
                      <div key={inter.id} className="relative flex items-start gap-3 sm:gap-4 group">
                        {/* Timeline Circle Node */}
                        <div className="absolute -left-[26px] sm:-left-[30px] top-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          {getIcon()}
                        </div>

                        <div className="flex-1 p-3.5 sm:p-4 rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-md transition-all space-y-1.5 sm:space-y-2">
                          <div className="flex flex-wrap items-center justify-between text-xs gap-1">
                            <span className="font-black text-foreground capitalize flex items-center gap-1.5">
                              {isEn && inter.type === 'appel' ? 'Phone Call' : isEn && inter.type === 'demonstration' ? 'Demonstration' : isEn && inter.type === 'visite' ? 'Client Visit' : inter.type}
                            </span>
                            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {inter.date} {isEn ? 'at' : 'à'} {inter.heure}
                            </span>
                          </div>

                          <p className="text-xs text-foreground font-semibold leading-relaxed">{inter.commentaire}</p>

                          {inter.prochaine_action && (
                            <div className="pt-2 border-t border-border/50 text-xs font-extrabold text-amber-500 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                              <span>{isEn ? 'Next action' : 'Prochaine action'} : {inter.prochaine_action}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Planned Relances */}
          {activeTab === 'relances' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {isEn ? 'Follow-ups & Meetings' : 'Relances & RDV'}
                </h3>
                <button
                  onClick={() => {
                    // Retour client n°10 : valeur par défaut du créneau horaire unique.
                    setRDateTime(toDateTimeLocal(prospect?.date_prochaine_relance || new Date().toISOString().split('T')[0], '09:30'));
                    setIsRelanceModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-all shadow-sm"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  {isEn ? 'Schedule follow-up' : 'Programmer une relance'}
                </button>
              </div>

              {relancesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : allFollowUps.length === 0 ? (
                <div className="p-6 sm:p-8 rounded-3xl border-2 border-dashed border-border text-center text-xs font-semibold text-muted-foreground">
                  {isEn ? 'No follow-up or meeting scheduled for this prospect.' : 'Aucune relance ni RDV programmé pour ce prospect.'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {allFollowUps.map((rel) => {
                    const isSynthetic = !!(rel as any)._synthetic;
                    const isRdv = !!(rel as any)._rdv;
                    const isDone = rel.statut === 'realisee';
                    const isCancelled = rel.statut === 'annulee';
                    const isLate = rel.statut === 'en_retard';
                    const canalIcons: Record<string, React.ReactNode> = {
                      appel: <Phone className="w-3 h-3" />,
                      whatsapp: <MessageSquare className="w-3 h-3" />,
                      email: <Mail className="w-3 h-3" />,
                      visite: <MapPin className="w-3 h-3" />,
                      autre: <Clock className="w-3 h-3" />,
                    };
                    const statutColors = {
                      prevue: 'bg-blue-500/10 text-blue-600',
                      en_retard: 'bg-rose-500/10 text-rose-500',
                      realisee: 'bg-emerald-500/10 text-emerald-600',
                      annulee: 'bg-muted text-muted-foreground',
                    };
                    const statutLabels = {
                      prevue: isEn ? 'Scheduled' : 'Prévue',
                      en_retard: isEn ? 'Overdue' : 'En retard',
                      realisee: isEn ? 'Done' : 'Réalisée',
                      annulee: isEn ? 'Cancelled' : 'Annulée',
                    };
                    return (
                      <div key={rel.id} className={`p-3.5 sm:p-4 rounded-2xl border bg-card shadow-sm text-xs transition-opacity ${isDone || isCancelled ? 'opacity-60' : ''} ${isLate ? 'border-rose-500/30' : 'border-border'} ${isSynthetic ? 'border-dashed opacity-80' : ''}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${statutColors[rel.statut as keyof typeof statutColors] || 'bg-muted text-muted-foreground'}`}>
                                {statutLabels[rel.statut as keyof typeof statutLabels] || rel.statut}
                              </span>
                              {!isRdv && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-muted text-muted-foreground capitalize">
                                  {canalIcons[rel.canal]} {rel.canal}
                                </span>
                              )}
                              {isRdv && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-purple-500/10 text-purple-600">
                                  {(rel as any)._rdvType === 'demonstration' ? (isEn ? 'Demo' : 'Démo') : 'RDV'}
                                </span>
                              )}
                              {/* {isSynthetic && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-500/10 text-amber-600">
                                  {isEn ? 'From form' : 'Depuis le formulaire'}
                                </span>
                              )} */}
                            </div>
                            <div className={`font-extrabold text-foreground ${isDone ? 'line-through' : ''}`}>
                              {rel.motif || (isEn ? 'Commercial follow-up' : 'Relance commerciale')}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground font-semibold">
                              <Clock className="w-3 h-3 text-primary shrink-0" />
                              {formatDateWithTime(rel.date, rel.heure, isEn ? 'en' : 'fr')}
                            </div>
                            {rel.commentaire && (
                              <p className="text-muted-foreground italic mt-1">{rel.commentaire}</p>
                            )}
                          </div>
                          {!isSynthetic && !isRdv && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => openEditRelance(rel)}
                                title={isEn ? 'Edit' : 'Modifier'}
                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {!isDone && !isCancelled && (
                                <button
                                  onClick={async () => { await completeRelance(rel.id); queryClient.invalidateQueries({ queryKey: ['relances', 'prospect', id] }); }}
                                  title={isEn ? 'Mark as done' : 'Marquer comme réalisée'}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={async () => { await deleteRelance(rel.id); queryClient.invalidateQueries({ queryKey: ['relances', 'prospect', id] }); }}
                                title={isEn ? 'Delete' : 'Supprimer'}
                                className="p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Notes with @mentions */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {isEn ? 'Internal Notes' : 'Notes internes'}
                </h3>
                <div className="relative">
                  <textarea
                    ref={noteRef}
                    rows={3}
                    value={noteText}
                    onChange={e => {
                      setNoteText(e.target.value);
                      const val = e.target.value;
                      const cursor = e.target.selectionStart;
                      const before = val.slice(0, cursor);
                      const atMatch = before.match(/@(\w*)$/);
                      if (atMatch) {
                        setShowMentions(true);
                        setMentionFilter(atMatch[1].toLowerCase());
                      } else {
                        setShowMentions(false);
                      }
                    }}
                    placeholder={isEn ? 'Write a note... Type @ to mention a colleague' : 'Écrire une note... Tapez @ pour mentionner un collègue'}
                    className="w-full p-3 rounded-2xl border border-input bg-background text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none resize-none"
                  />
                  {showMentions && (
                    <div className="absolute left-0 right-0 bottom-full mb-1 bg-card border border-border rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                      {commerciaux
                        .filter(c => `${c.prenom} ${c.nom}`.toLowerCase().includes(mentionFilter))
                        .map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              const val = noteText;
                              const cursor = noteRef.current?.selectionStart || val.length;
                              const before = val.slice(0, cursor);
                              const after = val.slice(cursor);
                              const newBefore = before.replace(/@\w*$/, `@${c.prenom} ${c.nom} `);
                              setNoteText(newBefore + after);
                              setShowMentions(false);
                              setTimeout(() => noteRef.current?.focus(), 0);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-muted flex items-center gap-2"
                          >
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">
                              {c.prenom?.[0]}{c.nom?.[0]}
                            </span>
                            {c.prenom} {c.nom}
                          </button>
                        ))}
                      {commerciaux.filter(c => `${c.prenom} ${c.nom}`.toLowerCase().includes(mentionFilter)).length === 0 && (
                        <p className="px-3 py-2 text-xs text-muted-foreground">{isEn ? 'No match' : 'Aucun résultat'}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      if (!noteText.trim()) return;
                      setNoteSaving(true);
                      const mentionedIds = commerciaux
                        .filter(c => noteText.includes(`@${c.prenom} ${c.nom}`))
                        .map(c => c.id);
                      try {
                        await addNote.mutateAsync({ contenu: noteText.trim(), mentionedUserIds: mentionedIds });
                        setNoteText('');
                        toast.success(isEn ? 'Note added!' : 'Note ajoutée !');
                      } catch {
                        toast.error(isEn ? 'Error adding note.' : "Erreur lors de l'ajout.");
                      } finally {
                        setNoteSaving(false);
                      }
                    }}
                    disabled={!noteText.trim() || noteSaving}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {noteSaving ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    {isEn ? 'Add note' : 'Ajouter'}
                  </button>
                </div>
              </div>

              {notes.length === 0 ? (
                <div className="p-6 sm:p-8 rounded-3xl border-2 border-dashed border-border text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-xs font-black text-foreground">
                    {isEn ? 'No note yet.' : 'Aucune note pour le moment.'}
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {isEn ? 'Add internal notes and @mention colleagues to notify them.' : 'Ajoutez des notes internes et @mentionnez vos collègues pour les notifier.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notes.map(note => (
                    <div key={note.id} className="p-3.5 rounded-2xl border border-border bg-card shadow-sm text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0">
                            {note.author_nom.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                          <span className="font-bold text-foreground">{note.author_nom}</span>
                          <span className="text-muted-foreground font-medium">
                            {new Date(note.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {note.author_id === user?.id && (
                          <button
                            onClick={() => removeNote.mutate(note.id)}
                            className="p-1 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                        {note.contenu.split(/(@\w+\s\w+)/g).map((part, i) =>
                          part.startsWith('@') ? (
                            <span key={i} className="font-bold text-primary">{part}</span>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Detailed Prospect Information Card */}
          {activeTab === 'infos' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {isEn ? 'Commercial Profile Summary' : "Fiche d'Identité Commerciale"}
                </h3>
                {!isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={startEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-input text-xs font-bold text-foreground hover:bg-muted transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5 text-primary" />
                      {isEn ? 'Edit' : 'Modifier'}
                    </button>
                    {/* Retour client n°8 : suppression du prospect depuis sa fiche */}
                    <button
                      onClick={handleDeleteProspect}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-input text-xs font-bold text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {isEn ? 'Delete' : 'Supprimer'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-xl border border-input text-xs font-bold text-muted-foreground hover:bg-muted transition-all"
                    >
                      {isEn ? 'Cancel' : 'Annuler'}
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={editSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {editSaving
                        ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Save className="w-3.5 h-3.5" />}
                      {isEn ? 'Save' : 'Enregistrer'}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-5 rounded-3xl border border-border bg-card space-y-4 shadow-sm text-xs">
                {isEditing ? (
                  /* ── Mode édition ── */
                  <div className="space-y-3">
                    {/* Identité */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'Last name' : 'Nom'}</label>
                        <input value={editForm.nom} onChange={e => setEditForm(f => ({...f, nom: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'First name' : 'Prénom'}</label>
                        <input value={editForm.prenom} onChange={e => setEditForm(f => ({...f, prenom: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'Company' : 'Entreprise'}</label>
                        <input value={editForm.entreprise} onChange={e => setEditForm(f => ({...f, entreprise: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'Sector' : "Secteur d'activité"}</label>
                        <select value={editForm.secteur_activite} onChange={e => setEditForm(f => ({...f, secteur_activite: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none">
                          <option value="">{isEn ? 'Select…' : 'Sélectionner…'}</option>
                          {SECTEURS_DETAIL.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    {/* Contact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'Phone' : 'Téléphone'}</label>
                        <input value={editForm.telephone} onChange={e => setEditForm(f => ({...f, telephone: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">WhatsApp</label>
                        <input value={editForm.whatsapp} onChange={e => setEditForm(f => ({...f, whatsapp: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="font-extrabold text-muted-foreground">Email</label>
                        <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({...f, email: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" />
                      </div>
                    </div>
                    {/* Localisation */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'Country' : 'Pays'}</label>
                        <select value={editForm.pays} onChange={e => setEditForm(f => ({...f, pays: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none">
                          {PAYS_DETAIL.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'City' : 'Ville'}</label>
                        <input value={editForm.ville} onChange={e => setEditForm(f => ({...f, ville: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'Address' : 'Adresse'}</label>
                        <input value={editForm.adresse} onChange={e => setEditForm(f => ({...f, adresse: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" />
                      </div>
                    </div>
                    {/* Pipeline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'Source' : 'Source'}</label>
                        <select value={editForm.source} onChange={e => setEditForm(f => ({...f, source: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none">
                          {SOURCES_DETAIL.map(s => <option key={s.value} value={s.value}>{sourceLabel(s, isEn)}</option>)}
                          {!SOURCES_DETAIL.some(s => s.value === editForm.source) && (
                            <option value={editForm.source}>{editForm.source.replace(/_/g, ' ')}</option>
                          )}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'Pipeline stage' : 'Étape pipeline'}</label>
                        <select value={editForm.statut_pipeline} onChange={e => setEditForm(f => ({...f, statut_pipeline: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none">
                          {etapes.map(e => <option key={e.nom} value={e.nom}>{getEtapeLabel(e, isEn)}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'Assigned to' : 'Commercial assigné'}</label>
                        <select value={editForm.commercial_id} onChange={e => setEditForm(f => ({...f, commercial_id: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none">
                          <option value="">—</option>
                          {commerciaux.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'Target plan' : 'Formule envisagée'}</label>
                        <select value={editForm.formule_envisagee} onChange={e => setEditForm(f => ({...f, formule_envisagee: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none">
                          <option value="">—</option>
                          {activeOrgOffers.map(o => <option key={o.id} value={o.nom}>{o.nom}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'Budget (FCFA)' : 'Budget estimé (FCFA)'}</label>
                        <input type="number" value={editForm.budget_estime} onChange={e => setEditForm(f => ({...f, budget_estime: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'No. of employees' : "Nombre d'employés"}</label>
                        <input type="number" min="0" value={editForm.nombre_employes} onChange={e => setEditForm(f => ({...f, nombre_employes: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'No. of sales reps' : 'Nbre de commerciaux'}</label>
                        <input type="number" min="0" value={editForm.nbre_commerciaux} onChange={e => setEditForm(f => ({...f, nbre_commerciaux: e.target.value}))}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-muted-foreground">{isEn ? 'Follow-up date' : 'Date de relance'}</label>
                        <input type="date" value={editForm.date_prochaine_relance} onChange={e => setEditForm(f => ({...f, date_prochaine_relance: e.target.value}))}
                          style={{ colorScheme: 'auto' }}
                          className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-extrabold text-muted-foreground">{isEn ? 'Website' : 'Site web'}</label>
                      <input type="url" value={editForm.site_web} onChange={e => setEditForm(f => ({...f, site_web: e.target.value}))}
                        placeholder="https://..."
                        className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-extrabold text-muted-foreground">{isEn ? 'Notes' : 'Notes / Commentaire'}</label>
                      <textarea rows={3} value={editForm.commentaire} onChange={e => setEditForm(f => ({...f, commentaire: e.target.value}))}
                        className="w-full p-2 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none resize-none" />
                    </div>

                    {/* Retour client n°4 : champs dynamiques définis par l'Admin */}
                    <CustomFieldsForm
                      schema={prospectFields}
                      values={editCustom}
                      onChange={setEditCustom}
                      isEn={isEn}
                    />
                  </div>
                ) : (
                  /* ── Mode lecture ── */
                  <div className="space-y-4">
                    {/* Identité */}
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-2">{isEn ? 'Identity' : 'Identité'}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'Last name' : 'Nom'}</span>
                          <span className="font-black text-foreground">{prospect.nom || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'First name' : 'Prénom'}</span>
                          <span className="font-black text-foreground">{prospect.prenom || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'Company' : 'Entreprise'}</span>
                          <span className="font-black text-foreground">{orFallback(prospect.entreprise)}</span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'Industry / Sector' : "Secteur d'Activité"}</span>
                          <span className="font-black text-foreground">{prospect.secteur_activite || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="pt-3 border-t border-border/60">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-2">{isEn ? 'Contact' : 'Contact'}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'Phone' : 'Téléphone'}</span>
                          <span className="font-black text-foreground text-sm">{formatPhoneNumber(prospect.telephone)}</span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">WhatsApp</span>
                          <span className="font-black text-foreground">{prospect.whatsapp ? formatPhoneNumber(prospect.whatsapp) : '-'}</span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">Email</span>
                          <span className="font-black text-foreground">{prospect.email || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'Website' : 'Site web'}</span>
                          {prospect.site_web ? (
                            <a href={prospect.site_web} target="_blank" rel="noopener noreferrer" className="font-black text-primary hover:underline text-xs break-all">{prospect.site_web}</a>
                          ) : (
                            <span className="font-black text-foreground">—</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Localisation */}
                    <div className="pt-3 border-t border-border/60">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-2">{isEn ? 'Location' : 'Localisation'}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'Country' : 'Pays'}</span>
                          <span className="font-black text-foreground">{prospect.pays || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'City' : 'Ville'}</span>
                          <span className="font-black text-foreground">{prospect.ville || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'Address' : 'Adresse'}</span>
                          <span className="font-black text-foreground">{prospect.adresse || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pipeline */}
                    <div className="pt-3 border-t border-border/60">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-2">{isEn ? 'Pipeline' : 'Pipeline'}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'Stage' : 'Étape'}</span>
                          <span className="font-black text-foreground">
                            {getEtapeLabelByNom(prospect.statut_pipeline, etapes, isEn)}
                          </span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'Acquisition Source' : "Source d'Acquisition"}</span>
                          <span className="font-black text-foreground capitalize">
                            {(() => {
                              const found = SOURCES_DETAIL.find(s => s.value === prospect.source);
                              return found ? sourceLabel(found, isEn) : prospect.source.replace(/_/g, ' ');
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'Assigned Sales Rep' : 'Commercial Responsable'}</span>
                          <span className="font-black text-primary">{prospect.commercial_nom || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'Target plan' : 'Formule envisagée'}</span>
                          <span className="font-black text-foreground">{prospect.formule_envisagee || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'Follow-up date' : 'Date de relance'}</span>
                          <span className="font-black text-foreground">{prospect.date_prochaine_relance || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Données entreprise */}
                    <div className="pt-3 border-t border-border/60">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-2">{isEn ? 'Company data' : "Données entreprise"}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'Estimated Budget' : 'Budget Estimé'}</span>
                          <span className="font-black text-emerald-500 text-sm">
                            {prospect.budget_estime ? `${prospect.budget_estime.toLocaleString()} FCFA` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'No. of employees' : "Nombre d'employés"}</span>
                          <span className="font-black text-foreground">{prospect.nombre_employes ?? '—'}</span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground font-extrabold text-[11px]">{isEn ? 'No. of sales reps' : 'Nbre de commerciaux'}</span>
                          <span className="font-black text-foreground">{prospect.nbre_commerciaux ?? '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {prospect.commentaire && (
                      <div className="pt-3 border-t border-border/60">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-2">{isEn ? 'Notes' : 'Notes / Commentaire'}</p>
                        <p className="text-foreground font-semibold leading-relaxed bg-muted/40 rounded-xl p-3">{prospect.commentaire}</p>
                      </div>
                    )}

                    {/* Retour client n°4 : champs dynamiques en lecture seule */}
                    {prospectFields.length > 0 && (
                      <div className="pt-3 border-t border-border/60">
                        <CustomFieldsForm
                          schema={prospectFields}
                          values={prospect.custom_fields || {}}
                          onChange={() => {}}
                          readOnly
                          isEn={isEn}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Interaction Bottom Sheet Modal on Mobile */}
      <AnimatePresence>
        {isInterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-sans relative"
            >
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto sm:hidden mb-1" />

              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-extrabold text-foreground">
                  {isEn ? 'Log an Interaction' : 'Consigner une Interaction'}
                </h2>
                <button onClick={() => setIsInterModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddInteraction} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-foreground">{isEn ? 'Interaction type' : "Type d'interaction"}</label>
                  <select
                    value={interType}
                    onChange={(e) => setInterType(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-input bg-background font-bold text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="appel">{isEn ? 'Phone Call' : 'Appel Téléphonique'}</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="demonstration">{isEn ? 'Demonstration' : 'Démonstration'}</option>
                    <option value="visite">{isEn ? 'Client Visit' : 'Visite Client'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-foreground">{isEn ? 'Report / Comment' : 'Compte-rendu / Commentaire'}</label>
                  {/* Retour client n°2 : mention @ pour notifier un commercial */}
                  <MentionTextarea
                    required
                    rows={3}
                    value={interComment}
                    onChange={setInterComment}
                    placeholder={isEn ? "Key points discussed during exchange... Type @ to notify a sales rep." : "Points clés abordés lors de l'échange... Tapez @ pour notifier un commercial."}
                    className="rounded-2xl font-semibold"
                    isEn={isEn}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-foreground">{isEn ? 'Next Action' : 'Prochaine Action'}</label>
                  <input
                    type="text"
                    value={interNextAction}
                    onChange={(e) => setInterNextAction(e.target.value)}
                    placeholder={isEn ? "Ex: Send proposal" : "Ex: Envoyer la proposition commerciale"}
                    className="w-full p-3 rounded-2xl border border-input bg-background font-semibold text-foreground"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInterModalOpen(false)}
                    className="w-full sm:w-1/3 py-3 rounded-2xl border border-input font-bold hover:bg-muted text-foreground"
                  >
                    {isEn ? 'Cancel' : 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-2/3 py-3 rounded-2xl bg-gradient-faciloop text-white font-extrabold shadow-md hover:opacity-95"
                  >
                    {isEn ? 'Save interaction' : "Enregistrer l'interaction"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Convert to Client Bottom Sheet Modal on Mobile */}
      <AnimatePresence>
        {isConvertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-sans relative"
            >
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto sm:hidden mb-1" />

              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  {isEn ? 'Convert to Client' : 'Conversion en Client'}
                </h2>
                <button onClick={() => setIsConvertModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground font-semibold">
                {isEn
                  ? `Converting ${orFallback(prospect.entreprise, fullName(prospect))} to an official client.`
                  : `Conversion de ${orFallback(prospect.entreprise, fullName(prospect))} en client officiel.`}
              </p>

              <div className="space-y-3 text-xs">
                {/* Offre */}
                <div>
                  <label className="block font-bold text-foreground mb-1.5">{isEn ? 'Subscription plan' : "Offre d'abonnement *"}</label>
                  {activeOrgOffers.length === 0 ? (
                    <p className="text-xs text-amber-600 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
                      {isEn ? 'No active offer configured. Go to Subscriptions to create one.' : 'Aucune offre active. Configurez vos offres dans Abonnements.'}
                    </p>
                  ) : (
                    <select
                      value={formuleSouscrite}
                      onChange={(e) => handleOfferChange(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-input bg-background font-bold text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      {activeOrgOffers.map(offer => (
                        <option key={offer.id} value={offer.nom}>{offer.nom}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Période */}
                <div>
                  <label className="block font-bold text-foreground mb-1.5">{isEn ? 'Billing period *' : 'Périodicité *'}</label>
                  <div className="flex gap-2">
                    {(['mensuel', 'trimestriel', 'annuel'] as const).map(freq => {
                      const selectedOffer = activeOrgOffers.find(o => o.nom === formuleSouscrite);
                      const tarif = selectedOffer?.tarifs[freq] || 0;
                      return (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => handleFrequenceChange(freq)}
                          className={`flex-1 py-2.5 px-2 rounded-xl border text-[11px] font-bold transition-all ${
                            convFrequence === freq
                              ? 'bg-primary text-white border-primary shadow-md'
                              : 'border-input bg-background text-foreground hover:border-primary/50'
                          }`}
                        >
                          <div className="capitalize">{freq === 'mensuel' ? 'Mensuel' : freq === 'trimestriel' ? 'Trimestriel' : 'Annuel'}</div>
                          {tarif > 0 && (
                            <div className="text-[10px] font-semibold opacity-80 mt-0.5">
                              {tarif.toLocaleString('fr-FR')} FCFA
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Montant */}
                <div>
                  <label className="block font-bold text-foreground mb-1.5">{isEn ? 'Amount (FCFA) *' : 'Montant (FCFA) *'}</label>
                  <input
                    type="number"
                    value={convMontant}
                    onChange={(e) => setConvMontant(e.target.value)}
                    placeholder="0"
                    className="w-full p-3 rounded-2xl border border-input bg-background font-bold text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Modifiable — pré-rempli depuis le tarif de l'offre</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => setIsConvertModalOpen(false)}
                  className="w-full sm:w-1/2 py-3 rounded-2xl border border-input text-xs font-bold hover:bg-muted text-foreground"
                >
                  {isEn ? 'Cancel' : 'Annuler'}
                </button>
                <button
                  onClick={handleConvert}
                  disabled={activeOrgOffers.length === 0}
                  className="w-full sm:w-1/2 py-3 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs hover:bg-emerald-600 shadow-md shadow-emerald-500/25 disabled:opacity-50"
                >
                  {isEn ? 'Confirm sale' : '✓ Confirmer la vente'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WhatsApp Feedback Action Modal */}
      <WhatsAppActionModal
        isOpen={isWhatsAppModalOpen}
        prospectId={prospect.id}
        prospectNom={displayName}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />

      {/* Modal — Programmer une relance */}
      <AnimatePresence>
        {isRelanceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <CalendarPlus className="w-4 h-4 text-primary" />
                  {isEn ? 'Schedule a follow-up' : 'Programmer une relance'}
                </h2>
                <button onClick={() => setIsRelanceModalOpen(false)} className="p-1 hover:bg-muted rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateRelance} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">{isEn ? 'Date & Time *' : 'Date & Heure *'}</label>
                  <input type="datetime-local" required value={rDateTime} onChange={e => setRDateTime(e.target.value)}
                    style={{ colorScheme: 'auto' }}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">{isEn ? 'Channel *' : 'Canal *'}</label>
                  <select value={rCanal} onChange={e => setRCanal(e.target.value as RelanceCanal)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="appel">{isEn ? 'Phone call' : 'Appel téléphonique'}</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="visite">{isEn ? 'Visit' : 'Visite'}</option>
                    <option value="autre">{isEn ? 'Other' : 'Autre'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">{isEn ? 'Purpose' : 'Motif'}</label>
                  <input type="text" value={rMotif} onChange={e => setRMotif(e.target.value)}
                    placeholder={isEn ? 'e.g. Proposal follow-up' : 'ex. Suivi offre commerciale'}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">{isEn ? 'Notes' : 'Commentaire'}</label>
                  <textarea rows={2} value={rComment} onChange={e => setRComment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setIsRelanceModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-input text-xs font-bold hover:bg-muted text-foreground">
                    {isEn ? 'Cancel' : 'Annuler'}
                  </button>
                  <button type="submit" disabled={rSaving}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-faciloop text-white text-xs font-bold hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2">
                    {rSaving
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><CalendarPlus className="w-3.5 h-3.5" /> {isEn ? 'Schedule' : 'Programmer'}</>
                    }
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal — Modifier une relance */}
      <AnimatePresence>
        {editRelanceId && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-left relative"
            >
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto sm:hidden mb-1" />
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-foreground">{isEn ? 'Edit follow-up' : 'Modifier la relance'}</h3>
                <button onClick={() => setEditRelanceId(null)} className="p-1.5 rounded-xl hover:bg-muted transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveEditRelance} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">{isEn ? 'Date & Time *' : 'Date & Heure *'}</label>
                  <input type="datetime-local" required value={erDateTime} onChange={e => setErDateTime(e.target.value)}
                    style={{ colorScheme: 'auto' }}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">{isEn ? 'Channel *' : 'Canal *'}</label>
                  <select value={erCanal} onChange={e => setErCanal(e.target.value as RelanceCanal)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="appel">{isEn ? 'Phone call' : 'Appel téléphonique'}</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="visite">{isEn ? 'Visit' : 'Visite'}</option>
                    <option value="autre">{isEn ? 'Other' : 'Autre'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">{isEn ? 'Purpose' : 'Motif'}</label>
                  <input type="text" value={erMotif} onChange={e => setErMotif(e.target.value)}
                    placeholder={isEn ? 'e.g. Proposal follow-up' : 'ex. Suivi offre commerciale'}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">{isEn ? 'Notes' : 'Commentaire'}</label>
                  <textarea rows={2} value={erComment} onChange={e => setErComment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setEditRelanceId(null)}
                    className="flex-1 py-2.5 rounded-xl border border-input text-xs font-bold hover:bg-muted text-foreground">
                    {isEn ? 'Cancel' : 'Annuler'}
                  </button>
                  <button type="submit" disabled={erSaving}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-faciloop text-white text-xs font-bold hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2">
                    {erSaving
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><Save className="w-3.5 h-3.5" /> {isEn ? 'Save' : 'Enregistrer'}</>
                    }
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
