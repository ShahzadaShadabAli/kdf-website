import Image from "next/image";

export default function PartnersSection({ partners }) {
  if (!partners?.length) return null;

  return (
    <section className="section on-paper" id="partners">
      <div className="wrap">
        <div className="kicker">
          <span className="num mono">09 — SUPPORTED BY</span>
          <span className="rule"></span>
        </div>
        <div className="section-head center">
          <span className="section-eyebrow">Partners &amp; Funders</span>
          <h2>Organisations that back this work.</h2>
        </div>
        <div className="partners-strip">
          {partners.map((p) =>
            p.logo?.url ? (
              <a
                key={p._id}
                className="partner-logo"
                href={p.websiteUrl || undefined}
                target={p.websiteUrl ? "_blank" : undefined}
                rel={p.websiteUrl ? "noopener" : undefined}
                aria-label={p.name}
              >
                <Image src={p.logo.url} alt={p.logo.alt || p.name} width={160} height={72} />
              </a>
            ) : (
              <span key={p._id} className="partner-logo-fallback">
                {p.name}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
