"use client";
import { Fragment, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { fetcher, apiSend } from "@/lib/swrFetcher";
import { isPendingMembership } from "@/lib/validation/membership";

const STATUS_LABEL = { accepted: "Member", rejected: "Rejected" };
const PILL = { accepted: "pill-published", rejected: "pill-archived" };
const TYPE_LABEL = { honorary: "Honorary", permanent: "Permanent" };

const FILTERS = [
  { key: "pending", label: "Waiting" },
  { key: "accepted", label: "Members" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

const stateOf = (m) => (isPendingMembership(m.status) ? "pending" : m.status);

export default function MembershipRequestsPage() {
  const { data, mutate, isLoading } = useSWR("/api/membership?limit=100", fetcher);
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function decide(m, status) {
    if (status === "rejected" && !window.confirm(`Reject ${m.fullName}'s application?`)) return;
    setBusyId(m._id);
    setError("");
    try {
      await apiSend(`/api/membership/${m._id}`, "PATCH", { status });
      await mutate();
      globalMutate("/api/membership?status=pending&limit=100"); // sidebar badge
    } catch (e) {
      setError(e.message || "Couldn't save — please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const all = data?.items || [];
  const counts = all.reduce((acc, m) => ({ ...acc, [stateOf(m)]: (acc[stateOf(m)] || 0) + 1 }), {});
  const items = filter === "all" ? all : all.filter((m) => stateOf(m) === filter);
  const waiting = counts.pending || 0;

  const decisionButtons = (m) => (
    <>
      <button
        type="button"
        className="admin-btn admin-btn-primary admin-btn-sm"
        disabled={busyId === m._id}
        onClick={(e) => {
          e.stopPropagation();
          decide(m, "accepted");
        }}
      >
        Add member
      </button>
      <button
        type="button"
        className="admin-btn admin-btn-reject admin-btn-sm"
        disabled={busyId === m._id}
        onClick={(e) => {
          e.stopPropagation();
          decide(m, "rejected");
        }}
      >
        Reject
      </button>
    </>
  );

  return (
    <>
      {waiting > 0 && (
        <div className="admin-empty-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {waiting} application{waiting === 1 ? " is" : "s are"} waiting for a decision.
        </div>
      )}

      <div className="admin-filter-tabs" role="tablist" aria-label="Filter applications">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            className={`admin-filter-tab${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="admin-filter-count">{f.key === "all" ? all.length : counts[f.key] || 0}</span>
          </button>
        ))}
      </div>

      {error && <p className="admin-error" style={{ marginBottom: 14 }}>{error}</p>}

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Contact</th>
                <th>Submitted</th>
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
              {items.map((m) => {
                const pending = isPendingMembership(m.status);
                return (
                  <Fragment key={m._id}>
                    <tr style={{ cursor: "pointer" }} onClick={() => setOpenId(openId === m._id ? null : m._id)}>
                      <td data-label="Name">
                        <strong>{m.fullName}</strong>
                      </td>
                      <td data-label="Type">
                        <span className={`pill ${m.membershipType === "honorary" ? "pill-new" : "pill-contacted"}`}>
                          {TYPE_LABEL[m.membershipType] || m.membershipType}
                        </span>
                      </td>
                      <td data-label="Contact" style={{ color: "var(--ink-soft)" }}>
                        {m.email}
                        <br />
                        {m.phone}
                      </td>
                      <td data-label="Submitted" className="mono" style={{ color: "var(--ink-soft)" }}>
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                      <td data-label="Status">
                        {pending ? (
                          <span className="pill pill-draft">Waiting</span>
                        ) : (
                          <span className={`pill ${PILL[m.status]}`}>{STATUS_LABEL[m.status]}</span>
                        )}
                      </td>
                      <td>
                        <div className="row-actions">
                          {pending && decisionButtons(m)}
                          <button
                            type="button"
                            className="admin-btn-icon"
                            aria-label={openId === m._id ? "Hide details" : "Show details"}
                            aria-expanded={openId === m._id}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              style={{ transform: openId === m._id ? "rotate(180deg)" : undefined }}
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {openId === m._id && (
                      <tr className="inbox-row-detail">
                        <td colSpan={6}>
                          <div className="admin-field-grid" style={{ marginBottom: 10 }}>
                            <div>
                              <strong>S/O or D/O:</strong> {m.guardianRelation} {m.guardianName}
                            </div>
                            <div>
                              <strong>Gender:</strong> {m.gender || "—"}
                            </div>
                            <div>
                              <strong>CNIC:</strong> {m.cnic || "—"}
                            </div>
                            <div>
                              <strong>Profession:</strong> {m.profession || "—"}
                            </div>
                            <div>
                              <strong>Home Address:</strong> {m.homeAddress || "—"}
                            </div>
                            <div>
                              <strong>Location:</strong> {[m.city, m.district, m.province].filter(Boolean).join(", ") || "—"}
                            </div>
                            {m.membershipType === "permanent" && (
                              <div>
                                <strong>Disability:</strong> {m.disability || "—"}
                              </div>
                            )}
                          </div>
                          <div>{m.message || <em>No message included.</em>}</div>
                          <div className="inbox-detail-actions">
                            {pending ? (
                              decisionButtons(m)
                            ) : (
                              <>
                                <span className="membership-decided">
                                  {m.status === "accepted" ? "Added as a member" : "Rejected"}
                                  {m.decidedAt ? ` on ${new Date(m.decidedAt).toLocaleDateString()}` : ""}
                                  {m.decidedBy ? ` by ${m.decidedBy}` : ""}
                                </span>
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-outline admin-btn-sm"
                                  disabled={busyId === m._id}
                                  onClick={() => decide(m, "new")}
                                >
                                  Undo
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    {all.length === 0
                      ? "No applications yet."
                      : filter === "pending"
                        ? "Nothing waiting — every application has been answered."
                        : "Nothing here yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
