// Données mock centralisées pour le Super-Admin
// TODO: Remplacer par appels API (GET /api/super-admin/...)

export type FormuleAbonnement = 'Pro' | 'Business' | 'Premium';
export type Periodicite = 'mensuel' | 'trimestriel' | 'annuel';

export interface OfferPricing {
  mensuel: number;
  mensuel_premier_mois: number | null;
  trimestriel: number;
  trimestriel_normal: number;
  trimestriel_remise: number;
  annuel: number;
  annuel_normal: number;
  annuel_remise: number;
}

export interface FormuleConfig {
  code: FormuleAbonnement;
  label: string;
  prix_xof: number;
  pricing: OfferPricing;
  isActive: boolean;
  description: string;
}

export const PERIODICITES: { code: Periodicite; label: string }[] = [
  { code: 'mensuel',      label: 'Mensuel' },
  { code: 'trimestriel',  label: 'Trimestriel' },
  { code: 'annuel',       label: 'Annuel' },
];

export const FORMULES: FormuleConfig[] = [
  {
    code: 'Pro',
    label: 'Pro',
    prix_xof: 350000,
    isActive: true,
    description: 'Idéal pour les petites équipes commerciales',
    pricing: {
      mensuel: 350000,
      mensuel_premier_mois: 175000,
      trimestriel: 945000,
      trimestriel_normal: 1050000,
      trimestriel_remise: 10,
      annuel: 3360000,
      annuel_normal: 4200000,
      annuel_remise: 20,
    },
  },
  {
    code: 'Business',
    label: 'Business',
    prix_xof: 750000,
    isActive: true,
    description: 'Pour les entreprises en croissance',
    pricing: {
      mensuel: 750000,
      mensuel_premier_mois: 375000,
      trimestriel: 2025000,
      trimestriel_normal: 2250000,
      trimestriel_remise: 10,
      annuel: 7200000,
      annuel_normal: 9000000,
      annuel_remise: 20,
    },
  },
  {
    code: 'Premium',
    label: 'Premium',
    prix_xof: 1500000,
    isActive: true,
    description: 'Solution complète pour les grandes organisations',
    pricing: {
      mensuel: 1500000,
      mensuel_premier_mois: 750000,
      trimestriel: 4050000,
      trimestriel_normal: 4500000,
      trimestriel_remise: 10,
      annuel: 14400000,
      annuel_normal: 18000000,
      annuel_remise: 20,
    },
  },
];

export function getOfferPrice(formule: FormuleAbonnement, periodicite: Periodicite, isFirstMonth = false): number {
  const f = FORMULES.find(fo => fo.code === formule);
  if (!f) return 0;
  if (periodicite === 'mensuel') {
    return isFirstMonth && f.pricing.mensuel_premier_mois
      ? f.pricing.mensuel_premier_mois
      : f.pricing.mensuel;
  }
  if (periodicite === 'trimestriel') return f.pricing.trimestriel;
  return f.pricing.annuel;
}

export interface TenantData {
  id: string;
  nom: string;
  formule: FormuleAbonnement;
  statut: 'actif' | 'suspendu';
  users_count: number;
  created_at: string;
}

export interface FactureData {
  id: string;
  tenant_id: string;
  tenant_nom: string;
  formule: FormuleAbonnement;
  montant_xof: number;
  statut: 'payee' | 'en_attente' | 'impayee';
  date_emission: string;
  date_echeance: string;
}

export interface ActivityData {
  id: string;
  text: string;
  date: string;
  type: 'info' | 'warning' | 'success';
}

// Mock Tenants
export const mockTenants: TenantData[] = [
  { id: 'org-1', nom: 'Teranga Logistique SA', formule: 'Business', statut: 'actif', users_count: 12, created_at: '2026-03-15T10:00:00Z' },
  { id: 'org-2', nom: 'Wave Digital', formule: 'Pro', statut: 'suspendu', users_count: 5, created_at: '2026-04-01T08:00:00Z' },
  { id: 'org-3', nom: 'Africa Tech Solutions', formule: 'Premium', statut: 'actif', users_count: 22, created_at: '2026-02-10T14:00:00Z' },
  { id: 'org-4', nom: 'Dakar Import-Export', formule: 'Pro', statut: 'actif', users_count: 4, created_at: '2026-06-20T09:00:00Z' },
  { id: 'org-5', nom: 'Sénégal Distribution SA', formule: 'Business', statut: 'actif', users_count: 8, created_at: '2026-07-05T11:00:00Z' },
];

// Mock Factures (avec dates étalées pour tester les filtres)
export const mockFactures: FactureData[] = [
  // Mars 2026
  { id: 'f-01', tenant_id: 'org-3', tenant_nom: 'Africa Tech Solutions', formule: 'Premium', montant_xof: 1500000, statut: 'payee', date_emission: '2026-03-01', date_echeance: '2026-03-15' },
  { id: 'f-02', tenant_id: 'org-1', tenant_nom: 'Teranga Logistique SA', formule: 'Business', montant_xof: 750000, statut: 'payee', date_emission: '2026-03-01', date_echeance: '2026-03-15' },
  // Avril 2026
  { id: 'f-03', tenant_id: 'org-3', tenant_nom: 'Africa Tech Solutions', formule: 'Premium', montant_xof: 1500000, statut: 'payee', date_emission: '2026-04-01', date_echeance: '2026-04-15' },
  { id: 'f-04', tenant_id: 'org-1', tenant_nom: 'Teranga Logistique SA', formule: 'Business', montant_xof: 750000, statut: 'payee', date_emission: '2026-04-01', date_echeance: '2026-04-15' },
  { id: 'f-05', tenant_id: 'org-2', tenant_nom: 'Wave Digital', formule: 'Pro', montant_xof: 350000, statut: 'payee', date_emission: '2026-04-01', date_echeance: '2026-04-15' },
  // Mai 2026
  { id: 'f-06', tenant_id: 'org-3', tenant_nom: 'Africa Tech Solutions', formule: 'Premium', montant_xof: 1500000, statut: 'payee', date_emission: '2026-05-01', date_echeance: '2026-05-15' },
  { id: 'f-07', tenant_id: 'org-1', tenant_nom: 'Teranga Logistique SA', formule: 'Business', montant_xof: 750000, statut: 'payee', date_emission: '2026-05-01', date_echeance: '2026-05-15' },
  { id: 'f-08', tenant_id: 'org-2', tenant_nom: 'Wave Digital', formule: 'Pro', montant_xof: 350000, statut: 'payee', date_emission: '2026-05-01', date_echeance: '2026-05-15' },
  // Juin 2026
  { id: 'f-09', tenant_id: 'org-3', tenant_nom: 'Africa Tech Solutions', formule: 'Premium', montant_xof: 1500000, statut: 'payee', date_emission: '2026-06-01', date_echeance: '2026-06-15' },
  { id: 'f-10', tenant_id: 'org-1', tenant_nom: 'Teranga Logistique SA', formule: 'Business', montant_xof: 750000, statut: 'payee', date_emission: '2026-06-01', date_echeance: '2026-06-15' },
  { id: 'f-11', tenant_id: 'org-2', tenant_nom: 'Wave Digital', formule: 'Pro', montant_xof: 350000, statut: 'impayee', date_emission: '2026-06-01', date_echeance: '2026-06-15' },
  { id: 'f-12', tenant_id: 'org-4', tenant_nom: 'Dakar Import-Export', formule: 'Pro', montant_xof: 350000, statut: 'payee', date_emission: '2026-06-20', date_echeance: '2026-07-05' },
  // Juillet 2026
  { id: 'f-13', tenant_id: 'org-3', tenant_nom: 'Africa Tech Solutions', formule: 'Premium', montant_xof: 1500000, statut: 'payee', date_emission: '2026-07-01', date_echeance: '2026-07-15' },
  { id: 'f-14', tenant_id: 'org-1', tenant_nom: 'Teranga Logistique SA', formule: 'Business', montant_xof: 750000, statut: 'payee', date_emission: '2026-07-01', date_echeance: '2026-07-15' },
  { id: 'f-15', tenant_id: 'org-2', tenant_nom: 'Wave Digital', formule: 'Pro', montant_xof: 350000, statut: 'impayee', date_emission: '2026-07-01', date_echeance: '2026-07-15' },
  { id: 'f-16', tenant_id: 'org-4', tenant_nom: 'Dakar Import-Export', formule: 'Pro', montant_xof: 350000, statut: 'payee', date_emission: '2026-07-05', date_echeance: '2026-07-20' },
  { id: 'f-17', tenant_id: 'org-5', tenant_nom: 'Sénégal Distribution SA', formule: 'Business', montant_xof: 750000, statut: 'payee', date_emission: '2026-07-05', date_echeance: '2026-07-20' },
  // Août 2026
  { id: 'f-18', tenant_id: 'org-3', tenant_nom: 'Africa Tech Solutions', formule: 'Premium', montant_xof: 1500000, statut: 'payee', date_emission: '2026-08-01', date_echeance: '2026-08-15' },
  { id: 'f-19', tenant_id: 'org-1', tenant_nom: 'Teranga Logistique SA', formule: 'Business', montant_xof: 750000, statut: 'payee', date_emission: '2026-08-01', date_echeance: '2026-08-15' },
  { id: 'f-20', tenant_id: 'org-2', tenant_nom: 'Wave Digital', formule: 'Pro', montant_xof: 350000, statut: 'en_attente', date_emission: '2026-08-01', date_echeance: '2026-08-15' },
  { id: 'f-21', tenant_id: 'org-4', tenant_nom: 'Dakar Import-Export', formule: 'Pro', montant_xof: 350000, statut: 'payee', date_emission: '2026-08-01', date_echeance: '2026-08-15' },
  { id: 'f-22', tenant_id: 'org-5', tenant_nom: 'Sénégal Distribution SA', formule: 'Business', montant_xof: 750000, statut: 'en_attente', date_emission: '2026-08-01', date_echeance: '2026-08-15' },
];

// Mock Activity
export const mockActivity: ActivityData[] = [
  { id: 'a-1', text: "Sénégal Distribution SA a ajouté 2 commerciaux", date: '2026-08-18T14:30:00Z', type: 'info' },
  { id: 'a-2', text: "Teranga Logistique SA a ajouté 3 commerciaux", date: '2026-08-17T10:00:00Z', type: 'info' },
  { id: 'a-3', text: "Wave Digital — paiement en retard (impayé)", date: '2026-08-15T08:00:00Z', type: 'warning' },
  { id: 'a-4', text: "Dakar Import-Export a payé sa facture Pro", date: '2026-08-12T16:00:00Z', type: 'success' },
  { id: 'a-5', text: "Africa Tech Solutions passe au plan Premium", date: '2026-08-05T09:00:00Z', type: 'success' },
  { id: 'a-6', text: "Sénégal Distribution SA — nouvelle inscription", date: '2026-07-05T11:00:00Z', type: 'success' },
  { id: 'a-7', text: "Wave Digital — suspension pour impayé", date: '2026-06-20T10:00:00Z', type: 'warning' },
  { id: 'a-8', text: "Dakar Import-Export — nouvelle inscription", date: '2026-06-20T09:00:00Z', type: 'success' },
];
