import Image from "next/image";
import MagneticButton from "@/components/shared/MagneticButton";

export default function Hero({ settings }) {
  const headline = settings?.heroHeadline || "Every thread carries a name.";
  const subtext =
    settings?.heroSubtext ||
    "Karakoram Disability Forum is a persons-with-disabilities organisation working across Baltistan on rights, independent living, and economic empowerment — one union council, one loom, one member at a time.";

  const [before, em, after] = splitEmphasis(headline);

  return (
    <section className="hero">
      <div className="hero-inner">
        <span className="hero-eyebrow">
          <span className="dot"></span> Skardu · Gilgit-Baltistan · Est. 2011
        </span>
        <h1>
          {before}
          {em && <em>{em}</em>}
          {after}
        </h1>
        <p>{subtext}</p>
        <div className="hero-actions">
          <MagneticButton as="a" href="#story" className="btn btn-primary">
            Read the Story <span className="arrow">→</span>
          </MagneticButton>
          <MagneticButton as="a" href="/shop" className="btn btn-ghost">
            Visit the Shop <span className="arrow">→</span>
          </MagneticButton>
        </div>
      </div>
      <div className="ridge">
        {settings?.heroImage?.url ? (
          <Image
            src={settings.heroImage.url}
            alt={settings.heroImage.alt || "Karakoram Disability Forum"}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
          />
        ) : (
          <svg viewBox="0 0 1180 300" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0 260 L140 130 L230 190 L340 90 L460 210 L590 60 L720 220 L840 110 L960 195 L1080 100 L1180 160 L1180 300 L0 300 Z"
              fill="var(--night2)"
            />
            <path
              d="M0 280 L170 170 L280 220 L410 140 L540 240 L680 120 L800 240 L930 150 L1050 220 L1180 180 L1180 300 L0 300 Z"
              fill="var(--night3)"
              opacity="0.85"
            />
            <path
              d="M0 260 L140 130 L230 190 L340 90 L460 210 L590 60 L720 220 L840 110 L960 195 L1080 100 L1180 160"
              fill="none"
              stroke="var(--gold-soft)"
              strokeWidth="1.4"
              strokeDasharray="8 9"
              opacity="0.6"
            />
            <path d="M0 285 Q 300 240 590 260 T 1180 250" fill="none" stroke="var(--teal-soft)" strokeWidth="1.2" opacity="0.4" />
          </svg>
        )}
        <div className="ridge-tag">
          <b>Skardu</b>
          2,228m above sea level — the doorway to K2, and home to KDF.
        </div>
      </div>
    </section>
  );
}

function splitEmphasis(text) {
  // Wraps the last word in <em> to echo the prototype's "carries a name." styling.
  const words = text.trim().split(" ");
  if (words.length < 2) return [text, null, ""];
  const em = words.pop();
  return [words.join(" ") + " ", em, ""];
}
