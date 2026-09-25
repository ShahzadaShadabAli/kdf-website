"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher, apiSend } from "@/lib/swrFetcher";
import Drawer from "@/components/admin/Drawer";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  CABINET_STATUSES,
  CABINET_GROUPS,
  CABINET_GROUP_LABELS,
  groupOf,
} from "@/lib/validation/cabinetMember";
import { ASPECT } from "@/lib/imageAspects";

const PILL = { published: "pill-published", draft: "pill-draft", archived: "pill-archived" };

const EMPTY = { name: "", role: "", parentId: null, group: "male", order: 0, status: "draft", photo: null };

// A member can't be reparented under itself or any of its own descendants —
// that would create a cycle the tree renderer can't draw.
function descendantIds(items, rootId) {
  const ids = new Set();
  let frontier = [rootId];
  while (frontier.length) {
    const next = items.filter((i) => frontier.includes(i.parentId)).map((i) => i._id);
    next.forEach((id) => ids.add(id));
    frontier = next;
  }
  return ids;
}

export default function CabinetAdminPage() {
  const { data, mutate, isLoading } = useSWR("/api/cabinet?admin=1", fetcher);
  const [drawer, setDrawer] = useState(null);
  const [tab, setTab] = useState("male");
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const items = data?.items || [];
  const byId = useMemo(() => new Map(items.map((i) => [i._id, i])), [items]);
  const counts = useMemo(
    () => items.reduce((acc, i) => ({ ...acc, [groupOf(i)]: (acc[groupOf(i)] || 0) + 1 }), {}),
    [items]
  );
  const shown = items.filter((i) => groupOf(i) === tab);

  function openNew() {
    setForm({ ...EMPTY, group: tab });
    setError("");
    setDrawer({ mode: "new" });
  }
  function openEdit(item) {
    setForm({ ...item, group: groupOf(item), photo: item.photo || null });
    setError("");
    setDrawer({ mode: "edit", item });
  }

  // Moving someone to another chart can't keep a parent from the old one.
  function changeGroup(group) {
    const parent = form.parentId ? byId.get(form.parentId) : null;
    setForm({ ...form, group, parentId: parent && groupOf(parent) === group ? form.parentId : null });
  }

  const blockedParentIds = drawer?.mode === "edit" ? descendantIds(items, drawer.item._id) : new Set();
  if (drawer?.mode === "edit") blockedParentIds.add(drawer.item._id);

  async function save() {
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, order: Number(form.order) };
      if (drawer.mode === "new") {
        await apiSend("/api/cabinet", "POST", payload);
      } else {
        await apiSend(`/api/cabinet/${drawer.item._id}`, "PATCH", payload);
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
    if (!confirm(`Archive "${item.name}"? Their direct reports will move up to their parent.`)) return;
    await apiSend(`/api/cabinet/${item._id}`, "DELETE");
    mutate();
  }

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <span style={{ fontSize: "0.86rem", color: "var(--ink-soft)" }}>
            Each chart is built separately — set a member&apos;s parent to place them under
            someone, or leave it blank for a top-level role.
          </span>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openNew}>
          + Add to {CABINET_GROUP_LABELS[tab]}
        </button>
      </div>

      <div className="admin-filter-tabs" role="tablist" aria-label="Choose a chart">
        {CABINET_GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={tab === g}
            className={`admin-filter-tab${tab === g ? " active" : ""}`}
            onClick={() => setTab(g)}
          >
            {CABINET_GROUP_LABELS[g]}
            <span className="admin-filter-count">{counts[g] || 0}</span>
          </button>
        ))}
      </div>

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Role</th>
                <th>Reports To</th>
                <th>Order</th>
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
              {shown.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="thumb" style={{ borderRadius: "50%" }}>
                      {c.photo?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.photo.url} alt={c.photo.alt || ""} />
                      )}
                    </div>
                  </td>
                  <td data-label="Name">
                    <strong>{c.name}</strong>
                  </td>
                  <td data-label="Role" style={{ color: "var(--ink-soft)" }}>{c.role}</td>
                  <td data-label="Reports To" style={{ color: "var(--ink-soft)" }}>
                    {c.parentId
                      ? byId.get(c.parentId)?.name || byId.get(c.parentId)?.role || "—"
                      : <em>Top level</em>}
                  </td>
                  <td data-label="Order" className="mono">{c.order}</td>
                  <td data-label="Status">
                    <span className={`pill ${PILL[c.status]}`}>{c.status}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="admin-btn-icon" aria-label="Edit" onClick={() => openEdit(c)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
                          <path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      {c.status !== "archived" && (
                        <button className="admin-btn-icon" aria-label="Archive" onClick={() => archive(c)}>
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
              {!isLoading && shown.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    Nobody in the {CABINET_GROUP_LABELS[tab].toLowerCase()} yet — add the first
                    member.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={!!drawer}
        title={drawer?.mode === "new" ? `Add to ${CABINET_GROUP_LABELS[form.group]}` : `Edit — ${drawer?.item?.name}`}
        onClose={() => setDrawer(null)}
        onSave={save}
        saving={saving}
        saveLabel="Save Member"
        error={error}
      >
        <div className="admin-field-grid">
          <div className="admin-field admin-field-full">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="admin-field admin-field-full">
            <label>Role / Title</label>
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </div>
          <div className="admin-field admin-field-full">
            <label>Chart</label>
            <select value={form.group} onChange={(e) => changeGroup(e.target.value)}>
              {CABINET_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {CABINET_GROUP_LABELS[g]}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field admin-field-full">
            <label>Reports To</label>
            <select
              value={form.parentId || ""}
              onChange={(e) => setForm({ ...form, parentId: e.target.value || null })}
            >
              <option value="">— Top level —</option>
              {items
                .filter((i) => groupOf(i) === form.group && !blockedParentIds.has(i._id))
                .map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.name ? `${i.name} (${i.role})` : i.role}
                  </option>
                ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Order (among siblings)</label>
            <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {CABINET_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
