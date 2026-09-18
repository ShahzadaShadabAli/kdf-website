import Image from "next/image";
import Reveal from "@/components/shared/Reveal";
import { ScenePattern, SCENE_KEYS } from "@/components/shared/PlaceholderArt";

const AVATAR_COLORS = ["var(--clay-soft)", "var(--teal-soft)", "var(--gold-soft)"];

function sceneFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return SCENE_KEYS[hash % SCENE_KEYS.length];
}

export default function VoicesStrip({ voices }) {
  if (!voices?.length) return null;

  return (
    <section className="section on-night" id="voices">
      <div className="wrap">
        <div className="kicker">
          <span className="num mono">03 — VOICES &amp; WORK</span>
          <span className="rule"></span>
        </div>
        <div className="section-head">
          <span className="section-eyebrow">From the Resource Center</span>
          <h2>Told in their own words, made by their own hands.</h2>
          <p>
            A photo essay is next on the list — real portraits, real workshops. Until then,
            here&apos;s the shape of it: craft and voice, side by side.
          </p>
        </div>

        <div className="strip">
          {voices.map((v, i) => {
            const reversed = i % 2 === 1;
            const vignette = (
              <Reveal className="strip-vignette" key={`${v._id}-vignette`}>
                {v.image?.url ? (
                  <Image src={v.image.url} alt={v.image.alt || v.vignetteTitle} width={300} height={140} />
                ) : (
                  <ScenePattern scene={sceneFor(v._id)} h={140} />
                )}
                <span className="cap">
                  <strong>{v.vignetteTitle}</strong>
                  {v.vignetteCaption}
                </span>
              </Reveal>
            );
            const quote = (
              <Reveal className="strip-quote" key={`${v._id}-quote`}>
                <p>&quot;{v.quote}&quot;</p>
                <div className="who">
                  <svg className="avatar" viewBox="0 0 34 34">
                    <circle cx="17" cy="17" r="17" fill={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
                  </svg>{" "}
                  {v.personName}, {v.personRole}
                </div>
              </Reveal>
            );
            return (
              <div className={`strip-row${reversed ? " reverse" : ""}`} key={v._id}>
                {reversed ? [quote, vignette] : [vignette, quote]}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
