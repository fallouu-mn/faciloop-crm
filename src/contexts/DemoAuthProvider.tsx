import React, { useState, useMemo } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';
import {
  DEMO_USER_SESSION, DEMO_ORG, DEMO_COMMERCIAUX, DEMO_PROSPECTS, DEMO_CLIENTS,
  DEMO_RELANCES, DEMO_INTERACTIONS, DEMO_NOTIFICATIONS, DEMO_PAIEMENTS,
  DEMO_OBJECTIFS, DEMO_COMMISSIONS, DEMO_ACTION_LOGS, DEMO_ORG_OFFERS, DEMO_ORG_ID,
} from '../lib/demoData';
import type { Prospect, ClientFaciloop } from '../types/crm';
import type { OrgOffer, CommissionEntry, ObjectifCommercialAdmin } from '../lib/mockAdminOrg';

export const DemoAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prospects, setProspects] = useState(DEMO_PROSPECTS);
  const [relances, setRelances] = useState(DEMO_RELANCES);
  const [interactions, setInteractions] = useState(DEMO_INTERACTIONS);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [clients, setClients] = useState<ClientFaciloop[]>(DEMO_CLIENTS);
  const [paiements] = useState(DEMO_PAIEMENTS);
  const [commerciaux, setCommerciaux] = useState(DEMO_COMMERCIAUX);
  const [objectifs, setObjectifs] = useState<ObjectifCommercialAdmin[]>(DEMO_OBJECTIFS);
  const [commissions] = useState<CommissionEntry[]>(DEMO_COMMISSIONS);
  const [actionLogs, setActionLogs] = useState(DEMO_ACTION_LOGS);
  const [orgOffers, setOrgOffers] = useState<OrgOffer[]>(DEMO_ORG_OFFERS);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currency, setCurrency] = useState('XOF');

  const user = DEMO_USER_SESSION;
  const currentOrg = DEMO_ORG;

  const myProspects = useMemo(() => prospects, [prospects]);
  const myRelances = useMemo(() => relances, [relances]);
  const myInteractions = useMemo(() => interactions, [interactions]);

  const addProspect = async (newP: Omit<Prospect, 'id' | 'created_at' | 'organization_id'>) => {
    const created: Prospect = { ...newP, id: `demo-new-${Date.now()}`, created_at: new Date().toISOString(), organization_id: DEMO_ORG_ID };
    setProspects(prev => [created, ...prev]);
    return { success: true, prospect: created };
  };

  const updateProspectStatus = (id: string, newStep: string, motifPerte?: string) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, statut_pipeline: newStep as any, ...(motifPerte ? { motif_perte: motifPerte as any } : {}) } : p));
  };

  const reassignProspects = (ids: string[], commercialId: string, commercialNom: string) => {
    setProspects(prev => prev.map(p => ids.includes(p.id) ? { ...p, commercial_id: commercialId, commercial_nom: commercialNom } : p));
  };

  const deleteProspect = (id: string) => setProspects(prev => prev.filter(p => p.id !== id));

  const addRelance = (newR: any) => {
    const created = { ...newR, id: `demo-r-${Date.now()}`, created_at: new Date().toISOString(), organization_id: DEMO_ORG_ID };
    setRelances(prev => [created, ...prev]);
  };

  const completeRelance = (id: string) => {
    setRelances(prev => prev.map(r => r.id === id ? { ...r, statut: 'realisee' as const } : r));
  };

  const addInteraction = (newI: any) => {
    const created = { ...newI, id: `demo-i-${Date.now()}`, created_at: new Date().toISOString(), organization_id: DEMO_ORG_ID };
    setInteractions(prev => [created, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lue: true } : n));
  };

  const convertProspectToClient = (prospectId: string, formule: string) => {
    const p = prospects.find(x => x.id === prospectId);
    if (!p) return;
    const newClient: ClientFaciloop = {
      id: `demo-cl-${Date.now()}`, organization_id: DEMO_ORG_ID, prospect_id: prospectId,
      commercial_id: p.commercial_id, entreprise: p.entreprise || p.nom,
      nom_responsable: `${p.prenom || ''} ${p.nom}`.trim(), telephone: p.telephone,
      formule_souscrite: formule, statut_compte: 'actif', statut_abonnement: 'actif',
      montant_paye: p.budget_estime || 150000, nombre_utilisateurs: 5,
      created_at: new Date().toISOString(),
    };
    setClients(prev => [newClient, ...prev]);
    updateProspectStatus(prospectId, 'gagne');
  };

  const addCommercial = async (c: any) => {
    const created = { ...c, id: `demo-comm-${Date.now()}`, organization_id: DEMO_ORG_ID, created_at: new Date().toISOString() };
    setCommerciaux(prev => [created, ...prev]);
  };

  const updateCommercial = async (id: string, updates: any) => {
    setCommerciaux(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const toggleCommercialStatus = (id: string) => {
    setCommerciaux(prev => prev.map(c => c.id === id ? { ...c, statut: c.statut === 'actif' ? 'inactif' as const : 'actif' as const } : c));
  };

  const addObjectif = async (o: Omit<ObjectifCommercialAdmin, 'id'>) => {
    const created: ObjectifCommercialAdmin = { ...o, id: `demo-obj-${Date.now()}` };
    setObjectifs(prev => [...prev, created]);
  };

  const updateObjectif = async (id: string, updates: Partial<Omit<ObjectifCommercialAdmin, 'id'>>) => {
    setObjectifs(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteObjectif = async (id: string) => {
    setObjectifs(prev => prev.filter(o => o.id !== id));
  };

  const addOrgOffer = async (offer: Omit<OrgOffer, 'id' | 'organization_id' | 'created_at'>) => {
    const created: OrgOffer = { ...offer, id: `demo-offer-${Date.now()}`, organization_id: DEMO_ORG_ID, created_at: new Date().toISOString() };
    setOrgOffers(prev => [created, ...prev]);
  };

  const updateOrgOffer = async (id: string, updates: Partial<Omit<OrgOffer, 'id' | 'organization_id' | 'created_at'>>) => {
    setOrgOffers(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteOrgOffer = async (id: string) => {
    setOrgOffers(prev => prev.filter(o => o.id !== id));
  };

  const addActionLog = (log: any) => {
    const entry = { ...log, id: `demo-log-${Date.now()}`, organization_id: DEMO_ORG_ID, created_at: new Date().toISOString() };
    setActionLogs(prev => [entry, ...prev]);
  };

  const updateOrganization = async () => {};
  const login = async () => null;
  const logout = () => {};
  const switchOrganization = () => {};

  const value: AuthContextType = {
    user, isLoading: false, currentOrg, currency, setCurrency,
    isDarkMode, toggleDarkMode: () => setIsDarkMode(p => !p),
    login, logout, switchOrganization,
    prospects, relances, interactions, notifications, clients, paiements,
    myProspects, myRelances, myInteractions,
    addProspect, updateProspectStatus, reassignProspects, deleteProspect,
    addRelance, completeRelance, addInteraction, markNotificationAsRead, convertProspectToClient,
    orgOffers, addOrgOffer, updateOrgOffer, deleteOrgOffer,
    commerciaux, addCommercial, updateCommercial, toggleCommercialStatus,
    objectifs, addObjectif, updateObjectif, deleteObjectif,
    commissions, actionLogs, addActionLog, updateOrganization,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
