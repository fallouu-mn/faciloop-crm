import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { UserRole, Organization, Commercial, Prospect, Relance, Interaction, NotificationItem, ClientFaciloop, Paiement, ActionLog, ActionLogType } from '../types/crm';
import { mockOrganizations, mockCommerciaux, mockProspects, mockRelances, mockInteractions, mockNotifications, mockClients, mockPaiements, mockActionLogs } from '../lib/mockData';
import { formatPhoneNumber } from '../lib/phoneUtils';
import { OrgOffer, mockOrgOffers, ObjectifCommercialAdmin, mockObjectifsAdmin, CommissionEntry, mockCommissions } from '../lib/mockAdminOrg';

export interface UserSession {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

interface AuthContextType {
  user: UserSession | null;
  currentOrg: Organization | null;
  currency: string;
  setCurrency: (c: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  login: (telephone: string, codeSecret: string) => Promise<UserSession | null>;
  logout: () => void;
  switchOrganization: (orgId: string) => void;
  
  // All raw state data (Admin Org & Super Admin view)
  prospects: Prospect[];
  relances: Relance[];
  interactions: Interaction[];
  notifications: NotificationItem[];
  clients: ClientFaciloop[];
  paiements: Paiement[];

  // Filtered views strictly for Commercial role (CDC 3.2 Isolation)
  myProspects: Prospect[];
  myRelances: Relance[];
  myInteractions: Interaction[];

  // State mutators
  addProspect: (p: Omit<Prospect, 'id' | 'created_at' | 'organization_id'>) => { success: boolean; duplicate?: boolean; prospect?: Prospect };
  updateProspectStatus: (id: string, newStep: string, motifPerte?: string) => void;
  reassignProspects: (prospectIds: string[], targetCommercialId: string, targetCommercialNom: string) => void;
  deleteProspect: (id: string) => void;
  
  addRelance: (r: Omit<Relance, 'id' | 'created_at' | 'organization_id'>) => void;
  completeRelance: (id: string) => void;
  
  addInteraction: (i: Omit<Interaction, 'id' | 'created_at' | 'organization_id'>) => void;
  markNotificationAsRead: (id: string) => void;
  convertProspectToClient: (prospectId: string, formule: string, options?: { frequence?: string; montant?: number; modePaiement?: string }) => void;

  // Org-specific offers (Admin Org → ses propres offres pour ses clients)
  orgOffers: OrgOffer[];
  addOrgOffer: (offer: Omit<OrgOffer, 'id' | 'organization_id' | 'created_at'>) => void;
  updateOrgOffer: (id: string, updates: Partial<Omit<OrgOffer, 'id' | 'organization_id' | 'created_at'>>) => void;
  deleteOrgOffer: (id: string) => void;

  // Commerciaux (team management)
  commerciaux: Commercial[];
  addCommercial: (c: Omit<Commercial, 'id' | 'organization_id' | 'created_at'>) => void;
  updateCommercial: (id: string, updates: Partial<Omit<Commercial, 'id' | 'organization_id' | 'created_at'>>) => void;
  toggleCommercialStatus: (id: string) => void;

  // Objectifs
  objectifs: ObjectifCommercialAdmin[];
  addObjectif: (o: Omit<ObjectifCommercialAdmin, 'id'>) => void;
  updateObjectif: (id: string, updates: Partial<Omit<ObjectifCommercialAdmin, 'id'>>) => void;
  deleteObjectif: (id: string) => void;

  // Commissions
  commissions: CommissionEntry[];

  // Journal d'activité (audit log)
  actionLogs: ActionLog[];
  addActionLog: (log: Omit<ActionLog, 'id' | 'organization_id' | 'created_at'>) => void;

  // Organisation settings
  updateOrganization: (updates: Partial<Omit<Organization, 'id'>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getRoleFromPath(path: string): UserRole {
  if (path.startsWith('/super-admin')) return 'super_admin';
  if (path.startsWith('/admin')) return 'admin_org';
  return 'commercial';
}

function getInitialUserFromPath(): { user: UserSession; orgIndex: number } {
  const path = window.location.pathname;
  const role = getRoleFromPath(path);

  // Persist role to localStorage so it survives refresh even if path detection has a timing issue
  try { localStorage.setItem('faciloop_crm_role', role); } catch {}

  if (role === 'super_admin') {
    return {
      user: { id: 'super-admin-1', nom: 'Digit', prenom: 'Advisor Admin', telephone: '+221770000000', email: 'admin@digitadvisor.sn', role: 'super_admin', organizationId: 'org-digitadvisor' },
      orgIndex: 0,
    };
  }
  if (role === 'admin_org') {
    return {
      user: { id: 'admin-org-1', nom: 'Ndiaye', prenom: 'Fatou', telephone: '+221789998877', email: 'fatou.ndiaye@teranga.sn', role: 'admin_org', organizationId: 'org-faciloop-client-1' },
      orgIndex: 1,
    };
  }
  return {
    user: { id: 'comm-1', nom: 'Diop', prenom: 'Moussa', telephone: '+221771234567', email: 'moussa.diop@teranga.sn', role: 'commercial', organizationId: 'org-faciloop-client-1' },
    orgIndex: 1,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = getInitialUserFromPath();
  const [user, setUser] = useState<UserSession | null>(initial.user);

  const [currentOrg, setCurrentOrg] = useState<Organization | null>(mockOrganizations[initial.orgIndex]);
  const [currency, setCurrency] = useState<string>('XOF');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Keep role synced with current path on navigation (ensures sidebar stays correct after refresh)
  useEffect(() => {
    const syncRole = () => {
      const role = getRoleFromPath(window.location.pathname);
      try { localStorage.setItem('faciloop_crm_role', role); } catch {}
      if (user && user.role !== role) {
        const synced = getInitialUserFromPath();
        setUser(synced.user);
        setCurrentOrg(mockOrganizations[synced.orgIndex]);
      }
    };
    window.addEventListener('popstate', syncRole);
    return () => window.removeEventListener('popstate', syncRole);
  }, [user]);

  // Initializing dark mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // State data store
  const [prospects, setProspects] = useState<Prospect[]>(mockProspects);
  const [relances, setRelances] = useState<Relance[]>(mockRelances);
  const [interactions, setInteractions] = useState<Interaction[]>(mockInteractions);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [clients, setClients] = useState<ClientFaciloop[]>(mockClients);
  const [paiements, setPaiements] = useState<Paiement[]>(mockPaiements);
  const [orgOffers, setOrgOffers] = useState<OrgOffer[]>(mockOrgOffers);

  const [commerciaux, setCommerciaux] = useState<Commercial[]>(mockCommerciaux);
  const [objectifs, setObjectifs] = useState<ObjectifCommercialAdmin[]>(mockObjectifsAdmin);
  const [commissions] = useState<CommissionEntry[]>(mockCommissions);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>(mockActionLogs);

  // Auto-logging helper
  const addActionLog = useCallback((log: Omit<ActionLog, 'id' | 'organization_id' | 'created_at'>) => {
    const entry: ActionLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      organization_id: user?.organizationId || 'org-faciloop-client-1',
      created_at: new Date().toISOString(),
    };
    setActionLogs(prev => [entry, ...prev]);
  }, [user]);

  // Commerciaux CRUD
  const myCommerciaux = useMemo(() => {
    if (!user) return [];
    return commerciaux.filter(c => c.organization_id === user.organizationId);
  }, [commerciaux, user]);

  const addCommercial = (c: Omit<Commercial, 'id' | 'organization_id' | 'created_at'>) => {
    const created: Commercial = {
      ...c,
      id: `comm-${Date.now()}`,
      organization_id: user?.organizationId || 'org-faciloop-client-1',
      created_at: new Date().toISOString(),
    };
    setCommerciaux(prev => [created, ...prev]);
    addActionLog({
      utilisateur_id: user?.id || '',
      utilisateur_nom: user ? `${user.prenom} ${user.nom}` : 'Système',
      action_type: 'commercial_added',
      action: 'Ajout d\'un commercial',
      entite_type: 'commercial',
      entite_id: created.id,
      cible: `${c.prenom} ${c.nom}`,
      nouvelle_valeur: c.email,
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const updateCommercial = (id: string, updates: Partial<Omit<Commercial, 'id' | 'organization_id' | 'created_at'>>) => {
    setCommerciaux(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const toggleCommercialStatus = (id: string) => {
    const target = commerciaux.find(c => c.id === id);
    if (!target) return;
    const newStatut = target.statut === 'actif' ? 'inactif' : 'actif';
    setCommerciaux(prev => prev.map(c => c.id === id ? { ...c, statut: newStatut } : c));
    addActionLog({
      utilisateur_id: user?.id || '',
      utilisateur_nom: user ? `${user.prenom} ${user.nom}` : 'Système',
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
  };

  // Objectifs CRUD
  const myObjectifs = useMemo(() => {
    if (!user) return [];
    return objectifs;
  }, [objectifs, user]);

  const addObjectif = (o: Omit<ObjectifCommercialAdmin, 'id'>) => {
    const created: ObjectifCommercialAdmin = { ...o, id: `obj-${Date.now()}` };
    setObjectifs(prev => [...prev, created]);
    addActionLog({
      utilisateur_id: user?.id || '',
      utilisateur_nom: user ? `${user.prenom} ${user.nom}` : 'Système',
      action_type: 'objectif_created',
      action: 'Définition d\'un objectif',
      entite_type: 'objectif',
      entite_id: created.id,
      cible: `${o.commercialNom} — ${o.type}`,
      nouvelle_valeur: `Objectif: ${o.objectif} · ${o.periode}`,
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const updateObjectif = (id: string, updates: Partial<Omit<ObjectifCommercialAdmin, 'id'>>) => {
    setObjectifs(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteObjectif = (id: string) => {
    setObjectifs(prev => prev.filter(o => o.id !== id));
  };

  // Organisation update
  const updateOrganization = (updates: Partial<Omit<Organization, 'id'>>) => {
    setCurrentOrg(prev => prev ? { ...prev, ...updates } : prev);
    addActionLog({
      utilisateur_id: user?.id || '',
      utilisateur_nom: user ? `${user.prenom} ${user.nom}` : 'Système',
      action_type: 'org_settings_updated',
      action: 'Modification paramètres organisation',
      entite_type: 'organisation',
      entite_id: user?.organizationId || '',
      cible: currentOrg?.nom || '',
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // CDC 3.2: Filtered lists restricted strictly to user's assigned portfolio if role === 'commercial'
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

  const login = async (telephone: string, codeSecret: string): Promise<UserSession | null> => {
    const cleanPhone = telephone.replace(/\s+/g, '');
    
    // Super-Admin fallback (phone contains 770000000 or pin is '0000' or '000000')
    if (cleanPhone.includes('770000000') || cleanPhone.includes('99999') || codeSecret === '0000' || codeSecret === '000000') {
      const sess: UserSession = {
        id: 'super-admin-1',
        nom: 'Digit',
        prenom: "Advisor Admin",
        telephone: telephone,
        email: 'admin@digitadvisor.sn',
        role: 'super_admin',
        organizationId: 'org-digitadvisor'
      };
      setUser(sess);
      setCurrentOrg(mockOrganizations[0]);
      return sess;
    }

    // Admin Org fallback (phone contains 789998877 or pin is '1111' or '111111')
    if (cleanPhone.includes('789998877') || codeSecret === '1111' || codeSecret === '111111') {
      const sess: UserSession = {
        id: 'admin-org-1',
        nom: 'Manager',
        prenom: 'Teranga Admin',
        telephone: telephone,
        email: 'admin@teranga.sn',
        role: 'admin_org',
        organizationId: 'org-faciloop-client-1'
      };
      setUser(sess);
      setCurrentOrg(mockOrganizations[1]);
      return sess;
    }

    // Standard Commercial login
    const foundComm = mockCommerciaux.find(c => c.telephone.replace(/\s+/g, '') === cleanPhone);
    const comm = foundComm || mockCommerciaux[0];
    const sess: UserSession = {
      id: comm.id,
      nom: comm.nom,
      prenom: comm.prenom,
      telephone: comm.telephone,
      email: comm.email,
      role: 'commercial',
      organizationId: comm.organization_id
    };
    setUser(sess);
    const org = mockOrganizations.find(o => o.id === comm.organization_id) || mockOrganizations[1];
    setCurrentOrg(org);
    return sess;
  };

  const logout = () => {
    setUser(null);
  };

  const switchOrganization = (orgId: string) => {
    const org = mockOrganizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      if (user) {
        setUser({ ...user, organizationId: orgId });
      }
    }
  };

  // Anti-Duplicate phone check & add prospect
  const addProspect = (newP: Omit<Prospect, 'id' | 'created_at' | 'organization_id'>) => {
    const formattedPhone = formatPhoneNumber(newP.telephone);
    const isDuplicate = prospects.some(
      p => p.organization_id === (user?.organizationId || 'org-faciloop-client-1') &&
           formatPhoneNumber(p.telephone) === formattedPhone
    );

    if (isDuplicate) {
      return { success: false, duplicate: true };
    }

    const created: Prospect = {
      ...newP,
      telephone: formattedPhone,
      id: `prospect-${Date.now()}`,
      organization_id: user?.organizationId || 'org-faciloop-client-1',
      commercial_id: newP.commercial_id || (user?.role === 'commercial' ? user.id : undefined),
      commercial_nom: newP.commercial_nom || (user ? `${user.prenom} ${user.nom}` : undefined),
      created_at: new Date().toISOString()
    };

    setProspects(prev => [created, ...prev]);
    addActionLog({
      utilisateur_id: user?.id || '',
      utilisateur_nom: user ? `${user.prenom} ${user.nom}` : 'Système',
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
  };

  const updateProspectStatus = (id: string, newStep: string, motifPerte?: string) => {
    const target = prospects.find(p => p.id === id);
    const oldStep = target?.statut_pipeline || '';
    setProspects(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            statut_pipeline: newStep as any,
            motif_perte: motifPerte as any || p.motif_perte,
            date_derniere_interaction: new Date().toISOString()
          };
        }
        return p;
      })
    );
    if (target) {
      const actionType = newStep === 'gagne' ? 'prospect_converted' : newStep === 'perdu' ? 'prospect_lost' : 'prospect_pipeline_move';
      addActionLog({
        utilisateur_id: user?.id || '',
        utilisateur_nom: user ? `${user.prenom} ${user.nom}` : 'Système',
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
    }
  };

  // CDC 3.1 Bulk Reassign Prospects by Admin
  const reassignProspects = (prospectIds: string[], targetCommercialId: string, targetCommercialNom: string) => {
    const idSet = new Set(prospectIds);
    setProspects(prev =>
      prev.map(p => {
        if (idSet.has(p.id)) {
          return {
            ...p,
            commercial_id: targetCommercialId,
            commercial_nom: targetCommercialNom
          };
        }
        return p;
      })
    );
    addActionLog({
      utilisateur_id: user?.id || '',
      utilisateur_nom: user ? `${user.prenom} ${user.nom}` : 'Système',
      action_type: 'prospect_reassigned',
      action: `Réattribution de ${prospectIds.length} prospect(s)`,
      entite_type: 'prospect',
      entite_id: prospectIds[0] || '',
      cible: targetCommercialNom,
      nouvelle_valeur: `${prospectIds.length} prospects → ${targetCommercialNom}`,
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const deleteProspect = (id: string) => {
    setProspects(prev => prev.filter(p => p.id !== id));
  };

  const addRelance = (newR: Omit<Relance, 'id' | 'created_at' | 'organization_id'>) => {
    const created: Relance = {
      ...newR,
      id: `relance-${Date.now()}`,
      organization_id: user?.organizationId || 'org-faciloop-client-1',
      commercial_id: newR.commercial_id || (user?.role === 'commercial' ? user.id : undefined),
      created_at: new Date().toISOString()
    };
    setRelances(prev => [created, ...prev]);
  };

  const completeRelance = (id: string) => {
    setRelances(prev =>
      prev.map(r => (r.id === id ? { ...r, statut: 'realisee' } : r))
    );
  };

  const addInteraction = (newI: Omit<Interaction, 'id' | 'created_at' | 'organization_id'>) => {
    const created: Interaction = {
      ...newI,
      id: `inter-${Date.now()}`,
      organization_id: user?.organizationId || 'org-faciloop-client-1',
      commercial_id: newI.commercial_id || (user?.role === 'commercial' ? user.id : undefined),
      created_at: new Date().toISOString()
    };
    setInteractions(prev => [created, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, lue: true } : n))
    );
  };

  // --- Org Offers CRUD (offers propres à l'organisation) ---
  const myOrgOffers = useMemo(() => {
    if (!user) return [];
    return orgOffers.filter(o => o.organization_id === user.organizationId);
  }, [orgOffers, user]);

  const addOrgOffer = (offer: Omit<OrgOffer, 'id' | 'organization_id' | 'created_at'>) => {
    const created: OrgOffer = {
      ...offer,
      id: `org-offer-${Date.now()}`,
      organization_id: user?.organizationId || 'org-faciloop-client-1',
      created_at: new Date().toISOString(),
    };
    setOrgOffers(prev => [created, ...prev]);
    addActionLog({
      utilisateur_id: user?.id || '',
      utilisateur_nom: user ? `${user.prenom} ${user.nom}` : 'Système',
      action_type: 'offer_created',
      action: 'Création d\'une offre',
      entite_type: 'offre',
      entite_id: created.id,
      cible: offer.nom,
      nouvelle_valeur: `${offer.tarifs.mensuel} FCFA/mois`,
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const updateOrgOffer = (id: string, updates: Partial<Omit<OrgOffer, 'id' | 'organization_id' | 'created_at'>>) => {
    setOrgOffers(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
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
  };

  const deleteOrgOffer = (id: string) => {
    const target = orgOffers.find(o => o.id === id);
    setOrgOffers(prev => prev.filter(o => o.id !== id));
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
  };

  const convertProspectToClient = (prospectId: string, formule: string, options?: { frequence?: string; montant?: number; modePaiement?: string }) => {
    const p = prospects.find(item => item.id === prospectId);
    if (!p) return;

    const freq = (options?.frequence || 'mensuel') as 'mensuel' | 'trimestriel' | 'annuel';
    const offer = myOrgOffers.find(o => o.nom === formule);
    const montant = options?.montant || offer?.tarifs[freq] || p.budget_estime || 500000;
    const modePaiement = options?.modePaiement || 'wave';

    const clientId = `client-${Date.now()}`;
    const newClient: ClientFaciloop = {
      id: clientId,
      organization_id: p.organization_id,
      prospect_id: p.id,
      commercial_id: p.commercial_id || user?.id,
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
      created_at: new Date().toISOString()
    };

    // Create associated payment entry
    const newPaiement: Paiement = {
      id: `pay-${Date.now()}`,
      organization_id: p.organization_id,
      client_id: clientId,
      abonnement_id: `ab-${Date.now()}`,
      commercial_id: p.commercial_id || user?.id,
      entreprise: p.entreprise || `${p.prenom || ''} ${p.nom}`.trim(),
      montant_attendu: montant,
      montant_paye: montant,
      montant_restant: 0,
      date_paiement: new Date().toISOString().split('T')[0],
      mode_paiement: modePaiement,
      reference_transaction: `${modePaiement.toUpperCase().slice(0, 2)}-${Date.now().toString().slice(-9)}`,
      statut: 'valide',
      justificatif_commentaire: `Souscription ${formule} — conversion prospect.`,
      created_at: new Date().toISOString()
    };

    setClients(prev => [newClient, ...prev]);
    setPaiements(prev => [newPaiement, ...prev]);
    updateProspectStatus(prospectId, 'gagne');
    addActionLog({
      utilisateur_id: user?.id || '',
      utilisateur_nom: user ? `${user.prenom} ${user.nom}` : 'Système',
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
        orgOffers: myOrgOffers,
        addOrgOffer,
        updateOrgOffer,
        deleteOrgOffer,
        commerciaux: myCommerciaux,
        addCommercial,
        updateCommercial,
        toggleCommercialStatus,
        objectifs: myObjectifs,
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
