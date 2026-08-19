import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { UserRole, Organization, Commercial, Prospect, Relance, Interaction, NotificationItem, ClientFaciloop } from '../types/crm';
import { mockOrganizations, mockCommerciaux, mockProspects, mockRelances, mockInteractions, mockNotifications, mockClients } from '../lib/mockData';
import { formatPhoneNumber } from '../lib/phoneUtils';

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
  convertProspectToClient: (prospectId: string, formule: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default session set to commercial Moussa Diop (id: 'comm-1')
  const [user, setUser] = useState<UserSession | null>({
    id: 'comm-1',
    nom: 'Diop',
    prenom: 'Moussa',
    telephone: '+221771234567',
    email: 'moussa.diop@teranga.sn',
    role: 'commercial',
    organizationId: 'org-faciloop-client-1'
  });

  const [currentOrg, setCurrentOrg] = useState<Organization | null>(mockOrganizations[1]);
  const [currency, setCurrency] = useState<string>('XOF');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

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
    
    // Super-Admin fallback (e.g. 770000000 or admin secret code)
    if (cleanPhone.includes('99999') || codeSecret === '0000') {
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

    // Admin Org fallback
    if (codeSecret === '1111') {
      const sess: UserSession = {
        id: 'admin-org-1',
        nom: 'Manager',
        prenom: 'Teranga',
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
    if (foundComm || codeSecret.length >= 4) {
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
    }

    return null;
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
    return { success: true, prospect: created };
  };

  const updateProspectStatus = (id: string, newStep: string, motifPerte?: string) => {
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

  const convertProspectToClient = (prospectId: string, formule: string) => {
    const p = prospects.find(item => item.id === prospectId);
    if (!p) return;

    const newClient: ClientFaciloop = {
      id: `client-${Date.now()}`,
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
      montant_paye: p.budget_estime || 500000,
      prochain_renouvellement: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      nombre_utilisateurs: 5,
      created_at: new Date().toISOString()
    };

    setClients(prev => [newClient, ...prev]);
    updateProspectStatus(prospectId, 'gagne');
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
        convertProspectToClient
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
