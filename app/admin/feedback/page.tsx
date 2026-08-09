import AdminGate from "@/components/admin/AdminGate";
import FeedbackList from "@/components/admin/FeedbackList";

export const metadata = { title: "Avis · Moonlight Cocktail Bar" };

export default function AdminFeedbackPage() {
  return (
    <AdminGate>
      <FeedbackList />
    </AdminGate>
  );
}
