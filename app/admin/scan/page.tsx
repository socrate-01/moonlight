import AdminGate from "@/components/admin/AdminGate";
import Scanner from "@/components/admin/Scanner";

export const metadata = { title: "Scan · Moonlight Cocktail Bar" };

export default function ScanPage() {
  return (
    <AdminGate>
      <Scanner />
    </AdminGate>
  );
}
