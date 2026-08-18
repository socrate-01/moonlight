import AdminGate from "@/components/admin/AdminGate";
import MessagesAdmin from "@/components/admin/messages/MessagesAdmin";

export const metadata = { title: "Messages · Admin Moonlight" };

export default function AdminMessagesPage() {
  return (
    <AdminGate>
      <MessagesAdmin />
    </AdminGate>
  );
}
