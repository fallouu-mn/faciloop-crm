import type { Commercial, Prospect, ClientFaciloop, Relance, Interaction, NotificationItem, Paiement, ActionLog, Organization } from '../types/crm';
import type { OrgOffer, CommissionEntry, ObjectifCommercialAdmin } from './mockAdminOrg';
import type { UserSession } from '../contexts/AuthContext';

export const DEMO_ORG_ID = 'demo-org-00000000-0000-0000-0000-000000000001';
export const DEMO_USER_ID = 'demo-user-00000000-0000-0000-0000-000000000001';

export const DEMO_USER_SESSION: UserSession = {
  id: DEMO_USER_ID,
  authId: DEMO_USER_ID,
  nom: 'Diallo',
  prenom: 'Cheikh',
  telephone: '221770000099',
  email: 'demo@faciloop.app',
  role: 'admin_org',
  organizationId: DEMO_ORG_ID,
  orgStatut: 'actif',
};

export const DEMO_ORG: Organization = {
  id: DEMO_ORG_ID,
  nom: 'Sira Digital Dakar',
  logo_url: undefined,
  devise_defaut: 'XOF',
  statut: 'actif',
  pays: 'Sénégal',
  ville: 'Dakar',
  adresse: 'Plateau, Rue Mohamed V',
  telephone: '+221 77 123 45 67',
  email: 'contact@siradigital.sn',
  site_web: 'www.siradigital.sn',
  secteur: 'Technologies & Services Numériques',
  formule_code: 'Business',
  periodicite: 'mensuel',
  prix_abonnement: 350000,
  date_debut_abonnement: '2026-01-15',
  date_fin_abonnement: '2026-09-15',
  statut_abonnement: 'actif',
  responsable_nom: 'Diallo',
  responsable_prenom: 'Cheikh',
  created_at: '2026-01-15T08:00:00Z',
};

export const DEMO_COMMERCIAUX: Commercial[] = [
  { id: 'demo-comm-1', organization_id: DEMO_ORG_ID, user_id: 'demo-cu-1', nom: 'Ndiaye', prenom: 'Fatou', email: 'fatou.ndiaye@siradigital.sn', telephone: '+221 77 234 56 78', statut: 'actif', created_at: '2026-01-20T08:00:00Z' },
  { id: 'demo-comm-2', organization_id: DEMO_ORG_ID, user_id: 'demo-cu-2', nom: 'Sow', prenom: 'Omar', email: 'omar.sow@siradigital.sn', telephone: '+221 76 345 67 89', statut: 'actif', created_at: '2026-01-20T08:00:00Z' },
  { id: 'demo-comm-3', organization_id: DEMO_ORG_ID, user_id: 'demo-cu-3', nom: 'Ba', prenom: 'Aminata', email: 'aminata.ba@siradigital.sn', telephone: '+221 78 456 78 90', statut: 'actif', created_at: '2026-02-01T08:00:00Z' },
];

export const DEMO_PROSPECTS: Prospect[] = [
  { id: 'demo-p-1', organization_id: DEMO_ORG_ID, commercial_id: 'demo-comm-1', commercial_nom: 'Fatou Ndiaye', nom: 'Mbaye', prenom: 'Ousmane', entreprise: 'SN Technologies SA', telephone: '+221 77 100 11 11', email: 'o.mbaye@sntec.sn', pays: 'Sénégal', ville: 'Dakar', secteur_activite: 'Technologies', source: 'linkedin', formule_envisagee: 'Business', budget_estime: 350000, statut_pipeline: 'nouveau_prospect', created_at: '2026-08-20T09:00:00Z' },
  { id: 'demo-p-2', organization_id: DEMO_ORG_ID, commercial_id: 'demo-comm-2', commercial_nom: 'Omar Sow', nom: 'Fall', prenom: 'Mariama', entreprise: 'Dakar Food Distribution', telephone: '+221 78 200 22 22', email: 'm.fall@dakarfood.sn', pays: 'Sénégal', ville: 'Parcelles Assainies', secteur_activite: 'Agroalimentaire', source: 'referral', formule_envisagee: 'Standard', budget_estime: 150000, statut_pipeline: 'a_contacter', created_at: '2026-08-18T10:30:00Z' },
  { id: 'demo-p-3', organization_id: DEMO_ORG_ID, commercial_id: 'demo-comm-3', commercial_nom: 'Aminata Ba', nom: 'Diop', prenom: 'Ibrahima', entreprise: 'Sénégal Logistics SA', telephone: '+221 76 300 33 33', email: 'i.diop@senlogistics.sn', pays: 'Sénégal', ville: 'Thiès', secteur_activite: 'Transport & Logistique', source: 'site_web', formule_envisagee: 'Business', budget_estime: 350000, statut_pipeline: 'contacte', date_derniere_interaction: '2026-08-22T14:00:00Z', created_at: '2026-08-15T08:00:00Z' },
  { id: 'demo-p-4', organization_id: DEMO_ORG_ID, commercial_id: 'demo-comm-1', commercial_nom: 'Fatou Ndiaye', nom: 'Sarr', prenom: 'Cheikh', entreprise: 'BankExpress SARL', telephone: '+221 77 400 44 44', email: 'c.sarr@bankexpress.sn', pays: 'Sénégal', ville: 'Dakar', secteur_activite: 'Finance', source: 'evenement', formule_envisagee: 'Enterprise', budget_estime: 750000, statut_pipeline: 'interesse', date_derniere_interaction: '2026-08-23T11:00:00Z', created_at: '2026-08-10T09:30:00Z' },
  { id: 'demo-p-5', organization_id: DEMO_ORG_ID, commercial_id: 'demo-comm-2', commercial_nom: 'Omar Sow', nom: 'Diallo', prenom: 'Aminata', entreprise: 'Agence Immo Thiès', telephone: '+221 78 500 55 55', email: 'a.diallo@immothies.sn', pays: 'Sénégal', ville: 'Thiès', secteur_activite: 'Immobilier', source: 'linkedin', formule_envisagee: 'Standard', budget_estime: 150000, statut_pipeline: 'rdv_programme', date_prochaine_relance: '2026-09-02', created_at: '2026-08-08T10:00:00Z' },
  { id: 'demo-p-6', organization_id: DEMO_ORG_ID, commercial_id: 'demo-comm-3', commercial_nom: 'Aminata Ba', nom: 'Niang', prenom: 'Modou', entreprise: 'CimenteCo SA', telephone: '+221 76 600 66 66', email: 'm.niang@cimenteco.sn', pays: 'Sénégal', ville: 'Dakar', secteur_activite: 'BTP', source: 'appel_sortant', formule_envisagee: 'Business', budget_estime: 350000, statut_pipeline: 'demo_realisee', date_derniere_interaction: '2026-08-25T15:00:00Z', created_at: '2026-08-05T08:00:00Z' },
  { id: 'demo-p-7', organization_id: DEMO_ORG_ID, commercial_id: 'demo-comm-1', commercial_nom: 'Fatou Ndiaye', nom: 'Touré', prenom: 'Aïssatou', entreprise: 'Médical Center Plus', telephone: '+221 77 700 77 77', email: 'a.toure@medicalplus.sn', pays: 'Sénégal', ville: 'Dakar', secteur_activite: 'Santé', source: 'referral', formule_envisagee: 'Business', budget_estime: 350000, statut_pipeline: 'essai_en_cours', date_prochaine_relance: '2026-09-05', created_at: '2026-08-01T09:00:00Z' },
  { id: 'demo-p-8', organization_id: DEMO_ORG_ID, commercial_id: 'demo-comm-2', commercial_nom: 'Omar Sow', nom: 'Kane', prenom: 'Babacar', entreprise: 'TéléCom Nord SARL', telephone: '+221 78 800 88 88', email: 'b.kane@telecomnord.sn', pays: 'Sénégal', ville: 'Saint-Louis', secteur_activite: 'Télécommunications', source: 'site_web', formule_envisagee: 'Enterprise', budget_estime: 750000, statut_pipeline: 'proposition_envoyee', date_derniere_interaction: '2026-08-26T10:00:00Z', created_at: '2026-07-28T10:00:00Z' },
  { id: 'demo-p-9', organization_id: DEMO_ORG_ID, commercial_id: 'demo-comm-3', commercial_nom: 'Aminata Ba', nom: 'Gaye', prenom: 'Pape', entreprise: 'Sécurité Global SA', telephone: '+221 76 900 99 99', email: 'p.gaye@securiteglobal.sn', pays: 'Sénégal', ville: 'Dakar', secteur_activite: 'Sécurité', source: 'linkedin', formule_envisagee: 'Business', budget_estime: 350000, statut_pipeline: 'paiement_en_attente', date_prochaine_relance: '2026-09-01', created_at: '2026-07-20T08:00:00Z' },
  { id: 'demo-p-10', organization_id: DEMO_ORG_ID, commercial_id: 'demo-comm-1', commercial_nom: 'Fatou Ndiaye', nom: 'Cissé', prenom: 'Khady', entreprise: 'Construction Salam', telephone: '+221 77 111 22 33', email: 'k.cisse@constsalam.sn', pays: 'Sénégal', ville: 'Ziguinchor', secteur_activite: 'Construction', source: 'appel_sortant', formule_envisagee: 'Standard', budget_estime: 150000, statut_pipeline: 'a_relancer_plus_tard', date_prochaine_relance: '2026-10-01', created_at: '2026-07-10T09:00:00Z' },
  { id: 'demo-p-11', organization_id: DEMO_ORG_ID, commercial_id: 'demo-comm-2', commercial_nom: 'Omar Sow', nom: 'Bâ', prenom: 'Mamadou', entreprise: 'Import Export Thiébou', telephone: '+221 78 444 55 66', email: 'm.ba@thiebouimport.sn', pays: 'Sénégal', ville: 'Dakar', secteur_activite: 'Commerce', source: 'referral', formule_envisagee: 'Standard', budget_estime: 150000, motif_perte: 'concurrent', statut_pipeline: 'prospect_perdu', created_at: '2026-07-01T10:00:00Z' },
];

export const DEMO_CLIENTS: ClientFaciloop[] = [
  { id: 'demo-cl-1', organization_id: DEMO_ORG_ID, prospect_id: 'demo-p-old-1', commercial_id: 'demo-comm-1', entreprise: 'Africa Tech Solutions', nom_responsable: 'Awa Sow', telephone: '+221 77 321 43 21', email: 'awa.sow@africatech.sn', pays: 'Sénégal', ville: 'Dakar', secteur_activite: 'Technologies', formule_souscrite: 'Business', statut_compte: 'actif', statut_abonnement: 'actif', montant_paye: 350000, prochain_renouvellement: '2026-09-15', nombre_utilisateurs: 8, derniere_connexion: '2026-08-28T09:30:00Z', created_at: '2026-03-15T08:00:00Z' },
  { id: 'demo-cl-2', organization_id: DEMO_ORG_ID, prospect_id: 'demo-p-old-2', commercial_id: 'demo-comm-2', entreprise: 'Wave Digital Finances', nom_responsable: 'Ibrahima Diop', telephone: '+221 76 654 32 10', email: 'i.diop@wavedigital.sn', pays: 'Sénégal', ville: 'Dakar', secteur_activite: 'Finance & Fintech', formule_souscrite: 'Enterprise', statut_compte: 'actif', statut_abonnement: 'actif', montant_paye: 750000, prochain_renouvellement: '2026-09-30', nombre_utilisateurs: 15, derniere_connexion: '2026-08-27T14:00:00Z', created_at: '2026-04-01T08:00:00Z' },
  { id: 'demo-cl-3', organization_id: DEMO_ORG_ID, prospect_id: 'demo-p-old-3', commercial_id: 'demo-comm-3', entreprise: 'Teranga Logistique SA', nom_responsable: 'Moussa Thiaw', telephone: '+221 78 765 43 21', email: 'm.thiaw@teranga-logistique.sn', pays: 'Sénégal', ville: 'Thiès', secteur_activite: 'Transport & Logistique', formule_souscrite: 'Standard', statut_compte: 'actif', statut_abonnement: 'actif', montant_paye: 150000, prochain_renouvellement: '2026-10-05', nombre_utilisateurs: 4, derniere_connexion: '2026-08-25T16:00:00Z', created_at: '2026-05-10T08:00:00Z' },
];

export const DEMO_RELANCES: Relance[] = [
  { id: 'demo-r-1', organization_id: DEMO_ORG_ID, prospect_id: 'demo-p-5', commercial_id: 'demo-comm-2', prospect_nom: 'Aminata Diallo', prospect_entreprise: 'Agence Immo Thiès', date: '2026-09-02', canal: 'appel', motif: 'Confirmation du RDV de présentation', statut: 'prevue', created_at: '2026-08-26T10:00:00Z' },
  { id: 'demo-r-2', organization_id: DEMO_ORG_ID, prospect_id: 'demo-p-7', commercial_id: 'demo-comm-1', prospect_nom: 'Aïssatou Touré', prospect_entreprise: 'Médical Center Plus', date: '2026-09-05', canal: 'whatsapp', motif: 'Suivi essai - retour sur fonctionnalités', statut: 'prevue', created_at: '2026-08-25T09:00:00Z' },
  { id: 'demo-r-3', organization_id: DEMO_ORG_ID, prospect_id: 'demo-p-9', commercial_id: 'demo-comm-3', prospect_nom: 'Pape Gaye', prospect_entreprise: 'Sécurité Global SA', date: '2026-09-01', canal: 'appel', motif: 'Relance paiement en attente', statut: 'prevue', created_at: '2026-08-27T08:00:00Z' },
  { id: 'demo-r-4', organization_id: DEMO_ORG_ID, prospect_id: 'demo-p-4', commercial_id: 'demo-comm-1', prospect_nom: 'Cheikh Sarr', prospect_entreprise: 'BankExpress SARL', date: '2026-08-25', canal: 'email', motif: 'Envoi proposition commerciale détaillée', statut: 'realisee', created_at: '2026-08-20T14:00:00Z' },
];

export const DEMO_INTERACTIONS: Interaction[] = [
  { id: 'demo-i-1', organization_id: DEMO_ORG_ID, prospect_id: 'demo-p-4', commercial_id: 'demo-comm-1', type: 'appel', statut: 'realisee', date: '2026-08-23', heure: '11:00', commentaire: 'Appel de qualification — budget confirmé 750k XOF/mois, décideur = DG', created_at: '2026-08-23T11:00:00Z' },
  { id: 'demo-i-2', organization_id: DEMO_ORG_ID, prospect_id: 'demo-p-6', commercial_id: 'demo-comm-3', type: 'demonstration', statut: 'realisee', date: '2026-08-25', heure: '15:00', commentaire: 'Démo live sur pipeline Kanban et relances automatiques. Très bon retour.', created_at: '2026-08-25T15:00:00Z' },
  { id: 'demo-i-3', organization_id: DEMO_ORG_ID, prospect_id: 'demo-p-3', commercial_id: 'demo-comm-3', type: 'whatsapp', statut: 'realisee', date: '2026-08-22', heure: '14:00', commentaire: 'Message de présentation envoyé avec brochure PDF', prochaine_action: 'Appeler dans 3 jours', created_at: '2026-08-22T14:00:00Z' },
  { id: 'demo-i-4', organization_id: DEMO_ORG_ID, prospect_id: 'demo-p-8', commercial_id: 'demo-comm-2', type: 'rdv', statut: 'realisee', date: '2026-08-26', heure: '10:00', commentaire: 'RDV en visio — proposition Enterprise envoyée. En attente retour dans 5 jours.', created_at: '2026-08-26T10:00:00Z' },
  { id: 'demo-i-5', organization_id: DEMO_ORG_ID, prospect_id: 'demo-p-9', commercial_id: 'demo-comm-3', type: 'appel', statut: 'realisee', date: '2026-08-27', heure: '09:30', commentaire: 'Confirmation de commande verbale — en attente validation direction financière', created_at: '2026-08-27T09:30:00Z' },
];

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  { id: 'demo-n-1', organization_id: DEMO_ORG_ID, type: 'relance', titre: "Relance à effectuer aujourd'hui", message: "Pape Gaye (Sécurité Global SA) — Relance paiement en attente programmée pour aujourd'hui.", lue: false, created_at: '2026-08-30T08:00:00Z' },
  { id: 'demo-n-2', organization_id: DEMO_ORG_ID, type: 'prospect', titre: 'Nouveau prospect assigné', message: 'Ousmane Mbaye de SN Technologies SA vous a été assigné par le responsable.', lue: false, created_at: '2026-08-29T15:00:00Z' },
  { id: 'demo-n-3', organization_id: DEMO_ORG_ID, type: 'abonnement', titre: 'Renouvellement abonnement à venir', message: 'Africa Tech Solutions — abonnement Business expire dans 16 jours.', lue: true, created_at: '2026-08-28T09:00:00Z' },
];

export const DEMO_PAIEMENTS: Paiement[] = [
  { id: 'demo-pay-1', organization_id: DEMO_ORG_ID, client_id: 'demo-cl-1', commercial_id: 'demo-comm-1', entreprise: 'Africa Tech Solutions', montant_attendu: 350000, montant_paye: 350000, montant_restant: 0, date_paiement: '2026-08-15', mode_paiement: 'wave', reference_transaction: 'WV-202608150001', statut: 'valide', created_at: '2026-08-15T10:30:00Z' },
  { id: 'demo-pay-2', organization_id: DEMO_ORG_ID, client_id: 'demo-cl-2', commercial_id: 'demo-comm-2', entreprise: 'Wave Digital Finances', montant_attendu: 750000, montant_paye: 750000, montant_restant: 0, date_paiement: '2026-08-01', mode_paiement: 'virement', reference_transaction: 'VIR-202608010003', statut: 'valide', created_at: '2026-08-01T09:00:00Z' },
  { id: 'demo-pay-3', organization_id: DEMO_ORG_ID, client_id: 'demo-cl-3', commercial_id: 'demo-comm-3', entreprise: 'Teranga Logistique SA', montant_attendu: 150000, montant_paye: 75000, montant_restant: 75000, date_paiement: '2026-08-05', mode_paiement: 'orange_money', reference_transaction: 'OM-202608050002', statut: 'en_attente', created_at: '2026-08-05T14:00:00Z' },
];

export const DEMO_OBJECTIFS: ObjectifCommercialAdmin[] = [
  { id: 'demo-obj-1', commercialId: 'demo-comm-1', commercialNom: 'Fatou Ndiaye', type: 'ca', objectif: 2000000, realise: 1400000, periode: '2026-08' },
  { id: 'demo-obj-2', commercialId: 'demo-comm-2', commercialNom: 'Omar Sow', type: 'ca', objectif: 2500000, realise: 2100000, periode: '2026-08' },
  { id: 'demo-obj-3', commercialId: 'demo-comm-3', commercialNom: 'Aminata Ba', type: 'ventes', objectif: 5, realise: 3, periode: '2026-08' },
];

export const DEMO_COMMISSIONS: CommissionEntry[] = [
  { id: 'demo-com-1', commercialId: 'demo-comm-1', commercialNom: 'Fatou Ndiaye', clientNom: 'Africa Tech Solutions', formule: 'Business', periodicite: 'mensuel', montantVente: 350000, tauxCommission: 5, montantCommission: 17500, dateVente: '2026-08-15', statut: 'a_verser' },
  { id: 'demo-com-2', commercialId: 'demo-comm-2', commercialNom: 'Omar Sow', clientNom: 'Wave Digital Finances', formule: 'Enterprise', periodicite: 'mensuel', montantVente: 750000, tauxCommission: 8, montantCommission: 60000, dateVente: '2026-08-01', statut: 'verse' },
  { id: 'demo-com-3', commercialId: 'demo-comm-3', commercialNom: 'Aminata Ba', clientNom: 'Teranga Logistique SA', formule: 'Standard', periodicite: 'mensuel', montantVente: 150000, tauxCommission: 5, montantCommission: 7500, dateVente: '2026-08-05', statut: 'a_verser' },
];

export const DEMO_ACTION_LOGS: ActionLog[] = [
  { id: 'demo-log-1', organization_id: DEMO_ORG_ID, utilisateur_id: DEMO_USER_ID, utilisateur_nom: 'Cheikh Diallo', action_type: 'prospect_pipeline_move', action: 'Pipeline: interessé → demo_realisee', entite_type: 'prospect', entite_id: 'demo-p-6', cible: 'CimenteCo SA', ancienne_valeur: 'interesse', nouvelle_valeur: 'demo_realisee', date: '2026-08-25', heure: '15:30', created_at: '2026-08-25T15:30:00Z' },
  { id: 'demo-log-2', organization_id: DEMO_ORG_ID, utilisateur_id: 'demo-comm-1', utilisateur_nom: 'Fatou Ndiaye', action_type: 'prospect_created', action: "Création d'un prospect", entite_type: 'prospect', entite_id: 'demo-p-1', cible: 'SN Technologies SA', nouvelle_valeur: 'Source: linkedin · Étape: Nouveau prospect', date: '2026-08-20', heure: '09:15', created_at: '2026-08-20T09:15:00Z' },
  { id: 'demo-log-3', organization_id: DEMO_ORG_ID, utilisateur_id: 'demo-comm-2', utilisateur_nom: 'Omar Sow', action_type: 'prospect_pipeline_move', action: 'Pipeline: proposition_envoyee → paiement_en_attente', entite_type: 'prospect', entite_id: 'demo-p-8', cible: 'TéléCom Nord SARL', ancienne_valeur: 'proposition_envoyee', nouvelle_valeur: 'paiement_en_attente', date: '2026-08-27', heure: '10:45', created_at: '2026-08-27T10:45:00Z' },
  { id: 'demo-log-4', organization_id: DEMO_ORG_ID, utilisateur_id: DEMO_USER_ID, utilisateur_nom: 'Cheikh Diallo', action_type: 'commercial_added', action: "Ajout d'un commercial", entite_type: 'commercial', entite_id: 'demo-comm-3', cible: 'Aminata Ba', nouvelle_valeur: 'actif', date: '2026-08-01', heure: '08:30', created_at: '2026-08-01T08:30:00Z' },
];

export const DEMO_ORG_OFFERS: OrgOffer[] = [
  { id: 'demo-offer-1', organization_id: DEMO_ORG_ID, nom: 'Standard', description: 'Accès aux fonctionnalités essentielles de CRM', tarifs: { mensuel: 150000, trimestriel: 405000, annuel: 1440000 }, actif: true, created_at: '2026-01-15T08:00:00Z' },
  { id: 'demo-offer-2', organization_id: DEMO_ORG_ID, nom: 'Business', description: 'Fonctionnalités avancées + support prioritaire', tarifs: { mensuel: 350000, trimestriel: 945000, annuel: 3360000 }, actif: true, created_at: '2026-01-15T08:00:00Z' },
  { id: 'demo-offer-3', organization_id: DEMO_ORG_ID, nom: 'Enterprise', description: 'Solution complète sur mesure pour grands comptes', tarifs: { mensuel: 750000, trimestriel: 2025000, annuel: 7200000 }, actif: true, created_at: '2026-01-15T08:00:00Z' },
];
