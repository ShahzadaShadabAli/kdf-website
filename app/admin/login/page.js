"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import "../admin.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Invalid email or password." : res.error);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <svg className="login-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path
            d="M6 30 C 6 18, 14 8, 20 8 S 34 18, 34 30"
            stroke="var(--gold)"
            strokeWidth="2"
            strokeDasharray="4 4"
            fill="none"
          />
          <circle cx="20" cy="8" r="2.6" fill="var(--clay-soft)" />
          <circle cx="6" cy="30" r="2.6" fill="var(--teal-soft)" />
          <circle cx="34" cy="30" r="2.6" fill="var(--teal-soft)" />
        </svg>
        <h1>Admin Sign In</h1>
        <p className="login-sub">Karakoram Disability Forum · Content Management</p>
        <form onSubmit={onSubmit}>
          <div className="admin-field" style={{ textAlign: "left" }}>
            <label htmlFor="loginEmail">Email</label>
            <input
              id="loginEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="admin-field" style={{ textAlign: "left" }}>
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
          {error && <p className="admin-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
