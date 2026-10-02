/**
 * Retour client n°3 — séparation claire des deux opérations téléphone :
 *
 * - `normalizePhoneNumber` : E.164 sans espace → écriture en base / détection de doublons.
 * - `formatPhoneNumber`    : groupage visuel (`+221 77 123 45 67`) → rendu uniquement.
 *
 * Les deux vivent dans `src/utils/formatters.ts` (source de vérité).
 *
 * NB : `main` utilisait `formatPhoneNumber` pour normaliser et `displayPhoneNumber`
 * pour afficher. Après la fusion, la nommage de `fallou` fait foi : un seul nom par
 * opération, plus d'alias concurrent.
 */
export { normalizePhoneNumber, formatPhoneNumber } from '../utils/formatters';
