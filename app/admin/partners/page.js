"use client";
import { useState } from "react";
import useSWR from "swr";
import { fetcher, apiSend } from "@/lib/swrFetcher";
import Drawer from "@/components/admin/Drawer";
import ImageUploader from "@/components/admin/ImageUploader";
import { PARTNER_STATUSES } from "@/lib/validation/partner";

const PILL = { published: "pill-published", draft: "pill-draft", archived: "pill-archived" };

const EMPTY = {
  name: "",
  websiteUrl: "",
  status: "draft",
  sortOrder: 0,
  logo: null,
};

export default function PartnersAdminPage() {
  const { data, mutate, isLoading } = useSWR("/api/partners?admin=1", fetcher);
  const [drawer, setDrawer] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openNew() {
    setForm(EMPTY);
    setError("");
    setDrawer({ mode: "new" });
  }
  function openEdit(item) {
    setForm({ ...item, logo: item.logo || null });
    setError("");
    setDrawer({ mode: "edit", item });
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) };
      if (drawer.mode === "new") {
        await apiSend("/api/partners", "POST", payload);
      } else {
        await apiSend(`/api/partners/${drawer.item._id}`, "PATCH", payload);
      }
      await mutate();
      setDrawer(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function archive(item) {
    if (!confirm(`Archive "${item.name}"?`)) return;
    await apiSend(`/api/partners/${item._id}`, "DELETE");
    mutate();
  }

  const items = data?.items || [];

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <span className="mono" style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>
            {items.length} partners
          </span>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openNew}>
          + Add Partner
        </button>
      </div>

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Name</th>
                <th>Website</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5}>Loading…</td>
                </tr>
              )}
              {items.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="thumb">
                      {p.logo?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.logo.url} alt={p.logo.alt} />
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                  </td>
                  <td style={{ color: "var(--ink-soft)" }}>{p.websiteUrl || "—"}</td>
                  <td>
                    <span className={`pill ${PILL[p.status]}`}>{p.status}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="admin-btn-icon" aria-label="Edit" onClick={() => openEdit(p)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
                          <path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      {p.status !== "archived" && (
                        <button className="admin-btn-icon" aria-label="Archive" onClick={() => archive(p)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M21 8v13H3V8" />
                            <path d="M1 3h22v5H1z" />
                            <path d="M10 12h4" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={!!drawer}
        title={drawer?.mode === "new" ? "Add Partner" : `Edit — ${drawer?.item?.name}`}
        onClose={() => setDrawer(null)}
        onSave={save}
        saving={saving}
        saveLabel="Save Partner"
        error={error}
      >
        <div className="admin-field-grid">
          <div className="admin-field admin-field-full">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="admin-field admin-field-full">
            <label>Website URL (optional)</label>
            <input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {PARTNER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          </div>
        </div>
        <div className="admin-field">
          <label>Logo</label>
          <ImageUploader value={form.logo} altPlaceholder={form.name} onChange={(logo) => setForm({ ...form, logo })} />
        </div>
      </Drawer>
    </>
  );
}
