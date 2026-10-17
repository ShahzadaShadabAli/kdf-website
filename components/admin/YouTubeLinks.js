"use client";
import { extractYouTubeId, youtubeThumb } from "@/lib/youtube";

// A small repeatable editor for YouTube links — used for the videos inside a
// gallery album. Nothing is uploaded: the video stays on YouTube and the site
// only stores its link.
export default function YouTubeLinks({ videos, onChange, max = 20 }) {
  function update(i, patch) {
    onChange(videos.map((video, idx) => (idx === i ? { ...video, ...patch } : video)));
  }

  function add() {
    onChange([...videos, { youtubeUrl: "", title: "" }]);
  }

  function remove(i) {
    onChange(videos.filter((_, idx) => idx !== i));
  }

  return (
    <div className="video-links">
      {videos.map((video, i) => {
        const url = (video.youtubeUrl || "").trim();
        const videoId = url ? extractYouTubeId(url) : null;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <div className="video-link-row" key={i}>
            <div className="video-link-thumb">
              {videoId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={youtubeThumb(videoId, "default")} alt="" />
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
            <div className="video-link-fields">
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={video.youtubeUrl || ""}
                onChange={(e) => update(i, { youtubeUrl: e.target.value })}
              />
              <input
                type="text"
                placeholder="Label (optional) — e.g. Chairman's speech"
                value={video.title || ""}
                onChange={(e) => update(i, { title: e.target.value })}
              />
              {url && !videoId && (
                <p className="admin-error">
                  That isn&apos;t a YouTube link. Copy the address from the video&apos;s Share button.
                </p>
              )}
            </div>
            <button type="button" className="admin-btn-danger" onClick={() => remove(i)}>
              Remove
            </button>
          </div>
        );
      })}

      {videos.length < max ? (
        <button type="button" className="admin-btn admin-btn-outline" onClick={add}>
          + Add YouTube link
        </button>
      ) : (
        <p className="admin-note">That&apos;s the maximum of {max} videos in one album.</p>
      )}
    </div>
  );
}
