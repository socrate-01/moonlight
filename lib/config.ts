/** Ouverture des billets.
 *
 *  Le nombre d'invités souhaité est atteint : le formulaire reste ouvert et
 *  les demandes continuent d'être enregistrées (elles apparaissent dans
 *  l'admin), mais aucun QR code n'est généré et aucun billet n'est
 *  téléchargeable.
 *
 *  Repasser à `true` pour rouvrir les téléchargements. */
export const TICKETS_OPEN: boolean = false;
