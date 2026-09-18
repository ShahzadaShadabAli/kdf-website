import { getDb } from "@/lib/firebase";
import { docsToItems } from "@/lib/firestoreHelpers";

export const dynamic = "force-dynamic";

async function countWhere(collectionRef, field, value) {
  const snapshot = await collectionRef.where(field, "==", value).count().get();
  return snapshot.data().count;
}

async function getStats() {
  const db = await getDb();
  const [publishedProducts, galleryItems, newContact, newMembership, auditLogSnap] = await Promise.all([
    countWhere(db.collection("products"), "status", "published"),
    countWhere(db.collection("galleryItems"), "status", "published"),
    countWhere(db.collection("contactMessages"), "status", "new"),
    countWhere(db.collection("membershipRequests"), "status", "new"),
    db.collection("auditLog").orderBy("createdAt", "desc").limit(10).get(),
  ]);
  return {
    publishedProducts,
    galleryItems,
    newContact,
    newMembership,
    auditLog: JSON.parse(JSON.stringify(docsToItems(auditLogSnap))),
  };
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(11,110,57,0.12)", color: "var(--teal)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 8l9-5 9 5-9 5-9-5Z" />
              <path d="M3 8v8l9 5 9-5V8" />
            </svg>
          </div>
          <div className="stat-num">{stats.publishedProducts}</div>
          <div className="stat-label">Published products</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(198,137,46,0.15)", color: "var(--gold)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <div className="stat-num">{stats.galleryItems}</div>
          <div className="stat-label">Gallery items</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(168,70,47,0.12)", color: "var(--clay)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <div className="stat-num">{stats.newContact}</div>
          <div className="stat-label">New contact messages</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(107,63,160,0.12)", color: "var(--purple)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="5" />
              <path d="M8.5 13 6 22l6-3 6 3-2.5-9" />
            </svg>
          </div>
          <div className="stat-num">{stats.newMembership}</div>
          <div className="stat-label">New membership applications</div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Recent Activity</h3>
          <span className="mono" style={{ fontSize: "0.76rem", color: "var(--ink-soft)" }}>
            Audit log
          </span>
        </div>
        {stats.auditLog.length === 0 && <div className="audit-item">No activity yet.</div>}
        {stats.auditLog.map((a) => (
          <div className="audit-item" key={a._id}>
            <span className="audit-dot"></span>
            <span>
              <strong>{a.actorEmail}</strong> — {a.action}
              {a.targetId ? ` (${a.targetId})` : ""}
            </span>
            <span className="audit-time mono" style={{ marginLeft: "auto", whiteSpace: "nowrap", color: "var(--ink-soft)", fontSize: "0.76rem" }}>
              {timeAgo(a.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
