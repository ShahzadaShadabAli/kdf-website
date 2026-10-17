"use client";
import { useState } from "react";
import useSWR from "swr";
import { fetcher, apiSend } from "@/lib/swrFetcher";
import Drawer from "@/components/admin/Drawer";
import MultiImageUploader from "@/components/admin/MultiImageUploader";
import YouTubeLinks from "@/components/admin/YouTubeLinks";
import {
  GALLERY_CATEGORIES,
  GALLERY_STATUSES,
  GALLERY_MAX_PHOTOS,
  GALLERY_MAX_VIDEOS,
} from "@/lib/validation/galleryItem";
import { albumCoverPhoto, albumDateLabel, albumPhotos, albumSummary, albumVideos } from "@/lib/gallery";
import { youtubeThumb } from "@/lib/youtube";
import { ScenePattern, SCENE_KEYS } from "@/components/shared/PlaceholderArt";
import { ASPECT } from "@/lib/imageAspects";

const PILL = { published: "pill-published", draft: "pill-draft", archived: "pill-archived" };

const EMPTY = {
  title: "",
  caption: "",
  eventDate: "",
  category: "Community",
  status: "draft",
  sortOrder: 0,
  photos: [],
  videos: [],
};

function sceneFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return SCENE_KEYS[hash % SCENE_KEYS.length];
}

// Albums saved before this collection held more than one photo each only have
// the single `image` field — seed the editor from it so saving carries it over.
function seedPhotos(item) {
  const photos = albumPhotos(item).map((photo) => ({ ...photo, isPrimary: !!photo.isPrimary }));
  if (photos.length && !photos.some((photo) => photo.isPrimary)) photos[0].isPrimary = true;
  return photos;
}

function AlbumThumb({ album }) {
  const photo = albumCoverPhoto(album);
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo.url} alt={photo.alt || album.title} />;
  }
  const video = albumVideos(album)[0];
  if (video) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={youtubeThumb(video.youtubeId)} alt={video.title || album.title} />;
  }
  return <ScenePattern scene={sceneFor(album._id)} h={150} />;
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
    setForm({
      ...item,
      caption: item.caption || "",
      eventDate: item.eventDate || "",
      photos: seedPhotos(item),
      videos: item.videos || [],
    });
    setError("");
    setDrawer({ mode: "edit", item });
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const videos = (form.videos || [])
        .filter((video) => (video.youtubeUrl || "").trim())
        .map((video) => ({ youtubeUrl: video.youtubeUrl.trim(), title: (video.title || "").trim() }));
      const payload = { ...form, sortOrder: Number(form.sortOrder), videos };
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
    if (!confirm(`Archive the album "${item.title}"?`)) return;
    await apiSend(`/api/gallery/${item._id}`, "DELETE");
    mutate();
  }

  const items = data?.items || [];

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <span style={{ fontSize: "0.86rem", color: "var(--ink-soft)" }}>
            One album per event — add all of its photos at once, plus any YouTube videos.
          </span>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openNew}>
          + Add Album
        </button>
      </div>

      {isLoading && <p>Loading…</p>}
      {!isLoading && items.length === 0 && (
        <p className="admin-note">No albums yet. Start one with “+ Add Album”.</p>
      )}
      <div className="admin-gallery-grid">
        {items.map((g) => {
          const dateLabel = albumDateLabel(g);
          return (
            <div className="admin-gallery-card" key={g._id}>
              <div className="admin-gallery-thumb">
                <AlbumThumb album={g} />
              </div>
              <div className="admin-gallery-body">
                <div className="agc-top">
                  <strong>{g.title}</strong>
                </div>
                <span>
                  {g.category}
                  {dateLabel ? ` · ${dateLabel}` : ""}
                </span>
                <span className="mono admin-gallery-count">{albumSummary(g) || "Empty album"}</span>
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
          );
        })}
      </div>

      <Drawer
        open={!!drawer}
        title={drawer?.mode === "new" ? "Add Album" : `Edit — ${drawer?.item?.title}`}
        onClose={() => setDrawer(null)}
        onSave={save}
        saving={saving}
        saveLabel="Save Album"
        error={error}
      >
        <div className="admin-field-grid">
          <div className="admin-field admin-field-full">
            <label>Album name</label>
            <input
              value={form.title}
              placeholder="e.g. White Cane Day 2026"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="admin-field admin-field-full">
            <label>Caption</label>
            <input
              value={form.caption}
              placeholder="One line about the event"
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label>Event date (optional)</label>
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />
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
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>
        </div>

        <div className="admin-field">
          <label>Photos ({(form.photos || []).length})</label>
          <MultiImageUploader
            images={form.photos || []}
            onChange={(photos) => setForm((f) => ({ ...f, photos }))}
            aspect={ASPECT.gallery}
            cropOnUpload={false}
            max={GALLERY_MAX_PHOTOS}
            altPlaceholder={form.title}
            defaultAlt="Event photo"
            primaryLabel="Cover"
            primaryNote={`the first becomes the album cover — up to ${GALLERY_MAX_PHOTOS} photos`}
          />
        </div>

        <div className="admin-field">
          <label>Videos from YouTube</label>
          <YouTubeLinks
            videos={form.videos || []}
            onChange={(videos) => setForm((f) => ({ ...f, videos }))}
            max={GALLERY_MAX_VIDEOS}
          />
        </div>
      </Drawer>
    </>
  );
}
