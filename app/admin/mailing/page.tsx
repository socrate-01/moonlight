import AdminGate from "@/components/admin/AdminGate";
import MailingConsole from "@/components/admin/mailing/MailingConsole";

export const metadata = { title: "Mailing · Moonlight Cocktail Bar" };

/** L'écran est derrière `AdminGate`, mais cette protection ne vaut que pour
 *  l'affichage : chaque route serveur qu'il appelle revérifie l'autorisation
 *  de son côté. */
export default function AdminMailingPage() {
  return (
    <AdminGate>
      <MailingConsole />
    </AdminGate>
  );
}
