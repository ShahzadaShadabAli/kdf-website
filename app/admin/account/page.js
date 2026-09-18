"use client";
import { useState } from "react";
import { apiSend } from "@/lib/swrFetcher";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function AccountPage() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState(null); // null | 'saving' | 'success' | 'error'
  const [error, setError] = useState("");

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmPassword) {
      setStatus("error");
      setError("New password and confirmation don't match");
      return;
    }
    setStatus("saving");
    try {
      await apiSend("/api/account/password", "PATCH", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setStatus("success");
      setForm(EMPTY);
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <div className="admin-panel" style={{ maxWidth: 420 }}>
      <form onSubmit={onSubmit}>
        <div className="admin-field">
          <label>Current Password</label>
          <input type="password" required value={form.currentPassword} onChange={set("currentPassword")} />
        </div>
        <div className="admin-field">
          <label>New Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={form.newPassword}
            onChange={set("newPassword")}
          />
        </div>
        <div className="admin-field">
          <label>Confirm New Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
          />
        </div>
        <button className="admin-btn admin-btn-primary" type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Change Password"}
        </button>
        {status === "success" && (
          <p style={{ color: "var(--teal-soft)", marginTop: 10 }}>Password updated.</p>
        )}
        {status === "error" && (
          <p style={{ color: "var(--clay-soft)", marginTop: 10 }} role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
