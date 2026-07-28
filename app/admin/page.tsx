import AdminGate from "@/components/admin/AdminGate";
import Dashboard from "@/components/admin/Dashboard";

export const metadata = { title: "Admin · Moonlight Cocktail Bar" };

export default function AdminPage() {
  return (
    <AdminGate>
      <Dashboard />
    </AdminGate>
  );
}
