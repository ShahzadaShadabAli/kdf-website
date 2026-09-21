"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher, apiSend } from "@/lib/swrFetcher";
import ImageUploader from "@/components/admin/ImageUploader";

const FIELDS = [
  "heroHeadline",
  "heroSubtext",
  "whatsappNumber",
  "contactEmail",
  "address",
  "bankName",
  "accountTitle",
  "accountNumber",
  "iban",
  "branchName",
  "facebookUrl",
  "instagramUrl",
  "whatsappUrl",
  "linkedinUrl",
];

export default function SettingsAdminPage() {
  const { data, mutate, isLoading } = useSWR("/api/settings", fetcher);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  async function save() {
    setSaving(true);
    setStatus("");
    try {
      const payload = {};
      FIELDS.forEach((f) => {
        payload[f] = form[f] ?? "";
      });
      payload.mapLat = form.mapLat === "" || form.mapLat == null ? null : Number(form.mapLat);
      payload.mapLng = form.mapLng === "" || form.mapLng == null ? null : Number(form.mapLng);
      payload.logo = form.logo ?? null;
      payload.heroImage = form.heroImage ?? null;
      payload.storyImage = form.storyImage ?? null;
      await apiSend("/api/settings", "PATCH", payload);
      await mutate();
      setStatus("Settings saved — homepage revalidated.");
    } catch (e) {
      setStatus(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !form) return <p>Loading…</p>;

  return (
    <>
      <div className="admin-panel" style={{ padding: "26px 30px", maxWidth: 640, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 22 }}>Site Copy &amp; Contact Details</h3>
        <div className="admin-field admin-field-full">
          <label>Hero Headline</label>
          <input value={form.heroHeadline} onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })} />
        </div>
        <div className="admin-field admin-field-full">
          <label>Hero Subtext</label>
          <textarea value={form.heroSubtext} onChange={(e) => setForm({ ...form, heroSubtext: e.target.value })} />
        </div>
        <div className="admin-field-grid">
          <div className="admin-field">
            <label>WhatsApp Number</label>
            <input value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Contact Email</label>
            <input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
        </div>
        <div className="admin-field admin-field-full">
          <label>Address</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", marginTop: 6 }}>
            Used as a fallback search on the homepage map if no exact coordinates are set below.
          </p>
        </div>
        <div className="admin-field-grid">
          <div className="admin-field">
            <label>Map Latitude (optional)</label>
            <input
              type="number"
              step="any"
              value={form.mapLat ?? ""}
              placeholder="e.g. 35.286908"
              onChange={(e) => setForm({ ...form, mapLat: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label>Map Longitude (optional)</label>
            <input
              type="number"
              step="any"
              value={form.mapLng ?? ""}
              placeholder="e.g. 75.662826"
              onChange={(e) => setForm({ ...form, mapLng: e.target.value })}
            />
          </div>
        </div>
        <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)" }}>
          Exact coordinates pin the homepage map precisely — leave both blank to fall back to
          the address text search above.
        </p>
      </div>

      <div className="admin-panel" style={{ padding: "26px 30px", maxWidth: 640, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 22 }}>Logo &amp; Photos</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--ink-soft)", marginBottom: 18 }}>
          Optional — each spot shows an illustrated graphic until a real image is uploaded here.
        </p>
        <div className="admin-field admin-field-full">
          <label>Logo</label>
          <ImageUploader
            value={form.logo}
            onChange={(v) => setForm({ ...form, logo: v })}
            altPlaceholder="Karakoram Disability Forum logo"
          />
          <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", marginTop: 6 }}>
            Shown in the website header and used as the browser-tab icon (favicon). A square PNG
            with a transparent background works best.
          </p>
        </div>
        <div className="admin-field-grid">
          <div className="admin-field">
            <label>Hero Photo</label>
            <ImageUploader
              value={form.heroImage}
              onChange={(v) => setForm({ ...form, heroImage: v })}
              altPlaceholder="Karakoram Disability Forum"
            />
          </div>
          <div className="admin-field">
            <label>Story Photo</label>
            <ImageUploader
              value={form.storyImage}
              onChange={(v) => setForm({ ...form, storyImage: v })}
              altPlaceholder="KDF's story"
            />
          </div>
        </div>
      </div>

      <div className="admin-panel" style={{ padding: "26px 30px", maxWidth: 640, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 22 }}>Donate — Bank Details</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--ink-soft)", marginBottom: 18 }}>
          Displayed as read-only text on the public Donate section — no payment is processed on
          this site.
        </p>
        <div className="admin-field-grid">
          <div className="admin-field">
            <label>Bank Name</label>
            <input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Account Title</label>
            <input value={form.accountTitle} onChange={(e) => setForm({ ...form, accountTitle: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Account Number</label>
            <input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>IBAN</label>
            <input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} />
          </div>
          <div className="admin-field admin-field-full">
            <label>Branch</label>
            <input value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="admin-panel" style={{ padding: "26px 30px", maxWidth: 640 }}>
        <h3 style={{ marginBottom: 22 }}>Social Links</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--ink-soft)", marginBottom: 18 }}>
          Leave a field blank to hide that icon in the footer.
        </p>
        <div className="admin-field-grid">
          <div className="admin-field">
            <label>Facebook URL</label>
            <input value={form.facebookUrl} onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Instagram URL</label>
            <input value={form.instagramUrl} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>WhatsApp Link (optional)</label>
            <input
              value={form.whatsappUrl}
              placeholder={`Defaults to wa.me/${form.whatsappNumber}`}
              onChange={(e) => setForm({ ...form, whatsappUrl: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label>LinkedIn URL</label>
            <input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {status && (
            <span className="mono" style={{ fontSize: "0.76rem", color: "var(--ink-soft)" }}>
              {status}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
