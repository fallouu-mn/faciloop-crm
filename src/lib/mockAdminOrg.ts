// Données mock centralisées pour l'Admin Org (Gestion commerciale)
// TODO: Remplacer par appels API (GET /api/admin-org/...)

// --- Offres propres à l'organisation (≠ offres SaaS du Super Admin) ---
export interface OrgOfferPricing {
  mensuel: number;
  trimestriel: number;
  annuel: number;
}

export interface OrgOffer {
  id: string;
  organization_id: string;
  nom: string;
  description: string;
  tarifs: OrgOfferPricing;
  actif: boolean;
  created_at: string;
}

export const mockOrgOffers: OrgOffer[] = [
  {
    id: 'org-offer-1',
    organization_id: 'org-faciloop-client-1',
    nom: 'Standard',
    description: 'Accès basique aux services de logistique',
    tarifs: { mensuel: 150000, trimestriel: 405000, annuel: 1440000 },
    actif: true,
    created_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'org-offer-2',
    organization_id: 'org-faciloop-client-1',
    nom: 'Premium',
    description: 'Services complets avec suivi prioritaire',
    tarifs: { mensuel: 350000, trimestriel: 945000, annuel: 3360000 },
    actif: true,
    created_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'org-offer-3',
    organization_id: 'org-faciloop-client-1',
    nom: 'Entreprise',
    description: 'Solution sur mesure pour grands comptes',
    tarifs: { mensuel: 750000, trimestriel: 2025000, annuel: 7200000 },
    actif: true,
    created_at: '2026-06-01T10:00:00Z',
  },
];

export interface CommercialPerformance {
  id: string;
  nom: string;
  prenom: string;
  prospectsCreees: number;
  contactsRealises: number;
  rdvRealises: number;
  demosRealisees: number;
  ventes: number;
  caGenere: number;
  caEncaisse: number;
  tauxConversion: number;
  delaiMoyenConversion: number;
  tauxRenouvellement: number;
  objectifAtteint: number;
}

export interface CommissionEntry {
  id: string;
  commercialId: string;
  commercialNom: string;
  clientNom: string;
  formule: string;
  periodicite: 'mensuel' | 'trimestriel' | 'annuel';
  montantVente: number;
  tauxCommission: number;
  montantCommission: number;
  dateVente: string;
  statut: 'a_verser' | 'verse' | 'annule';
}

export interface ObjectifCommercialAdmin {
  id: string;
  commercialId: string;
  commercialNom: string;
  type: 'ca' | 'ventes' | 'prospects';
  objectif: number;
  realise: number;
  periode: string;
  date_debut?: string;
  date_fin?: string;
}

export interface DashboardAdminOrgStats {
  totalProspects: number;
  prospectsActifs: number;
  totalClients: number;
  nouveauxClientsMois: number;
  abonnementsActifs: number;
  caGenere: number;
  caEncaisse: number;
  tauxConversion: number;
  tauxRenouvellement: number;
  comptesActifs: number;
  comptesInactifs: number;
  resiliations: number;
  repartitionParFormule: { formule: string; nombre: number }[];
  repartitionParZone: { zone: string; nombre: number }[];
  repartitionParSecteur: { secteur: string; nombre: number }[];
}

export const mockPerformances: CommercialPerformance[] = [
  {
    id: 'comm-1', nom: 'Diop', prenom: 'Moussa',
    prospectsCreees: 24, contactsRealises: 18, rdvRealises: 12, demosRealisees: 8,
    ventes: 6, caGenere: 4500000, caEncaisse: 3200000,
    tauxConversion: 25, delaiMoyenConversion: 14, tauxRenouvellement: 80, objectifAtteint: 72,
  },
  {
    id: 'comm-2', nom: 'Sow', prenom: 'Awa',
    prospectsCreees: 18, contactsRealises: 15, rdvRealises: 10, demosRealisees: 7,
    ventes: 8, caGenere: 6200000, caEncaisse: 5100000,
    tauxConversion: 44, delaiMoyenConversion: 9, tauxRenouvellement: 92, objectifAtteint: 95,
  },
  {
    id: 'comm-3', nom: 'Ndiaye', prenom: 'Ibrahima',
    prospectsCreees: 15, contactsRealises: 12, rdvRealises: 7, demosRealisees: 5,
    ventes: 4, caGenere: 3000000, caEncaisse: 2400000,
    tauxConversion: 27, delaiMoyenConversion: 18, tauxRenouvellement: 75, objectifAtteint: 58,
  },
];

export const mockCommissions: CommissionEntry[] = [
  { id: 'com-1', commercialId: 'comm-1', commercialNom: 'Moussa Diop', clientNom: 'Sénégal Telecom Solutions', formule: 'Business', periodicite: 'mensuel', montantVente: 750000, tauxCommission: 5, montantCommission: 37500, dateVente: '2026-08-10', statut: 'a_verser' },
  { id: 'com-2', commercialId: 'comm-2', commercialNom: 'Awa Sow', clientNom: 'Africa Tech Solutions', formule: 'Premium', periodicite: 'trimestriel', montantVente: 4050000, tauxCommission: 8, montantCommission: 324000, dateVente: '2026-08-05', statut: 'a_verser' },
  { id: 'com-3', commercialId: 'comm-1', commercialNom: 'Moussa Diop', clientNom: 'Dakar Import-Export', formule: 'Pro', periodicite: 'annuel', montantVente: 3360000, tauxCommission: 10, montantCommission: 336000, dateVente: '2026-07-20', statut: 'verse' },
  { id: 'com-4', commercialId: 'comm-2', commercialNom: 'Awa Sow', clientNom: 'Wave Digital', formule: 'Pro', periodicite: 'mensuel', montantVente: 350000, tauxCommission: 5, montantCommission: 17500, dateVente: '2026-07-15', statut: 'verse' },
  { id: 'com-5', commercialId: 'comm-3', commercialNom: 'Ibrahima Ndiaye', clientNom: 'Sénégal Distribution SA', formule: 'Business', periodicite: 'trimestriel', montantVente: 2025000, tauxCommission: 8, montantCommission: 162000, dateVente: '2026-08-12', statut: 'a_verser' },
  { id: 'com-6', commercialId: 'comm-3', commercialNom: 'Ibrahima Ndiaye', clientNom: 'Teranga Logistique SA', formule: 'Business', periodicite: 'annuel', montantVente: 7200000, tauxCommission: 10, montantCommission: 720000, dateVente: '2026-06-01', statut: 'verse' },
];

export const mockObjectifsAdmin: ObjectifCommercialAdmin[] = [
  { id: 'obj-1', commercialId: 'comm-1', commercialNom: 'Moussa Diop', type: 'ca', objectif: 6000000, realise: 4500000, periode: '2026-08', date_debut: '2026-08-01', date_fin: '2026-08-31' },
  { id: 'obj-2', commercialId: 'comm-1', commercialNom: 'Moussa Diop', type: 'ventes', objectif: 8, realise: 6, periode: '2026-08', date_debut: '2026-08-01', date_fin: '2026-08-31' },
  { id: 'obj-3', commercialId: 'comm-2', commercialNom: 'Awa Sow', type: 'ca', objectif: 7000000, realise: 6200000, periode: '2026-08', date_debut: '2026-08-01', date_fin: '2026-08-31' },
  { id: 'obj-4', commercialId: 'comm-2', commercialNom: 'Awa Sow', type: 'ventes', objectif: 10, realise: 8, periode: '2026-08', date_debut: '2026-08-01', date_fin: '2026-08-31' },
  { id: 'obj-5', commercialId: 'comm-3', commercialNom: 'Ibrahima Ndiaye', type: 'ca', objectif: 5000000, realise: 3000000, periode: '2026-08', date_debut: '2026-08-01', date_fin: '2026-08-31' },
  { id: 'obj-6', commercialId: 'comm-3', commercialNom: 'Ibrahima Ndiaye', type: 'ventes', objectif: 6, realise: 4, periode: '2026-08', date_debut: '2026-08-01', date_fin: '2026-08-31' },
];

export const mockDashboardStats: DashboardAdminOrgStats = {
  totalProspects: 57,
  prospectsActifs: 38,
  totalClients: 22,
  nouveauxClientsMois: 5,
  abonnementsActifs: 18,
  caGenere: 13700000,
  caEncaisse: 10700000,
  tauxConversion: 32,
  tauxRenouvellement: 82,
  comptesActifs: 18,
  comptesInactifs: 4,
  resiliations: 2,
  repartitionParFormule: [
    { formule: 'Pro', nombre: 8 },
    { formule: 'Business', nombre: 10 },
    { formule: 'Premium', nombre: 4 },
  ],
  repartitionParZone: [
    { zone: 'Dakar', nombre: 12 },
    { zone: 'Thiès', nombre: 5 },
    { zone: 'Saint-Louis', nombre: 3 },
    { zone: 'Ziguinchor', nombre: 2 },
  ],
  repartitionParSecteur: [
    { secteur: 'Commerce / Distribution', nombre: 8 },
    { secteur: 'Télécommunications', nombre: 5 },
    { secteur: 'Services', nombre: 4 },
    { secteur: 'Industrie', nombre: 3 },
    { secteur: 'Immobilier', nombre: 2 },
  ],
};
