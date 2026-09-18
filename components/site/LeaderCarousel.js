"use client";
import { useState } from "react";
import Image from "next/image";

const RINGS = ["var(--teal-soft)", "var(--purple-soft)", "var(--gold-soft)"];

export default function LeaderCarousel({ leaders }) {
  const [index, setIndex] = useState(0);
  const [switching, setSwitching] = useState(false);

  if (!leaders?.length) return null;

  function go(newIndex) {
    setSwitching(true);
    setTimeout(() => {
      setIndex(newIndex);
      setSwitching(false);
    }, 260);
  }

  const l = leaders[index];
  const ring = RINGS[index % RINGS.length];

  return (
    <div className="letter-carousel">
      <div className="letter-frame">
        <div className="letter-pin left" aria-hidden="true"></div>
        <div className="letter-pin right" aria-hidden="true"></div>
        <div className="letter-stamp mono">
          <span>
            No. {String(index + 1).padStart(3, "0")} — Skardu, GB
          </span>
          <span>KDF · Est. 2011</span>
        </div>
        <div className={`letter-grid${switching ? " switching" : ""}`}>
          <div className="letter-portrait">
            {l.photo?.url ? (
              <Image src={l.photo.url} alt={l.photo.alt || l.name} width={120} height={120} />
            ) : (
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="58" fill="var(--night2)" />
                <circle cx="60" cy="60" r="58" fill="none" stroke="var(--gold-soft)" strokeWidth="1" strokeDasharray="2 5" opacity="0.7" />
                <circle cx="60" cy="48" r="20" fill="none" stroke={ring} strokeWidth="2.4" />
                <path d="M28 100 C28 76, 42 66, 60 66 S 92 76, 92 100" fill="none" stroke={ring} strokeWidth="2.4" />
              </svg>
            )}
            <div className="letter-who">
              <strong>{l.name}</strong>
              <span>{l.title}</span>
            </div>
          </div>
          <div className="letter-body">
            <p className="letter-quote">&quot;{l.quote}&quot;</p>
            <p className="letter-sub">{l.bio}</p>
          </div>
        </div>
      </div>

      <div className="letter-controls">
        <button className="letter-nav prev" aria-label="Previous leader" onClick={() => go((index - 1 + leaders.length) % leaders.length)}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M15 6 L9 12 L15 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="letter-dots" role="tablist" aria-label="Choose a leader">
          {leaders.map((leader, i) => (
            <button
              key={leader._id}
              className={`letter-dot${i === index ? " active" : ""}`}
              role="tab"
              aria-label={`Show note from ${leader.name}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button className="letter-nav next" aria-label="Next leader" onClick={() => go((index + 1) % leaders.length)}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M9 6 L15 12 L9 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
