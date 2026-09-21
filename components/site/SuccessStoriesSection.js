"use client";
import { useState } from "react";
import { extractYouTubeId } from "@/lib/validation/successStory";

function VideoCard({ story }) {
  const [playing, setPlaying] = useState(false);
  const videoId = extractYouTubeId(story.youtubeUrl);
  if (!videoId) return null;

  return (
    <div className="story-card">
      {playing ? (
        <div className="story-card-frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
            title={story.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          type="button"
          className="story-card-thumb"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${story.title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" loading="lazy" />
          <span className="story-card-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
      <div className="story-card-body">
        <h3>{story.title}</h3>
        {story.caption && <p>{story.caption}</p>}
      </div>
    </div>
  );
}

export default function SuccessStoriesSection({ stories }) {
  if (!stories?.length) return null;

  return (
    <section className="section on-paper" id="success-stories">
      <div className="wrap">
        <div className="kicker">
          <span className="num mono">04 — IN THEIR OWN VOICE</span>
          <span className="rule"></span>
        </div>
        <div className="section-head">
          <span className="section-eyebrow">Success Stories</span>
          <h2>Watch what the work looks like.</h2>
          <p>Short videos from members and the Resource Center — played straight from YouTube.</p>
        </div>
        <div className="story-card-grid">
          {stories.map((story) => (
            <VideoCard key={story._id} story={story} />
          ))}
        </div>
      </div>
    </section>
  );
}
