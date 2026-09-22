"use client";
import { useState } from "react";
import { bankAccountsOf } from "@/lib/bankAccounts";

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
  const accounts = bankAccountsOf(settings).filter((a) => a.accountNumber || a.iban);
  const [selected, setSelected] = useState(0);
  const account = accounts[Math.min(selected, accounts.length - 1)];

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
        </div>

        <div className="donate-grid">
          {account ? (
            <div className="donate-card">
              {accounts.length > 1 && (
                <div className="donate-tabs" role="tablist" aria-label="Choose a bank account">
                  {accounts.map((a, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={a === account}
                      className={`donate-tab${a === account ? " active" : ""}`}
                      onClick={() => setSelected(i)}
                    >
                      {a.bankName || `Account ${i + 1}`}
                    </button>
                  ))}
                </div>
              )}
              <div role={accounts.length > 1 ? "tabpanel" : undefined}>
                <CopyableRow label="Bank" value={account.bankName} />
                <CopyableRow label="Account Title" value={account.accountTitle} />
                <CopyableRow label="Account Number" value={account.accountNumber} />
                <CopyableRow label="IBAN" value={account.iban} />
                <CopyableRow label="Branch" value={account.branchName} />
              </div>
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
