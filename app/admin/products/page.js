"use client";
import { useState } from "react";
import useSWR from "swr";
import { fetcher, apiSend } from "@/lib/swrFetcher";
import Drawer from "@/components/admin/Drawer";
import MultiImageUploader from "@/components/admin/MultiImageUploader";
import { CRAFTS, PRODUCT_STATUSES } from "@/lib/validation/product";

const PILL = { published: "pill-published", draft: "pill-draft", archived: "pill-archived" };

const EMPTY = {
  name: "",
  slug: "",
  craft: "Weaving",
  makerName: "",
  makerRole: "",
  priceMinor: 0,
  currency: "PKR",
  description: "",
  status: "draft",
  sortOrder: 0,
  images: [],
};

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductsAdminPage() {
  const { data, mutate, isLoading } = useSWR("/api/products?admin=1&limit=100", fetcher);
  const [drawer, setDrawer] = useState(null); // null | { mode: 'new'|'edit', item }
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openNew() {
    setForm(EMPTY);
    setError("");
    setDrawer({ mode: "new" });
  }
  function openEdit(item) {
    setForm({
      ...item,
      priceMinor: item.priceMinor,
    });
    setError("");
    setDrawer({ mode: "edit", item });
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        priceMinor: Number(form.priceMinor),
        sortOrder: Number(form.sortOrder),
        slug: form.slug || slugify(form.name),
      };
      if (drawer.mode === "new") {
        await apiSend("/api/products", "POST", payload);
      } else {
        await apiSend(`/api/products/${drawer.item._id}`, "PATCH", payload);
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
    await apiSend(`/api/products/${item._id}`, "DELETE");
    mutate();
  }

  const items = data?.items || [];

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <span className="mono" style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>
            {items.length} products
          </span>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openNew}>
          + New Product
        </button>
      </div>

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Product</th>
                <th>Craft</th>
                <th>Price</th>
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
              {items.map((p) => {
                const primary = p.images?.find((im) => im.isPrimary) || p.images?.[0];
                return (
                <tr key={p._id}>
                  <td>
                    <div className="thumb">
                      {primary?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={primary.url} alt={primary.alt || ""} />
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="cell-name">
                      <strong>{p.name}</strong>
                      <span>{p.makerName}</span>
                    </div>
                  </td>
                  <td>{p.craft}</td>
                  <td className="mono">
                    {p.currency} {(p.priceMinor / 100).toLocaleString()}
                  </td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={!!drawer}
        title={drawer?.mode === "new" ? "New Product" : `Edit — ${drawer?.item?.name}`}
        onClose={() => setDrawer(null)}
        onSave={save}
        saving={saving}
        saveLabel="Save Product"
        error={error}
      >
        <div className="admin-field-grid">
          <div className="admin-field admin-field-full">
            <label>Product Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="admin-field admin-field-full">
            <label>Slug</label>
            <input
              value={form.slug}
              placeholder={slugify(form.name)}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
            />
          </div>
          <div className="admin-field">
            <label>Craft</label>
            <select value={form.craft} onChange={(e) => setForm({ ...form, craft: e.target.value })}>
              {CRAFTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {PRODUCT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Maker Name</label>
            <input value={form.makerName} onChange={(e) => setForm({ ...form, makerName: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Maker Role</label>
            <input value={form.makerRole} onChange={(e) => setForm({ ...form, makerRole: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Price (PKR, whole rupees)</label>
            <input
              type="number"
              value={form.priceMinor / 100}
              onChange={(e) => setForm({ ...form, priceMinor: Math.round(Number(e.target.value) * 100) })}
            />
          </div>
          <div className="admin-field">
            <label>Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          </div>
          <div className="admin-field admin-field-full">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="admin-field">
          <label>Images</label>
          <MultiImageUploader
            images={form.images}
            altPlaceholder={form.name}
            onChange={(images) => setForm({ ...form, images })}
          />
        </div>
      </Drawer>
    </>
  );
}
