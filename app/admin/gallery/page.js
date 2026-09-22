"use client";
import { useState } from "react";
import useSWR from "swr";
import { fetcher, apiSend } from "@/lib/swrFetcher";
import Drawer from "@/components/admin/Drawer";
import ImageUploader from "@/components/admin/ImageUploader";
import { GALLERY_CATEGORIES, GALLERY_STATUSES } from "@/lib/validation/galleryItem";
import { ScenePattern, SCENE_KEYS } from "@/components/shared/PlaceholderArt";
import { ASPECT } from "@/lib/imageAspects";

const PILL = { published: "pill-published", draft: "pill-draft", archived: "pill-archived" };

const EMPTY = {
  title: "",
  caption: "",
  category: "Weaving",
  status: "draft",
  sortOrder: 0,
  image: null,
};

function sceneFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return SCENE_KEYS[hash % SCENE_KEYS.length];
}

export default function GalleryAdminPage() {
  const { data, mutate, isLoading } = useSWR("/api/gallery?admin=1&limit=100", fetcher);
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
      const payload = { ...form, sortOrder: Number(form.sortOrder) };
      if (drawer.mode === "new") {
        await apiSend("/api/gallery", "POST", payload);
      } else {
        await apiSend(`/api/gallery/${drawer.item._id}`, "PATCH", payload);
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
    if (!confirm(`Archive "${item.title}"?`)) return;
    await apiSend(`/api/gallery/${item._id}`, "DELETE");
    mutate();
  }

  const items = data?.items || [];

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <span className="mono" style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>
            {items.length} images
          </span>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openNew}>
          + Add Image
        </button>
      </div>

      {isLoading && <p>Loading…</p>}
      <div className="admin-gallery-grid">
        {items.map((g) => (
          <div className="admin-gallery-card" key={g._id}>
            <div className="admin-gallery-thumb">
              {g.image?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.image.url} alt={g.image.alt} />
              ) : (
                <ScenePattern scene={sceneFor(g._id)} h={150} />
              )}
            </div>
            <div className="admin-gallery-body">
              <div className="agc-top">
                <strong>{g.title}</strong>
              </div>
              <span>{g.category}</span>
              <div className="agc-foot">
                <span className={`pill ${PILL[g.status]}`}>{g.status}</span>
                <button className="admin-btn-icon" aria-label="Edit" onClick={() => openEdit(g)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
                    <path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
              {g.status !== "archived" && (
                <button className="admin-btn-danger" style={{ marginTop: 8 }} onClick={() => archive(g)}>
                  Archive
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Drawer
        open={!!drawer}
        title={drawer?.mode === "new" ? "Add Image" : `Edit — ${drawer?.item?.title}`}
        onClose={() => setDrawer(null)}
        onSave={save}
        saving={saving}
        saveLabel="Save Image"
        error={error}
      >
        <div className="admin-field-grid">
          <div className="admin-field admin-field-full">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="admin-field admin-field-full">
            <label>Caption</label>
            <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {GALLERY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {GALLERY_STATUSES.map((s) => (
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
          <label>Photo</label>
          <ImageUploader
            value={form.image}
            aspect={ASPECT.gallery}
            altPlaceholder={form.title}
            onChange={(image) => setForm({ ...form, image })}
          />
        </div>
      </Drawer>
    </>
  );
}
