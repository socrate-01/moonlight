import AdminGate from "@/components/admin/AdminGate";
import BookingsAdmin from "@/components/admin/bookings/BookingsAdmin";

export const metadata = { title: "Demandes · Admin Moonlight" };

export default function AdminDemandesPage() {
  return (
    <AdminGate>
      <BookingsAdmin />
    </AdminGate>
  );
}
