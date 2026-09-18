import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminProviders from "./providers";
import AdminShell from "@/components/admin/AdminShell";
import "./admin.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Karakoram Disability Forum",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  // The login page renders its own full-screen layout with no session yet;
  // middleware already redirects every other /admin/* route when unauthenticated.
  if (!session) {
    return (
      <AdminProviders session={session}>
        <div className="admin-body">{children}</div>
      </AdminProviders>
    );
  }

  return (
    <AdminProviders session={session}>
      <div className="admin-body">
        <AdminShell session={session}>{children}</AdminShell>
      </div>
    </AdminProviders>
  );
}
