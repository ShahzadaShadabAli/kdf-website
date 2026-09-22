"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import Reveal from "@/components/shared/Reveal";
import Lightbox from "@/components/shared/Lightbox";
import { ScenePattern, SCENE_KEYS } from "@/components/shared/PlaceholderArt";

function sceneFor(id) {
  // Deterministic placeholder scene per item until a real photo is uploaded.
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return SCENE_KEYS[hash % SCENE_KEYS.length];
}

export default function GalleryGrid({ initialItems, initialCursor, categories, variant = "full" }) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const loadPage = useCallback(async (cat, reset) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "6" });
    if (cat && cat !== "all") params.set("category", cat);
    if (!reset && cursor) params.set("cursor", cursor);
    const res = await fetch(`/api/gallery?${params.toString()}`);
    const data = await res.json();
    setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
    setCursor(data.nextCursor);
    setLoading(false);
  }, [cursor]);

  function onFilter(cat) {
    setCategory(cat);
    loadPage(cat, true);
  }

  const lightboxItems = items.map((g) => ({
    title: g.title,
    sub: g.caption,
    image: g.image,
    art: <ScenePattern scene={sceneFor(g._id)} h={230} />,
  }));

  return (
    <>
      {variant === "full" && (
        <div className="gallery-toolbar">
          <div className="gallery-tabs" role="tablist" aria-label="Filter gallery by category">
            <button className={`gallery-tab${category === "all" ? " active" : ""}`} onClick={() => onFilter("all")}>
              All
            </button>
            {categories.map((c) => (
              <button key={c} className={`gallery-tab${category === c ? " active" : ""}`} onClick={() => onFilter(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="gallery-grid">
        {items.map((g, i) => (
          <Reveal as="div" className="gtile" key={g._id} tabIndex={0} role="button" aria-label={`View ${g.title} fullscreen`}
            onClick={() => setLightboxIndex(i)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLightboxIndex(i); } }}
          >
            {g.image?.url ? (
              <Image
                src={g.image.url}
                alt={g.image.alt}
                width={600}
                height={450}
                sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 400px"
              />
            ) : (
              <ScenePattern scene={sceneFor(g._id)} h={230} />
            )}
            <div className="gcap">
              <strong>{g.title}</strong>
              <span>{g.caption}</span>
            </div>
          </Reveal>
        ))}
      </div>

      {variant === "full" ? (
        <div className="load-more-wrap">
          <span className="load-more-hint mono">
            {cursor ? "More photos to load" : "You've reached the end of the gallery"}
          </span>
          {cursor && (
            <button
              className={`btn btn-primary${loading ? " loading" : ""}`}
              onClick={() => loadPage(category, false)}
            >
              <span className="label">Load More</span>
              <span className="spinner"></span>
              <span className="arrow">→</span>
            </button>
          )}
        </div>
      ) : (
        <div className="load-more-wrap">
          <a className="btn btn-ghost" href="/gallery">
            View Full Gallery <span className="arrow">→</span>
          </a>
        </div>
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
