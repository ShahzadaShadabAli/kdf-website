"use client";
import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { fetcher, apiSend } from "@/lib/swrFetcher";
import Drawer from "@/components/admin/Drawer";
import { USER_ROLES } from "@/lib/validation/user";

export default function UsersAdminPage() {
  const { data: session } = useSession();
  const { data, mutate, isLoading } = useSWR("/api/users", fetcher);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "editor" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function invite() {
    setSaving(true);
    setError("");
    try {
      await apiSend("/api/users", "POST", form);
      await mutate();
      setDrawer(false);
      setForm({ name: "", email: "", role: "editor" });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u) {
    await apiSend(`/api/users/${u._id}`, "PATCH", { isActive: !u.isActive });
    mutate();
  }

  const items = data?.items || [];

  return (
    <>
      <div className="admin-toolbar">
        <div></div>
        <button className="admin-btn admin-btn-primary" onClick={() => setDrawer(true)}>
          + Invite Admin
        </button>
      </div>
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
                  <td>
                    <strong>{u.name}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`pill ${u.role === "super_admin" ? "pill-new" : "pill-contacted"}`}>
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="mono" style={{ color: "var(--ink-soft)" }}>
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}
                  </td>
                  <td>
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

      <Drawer
        open={drawer}
        title="Invite Admin"
        onClose={() => setDrawer(false)}
        onSave={invite}
        saving={saving}
        saveLabel="Send Invite"
        error={error}
      >
        <div className="admin-field">
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="admin-field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="admin-field">
          <label>Role</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>
          A production deployment emails a set-password link (Resend/SMTP) instead of a raw
          password — wire <code>RESEND_API_KEY</code> and the invite flow to send one.
        </p>
      </Drawer>
    </>
  );
}
