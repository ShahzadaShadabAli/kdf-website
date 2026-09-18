"use client";
import { useState } from "react";
import useSWR from "swr";
import { fetcher, apiSend } from "@/lib/swrFetcher";
import Drawer from "@/components/admin/Drawer";
import ImageUploader from "@/components/admin/ImageUploader";
import { VOICE_STATUSES } from "@/lib/validation/voice";

const PILL = { published: "pill-published", draft: "pill-draft", archived: "pill-archived" };

const EMPTY = {
  quote: "",
  personName: "",
  personRole: "",
  vignetteTitle: "",
  vignetteCaption: "",
  order: 0,
  status: "draft",
  image: null,
};

export default function VoicesAdminPage() {
  const { data, mutate, isLoading } = useSWR("/api/voices?admin=1", fetcher);
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
    setForm({ ...item, image: item.image || null });
    setError("");
    setDrawer({ mode: "edit", item });
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, order: Number(form.order) };
      if (drawer.mode === "new") {
        await apiSend("/api/voices", "POST", payload);
      } else {
        await apiSend(`/api/voices/${drawer.item._id}`, "PATCH", payload);
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
    if (!confirm(`Archive the voice from "${item.personName}"?`)) return;
    await apiSend(`/api/voices/${item._id}`, "DELETE");
    mutate();
  }

  const items = data?.items || [];

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <span style={{ fontSize: "0.86rem", color: "var(--ink-soft)" }}>
            Order sets the alternating quote/vignette sequence on the homepage.
          </span>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openNew}>
          + Add Voice
        </button>
      </div>

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Order</th>
                <th>Person</th>
                <th>Quote</th>
                <th>Vignette</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7}>Loading…</td>
                </tr>
              )}
              {items.map((v) => (
                <tr key={v._id}>
                  <td>
                    <div className="thumb">
                      {v.image?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.image.url} alt={v.image.alt || ""} />
                      )}
                    </div>
                  </td>
                  <td className="mono">{v.order}</td>
                  <td>
                    <div className="cell-name">
                      <strong>{v.personName}</strong>
                      <span>{v.personRole}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--ink-soft)", maxWidth: 260 }}>
                    {v.quote.length > 80 ? `${v.quote.slice(0, 80)}…` : v.quote}
                  </td>
                  <td style={{ color: "var(--ink-soft)" }}>{v.vignetteTitle}</td>
                  <td>
                    <span className={`pill ${PILL[v.status]}`}>{v.status}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="admin-btn-icon" aria-label="Edit" onClick={() => openEdit(v)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
                          <path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      {v.status !== "archived" && (
                        <button className="admin-btn-icon" aria-label="Archive" onClick={() => archive(v)}>
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
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={7}>No voices yet — add the first one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={!!drawer}
        title={drawer?.mode === "new" ? "Add Voice" : `Edit — ${drawer?.item?.personName}`}
        onClose={() => setDrawer(null)}
        onSave={save}
        saving={saving}
        saveLabel="Save Voice"
        error={error}
      >
        <div className="admin-field-grid">
          <div className="admin-field admin-field-full">
            <label>Quote</label>
            <textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Person Name</label>
            <input value={form.personName} onChange={(e) => setForm({ ...form, personName: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Person Role</label>
            <input
              value={form.personRole}
              placeholder="e.g. Member since 2019"
              onChange={(e) => setForm({ ...form, personRole: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label>Vignette Title</label>
            <input
              value={form.vignetteTitle}
              placeholder="e.g. Loom Corner"
              onChange={(e) => setForm({ ...form, vignetteTitle: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label>Vignette Caption</label>
            <input
              value={form.vignetteCaption}
              placeholder="e.g. Weaving Programme, Skardu bazaar"
              onChange={(e) => setForm({ ...form, vignetteCaption: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label>Order</label>
            <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {VOICE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="admin-field">
          <label>Vignette Image</label>
          <ImageUploader
            value={form.image}
            altPlaceholder={form.vignetteTitle}
            onChange={(image) => setForm({ ...form, image })}
          />
        </div>
      </Drawer>
    </>
  );
}
