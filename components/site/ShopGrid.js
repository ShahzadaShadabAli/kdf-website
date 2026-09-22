"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import Reveal from "@/components/shared/Reveal";
import Lightbox from "@/components/shared/Lightbox";
import { SwatchPattern } from "@/components/shared/PlaceholderArt";

function money(minor, currency) {
  const major = (minor / 100).toLocaleString();
  return `${currency} ${major}`;
}

function patternKind(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % 3;
}

export default function ShopGrid({ initialItems, initialCursor, crafts, whatsappNumber, variant = "full" }) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [craft, setCraft] = useState("all");
  const [loading, setLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const loadPage = useCallback(
    async (c, reset) => {
      setLoading(true);
      const params = new URLSearchParams({ limit: "8" });
      if (c && c !== "all") params.set("craft", c);
      if (!reset && cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
      setCursor(data.nextCursor);
      setLoading(false);
    },
    [cursor]
  );

  function onFilter(c) {
    setCraft(c);
    loadPage(c, true);
  }

  const primaryImage = (p) => p.images?.find((im) => im.isPrimary) || p.images?.[0];

  const lightboxItems = items.map((p) => ({
    title: p.name,
    sub: `${p.makerName} · ${money(p.priceMinor, p.currency)}`,
    image: primaryImage(p),
    art: <SwatchPattern kind={patternKind(p._id)} />,
  }));

  const Card = ({ p, i }) => {
    const img = primaryImage(p);
    const msg = encodeURIComponent(`Hi! I'm interested in the ${p.name} (${money(p.priceMinor, p.currency)}) from the Karakoram Disability Forum shop.`);
    return (
      <Reveal as="div" className="swatch" tabIndex={0}>
        <div className="swatch-punch"></div>
        <div className="swatch-art" onClick={() => setLightboxIndex(i)} style={{ cursor: "pointer" }}>
          {img?.url ? (
            <Image src={img.url} alt={img.alt} width={400} height={328} sizes="(max-width: 560px) 90vw, 320px" />
          ) : (
            <SwatchPattern kind={patternKind(p._id)} />
          )}
        </div>
        <div className="swatch-body">
          <span className="swatch-tag">{p.craft}</span>
          <h3>{p.name}</h3>
          <div className="maker">{p.makerName}{p.makerRole ? ` · ${p.makerRole}` : ""}</div>
          <div className="swatch-foot">
            <span className="price">{money(p.priceMinor, p.currency)}</span>
            <a
              className="buy-btn"
              href={`https://wa.me/${whatsappNumber}?text=${msg}`}
              target="_blank"
              rel="noopener"
              aria-label={`Buy ${p.name} via WhatsApp`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.2c-.24.68-1.38 1.3-1.9 1.35-.5.05-1.03.24-3.45-.72-2.9-1.16-4.77-4.1-4.92-4.3-.15-.2-1.17-1.56-1.17-2.98s.75-2.1 1.02-2.38c.26-.28.57-.35.76-.35h.55c.18 0 .43-.07.66.5.24.58.8 2 .87 2.14.07.15.12.32.02.5-.1.2-.15.32-.3.5-.15.17-.3.38-.44.5-.15.15-.3.3-.13.6.17.3.75 1.24 1.6 2 1.1.98 2.02 1.28 2.32 1.43.3.15.48.13.66-.08.18-.2.75-.87.96-1.17.2-.3.4-.25.68-.15.28.1 1.78.84 2.08.99.3.15.5.22.58.35.07.13.07.75-.17 1.43z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </Reveal>
    );
  };

  return (
    <>
      <div className="shop-tabs" role="tablist" aria-label="Filter shop by craft">
        <button className={`shop-tab${craft === "all" ? " active" : ""}`} onClick={() => onFilter("all")}>
          All Work
        </button>
        {crafts.map((c) => (
          <button key={c} className={`shop-tab${craft === c ? " active" : ""}`} onClick={() => onFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      {variant === "home" ? (
        <>
          <p className="rack-hint">← scroll the rack →</p>
          <div className="shop-rack">
            {items.map((p, i) => (
              <Card p={p} i={i} key={p._id} />
            ))}
          </div>
          <div className="load-more-wrap">
            <a className="btn btn-ghost" href="/shop">
              Visit the Full Shop <span className="arrow">→</span>
            </a>
          </div>
        </>
      ) : (
        <>
          <div className="shop-grid">
            {items.map((p, i) => (
              <Card p={p} i={i} key={p._id} />
            ))}
          </div>
          <div className="load-more-wrap">
            <span className="load-more-hint mono">
              {cursor ? "More pieces to load" : "You've reached the end of the catalogue"}
            </span>
            {cursor && (
              <button
                className={`btn btn-primary${loading ? " loading" : ""}`}
                onClick={() => loadPage(craft, false)}
              >
                <span className="label">Load More</span>
                <span className="spinner"></span>
                <span className="arrow">→</span>
              </button>
            )}
          </div>
        </>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onStep={(dir) => setLightboxIndex((i) => (i + dir + lightboxItems.length) % lightboxItems.length)}
        />
      )}
    </>
  );
}
