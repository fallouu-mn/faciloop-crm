import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole, Organization, Commercial, Prospect, Relance, Interaction, NotificationItem, ClientFaciloop, Paiement, ActionLog, ActionLogType, ModePaiement, Commission, ObjectifCommercial, Offre } from '../types/crm';
import { formatPhoneNumber } from '../lib/phoneUtils';
import { OrgOffer, ObjectifCommercialAdmin, CommissionEntry } from '../lib/mockAdminOrg';

import * as prospectsService from '../services/prospects';
import * as relancesService from '../services/relances';
import * as interactionsService from '../services/interactions';
import * as notificationsService from '../services/notifications';
import * as clientsService from '../services/clients';
import * as paiementsService from '../services/paiements';
import * as offresService from '../services/offres';
import * as commerciauxService from '../services/commerciaux';
import * as objectifsService from '../services/objectifs';
import * as commissionsService from '../services/commissions';
import * as journalService from '../services/journal';

export interface UserSession {
  id: string;
  authId: string;
  commercialId?: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  role: UserRole;
  organizationId: string; // vide '' pour super_admin sans org
  orgStatut?: string; // 'actif' | 'en_attente' | 'suspendu' | 'inactif'
}

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  currentOrg: Organization | null;
  currency: string;
  setCurrency: (c: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  login: (telephone: string, codeSecret: string) => Promise<UserSession | null>;
  logout: () => void;
  switchOrganization: (orgId: string) => void;

  prospects: Prospect[];
  relances: Relance[];
  interactions: Interaction[];
  notifications: NotificationItem[];
  clients: ClientFaciloop[];
  paiements: Paiement[];

  myProspects: Prospect[];
  myRelances: Relance[];
  myInteractions: Interaction[];

  addProspect: (p: Omit<Prospect, 'id' | 'created_at' | 'organization_id'>) => Promise<{ success: boolean; duplicate?: boolean; prospect?: Prospect }>;
  updateProspectStatus: (id: string, newStep: string, motifPerte?: string) => void;
  reassignProspects: (prospectIds: string[], targetCommercialId: string, targetCommercialNom: string) => void;
  deleteProspect: (id: string) => void;

  addRelance: (r: Omit<Relance, 'id' | 'created_at' | 'organization_id'>) => void;
  completeRelance: (id: string) => void;

  addInteraction: (i: Omit<Interaction, 'id' | 'created_at' | 'organization_id'>) => void;
  markNotificationAsRead: (id: string) => void;
  convertProspectToClient: (prospectId: string, formule: string, options?: { frequence?: string; montant?: number; modePaiement?: ModePaiement }) => void;

  orgOffers: OrgOffer[];
  addOrgOffer: (offer: Omit<OrgOffer, 'id' | 'organization_id' | 'created_at'>) => void;
  updateOrgOffer: (id: string, updates: Partial<Omit<OrgOffer, 'id' | 'organization_id' | 'created_at'>>) => void;
  deleteOrgOffer: (id: string) => void;

  commerciaux: Commercial[];
  addCommercial: (c: Omit<Commercial, 'id' | 'organization_id' | 'created_at'>) => void;
  updateCommercial: (id: string, updates: Partial<Omit<Commercial, 'id' | 'organization_id' | 'created_at'>>) => void;
  toggleCommercialStatus: (id: string) => void;

  objectifs: ObjectifCommercialAdmin[];
  addObjectif: (o: Omit<ObjectifCommercialAdmin, 'id'>) => void;
  updateObjectif: (id: string, updates: Partial<Omit<ObjectifCommercialAdmin, 'id'>>) => void;
  deleteObjectif: (id: string) => void;

  commissions: CommissionEntry[];

  actionLogs: ActionLog[];
  addActionLog: (log: Omit<ActionLog, 'id' | 'organization_id' | 'created_at'>) => void;

  updateOrganization: (updates: Partial<Omit<Organization, 'id'>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function phoneToEmail(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  return `${digits}@faciloop.app`;
}

async function fetchUserProfile(authUserId: string): Promise<{
  role: UserRole;
  organizationId: string | null;
  profile?: { id: string; nom: string; prenom: string; email: string; telephone: string };
} | null> {
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role, organization_id')
    .eq('user_id', authUserId)
    .eq('is_active', true)
    .single();

  if (roleError || !roleData) return null;

  let profile: { id: string; nom: string; prenom: string; email: string; telephone: string } | undefined;

  if (roleData.role === 'commercial') {
    const { data: commData } = await supabase
      .from('commerciaux')
      .select('id, nom, prenom, email, telephone')
      .eq('user_id', authUserId)
      .single();

    if (commData) {
      profile = commData;
    }
  } else if (roleData.role === 'admin_org') {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const meta = authUser.user_metadata || {};
      const authEmail = authUser.email || '';
      const phoneFromEmail = authEmail.replace('@faciloop.app', '');
      profile = {
        id: authUserId,
        nom: meta.last_name || '',
        prenom: meta.first_name || '',
        email: authEmail,
        telephone: phoneFromEmail,
      };
    }
  }

  return {
    role: roleData.role as UserRole,
    organizationId: roleData.organization_id || null,
    profile,
  };
}

// Mappers: DB types → mock types (keeps pages working without changes)
function mapCommissionToEntry(c: Commission): CommissionEntry {
  return {
    id: c.id,
    commercialId: c.commercial_id,
    commercialNom: c.commercial_nom || '',
    clientNom: c.client_nom || '',
    formule: c.formule || '',
    periodicite: (c.periodicite || 'mensuel') as 'mensuel' | 'trimestriel' | 'annuel',
    montantVente: c.montant_vente,
    tauxCommission: c.taux_commission,
    montantCommission: c.montant_commission,
    dateVente: c.date_vente,
    statut: c.statut,
  };
}

function mapObjectifToAdmin(o: ObjectifCommercial): ObjectifCommercialAdmin {
  return {
    id: o.id,
    commercialId: o.commercial_id,
    commercialNom: o.commercial_nom || '',
    type: o.type as 'ca' | 'ventes' | 'prospects',
    objectif: o.valeur_cible,
    realise: o.valeur_actuelle,
    periode: o.date_debut?.slice(0, 7) || '',
  };
}

function mapOffreToOrgOffer(o: Offre): OrgOffer {
  return {
    id: o.id,
    organization_id: o.organization_id,
    nom: o.nom,
    description: o.description || '',
    tarifs: o.tarifs || { mensuel: o.prix_mensuel || 0, trimestriel: (o.prix_mensuel || 0) * 3, annuel: o.prix_annuel || 0 },
    actif: o.actif,
    created_at: o.created_at,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [currency, setCurrency] = useState<string>('XOF');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Data state (initialized empty, fetched from Supabase)
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [relances, setRelances] = useState<Relance[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [clients, setClients] = useState<ClientFaciloop[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [offres, setOffres] = useState<Offre[]>([]);
  const [commerciaux, setCommerciaux] = useState<Commercial[]>([]);
  const [objectifsRaw, setObjectifsRaw] = useState<ObjectifCommercial[]>([]);
  const [commissionsRaw, setCommissionsRaw] = useState<Commission[]>([]);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);

  // Fetch all org data after user session is established
  const fetchAllData = useCallback(async (orgId: string) => {
    try {
      const [
        prospectsData,
        relancesData,
        interactionsData,
        notificationsData,
        clientsData,
        paiementsData,
        offresData,
        commerciauxData,
        objectifsData,
        commissionsData,
        logsData,
      ] = await Promise.all([
        prospectsService.getProspects(orgId),
        relancesService.getRelances(orgId),
        interactionsService.getInteractions(orgId),
        notificationsService.getNotifications(orgId),
        clientsService.getClients(orgId),
        paiementsService.getPaiements(orgId),
        offresService.getOffres(orgId),
        commerciauxService.getCommerciaux(orgId),
        objectifsService.getObjectifs(orgId),
        commissionsService.getCommissions(orgId),
        journalService.getActionLogs(orgId),
      ]);

      setProspects(prospectsData);
      setRelances(relancesData);
      setInteractions(interactionsData);
      setNotifications(notificationsData);
      setClients(clientsData);
      setPaiements(paiementsData);
      setOffres(offresData);
      setCommerciaux(commerciauxData);
      setObjectifsRaw(objectifsData);
      setCommissionsRaw(commissionsData);
      setActionLogs(logsData);
    } catch (e) {
      console.error('Erreur chargement données:', e);
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await buildUserSession(session.user.id, session.user.email || '');
        }
      } catch (e) {
        console.error('Erreur restauration session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentOrg(null);
      }
      if (event === 'SIGNED_IN' && session?.user) {
        await buildUserSession(session.user.id, session.user.email || '');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const buildUserSession = async (authId: string, email: string) => {
    const profile = await fetchUserProfile(authId);
    if (!profile) return;

    const sess: UserSession = {
      id: profile.profile?.id || authId,
      authId,
      commercialId: profile.role === 'commercial' ? profile.profile?.id : undefined,
      nom: profile.profile?.nom || 'Admin',
      prenom: profile.profile?.prenom || 'Super',
      telephone: profile.profile?.telephone || '',
      email: profile.profile?.email || email,
      role: profile.role,
      organizationId: profile.organizationId || '',
    };

    // Super admin sans org → pas de fetch org ni data
    if (!profile.organizationId) {
      setUser(sess);
      setCurrentOrg(null);
      return;
    }

    const { data: orgData } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organizationId)
      .single();

    if (orgData) {
      sess.orgStatut = orgData.statut;

      // Si org pas active → déconnecter (ne doit pas avoir de session persistante)
      if (orgData.statut !== 'actif') {
        await supabase.auth.signOut();
        setUser(null);
        return;
      }

      setCurrentOrg({
        id: orgData.id,
        nom: orgData.nom,
        logo_url: orgData.logo_url,
        devise_defaut: orgData.devise_defaut,
        statut: orgData.statut,
        pays: orgData.pays,
        ville: orgData.ville,
        adresse: orgData.adresse,
        telephone: orgData.telephone,
        email: orgData.email,
        site_web: orgData.site_web,
        secteur: orgData.secteur,
        created_at: orgData.created_at,
      });
    }

    setUser(sess);
    await fetchAllData(profile.organizationId);
  };

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setCurrentOrg(null);
        window.location.href = '/login';
      }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [user]);

  // Dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // ============================================
  // AUTH ACTIONS
  // ============================================
  const login = async (telephone: string, codeSecret: string): Promise<UserSession | null> => {
    const cleanPhone = telephone.replace(/\s+/g, '');
    const email = phoneToEmail(cleanPhone);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: codeSecret,
    });

    if (error) {
      console.error('Login error:', error.message);
      return null;
    }

    if (data.user) {
      const profile = await fetchUserProfile(data.user.id);
      if (!profile) return null;

      const sess: UserSession = {
        id: profile.profile?.id || data.user.id,
        authId: data.user.id,
        commercialId: profile.role === 'commercial' ? profile.profile?.id : undefined,
        nom: profile.profile?.nom || 'Admin',
        prenom: profile.profile?.prenom || 'Super',
        telephone: profile.profile?.telephone || '',
        email: profile.profile?.email || email,
        role: profile.role,
        organizationId: profile.organizationId || '',
      };

      if (profile.organizationId) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.organizationId)
          .single();

        if (orgData) {
          sess.orgStatut = orgData.statut;

          // Si org en attente ou suspendue → ne pas charger les données
          if (orgData.statut !== 'actif') {
            setUser(sess);
            await supabase.auth.signOut();
            return sess;
          }

          setCurrentOrg({
            id: orgData.id,
            nom: orgData.nom,
            logo_url: orgData.logo_url,
            devise_defaut: orgData.devise_defaut,
            statut: orgData.statut,
            pays: orgData.pays,
            ville: orgData.ville,
            adresse: orgData.adresse,
            telephone: orgData.telephone,
            email: orgData.email,
            site_web: orgData.site_web,
            secteur: orgData.secteur,
            created_at: orgData.created_at,
          });
        }

        setUser(sess);
        await fetchAllData(profile.organizationId);
      } else {
        setUser(sess);
      }

      return sess;
    }

    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentOrg(null);
  };

  const switchOrganization = (orgId: string) => {
    if (user && orgId) {
      setUser({ ...user, organizationId: orgId });
      fetchAllData(orgId);
    }
  };

  // ============================================
  // DATA FILTERING (CDC 3.2 Isolation)
  // ============================================
  const myProspects = useMemo(() => {
    if (!user) return [];
    if (user.role === 'commercial') {
      return prospects.filter(p => p.commercial_id === user.id);
    }
    return prospects;
  }, [prospects, user]);

  const myRelances = useMemo(() => {
    if (!user) return [];
    if (user.role === 'commercial') {
      return relances.filter(r => r.commercial_id === user.id);
    }
    return relances;
  }, [relances, user]);

  const myInteractions = useMemo(() => {
    if (!user) return [];
    if (user.role === 'commercial') {
      return interactions.filter(i => i.commercial_id === user.id);
    }
    return interactions;
  }, [interactions, user]);

  const orgOffers = useMemo(() => {
    return offres.map(mapOffreToOrgOffer);
  }, [offres]);

  const objectifs = useMemo(() => {
    return objectifsRaw.map(mapObjectifToAdmin);
  }, [objectifsRaw]);

  const commissions = useMemo(() => {
    return commissionsRaw.map(mapCommissionToEntry);
  }, [commissionsRaw]);

  // ============================================
  // LOGGING HELPER
  // ============================================
  const addActionLog = useCallback(async (log: Omit<ActionLog, 'id' | 'organization_id' | 'created_at'>) => {
    if (!user) return;
    try {
      const entry = await journalService.createActionLog({
        ...log,
        organization_id: user.organizationId,
      });
      setActionLogs(prev => [entry, ...prev]);
    } catch (e) {
      console.error('Erreur log action:', e);
    }
  }, [user]);

  // ============================================
  // CRUD COMMERCIAUX
  // ============================================
  const addCommercial = async (c: Omit<Commercial, 'id' | 'organization_id' | 'created_at'>) => {
    if (!user) return;
    try {
      const created = await commerciauxService.createCommercial({
        ...c,
        organization_id: user.organizationId,
      });
      setCommerciaux(prev => [created, ...prev]);
      addActionLog({
        utilisateur_id: user.id,
        utilisateur_nom: `${user.prenom} ${user.nom}`,
        action_type: 'commercial_added',
        action: 'Ajout d\'un commercial',
        entite_type: 'commercial',
        entite_id: created.id,
        cible: `${c.prenom} ${c.nom}`,
        nouvelle_valeur: c.email,
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      console.error('Erreur ajout commercial:', e);
    }
  };

  const updateCommercial = async (id: string, updates: Partial<Omit<Commercial, 'id' | 'organization_id' | 'created_at'>>) => {
    try {
      const updated = await commerciauxService.updateCommercial(id, updates);
      setCommerciaux(prev => prev.map(c => c.id === id ? updated : c));
    } catch (e) {
      console.error('Erreur mise à jour commercial:', e);
    }
  };

  const toggleCommercialStatus = async (id: string) => {
    const target = commerciaux.find(c => c.id === id);
    if (!target || !user) return;
    const newStatut = target.statut === 'actif' ? 'inactif' : 'actif';
    try {
      const updated = await commerciauxService.updateCommercial(id, { statut: newStatut });
      setCommerciaux(prev => prev.map(c => c.id === id ? updated : c));
      addActionLog({
        utilisateur_id: user.id,
        utilisateur_nom: `${user.prenom} ${user.nom}`,
        action_type: newStatut === 'inactif' ? 'commercial_removed' : 'commercial_added',
        action: newStatut === 'inactif' ? 'Désactivation d\'un commercial' : 'Réactivation d\'un commercial',
        entite_type: 'commercial',
        entite_id: id,
        cible: `${target.prenom} ${target.nom}`,
        ancienne_valeur: target.statut,
        nouvelle_valeur: newStatut,
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      console.error('Erreur toggle statut commercial:', e);
    }
  };

  // ============================================
  // CRUD OBJECTIFS
  // ============================================
  const addObjectif = async (o: Omit<ObjectifCommercialAdmin, 'id'>) => {
    if (!user) return;
    try {
      const created = await objectifsService.createObjectif({
        organization_id: user.organizationId,
        commercial_id: o.commercialId,
        commercial_nom: o.commercialNom,
        type: o.type as any,
        periode: 'mensuel',
        date_debut: `${o.periode}-01`,
        date_fin: `${o.periode}-28`,
        valeur_cible: o.objectif,
        valeur_actuelle: o.realise,
        statut: 'en_cours',
      });
      setObjectifsRaw(prev => [...prev, created]);
      addActionLog({
        utilisateur_id: user.id,
        utilisateur_nom: `${user.prenom} ${user.nom}`,
        action_type: 'objectif_created',
        action: 'Définition d\'un objectif',
        entite_type: 'objectif',
        entite_id: created.id,
        cible: `${o.commercialNom} — ${o.type}`,
        nouvelle_valeur: `Objectif: ${o.objectif} · ${o.periode}`,
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      console.error('Erreur ajout objectif:', e);
    }
  };

  const updateObjectif = async (id: string, updates: Partial<Omit<ObjectifCommercialAdmin, 'id'>>) => {
    try {
      const dbUpdates: Partial<ObjectifCommercial> = {};
      if (updates.objectif !== undefined) dbUpdates.valeur_cible = updates.objectif;
      if (updates.realise !== undefined) dbUpdates.valeur_actuelle = updates.realise;
      if (updates.commercialNom !== undefined) dbUpdates.commercial_nom = updates.commercialNom;
      if (updates.type !== undefined) dbUpdates.type = updates.type as any;

      const updated = await objectifsService.updateObjectif(id, dbUpdates);
      setObjectifsRaw(prev => prev.map(o => o.id === id ? updated : o));
    } catch (e) {
      console.error('Erreur mise à jour objectif:', e);
    }
  };

  const deleteObjectif = async (id: string) => {
    try {
      await objectifsService.deleteObjectif(id);
      setObjectifsRaw(prev => prev.filter(o => o.id !== id));
    } catch (e) {
      console.error('Erreur suppression objectif:', e);
    }
  };

  // ============================================
  // CRUD ORGANISATION
  // ============================================
  const updateOrganization = async (updates: Partial<Omit<Organization, 'id'>>) => {
    if (!user || !currentOrg) return;
    try {
      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', currentOrg.id);
      if (error) throw error;

      setCurrentOrg(prev => prev ? { ...prev, ...updates } : prev);
      addActionLog({
        utilisateur_id: user.id,
        utilisateur_nom: `${user.prenom} ${user.nom}`,
        action_type: 'org_settings_updated',
        action: 'Modification paramètres organisation',
        entite_type: 'organisation',
        entite_id: currentOrg.id,
        cible: currentOrg.nom,
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      console.error('Erreur mise à jour organisation:', e);
    }
  };

  // ============================================
  // CRUD PROSPECTS
  // ============================================
  const addProspect = async (newP: Omit<Prospect, 'id' | 'created_at' | 'organization_id'>): Promise<{ success: boolean; duplicate?: boolean; prospect?: Prospect }> => {
    if (!user) return { success: false };

    const formattedPhone = formatPhoneNumber(newP.telephone);
    const isDuplicate = prospects.some(
      p => formatPhoneNumber(p.telephone) === formattedPhone
    );

    if (isDuplicate) {
      return { success: false, duplicate: true };
    }

    try {
      const created = await prospectsService.createProspect({
        ...newP,
        telephone: formattedPhone,
        organization_id: user.organizationId,
        commercial_id: newP.commercial_id || (user.role === 'commercial' ? user.id : undefined),
        commercial_nom: newP.commercial_nom || `${user.prenom} ${user.nom}`,
      });

      setProspects(prev => [created, ...prev]);
      addActionLog({
        utilisateur_id: user.id,
        utilisateur_nom: `${user.prenom} ${user.nom}`,
        action_type: 'prospect_created',
        action: 'Création d\'un prospect',
        entite_type: 'prospect',
        entite_id: created.id,
        cible: created.entreprise || `${created.prenom || ''} ${created.nom}`,
        nouvelle_valeur: `Source: ${created.source} · Étape: ${created.statut_pipeline}`,
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      });
      return { success: true, prospect: created };
    } catch (e) {
      console.error('Erreur création prospect:', e);
      return { success: false };
    }
  };

  const updateProspectStatus = async (id: string, newStep: string, motifPerte?: string) => {
    const target = prospects.find(p => p.id === id);
    if (!target || !user) return;
    const oldStep = target.statut_pipeline;

    try {
      const updates: Partial<Prospect> = {
        statut_pipeline: newStep as any,
        date_derniere_interaction: new Date().toISOString(),
      };
      if (motifPerte) updates.motif_perte = motifPerte as any;

      const updated = await prospectsService.updateProspect(id, updates);
      setProspects(prev => prev.map(p => p.id === id ? updated : p));

      const actionType = newStep === 'gagne' ? 'prospect_converted' : newStep === 'perdu' ? 'prospect_lost' : 'prospect_pipeline_move';
      addActionLog({
        utilisateur_id: user.id,
        utilisateur_nom: `${user.prenom} ${user.nom}`,
        action_type: actionType,
        action: `Pipeline: ${oldStep} → ${newStep}`,
        entite_type: 'prospect',
        entite_id: id,
        cible: target.entreprise || `${target.prenom || ''} ${target.nom}`,
        ancienne_valeur: oldStep,
        nouvelle_valeur: newStep,
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      console.error('Erreur mise à jour pipeline:', e);
    }
  };

  const reassignProspects = async (prospectIds: string[], targetCommercialId: string, targetCommercialNom: string) => {
    if (!user) return;
    try {
      await Promise.all(
        prospectIds.map(id =>
          prospectsService.updateProspect(id, {
            commercial_id: targetCommercialId,
            commercial_nom: targetCommercialNom,
          })
        )
      );

      setProspects(prev =>
        prev.map(p =>
          prospectIds.includes(p.id)
            ? { ...p, commercial_id: targetCommercialId, commercial_nom: targetCommercialNom }
            : p
        )
      );

      addActionLog({
        utilisateur_id: user.id,
        utilisateur_nom: `${user.prenom} ${user.nom}`,
        action_type: 'prospect_reassigned',
        action: `Réattribution de ${prospectIds.length} prospect(s)`,
        entite_type: 'prospect',
        entite_id: prospectIds[0] || '',
        cible: targetCommercialNom,
        nouvelle_valeur: `${prospectIds.length} prospects → ${targetCommercialNom}`,
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      console.error('Erreur réattribution:', e);
    }
  };

  const deleteProspect = async (id: string) => {
    try {
      await prospectsService.deleteProspect(id);
      setProspects(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error('Erreur suppression prospect:', e);
    }
  };

  // ============================================
  // CRUD RELANCES & INTERACTIONS
  // ============================================
  const addRelance = async (newR: Omit<Relance, 'id' | 'created_at' | 'organization_id'>) => {
    if (!user) return;
    try {
      const created = await relancesService.createRelance({
        ...newR,
        organization_id: user.organizationId,
        commercial_id: newR.commercial_id || (user.role === 'commercial' ? user.id : undefined),
      });
      setRelances(prev => [created, ...prev]);
    } catch (e) {
      console.error('Erreur création relance:', e);
    }
  };

  const completeRelance = async (id: string) => {
    try {
      const updated = await relancesService.completeRelance(id);
      setRelances(prev => prev.map(r => r.id === id ? updated : r));
    } catch (e) {
      console.error('Erreur completion relance:', e);
    }
  };

  const addInteraction = async (newI: Omit<Interaction, 'id' | 'created_at' | 'organization_id'>) => {
    if (!user) return;
    try {
      const created = await interactionsService.createInteraction({
        ...newI,
        organization_id: user.organizationId,
        commercial_id: newI.commercial_id || (user.role === 'commercial' ? user.id : undefined),
      });
      setInteractions(prev => [created, ...prev]);
    } catch (e) {
      console.error('Erreur création interaction:', e);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationsService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lue: true } : n));
    } catch (e) {
      console.error('Erreur marquage notification:', e);
    }
  };

  // ============================================
  // CRUD ORG OFFERS
  // ============================================
  const addOrgOffer = async (offer: Omit<OrgOffer, 'id' | 'organization_id' | 'created_at'>) => {
    if (!user) return;
    try {
      const created = await offresService.createOffre({
        organization_id: user.organizationId,
        nom: offer.nom,
        description: offer.description,
        tarifs: offer.tarifs,
        actif: offer.actif,
      });
      setOffres(prev => [created, ...prev]);
      addActionLog({
        utilisateur_id: user.id,
        utilisateur_nom: `${user.prenom} ${user.nom}`,
        action_type: 'offer_created',
        action: 'Création d\'une offre',
        entite_type: 'offre',
        entite_id: created.id,
        cible: offer.nom,
        nouvelle_valeur: `${offer.tarifs.mensuel} FCFA/mois`,
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      console.error('Erreur création offre:', e);
    }
  };

  const updateOrgOffer = async (id: string, updates: Partial<Omit<OrgOffer, 'id' | 'organization_id' | 'created_at'>>) => {
    try {
      const dbUpdates: Partial<Offre> = {};
      if (updates.nom !== undefined) dbUpdates.nom = updates.nom;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.tarifs !== undefined) dbUpdates.tarifs = updates.tarifs;
      if (updates.actif !== undefined) dbUpdates.actif = updates.actif;

      const updated = await offresService.updateOffre(id, dbUpdates);
      setOffres(prev => prev.map(o => o.id === id ? updated : o));
      addActionLog({
        utilisateur_id: user?.id || '',
        utilisateur_nom: user ? `${user.prenom} ${user.nom}` : 'Système',
        action_type: 'offer_updated',
        action: 'Modification d\'une offre',
        entite_type: 'offre',
        entite_id: id,
        cible: updates.nom || '',
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      console.error('Erreur mise à jour offre:', e);
    }
  };

  const deleteOrgOffer = async (id: string) => {
    const target = offres.find(o => o.id === id);
    try {
      await offresService.deleteOffre(id);
      setOffres(prev => prev.filter(o => o.id !== id));
      addActionLog({
        utilisateur_id: user?.id || '',
        utilisateur_nom: user ? `${user.prenom} ${user.nom}` : 'Système',
        action_type: 'offer_deleted',
        action: 'Suppression d\'une offre',
        entite_type: 'offre',
        entite_id: id,
        cible: target?.nom || '',
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      console.error('Erreur suppression offre:', e);
    }
  };

  // ============================================
  // CONVERSION PROSPECT → CLIENT
  // ============================================
  const convertProspectToClient = async (prospectId: string, formule: string, options?: { frequence?: string; montant?: number; modePaiement?: ModePaiement }) => {
    if (!user) return;
    const p = prospects.find(item => item.id === prospectId);
    if (!p) return;

    const freq = (options?.frequence || 'mensuel') as 'mensuel' | 'trimestriel' | 'annuel';
    const offer = offres.find(o => o.nom === formule);
    const tarifs = offer?.tarifs;
    const montant = options?.montant || (tarifs ? tarifs[freq] : null) || p.budget_estime || 500000;
    const modePaiement = options?.modePaiement || 'wave';

    try {
      const newClient = await clientsService.createClient({
        organization_id: p.organization_id,
        prospect_id: p.id,
        commercial_id: p.commercial_id || user.id,
        entreprise: p.entreprise,
        nom_responsable: `${p.prenom || ''} ${p.nom}`.trim(),
        telephone: p.telephone,
        whatsapp: p.whatsapp,
        email: p.email,
        pays: p.pays,
        ville: p.ville,
        secteur_activite: p.secteur_activite,
        formule_souscrite: formule,
        statut_compte: 'actif',
        statut_abonnement: 'actif',
        montant_paye: montant,
        prochain_renouvellement: new Date(Date.now() + (freq === 'annuel' ? 365 : freq === 'trimestriel' ? 90 : 30) * 86400000).toISOString().split('T')[0],
        nombre_utilisateurs: 5,
      });

      const newPaiement = await paiementsService.createPaiement({
        organization_id: p.organization_id,
        client_id: newClient.id,
        commercial_id: p.commercial_id || user.id,
        entreprise: p.entreprise || `${p.prenom || ''} ${p.nom}`.trim(),
        montant_attendu: montant,
        montant_paye: montant,
        montant_restant: 0,
        date_paiement: new Date().toISOString().split('T')[0],
        mode_paiement: modePaiement,
        reference_transaction: `${modePaiement.toUpperCase().slice(0, 2)}-${Date.now().toString().slice(-9)}`,
        statut: 'valide',
        justificatif_commentaire: `Souscription ${formule} — conversion prospect.`,
      });

      setClients(prev => [newClient, ...prev]);
      setPaiements(prev => [newPaiement, ...prev]);
      await updateProspectStatus(prospectId, 'gagne');

      addActionLog({
        utilisateur_id: user.id,
        utilisateur_nom: `${user.prenom} ${user.nom}`,
        action_type: 'prospect_converted',
        action: 'Conversion prospect en client',
        entite_type: 'prospect',
        entite_id: prospectId,
        cible: p.entreprise || `${p.prenom || ''} ${p.nom}`,
        ancienne_valeur: `Prospect — ${p.statut_pipeline}`,
        nouvelle_valeur: `Client actif — ${formule}`,
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      console.error('Erreur conversion prospect:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        currentOrg,
        currency,
        setCurrency,
        isDarkMode,
        toggleDarkMode,
        login,
        logout,
        switchOrganization,
        prospects,
        relances,
        interactions,
        notifications,
        clients,
        paiements,
        myProspects,
        myRelances,
        myInteractions,
        addProspect,
        updateProspectStatus,
        reassignProspects,
        deleteProspect,
        addRelance,
        completeRelance,
        addInteraction,
        markNotificationAsRead,
        convertProspectToClient,
        orgOffers,
        addOrgOffer,
        updateOrgOffer,
        deleteOrgOffer,
        commerciaux,
        addCommercial,
        updateCommercial,
        toggleCommercialStatus,
        objectifs,
        addObjectif,
        updateObjectif,
        deleteObjectif,
        commissions,
        actionLogs,
        addActionLog,
        updateOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
