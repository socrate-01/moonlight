import AdminGate from "@/components/admin/AdminGate";
import CocktailsAdmin from "@/components/admin/cocktails/CocktailsAdmin";

export const metadata = { title: "Cocktails · Admin Moonlight" };

export default function AdminCocktailsPage() {
  return (
    <AdminGate>
      <CocktailsAdmin />
    </AdminGate>
  );
}
