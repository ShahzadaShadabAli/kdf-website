"use client";
import { useEffect, useState } from "react";
import { GENDERS, GUARDIAN_RELATIONS, PROVINCES } from "@/lib/validation/membership";

const OPTIONS = [
  {
    type: "honorary",
    title: "Honorary Member",
    body: "For persons without disabilities who meet KDF's membership eligibility and want to support the Forum's work formally, without a day-to-day operational role.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l3 6 6 .9-4.5 4.3 1 6.3L12 16.5 6.5 19.5l1-6.3L3 8.9 9 8z" />
      </svg>
    ),
  },
  {
    type: "permanent",
    title: "Regular Member",
    body: "For persons with disabilities, aged 18 or above, who are permanent residents of Gilgit-Baltistan — full members with a voice in general body meetings and decisions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      </svg>
    ),
  },
];

const EMPTY_FORM = {
  fullName: "",
  guardianRelation: GUARDIAN_RELATIONS[0],
  guardianName: "",
  gender: GENDERS[0],
  email: "",
  phone: "",
  cnic: "",
  profession: "",
  homeAddress: "",
  province: PROVINCES[0],
  district: "",
  city: "",
  disability: "",
  message: "",
  companyWebsite: "",
};

export default function BecomeMemberSection() {
  const [selected, setSelected] = useState(null); // 'honorary' | 'permanent' | null
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'
  const [error, setError] = useState("");

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  // Gender picks a sensible default for S/O vs D/O (Male -> S/O, Female ->
  // D/O) — still just a default, the admin/applicant can change it after.
  function onGenderChange(e) {
    const gender = e.target.value;
    setForm((f) => ({
      ...f,
      gender,
      guardianRelation: gender === "Female" ? "D/O" : gender === "Male" ? "S/O" : f.guardianRelation,
    }));
  }

  function choose(type) {
    setSelected(type);
    setStatus(null);
    setError("");
    setForm(
      type === "permanent"
        ? { ...EMPTY_FORM, province: "Gilgit-Baltistan" }
        : { ...EMPTY_FORM, disability: "" }
    );
  }

  function close() {
    setSelected(null);
  }

  useEffect(() => {
    if (!selected) return;
    document.body.style.overflow = "hidden";
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, membershipType: selected }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const fieldError = Object.values(data.error?.fieldErrors || {})[0]?.[0];
        throw new Error(
          data.error?.formErrors?.[0] || fieldError || data.error || "Something went wrong"
        );
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <section className="section on-paper" id="become-a-member">
      <div className="wrap">
        <div className="kicker">
          <span className="num mono">09 — JOIN THE FORUM</span>
          <span className="rule"></span>
        </div>
        <div className="section-head">
          <span className="section-eyebrow">Become a Member</span>
          <h2>Two ways to join.</h2>
          <p>Pick the membership that fits, and send us a few details — we&apos;ll follow up directly.</p>
        </div>

        <div className="member-grid">
          {OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              className="member-card"
              onClick={() => choose(opt.type)}
            >
              <span className="member-icon">{opt.icon}</span>
              <h3>{opt.title}</h3>
              <p>{opt.body}</p>
              <span className="member-cta">Choose this →</span>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="member-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="member-modal" role="dialog" aria-modal="true" aria-labelledby="member-modal-title">
            <button className="member-modal-close" onClick={close} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {status === "success" ? (
              <div className="member-modal-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <h3>Application sent</h3>
                <p>Thanks — we&apos;ll be in touch about next steps.</p>
                <button className="btn btn-primary" type="button" onClick={close}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 id="member-modal-title">
                  Apply as {selected === "honorary" ? "an Honorary" : "a Regular"} Member
                </h3>
                <form onSubmit={onSubmit} noValidate>
                  <div className="hp-field" aria-hidden="true">
                    <label htmlFor="member-companyWebsite">Company Website</label>
                    <input
                      id="member-companyWebsite"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.companyWebsite}
                      onChange={set("companyWebsite")}
                    />
                  </div>

                  <div className="form-field-grid">
                    <div className="form-field">
                      <label htmlFor="member-fullName">Full Name</label>
                      <input id="member-fullName" type="text" required value={form.fullName} onChange={set("fullName")} />
                    </div>
                    <div className="form-field">
                      <label htmlFor="member-gender">Gender</label>
                      <select id="member-gender" value={form.gender} onChange={onGenderChange}>
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-field-grid">
                    <div className="form-field">
                      <label htmlFor="member-guardianRelation">S/O or D/O</label>
                      <select id="member-guardianRelation" value={form.guardianRelation} onChange={set("guardianRelation")}>
                        {GUARDIAN_RELATIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="member-guardianName">Father&apos;s Name</label>
                      <input
                        id="member-guardianName"
                        type="text"
                        required
                        value={form.guardianName}
                        onChange={set("guardianName")}
                      />
                    </div>
                  </div>

                  <div className="form-field-grid">
                    <div className="form-field">
                      <label htmlFor="member-phone">Phone</label>
                      <input id="member-phone" type="tel" required value={form.phone} onChange={set("phone")} />
                    </div>
                    <div className="form-field">
                      <label htmlFor="member-email">Email</label>
                      <input id="member-email" type="email" required value={form.email} onChange={set("email")} />
                    </div>
                  </div>

                  <div className="form-field-grid">
                    <div className="form-field">
                      <label htmlFor="member-cnic">CNIC</label>
                      <input
                        id="member-cnic"
                        type="text"
                        required
                        placeholder="12345-1234567-1"
                        value={form.cnic}
                        onChange={set("cnic")}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="member-profession">Profession (optional)</label>
                      <input id="member-profession" type="text" value={form.profession} onChange={set("profession")} />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="member-homeAddress">Home Address</label>
                    <input id="member-homeAddress" type="text" required value={form.homeAddress} onChange={set("homeAddress")} />
                  </div>

                  <div className="form-field-grid">
                    <div className="form-field">
                      <label htmlFor="member-province">Province</label>
                      {selected === "permanent" ? (
                        <input id="member-province" type="text" value="Gilgit-Baltistan" disabled readOnly />
                      ) : (
                        <select id="member-province" value={form.province} onChange={set("province")}>
                          {PROVINCES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      )}
                      {selected === "permanent" && (
                        <p className="form-hint">
                          Regular membership is open only to permanent residents of Gilgit-Baltistan.
                        </p>
                      )}
                    </div>
                    <div className="form-field">
                      <label htmlFor="member-district">District</label>
                      <input id="member-district" type="text" required value={form.district} onChange={set("district")} />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="member-city">City</label>
                    <input id="member-city" type="text" required value={form.city} onChange={set("city")} />
                  </div>

                  {selected === "permanent" && (
                    <div className="form-field">
                      <label htmlFor="member-disability">Disability / Impairment Type</label>
                      <input
                        id="member-disability"
                        type="text"
                        required
                        value={form.disability}
                        onChange={set("disability")}
                      />
                    </div>
                  )}

                  <div className="form-field">
                    <label htmlFor="member-message">Message (optional)</label>
                    <textarea id="member-message" rows={3} value={form.message} onChange={set("message")} />
                  </div>

                  <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
                    <span className="label">{status === "sending" ? "Sending…" : "Submit Application"}</span>
                    <span className="arrow">→</span>
                  </button>
                  {status === "error" && (
                    <p className="form-status error" role="alert">
                      {error}
                    </p>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
