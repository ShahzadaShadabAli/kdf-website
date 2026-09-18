"use client";
import { Fragment, useState } from "react";
import useSWR from "swr";
import { fetcher, apiSend } from "@/lib/swrFetcher";

const PILL = { new: "pill-new", contacted: "pill-contacted", closed: "pill-closed" };

export default function MembershipRequestsPage() {
  const { data, mutate, isLoading } = useSWR("/api/membership?limit=100", fetcher);
  const [openId, setOpenId] = useState(null);

  async function setStatus(id, status) {
    await apiSend(`/api/membership/${id}`, "PATCH", { status });
    mutate();
  }

  const items = data?.items || [];
  const newCount = items.filter((i) => i.status === "new").length;

  return (
    <>
      {newCount > 0 && (
        <div className="admin-empty-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {newCount} new application{newCount === 1 ? "" : "s"} need a first response.
        </div>
      )}
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
              {items.map((m) => (
                <Fragment key={m._id}>
                  <tr style={{ cursor: "pointer" }} onClick={() => setOpenId(openId === m._id ? null : m._id)}>
                    <td>
                      <strong>{m.fullName}</strong>
                    </td>
                    <td>
                      <span className={`pill ${m.membershipType === "honorary" ? "pill-new" : "pill-contacted"}`}>
                        {m.membershipType}
                      </span>
                    </td>
                    <td style={{ color: "var(--ink-soft)" }}>
                      {m.email}
                      <br />
                      {m.phone}
                    </td>
                    <td className="mono" style={{ color: "var(--ink-soft)" }}>
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`pill ${PILL[m.status]}`}>{m.status}</span>
                    </td>
                    <td>
                      <button className="admin-btn-icon" aria-label="Expand">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
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
                        <div>
                          {m.message || <em>No message included.</em>}
                        </div>
                        <div className="inbox-detail-actions">
                          <button className="admin-btn admin-btn-outline" onClick={() => setStatus(m._id, "contacted")}>
                            Mark Contacted
                          </button>
                          <button className="admin-btn admin-btn-outline" onClick={() => setStatus(m._id, "closed")}>
                            Mark Closed
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={6}>No applications yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
