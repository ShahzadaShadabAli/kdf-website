"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import Reveal from "@/components/shared/Reveal";
import Lightbox from "@/components/shared/Lightbox";
import { ScenePattern, SCENE_KEYS } from "@/components/shared/PlaceholderArt";
import { albumCoverPhoto, albumDateLabel, albumMedia, albumSummary, albumVideos } from "@/lib/gallery";
import { youtubeThumb } from "@/lib/youtube";

function sceneFor(id) {
  // Deterministic placeholder scene per album until real photos are uploaded.
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return SCENE_KEYS[hash % SCENE_KEYS.length];
}

function PlayBadge() {
  return (
    <span className="galbum-play" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

// The cover is the album's primary photo; a video-only album falls back to its
// first video's YouTube thumbnail, and an empty album to the placeholder art.
function AlbumCover({ album }) {
  const photo = albumCoverPhoto(album);
  if (photo) {
    return (
      <Image
        src={photo.url}
        alt={photo.alt || album.title}
        width={600}
        height={450}
        sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 400px"
      />
    );
  }
  const video = albumVideos(album)[0];
  if (video) {
    return (
      <>
        {/* YouTube thumbnails aren't served from our own domain — plain img
            keeps them out of next/image's optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={youtubeThumb(video.youtubeId)} alt={video.title || album.title} loading="lazy" />
        <PlayBadge />
      </>
    );
  }
  return <ScenePattern scene={sceneFor(album._id)} h={230} />;
}

export default function GalleryGrid({ initialItems, initialCursor, categories, variant = "full" }) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  // Which album is open in the viewer, and where in that album we are.
  const [open, setOpen] = useState(null);

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

  const album = open ? items.find((g) => g._id === open.albumId) : null;
  const media = album ? albumMedia(album) : [];
  const viewerItems = album
    ? media.length
      ? media.map((m) => ({
          title: album.title,
          sub:
            m.type === "video"
              ? m.title || "Video"
              : m.image.alt || album.caption || "",
          image: m.type === "image" ? m.image : null,
          youtubeId: m.type === "video" ? m.youtubeId : null,
        }))
      : [
          {
            title: album.title,
            sub: album.caption,
            image: null,
            art: <ScenePattern scene={sceneFor(album._id)} h={230} />,
          },
        ]
    : [];

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
        {items.map((g) => {
          const summary = albumSummary(g);
          const dateLabel = albumDateLabel(g);
          const total = albumMedia(g).length;
          return (
            <Reveal
              as="div"
              className="gtile"
              key={g._id}
              tabIndex={0}
              role="button"
              aria-label={`Open the ${g.title} album`}
              onClick={() => setOpen({ albumId: g._id, index: 0 })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen({ albumId: g._id, index: 0 });
                }
              }}
            >
              <div className="gtile-cover">
                <AlbumCover album={g} />
                {total > 1 && (
                  <span className="galbum-chip mono">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <rect x="8" y="3" width="13" height="13" rx="2" />
                      <path d="M16 19.5A1.5 1.5 0 0114.5 21H4.5A1.5 1.5 0 013 19.5V8" />
                    </svg>
                    {total}
                  </span>
                )}
              </div>
              <div className="galbum-bar">
                <strong>{g.title}</strong>
                {(dateLabel || summary) && (
                  <span className="galbum-meta mono">{[dateLabel, summary].filter(Boolean).join(" · ")}</span>
                )}
                {g.caption && <span className="galbum-caption">{g.caption}</span>}
              </div>
            </Reveal>
          );
        })}
      </div>

      {variant === "full" ? (
        <div className="load-more-wrap">
          <span className="load-more-hint mono">
            {cursor ? "More albums to load" : "You've reached the end of the gallery"}
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

      {album && viewerItems.length > 0 && (
        <Lightbox
          items={viewerItems}
          index={Math.min(open.index, viewerItems.length - 1)}
          onClose={() => setOpen(null)}
          onStep={(dir) =>
            setOpen((o) => ({
              ...o,
              index: (o.index + dir + viewerItems.length) % viewerItems.length,
            }))
          }
        />
      )}
    </>
  );
}
