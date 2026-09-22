"use client";
import { useState } from "react";
import useSWR from "swr";
import { fetcher, apiSend } from "@/lib/swrFetcher";
import Drawer from "@/components/admin/Drawer";
import { SUCCESS_STORY_STATUSES, extractYouTubeId } from "@/lib/validation/successStory";

const PILL = { published: "pill-published", draft: "pill-draft", archived: "pill-archived" };

const EMPTY = {
  title: "",
  caption: "",
  youtubeUrl: "",
  order: 0,
  status: "draft",
};

export default function SuccessStoriesAdminPage() {
  const { data, mutate, isLoading } = useSWR("/api/success-stories?admin=1", fetcher);
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
    setForm(item);
    setError("");
    setDrawer({ mode: "edit", item });
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, order: Number(form.order) };
      if (drawer.mode === "new") {
        await apiSend("/api/success-stories", "POST", payload);
      } else {
        await apiSend(`/api/success-stories/${drawer.item._id}`, "PATCH", payload);
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
    await apiSend(`/api/success-stories/${item._id}`, "DELETE");
    mutate();
  }

  const items = data?.items || [];

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <span style={{ fontSize: "0.86rem", color: "var(--ink-soft)" }}>
            Paste any YouTube video link — the video plays straight from YouTube, nothing is uploaded here.
          </span>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openNew}>
          + Add Success Story
        </button>
      </div>

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Order</th>
                <th>Title</th>
                <th>YouTube Link</th>
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
              {items.map((s) => {
                const videoId = extractYouTubeId(s.youtubeUrl);
                return (
                  <tr key={s._id}>
                    <td>
                      <div className="thumb">
                        {videoId && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`https://i.ytimg.com/vi/${videoId}/default.jpg`} alt="" />
                        )}
                      </div>
                    </td>
                    <td data-label="Order" className="mono">{s.order}</td>
                    <td data-label="Title">
                      <strong>{s.title}</strong>
                    </td>
                    <td data-label="YouTube Link" style={{ color: "var(--ink-soft)", maxWidth: 260, wordBreak: "break-all" }}>
                      {s.youtubeUrl}
                    </td>
                    <td data-label="Status">
                      <span className={`pill ${PILL[s.status]}`}>{s.status}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="admin-btn-icon" aria-label="Edit" onClick={() => openEdit(s)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
                            <path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        {s.status !== "archived" && (
                          <button className="admin-btn-icon" aria-label="Archive" onClick={() => archive(s)}>
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
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={6}>No success stories yet — add the first one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={!!drawer}
        title={drawer?.mode === "new" ? "Add Success Story" : `Edit — ${drawer?.item?.title}`}
        onClose={() => setDrawer(null)}
        onSave={save}
        saving={saving}
        saveLabel="Save Story"
        error={error}
      >
        <div className="admin-field-grid">
          <div className="admin-field admin-field-full">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="admin-field admin-field-full">
            <label>YouTube Link</label>
            <input
              value={form.youtubeUrl}
              placeholder="https://www.youtube.com/watch?v=..."
              onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
            />
            {form.youtubeUrl && !extractYouTubeId(form.youtubeUrl) && (
              <p className="admin-error">Doesn&apos;t look like a valid YouTube link yet.</p>
            )}
          </div>
          <div className="admin-field admin-field-full">
            <label>Caption (optional)</label>
            <textarea value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Order</label>
            <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {SUCCESS_STORY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Drawer>
    </>
  );
}
