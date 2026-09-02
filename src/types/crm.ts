// TypeScript interfaces for Faciloop CRM Multi-Tenant

export type TenantStatut = 'actif' | 'inactif' | 'suspendu';
export type UserRole = 'super_admin' | 'admin_org' | 'commercial';
export type CommercialStatut = 'actif' | 'inactif';

export type ProspectSource = 
  | 'site_web' 
  | 'prospection_directe' 
  | 'recommandation' 
  | 'reseaux_sociaux' 
  | 'whatsapp' 
  | 'evenement' 
  | 'autre';

export type PipelineStepId =
  | 'nouveau'
  | 'a_contacter'
  | 'contacte'
  | 'interesse'
  | 'rdv_programme'
  | 'demo_realisee'
  | 'essai_en_cours'
  | 'proposition'
  | 'paiement_att'
  | 'gagne'
  | 'a_relancer'
  | 'perdu';

export type MotifPerte = 
  | 'prix_trop_eleve' 
  | 'concurrent' 
  | 'pas_de_besoin_actuel' 
  | 'injoignable' 
  | 'mauvais_timing' 
  | 'autre';

export type InteractionType = 'appel' | 'whatsapp' | 'email' | 'visite' | 'rdv' | 'demonstration' | 'autre';
export type InteractionStatut = 'planifiee' | 'realisee' | 'annulee';

export type RelanceCanal = 'appel' | 'whatsapp' | 'email' | 'visite' | 'autre';
export type RelanceStatut = 'prevue' | 'realisee' | 'annulee' | 'en_retard';

export type ModePaiement = 'wave' | 'orange_money' | 'paytech' | 'stripe' | 'virement' | 'espece';
export type AbonnementStatut = 'actif' | 'en_attente' | 'expire' | 'suspendu';
export type PaiementStatut = 'valide' | 'en_attente' | 'echoue' | 'rembourse';

export type ObjectifPeriode = 'mensuel' | 'trimestriel' | 'annuel';
export type ObjectifType = 'prospects' | 'rdv' | 'ventes' | 'ca';
export type ObjectifStatut = 'en_cours' | 'atteint' | 'depasse' | 'non_atteint';

export interface Organization {
  id: string;
  nom: string;
  logo_url?: string;
  devise_defaut: string;
  statut: TenantStatut;
  pays?: string;
  ville?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  secteur?: string;
  formule_code?: string;
  periodicite?: string;
  prix_abonnement?: number;
  date_debut_abonnement?: string;
  date_fin_abonnement?: string;
  statut_abonnement?: string;
  responsable_nom?: string;
  responsable_prenom?: string;
  created_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  organization_id?: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Commercial {
  id: string;
  organization_id: string;
  user_id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  avatar?: string;
  statut: CommercialStatut;
  created_at: string;
}

export interface Prospect {
  id: string;
  organization_id: string;
  commercial_id?: string;
  commercial_nom?: string;
  nom: string;
  prenom?: string;
  entreprise: string;
  telephone: string;
  whatsapp?: string;
  email?: string;
  pays?: string;
  ville?: string;
  adresse?: string;
  secteur_activite?: string;
  source: ProspectSource;
  formule_envisagee?: string;
  budget_estime?: number;
  commentaire?: string;
  motif_perte?: MotifPerte;
  date_prochaine_relance?: string;
  date_derniere_interaction?: string;
  statut_pipeline: PipelineStepId;
  created_at: string;
}

export interface ClientFaciloop {
  id: string;
  organization_id: string;
  prospect_id?: string;
  commercial_id?: string;
  entreprise: string;
  nom_responsable: string;
  telephone: string;
  whatsapp?: string;
  email?: string;
  pays?: string;
  ville?: string;
  secteur_activite?: string;
  formule_souscrite: string;
  statut_compte: 'actif' | 'suspendu' | 'inactif';
  statut_abonnement: AbonnementStatut;
  montant_paye: number;
  prochain_renouvellement?: string;
  fonctionnalites_activees?: string[];
  nombre_utilisateurs: number;
  derniere_connexion?: string;
  created_at: string;
}

export interface Interaction {
  id: string;
  organization_id: string;
  prospect_id: string;
  commercial_id?: string;
  type: InteractionType;
  statut: InteractionStatut;
  date: string;
  heure?: string;
  commentaire?: string;
  prochaine_action?: string;
  date_prochaine_relance?: string;
  created_at: string;
}

export interface Relance {
  id: string;
  organization_id: string;
  prospect_id: string;
  commercial_id?: string;
  prospect_nom: string;
  prospect_entreprise: string;
  date: string;
  heure?: string;
  canal: RelanceCanal;
  motif?: string;
  commentaire?: string;
  statut: RelanceStatut;
  created_at: string;
}

export interface Abonnement {
  id: string;
  organization_id: string;
  client_id: string;
  commercial_id?: string;
  entreprise: string;
  formule_souscrite: string;
  prix: number;
  devise: string;
  periodicite: string;
  date_debut: string;
  date_echeance: string;
  statut: AbonnementStatut;
  mode_paiement: ModePaiement;
  paiement_fractionne: boolean;
  reduction_pourcent: number;
  justificatif_commentaire?: string;
  created_at: string;
}

export interface Paiement {
  id: string;
  organization_id: string;
  client_id: string;
  abonnement_id?: string;
  commercial_id?: string;
  entreprise: string;
  montant_attendu: number;
  montant_paye: number;
  montant_restant: number;
  date_paiement: string;
  mode_paiement: ModePaiement;
  reference_transaction?: string;
  statut: PaiementStatut;
  justificatif_commentaire?: string;
  created_at: string;
}

export interface ObjectifCommercial {
  id: string;
  organization_id: string;
  commercial_id: string;
  commercial_nom?: string;
  periode: ObjectifPeriode;
  date_debut: string;
  date_fin: string;
  type: ObjectifType;
  objectif: number;
  realise: number;
  statut: ObjectifStatut;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  organization_id: string;
  commercial_id?: string;
  type: string;
  titre: string;
  message: string;
  lien?: string;
  lue: boolean;
  created_at: string;
}

export type ActionLogType =
  | 'prospect_created'
  | 'prospect_updated'
  | 'prospect_pipeline_move'
  | 'prospect_converted'
  | 'prospect_lost'
  | 'client_created'
  | 'client_updated'
  | 'offer_created'
  | 'offer_updated'
  | 'offer_deleted'
  | 'subscription_created'
  | 'subscription_updated'
  | 'objectif_created'
  | 'objectif_updated'
  | 'payment_received'
  | 'payment_updated'
  | 'org_settings_updated'
  | 'commercial_added'
  | 'commercial_removed'
  | 'prospect_reassigned'
  | 'other';

export interface Offre {
  id: string;
  organization_id: string;
  nom: string;
  description: string;
  tarif_mensuel: number;
  tarif_trimestriel: number;
  tarif_annuel: number;
  actif: boolean;
  created_at: string;
}

export interface Commission {
  id: string;
  organization_id: string;
  commercial_id: string;
  commercial_nom?: string;
  client_nom?: string;
  formule?: string;
  periodicite?: string;
  montant_vente: number;
  taux_commission: number;
  montant_commission: number;
  date_vente: string;
  statut: 'a_verser' | 'verse' | 'annule';
  created_at: string;
}

export interface ActionLog {
  id: string;
  organization_id: string;
  utilisateur_id: string;
  utilisateur_nom: string;
  action_type: ActionLogType;
  action: string;
  entite_type?: string;
  entite_id?: string;
  cible?: string;
  ancienne_valeur?: string;
  nouvelle_valeur?: string;
  date: string;
  heure: string;
  created_at: string;
}
