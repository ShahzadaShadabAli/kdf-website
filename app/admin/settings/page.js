"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher, apiSend } from "@/lib/swrFetcher";
import ImageUploader from "@/components/admin/ImageUploader";
import { ASPECT } from "@/lib/imageAspects";
import { EMPTY_BANK_ACCOUNT, bankAccountsOf, isFilledIn } from "@/lib/bankAccounts";

const FIELDS = [
  "heroHeadline",
  "heroSubtext",
  "whatsappNumber",
  "contactEmail",
  "address",
  "facebookUrl",
  "instagramUrl",
  "whatsappUrl",
  "linkedinUrl",
  "tiktokUrl",
];

const BANK_FIELDS = [
  ["bankName", "Bank Name"],
  ["accountTitle", "Account Title"],
  ["accountNumber", "Account Number"],
  ["iban", "IBAN"],
  ["branchName", "Branch"],
];

const withAccounts = (settings) => ({ ...settings, bankAccounts: bankAccountsOf(settings) });

export default function SettingsAdminPage() {
  // No background refetching: closing the file picker counts as a window
  // focus, and a refetch there would overwrite a just-uploaded, unsaved image.
  const { data, mutate, isLoading } = useSWR("/api/settings", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (data?.settings && !form) setForm(withAccounts(data.settings));
  }, [data, form]);

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
      payload.bankAccounts = form.bankAccounts.filter(isFilledIn);
      // Accounts now live in bankAccounts; clear the older single-account fields.
      BANK_FIELDS.forEach(([f]) => (payload[f] = ""));
      const res = await apiSend("/api/settings", "PATCH", payload);
      setForm(withAccounts(res.settings));
      await mutate({ settings: res.settings }, { revalidate: false });
      setStatus("Settings saved — the website is updated.");
    } catch (e) {
      setStatus(e.message);
    } finally {
      setSaving(false);
    }
  }

  function updateAccount(i, field, value) {
    setForm({ ...form, bankAccounts: form.bankAccounts.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)) });
  }

  if (isLoading || !form) return <p>Loading…</p>;

  return (
    <>
      <div className="admin-panel settings-panel">
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

      <div className="admin-panel settings-panel">
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
              aspect={ASPECT.hero}
              onChange={(v) => setForm({ ...form, heroImage: v })}
              altPlaceholder="Karakoram Disability Forum"
            />
          </div>
          <div className="admin-field">
            <label>Story Photo</label>
            <ImageUploader
              value={form.storyImage}
              aspect={ASPECT.story}
              onChange={(v) => setForm({ ...form, storyImage: v })}
              altPlaceholder="KDF's story"
            />
          </div>
        </div>
      </div>

      <div className="admin-panel settings-panel">
        <h3 style={{ marginBottom: 22 }}>Donate — Bank Accounts</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--ink-soft)", marginBottom: 18 }}>
          Visitors choose between these on the Donate section and copy the details. Nothing is
          paid on this site. An account shows once it has an account number or IBAN.
        </p>
        {form.bankAccounts.map((account, i) => (
          <div className="bank-account-card" key={i}>
            <div className="bank-account-head">
              <strong>{account.bankName || `Account ${i + 1}`}</strong>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={() => setForm({ ...form, bankAccounts: form.bankAccounts.filter((_, idx) => idx !== i) })}
              >
                Remove
              </button>
            </div>
            <div className="admin-field-grid">
              {BANK_FIELDS.map(([field, label]) => (
                <div className={`admin-field${field === "branchName" ? " admin-field-full" : ""}`} key={field}>
                  <label>{label}</label>
                  <input value={account[field] || ""} onChange={(e) => updateAccount(i, field, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        ))}
        {form.bankAccounts.length < 10 && (
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => setForm({ ...form, bankAccounts: [...form.bankAccounts, { ...EMPTY_BANK_ACCOUNT }] })}
          >
            + Add {form.bankAccounts.length ? "another" : "a"} bank account
          </button>
        )}
      </div>

      <div className="admin-panel settings-panel">
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
          <div className="admin-field">
            <label>TikTok URL</label>
            <input
              value={form.tiktokUrl || ""}
              placeholder="https://www.tiktok.com/@..."
              onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Stays on screen while scrolling, so saving never needs a long scroll on a phone. */}
      <div className="settings-savebar">
        <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {status && <span className="settings-status">{status}</span>}
      </div>
    </>
  );
}
