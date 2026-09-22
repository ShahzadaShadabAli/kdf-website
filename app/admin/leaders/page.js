"use client";
import { useState } from "react";
import useSWR from "swr";
import { fetcher, apiSend } from "@/lib/swrFetcher";
import Drawer from "@/components/admin/Drawer";
import ImageUploader from "@/components/admin/ImageUploader";
import { LEADER_STATUSES } from "@/lib/validation/leader";
import { ASPECT } from "@/lib/imageAspects";

const PILL = { published: "pill-published", draft: "pill-draft", archived: "pill-archived" };

const EMPTY = { name: "", title: "", quote: "", bio: "", order: 0, status: "draft", photo: null };

export default function LeadersAdminPage() {
  const { data, mutate, isLoading } = useSWR("/api/leaders?admin=1", fetcher);
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
    setForm({ ...item, photo: item.photo || null });
    setError("");
    setDrawer({ mode: "edit", item });
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, order: Number(form.order) };
      if (drawer.mode === "new") {
        await apiSend("/api/leaders", "POST", payload);
      } else {
        await apiSend(`/api/leaders/${drawer.item._id}`, "PATCH", payload);
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
    await apiSend(`/api/leaders/${item._id}`, "DELETE");
    mutate();
  }

  const items = data?.items || [];

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <span style={{ fontSize: "0.86rem", color: "var(--ink-soft)" }}>
            Order sets the carousel order on the homepage.
          </span>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openNew}>
          + Add Leader
        </button>
      </div>
      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Order</th>
                <th>Name</th>
                <th>Title</th>
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
              {items.map((l) => (
                <tr key={l._id}>
                  <td>
                    <div className="thumb" style={{ borderRadius: "50%" }}>
                      {l.photo?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.photo.url} alt={l.photo.alt || ""} />
                      )}
                    </div>
                  </td>
                  <td data-label="Order" className="mono">{l.order}</td>
                  <td data-label="Name">
                    <strong>{l.name}</strong>
                  </td>
                  <td data-label="Title" style={{ color: "var(--ink-soft)" }}>{l.title}</td>
                  <td data-label="Status">
                    <span className={`pill ${PILL[l.status]}`}>{l.status}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="admin-btn-icon" aria-label="Edit" onClick={() => openEdit(l)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
                          <path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      {l.status !== "archived" && (
                        <button className="admin-btn-icon" aria-label="Archive" onClick={() => archive(l)}>
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
        title={drawer?.mode === "new" ? "New Leader" : `Edit — ${drawer?.item?.name}`}
        onClose={() => setDrawer(null)}
        onSave={save}
        saving={saving}
        saveLabel="Save Leader"
        error={error}
      >
        <div className="admin-field-grid">
          <div className="admin-field admin-field-full">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="admin-field admin-field-full">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Order</label>
            <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {LEADER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field admin-field-full">
            <label>Quote</label>
            <textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
          </div>
          <div className="admin-field admin-field-full">
            <label>Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
        </div>
        <div className="admin-field">
          <label>Photo</label>
          <ImageUploader value={form.photo} aspect={ASPECT.portrait} altPlaceholder={form.name} onChange={(photo) => setForm({ ...form, photo })} />
        </div>
      </Drawer>
    </>
  );
}
