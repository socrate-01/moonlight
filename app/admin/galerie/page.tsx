import AdminGate from "@/components/admin/AdminGate";
import GalleryAdmin from "@/components/admin/gallery/GalleryAdmin";

export const metadata = { title: "Galerie · Admin Moonlight" };

export default function AdminGaleriePage() {
  return (
    <AdminGate>
      <GalleryAdmin />
    </AdminGate>
  );
}
