"use client";

export default function Drawer({ open, title, onClose, onSave, saving, saveLabel = "Save", children, error }) {
  if (!open) return null;
  return (
    <>
      <div className="admin-overlay" onClick={onClose} />
      <div className="admin-drawer">
        <div className="admin-drawer-head">
          <h3>{title}</h3>
          <button className="admin-drawer-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="admin-drawer-body">
          {children}
          {error && <p className="admin-error">{error}</p>}
        </div>
        <div className="admin-drawer-foot">
          <button className="admin-btn admin-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="admin-btn admin-btn-primary" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : saveLabel}
          </button>
        </div>
      </div>
    </>
  );
}
