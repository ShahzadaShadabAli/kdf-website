"use client";

function CopyableRow({ label, value }) {
  if (!value) return null;
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API can be unavailable (older browsers, insecure context) —
      // the value is still visible to select and copy manually.
    }
  }
  return (
    <div className="donate-row">
      <span className="label">{label}</span>
      <span className="value">
        {value}
        <button className="donate-copy-btn" onClick={copy} type="button" aria-label={`Copy ${label}`}>
          Copy
        </button>
      </span>
    </div>
  );
}

export default function DonateSection({ settings }) {
  const hasBankDetails = settings?.accountNumber || settings?.iban;

  return (
    <section className="section on-card" id="donate">
      <div className="wrap">
        <div className="kicker">
          <span className="num mono">08 — SUPPORT THE FORUM</span>
          <span className="rule"></span>
        </div>
        <div className="section-head">
          <span className="section-eyebrow">Donate</span>
          <h2>Fund the Resource Center directly.</h2>
          <p>
            Donations go straight to rehabilitation support, assistive devices, and the craft
            programme. Transfer directly using the bank details below — nothing is processed
            on this website.
          </p>
        </div>

        <div className="donate-grid">
          {hasBankDetails ? (
            <div className="donate-card">
              <CopyableRow label="Bank" value={settings.bankName} />
              <CopyableRow label="Account Title" value={settings.accountTitle} />
              <CopyableRow label="Account Number" value={settings.accountNumber} />
              <CopyableRow label="IBAN" value={settings.iban} />
              <CopyableRow label="Branch" value={settings.branchName} />
            </div>
          ) : (
            <div className="donate-card donate-empty">
              Bank details haven&apos;t been added yet — an admin can fill these in under
              Settings.
            </div>
          )}

          <div className="donate-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span>
              This site never handles card numbers or takes a payment itself — please transfer
              directly through your own bank or mobile app using the details above, and message
              us on WhatsApp if you&apos;d like a receipt confirmed.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
