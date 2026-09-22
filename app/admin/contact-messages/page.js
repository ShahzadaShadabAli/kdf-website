"use client";
import { Fragment, useState } from "react";
import useSWR from "swr";
import { fetcher, apiSend } from "@/lib/swrFetcher";

const PILL = { new: "pill-new", contacted: "pill-contacted", closed: "pill-closed" };

export default function ContactMessagesPage() {
  const { data, mutate, isLoading } = useSWR("/api/contact?limit=100", fetcher);
  const [openId, setOpenId] = useState(null);

  async function setStatus(id, status) {
    await apiSend(`/api/contact/${id}`, "PATCH", { status });
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
          {newCount} new message{newCount === 1 ? "" : "s"} need a first response.
        </div>
      )}
      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Submitted</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5}>Loading…</td>
                </tr>
              )}
              {items.map((c) => (
                <Fragment key={c._id}>
                  <tr style={{ cursor: "pointer" }} onClick={() => setOpenId(openId === c._id ? null : c._id)}>
                    <td data-label="Name">
                      <strong>{c.fullName}</strong>
                    </td>
                    <td data-label="Email">{c.email}</td>
                    <td data-label="Submitted" className="mono" style={{ color: "var(--ink-soft)" }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td data-label="Status">
                      <span className={`pill ${PILL[c.status]}`}>{c.status}</span>
                    </td>
                    <td>
                      <button className="admin-btn-icon" aria-label="Expand">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {openId === c._id && (
                    <tr className="inbox-row-detail">
                      <td colSpan={5}>
                        {c.message}
                        <div className="inbox-detail-actions">
                          <button className="admin-btn admin-btn-outline" onClick={() => setStatus(c._id, "contacted")}>
                            Mark Contacted
                          </button>
                          <button className="admin-btn admin-btn-outline" onClick={() => setStatus(c._id, "closed")}>
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
                  <td colSpan={5}>No messages yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
