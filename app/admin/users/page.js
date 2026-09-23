"use client";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { fetcher, apiSend } from "@/lib/swrFetcher";

export default function UsersAdminPage() {
  const { data: session } = useSession();
  const { data, mutate, isLoading } = useSWR("/api/users", fetcher);
  async function toggleActive(u) {
    await apiSend(`/api/users/${u._id}`, "PATCH", { isActive: !u.isActive });
    mutate();
  }

  const items = data?.items || [];

  return (
    <>
      <p className="admin-note">
        Admin accounts are created by whoever set the website up. You can disable an account
        here to stop it signing in, and each admin changes their own password under My Account.
      </p>
      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6}>Loading…</td>
                </tr>
              )}
              {items.map((u) => (
                <tr key={u._id}>
                  <td data-label="Name">
                    <strong>{u.name}</strong>
                  </td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Role">
                    <span className={`pill ${u.role === "super_admin" ? "pill-new" : "pill-contacted"}`}>
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td data-label="Last Login" className="mono" style={{ color: "var(--ink-soft)" }}>
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}
                  </td>
                  <td data-label="Status">
                    <span className={`pill ${u.isActive ? "pill-published" : "pill-archived"}`}>
                      {u.isActive ? "active" : "disabled"}
                    </span>
                  </td>
                  <td>
                    {u._id !== session?.user?.id && (
                      <button className="admin-btn-danger" onClick={() => toggleActive(u)}>
                        {u.isActive ? "Disable" : "Enable"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </>
  );
}
