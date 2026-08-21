import {
  Organization,
  Commercial,
  Prospect,
  ClientFaciloop,
  Interaction,
  Relance,
  Abonnement,
  Paiement,
  ObjectifCommercial,
  NotificationItem,
  ActionLog
} from '../types/crm';

export const mockOrganizations: Organization[] = [
  {
    id: 'org-digitadvisor',
    nom: "Faciloop SAS",
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
    devise_defaut: 'XOF',
    statut: 'actif',
    created_at: '2026-01-15T08:00:00Z'
  },
  {
    id: 'org-faciloop-client-1',
    nom: 'Teranga Logistique SA',
    logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    devise_defaut: 'XOF',
    statut: 'actif',
    created_at: '2026-02-01T10:30:00Z'
  },
  {
    id: 'org-faciloop-client-2',
    nom: 'Baobab Digital Agency',
    logo_url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop',
    devise_defaut: 'EUR',
    statut: 'actif',
    created_at: '2026-03-10T14:15:00Z'
  },
  {
    id: 'org-faciloop-client-3',
    nom: 'Dakar Transit Services',
    logo_url: 'https://images.unsplash.com/photo-1542744801-43245f175232?w=100&h=100&fit=crop',
    devise_defaut: 'XOF',
    statut: 'suspendu',
    created_at: '2026-04-05T09:00:00Z'
  }
];

export const mockCommerciaux: Commercial[] = [
  {
    id: 'comm-1',
    organization_id: 'org-faciloop-client-1',
    nom: 'Diop',
    prenom: 'Moussa',
    email: 'moussa.diop@teranga.sn',
    telephone: '+221 77 123 45 67',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    statut: 'actif',
    created_at: '2026-02-02T08:00:00Z'
  },
  {
    id: 'comm-2',
    organization_id: 'org-faciloop-client-1',
    nom: 'Sow',
    prenom: 'Awa',
    email: 'awa.sow@teranga.sn',
    telephone: '+221 78 987 65 43',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    statut: 'actif',
    created_at: '2026-02-05T09:30:00Z'
  },
  {
    id: 'comm-3',
    organization_id: 'org-faciloop-client-2',
    nom: 'Ndiaye',
    prenom: 'Ibrahima',
    email: 'ibrahima@baobab-digital.com',
    telephone: '+221 76 555 44 33',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    statut: 'actif',
    created_at: '2026-03-12T11:00:00Z'
  }
];

export const mockProspects: Prospect[] = [
  {
    id: 'prospect-1',
    organization_id: 'org-faciloop-client-1',
    commercial_id: 'comm-1',
    commercial_nom: 'Moussa Diop',
    nom: 'Faye',
    prenom: 'Ousmane',
    entreprise: 'Sénégal Telecom Solutions',
    telephone: '+221 77 456 78 90',
    whatsapp: '+221 77 456 78 90',
    email: 'ousmane.faye@stsolutions.sn',
    pays: 'Sénégal',
    ville: 'Dakar',
    secteur_activite: 'Télécommunications',
    source: 'prospection_directe',
    formule_envisagee: 'SaaS Pro (25 utilisateurs)',
    budget_estime: 750000,
    commentaire: 'Intéressé par le suivi des relances WhatsApp automatiques.',
    date_prochaine_relance: '2026-08-19',
    date_derniere_interaction: '2026-08-18T14:30:00Z',
    statut_pipeline: 'nouveau',
    created_at: '2026-08-15T09:00:00Z'
  },
  {
    id: 'prospect-2',
    organization_id: 'org-faciloop-client-1',
    commercial_id: 'comm-1',
    commercial_nom: 'Moussa Diop',
    nom: 'Cissé',
    prenom: 'Fatou',
    entreprise: 'Boutique Mouhamed',
    telephone: '+221 78 111 22 33',
    whatsapp: '+221 78 111 22 33',
    email: 'contact@mouhamed-boutique.sn',
    pays: 'Sénégal',
    ville: 'Thiès',
    secteur_activite: 'Commerce / Distribution',
    source: 'site_web',
    formule_envisagee: 'SaaS Starter',
    budget_estime: 250000,
    commentaire: 'Souhaite une démo sur la gestion du Kanban commercial.',
    date_prochaine_relance: '2026-08-19',
    date_derniere_interaction: '2026-08-17T11:00:00Z',
    statut_pipeline: 'a_contacter',
    created_at: '2026-08-10T14:00:00Z'
  },
  {
    id: 'prospect-3',
    organization_id: 'org-faciloop-client-1',
    commercial_id: 'comm-2',
    commercial_nom: 'Awa Sow',
    nom: 'Kane',
    prenom: 'Mamadou',
    entreprise: 'Haps Store International',
    telephone: '+221 70 888 99 00',
    whatsapp: '+221 70 888 99 00',
    email: 'mamadou.kane@hapsstore.com',
    pays: 'Sénégal',
    ville: 'Dakar',
    secteur_activite: 'Import-Export',
    source: 'recommandation',
    formule_envisagee: 'SaaS Enterprise',
    budget_estime: 1500000,
    commentaire: 'Démonstration effectuée avec le Directeur Commercial.',
    date_prochaine_relance: '2026-08-20',
    date_derniere_interaction: '2026-08-18T16:00:00Z',
    statut_pipeline: 'demo_realisee',
    created_at: '2026-08-01T10:00:00Z'
  },
  {
    id: 'prospect-4',
    organization_id: 'org-faciloop-client-1',
    commercial_id: 'comm-1',
    commercial_nom: 'Moussa Diop',
    nom: 'Ba',
    prenom: 'Amadou',
    entreprise: 'MaNou Fashion Services',
    telephone: '+221 77 999 00 11',
    whatsapp: '+221 77 999 00 11',
    email: 'a.ba@manou-services.sn',
    pays: 'Sénégal',
    ville: 'Saint-Louis',
    secteur_activite: 'Textile / Confection',
    source: 'reseaux_sociaux',
    formule_envisagee: 'SaaS Pro',
    budget_estime: 500000,
    commentaire: 'Devis envoyé le 16 Août. En attente de validation.',
    date_prochaine_relance: '2026-08-19',
    date_derniere_interaction: '2026-08-16T15:20:00Z',
    statut_pipeline: 'proposition',
    created_at: '2026-07-28T08:30:00Z'
  },
  {
    id: 'prospect-5',
    organization_id: 'org-faciloop-client-1',
    commercial_id: 'comm-2',
    commercial_nom: 'Awa Sow',
    nom: 'Fall',
    prenom: 'Cheikh',
    entreprise: 'Dakar Agro Tech',
    telephone: '+221 76 333 22 11',
    whatsapp: '+221 76 333 22 11',
    email: 'c.fall@dakar-agrotech.sn',
    pays: 'Sénégal',
    ville: 'Dakar',
    secteur_activite: 'Agroalimentaire',
    source: 'evenement',
    formule_envisagee: 'SaaS Enterprise',
    budget_estime: 2000000,
    commentaire: 'Contrat signé ! Converti en Client Faciloop.',
    date_derniere_interaction: '2026-08-14T10:00:00Z',
    statut_pipeline: 'gagne',
    created_at: '2026-07-15T09:00:00Z'
  },
  {
    id: 'prospect-6',
    organization_id: 'org-faciloop-client-1',
    commercial_id: 'comm-1',
    commercial_nom: 'Moussa Diop',
    nom: 'Gaye',
    prenom: 'Sidy',
    entreprise: 'Global Transport Senegal',
    telephone: '+221 77 222 33 44',
    whatsapp: '+221 77 222 33 44',
    email: 'sgaye@gts.sn',
    pays: 'Sénégal',
    ville: 'Rufisque',
    secteur_activite: 'Logistique',
    source: 'prospection_directe',
    motif_perte: 'prix_trop_eleve',
    commentaire: 'Budget dépassé pour cette année.',
    date_derniere_interaction: '2026-08-12T11:40:00Z',
    statut_pipeline: 'perdu',
    created_at: '2026-07-10T12:00:00Z'
  }
];

export const mockClients: ClientFaciloop[] = [
  {
    id: 'client-1',
    organization_id: 'org-faciloop-client-1',
    prospect_id: 'prospect-5',
    commercial_id: 'comm-2',
    entreprise: 'Dakar Agro Tech',
    nom_responsable: 'Cheikh Fall',
    telephone: '+221 76 333 22 11',
    whatsapp: '+221 76 333 22 11',
    email: 'c.fall@dakar-agrotech.sn',
    pays: 'Sénégal',
    ville: 'Dakar',
    secteur_activite: 'Agroalimentaire',
    formule_souscrite: 'SaaS Enterprise',
    statut_compte: 'actif',
    statut_abonnement: 'actif',
    montant_paye: 2000000,
    prochain_renouvellement: '2027-08-14',
    fonctionnalites_activees: ['kanban', 'whatsapp_templates', 'exports_excel', 'statistiques_avancees'],
    nombre_utilisateurs: 10,
    derniere_connexion: '2026-08-18T18:00:00Z',
    created_at: '2026-08-14T10:00:00Z'
  }
];

export const mockInteractions: Interaction[] = [
  {
    id: 'inter-1',
    organization_id: 'org-faciloop-client-1',
    prospect_id: 'prospect-1',
    commercial_id: 'comm-1',
    type: 'appel',
    statut: 'realisee',
    date: '2026-08-18',
    heure: '14:30',
    commentaire: 'Premier appel de qualification. Le client recherche un outil de suivi pour ses 25 commerciaux.',
    prochaine_action: 'Envoyer plaquette par WhatsApp',
    date_prochaine_relance: '2026-08-19',
    created_at: '2026-08-18T14:30:00Z'
  },
  {
    id: 'inter-2',
    organization_id: 'org-faciloop-client-1',
    prospect_id: 'prospect-3',
    commercial_id: 'comm-2',
    type: 'demonstration',
    statut: 'realisee',
    date: '2026-08-18',
    heure: '16:00',
    commentaire: 'Démonstration Google Meet très appréciée. Le module de relance automatique a fait sensation.',
    prochaine_action: 'Transmettre la proposition commerciale',
    date_prochaine_relance: '2026-08-20',
    created_at: '2026-08-18T16:00:00Z'
  }
];

export const mockRelances: Relance[] = [
  {
    id: 'relance-1',
    organization_id: 'org-faciloop-client-1',
    prospect_id: 'prospect-1',
    commercial_id: 'comm-1',
    prospect_nom: 'Ousmane Faye',
    prospect_entreprise: 'Sénégal Telecom Solutions',
    date: '2026-08-19',
    heure: '09:30',
    canal: 'whatsapp',
    motif: 'Relance post-qualification',
    commentaire: 'Envoyer le lien de la démo enregistrée',
    statut: 'prevue',
    created_at: '2026-08-18T14:35:00Z'
  },
  {
    id: 'relance-2',
    organization_id: 'org-faciloop-client-1',
    prospect_id: 'prospect-2',
    commercial_id: 'comm-1',
    prospect_nom: 'Fatou Cissé',
    prospect_entreprise: 'Boutique Mouhamed',
    date: '2026-08-19',
    heure: '11:00',
    canal: 'appel',
    motif: 'Planification RDV démo',
    commentaire: 'Appeler sur le fixe ou mobile principal',
    statut: 'prevue',
    created_at: '2026-08-17T11:05:00Z'
  },
  {
    id: 'relance-3',
    organization_id: 'org-faciloop-client-1',
    prospect_id: 'prospect-4',
    commercial_id: 'comm-1',
    prospect_nom: 'Amadou Ba',
    prospect_entreprise: 'MaNou Fashion Services',
    date: '2026-08-18',
    heure: '15:00',
    canal: 'appel',
    motif: 'Suivi du devis',
    commentaire: 'Savoir si le devis a été signé par la comptabilité',
    statut: 'en_retard',
    created_at: '2026-08-16T15:25:00Z'
  }
];

export const mockAbonnements: Abonnement[] = [
  {
    id: 'ab-1',
    organization_id: 'org-faciloop-client-1',
    client_id: 'client-1',
    commercial_id: 'comm-2',
    entreprise: 'Dakar Agro Tech',
    formule_souscrite: 'SaaS Enterprise',
    prix: 2000000,
    devise: 'XOF',
    periodicite: 'annuel',
    date_debut: '2026-08-14',
    date_echeance: '2027-08-14',
    statut: 'actif',
    mode_paiement: 'wave',
    paiement_fractionne: false,
    reduction_pourcent: 0,
    justificatif_commentaire: 'Paiement Wave direct validé.',
    created_at: '2026-08-14T10:00:00Z'
  }
];

export const mockPaiements: Paiement[] = [
  {
    id: 'pay-1',
    organization_id: 'org-faciloop-client-1',
    client_id: 'client-1',
    abonnement_id: 'ab-1',
    commercial_id: 'comm-2',
    entreprise: 'Dakar Agro Tech',
    montant_attendu: 2000000,
    montant_paye: 2000000,
    montant_restant: 0,
    date_paiement: '2026-08-14',
    mode_paiement: 'wave',
    reference_transaction: 'WV-894739201',
    statut: 'valide',
    justificatif_commentaire: 'Attestation de paiement émise.',
    created_at: '2026-08-14T10:05:00Z'
  }
];

export const mockObjectifs: ObjectifCommercial[] = [
  {
    id: 'obj-1',
    organization_id: 'org-faciloop-client-1',
    commercial_id: 'comm-1',
    commercial_nom: 'Moussa Diop',
    periode: 'mensuel',
    date_debut: '2026-08-01',
    date_fin: '2026-08-31',
    type: 'prospects',
    valeur_cible: 30,
    valeur_actuelle: 18,
    statut: 'en_cours',
    created_at: '2026-08-01T08:00:00Z'
  },
  {
    id: 'obj-2',
    organization_id: 'org-faciloop-client-1',
    commercial_id: 'comm-1',
    commercial_nom: 'Moussa Diop',
    periode: 'mensuel',
    date_debut: '2026-08-01',
    date_fin: '2026-08-31',
    type: 'ca',
    valeur_cible: 5000000,
    valeur_actuelle: 3377923,
    statut: 'en_cours',
    created_at: '2026-08-01T08:00:00Z'
  },
  {
    id: 'obj-3',
    organization_id: 'org-faciloop-client-1',
    commercial_id: 'comm-2',
    commercial_nom: 'Awa Sow',
    periode: 'mensuel',
    date_debut: '2026-08-01',
    date_fin: '2026-08-31',
    type: 'ventes',
    valeur_cible: 5,
    valeur_actuelle: 6,
    statut: 'depasse',
    created_at: '2026-08-01T08:00:00Z'
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    organization_id: 'org-faciloop-client-1',
    commercial_id: 'comm-1',
    type: 'relance_retard',
    titre: 'Relance en retard',
    message: 'La relance pour MaNou Fashion Services était prévue hier à 15:00.',
    lien: '/app/prospects/prospect-4',
    lue: false,
    created_at: '2026-08-19T08:00:00Z'
  },
  {
    id: 'notif-2',
    organization_id: 'org-faciloop-client-1',
    commercial_id: 'comm-1',
    type: 'nouveau_prospect',
    titre: 'Nouveau prospect attribué',
    message: 'Vous avez reçu le prospect Sénégal Telecom Solutions.',
    lien: '/app/prospects/prospect-1',
    lue: true,
    created_at: '2026-08-15T09:05:00Z'
  }
];

export const mockActionLogs: ActionLog[] = [
  {
    id: 'log-1',
    organization_id: 'org-faciloop-client-1',
    utilisateur_id: 'comm-2',
    utilisateur_nom: 'Awa Sow',
    action: 'Conversion prospect en client',
    cible: 'Dakar Agro Tech',
    ancienne_valeur: 'Prospect - Gagné',
    nouvelle_valeur: 'Client Faciloop - SaaS Enterprise',
    date: '2026-08-14',
    heure: '10:00',
    created_at: '2026-08-14T10:00:00Z'
  },
  {
    id: 'log-2',
    organization_id: 'org-faciloop-client-1',
    utilisateur_id: 'comm-1',
    utilisateur_nom: 'Moussa Diop',
    action: 'Changement d\'étape Kanban',
    cible: 'Sénégal Telecom Solutions',
    ancienne_valeur: 'A contacter',
    nouvelle_valeur: 'Nouveau prospect',
    date: '2026-08-18',
    heure: '14:30',
    created_at: '2026-08-18T14:30:00Z'
  }
];
