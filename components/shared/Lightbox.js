"use client";
import { useEffect } from "react";
import Image from "next/image";

export default function Lightbox({ items, index, onClose, onStep }) {
  const item = items[index];

  useEffect(() => {
    if (!item) return;
    document.body.style.overflow = "hidden";
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [item, onClose, onStep]);

  if (!item) return null;

  return (
    <div
      className="lightbox open"
      aria-hidden="false"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button className="lightbox-close" aria-label="Close image view" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>
      <button className="lightbox-nav prev" aria-label="Previous image" onClick={() => onStep(-1)}>
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M15 6 L9 12 L15 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="lightbox-stage">
        <div className="lightbox-art">
          {item.image?.url ? (
            <Image
              src={item.image.url}
              alt={item.image.alt || item.title}
              width={item.image.width || 800}
              height={item.image.height || 600}
            />
          ) : (
            item.art
          )}
        </div>
        <div className="lightbox-cap">
          <strong>{item.title}</strong>
          <span>{item.sub}</span>
          <span className="lightbox-count mono">
            {index + 1} / {items.length}
          </span>
        </div>
      </div>
      <button className="lightbox-nav next" aria-label="Next image" onClick={() => onStep(1)}>
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M9 6 L15 12 L9 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
