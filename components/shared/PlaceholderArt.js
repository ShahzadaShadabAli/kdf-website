// Illustrated placeholder SVGs — 1:1 replaceable with real photography.
// A product/gallery/leader doc that already has an uploaded image just
// renders that image instead (see call sites); this only fires when none
// has been uploaded yet.

const PALETTES = [
  ["var(--teal)", "var(--teal-soft)"],
  ["var(--clay)", "var(--clay-soft)"],
  ["var(--gold)", "var(--gold-soft)"],
];

export function SwatchPattern({ kind = 0, className }) {
  const [c1, c2] = PALETTES[kind % 3];
  if (kind % 3 === 0) {
    return (
      <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
        <rect width="200" height="200" fill="var(--paper)" />
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={i}
            x1={i * 22 - 20}
            y1="0"
            x2={i * 22 + 40}
            y2="200"
            stroke={i % 2 ? c1 : c2}
            strokeWidth="6"
            opacity="0.6"
          />
        ))}
      </svg>
    );
  }
  if (kind % 3 === 1) {
    const rings = [];
    for (let r = 90; r > 0; r -= 14) rings.push(r);
    return (
      <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
        <rect width="200" height="200" fill="var(--paper)" />
        {rings.map((r, i) => (
          <circle key={i} cx="100" cy="100" r={r} fill="none" stroke={r % 28 < 14 ? c1 : c2} strokeWidth="6" opacity="0.55" />
        ))}
      </svg>
    );
  }
  const stitches = [];
  for (let x = 10; x < 190; x += 26) {
    for (let y = 10; y < 190; y += 26) stitches.push([x, y]);
  }
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <rect width="200" height="200" fill="var(--paper)" />
      {stitches.map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y} L${x + 16} ${y + 16} M${x + 16} ${y} L${x} ${y + 16}`}
          stroke={(x + y) % 52 === 0 ? c1 : c2}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}
    </svg>
  );
}

const SCENES = {
  loom: (h) => (
    <svg viewBox={`0 0 300 ${h}`} aria-hidden="true">
      <rect width="300" height={h} fill="var(--card)" />
      <line x1="40" y1="20" x2="40" y2={h - 20} stroke="var(--teal)" strokeWidth="2" />
      <line x1="260" y1="20" x2="260" y2={h - 20} stroke="var(--teal)" strokeWidth="2" />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={70 + i * 22} y1="18" x2={70 + i * 22} y2={h - 18} stroke="var(--gold-soft)" strokeWidth="1.4" opacity="0.8" />
      ))}
      <path d={`M40 ${h * 0.35} H260 M40 ${h * 0.55} H260 M40 ${h * 0.75} H260`} stroke="var(--clay-soft)" strokeWidth="5" opacity="0.75" />
    </svg>
  ),
  carving: (h) => (
    <svg viewBox={`0 0 300 ${h}`} aria-hidden="true">
      <rect width="300" height={h} fill="var(--card)" />
      {Array.from({ length: 6 }).map((_, i) => (
        <circle key={i} cx="150" cy={h / 2} r={16 + i * 16} fill="none" stroke={i % 2 ? "var(--clay-soft)" : "var(--gold)"} strokeWidth="4" opacity="0.55" />
      ))}
      <path d={`M110 ${h / 2 - 8} l16 16 l40-40`} stroke="var(--teal)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  stitch: (h) => {
    const rows = Math.floor(h / 26);
    const items = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 10; c++) items.push([r, c]);
    }
    return (
      <svg viewBox={`0 0 300 ${h}`} aria-hidden="true">
        <rect width="300" height={h} fill="var(--card)" />
        {items.map(([r, c], i) => (
          <path
            key={i}
            d={`M${20 + c * 26} ${20 + r * 26} l16 16 M${36 + c * 26} ${20 + r * 26} l-16 16`}
            stroke={(r + c) % 2 ? "var(--teal)" : "var(--gold)"}
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.7"
          />
        ))}
      </svg>
    );
  },
  ridge: (h) => (
    <svg viewBox={`0 0 300 ${h}`} aria-hidden="true">
      <rect width="300" height={h} fill="var(--night2)" />
      <path
        d={`M0 ${h * 0.7} L60 ${h * 0.3} L100 ${h * 0.55} L150 ${h * 0.2} L200 ${h * 0.6} L250 ${h * 0.35} L300 ${h * 0.55} L300 ${h} L0 ${h} Z`}
        fill="var(--night3)"
      />
      <path
        d={`M0 ${h * 0.7} L60 ${h * 0.3} L100 ${h * 0.55} L150 ${h * 0.2} L200 ${h * 0.6} L250 ${h * 0.35} L300 ${h * 0.55}`}
        fill="none"
        stroke="var(--gold-soft)"
        strokeWidth="1.4"
        strokeDasharray="6 7"
        opacity="0.7"
      />
    </svg>
  ),
  hands: (h) => (
    <svg viewBox={`0 0 300 ${h}`} aria-hidden="true">
      <rect width="300" height={h} fill="var(--card)" />
      <path
        d={`M90 ${h * 0.75} C90 ${h * 0.35}, 130 ${h * 0.2}, 150 ${h * 0.2} S 210 ${h * 0.35}, 210 ${h * 0.75}`}
        fill="none"
        stroke="var(--teal)"
        strokeWidth="2.4"
      />
      <circle cx="150" cy={h * 0.3} r="18" fill="none" stroke="var(--clay)" strokeWidth="2" />
      <path d={`M150 ${h * 0.3} l0 -34`} stroke="var(--gold)" strokeWidth="2" strokeDasharray="3 5" />
    </svg>
  ),
  gather: (h) => (
    <svg viewBox={`0 0 300 ${h}`} aria-hidden="true">
      <rect width="300" height={h} fill="var(--card)" />
      {Array.from({ length: 5 }).map((_, i) => (
        <circle key={i} cx={50 + i * 48} cy={h * 0.55} r="16" fill="none" stroke={i % 2 ? "var(--clay-soft)" : "var(--teal)"} strokeWidth="2.6" />
      ))}
      <path d={`M20 ${h * 0.55} H280`} stroke="var(--gold-soft)" strokeWidth="1.4" strokeDasharray="4 6" opacity="0.7" />
    </svg>
  ),
};

export function ScenePattern({ scene = "loom", h = 230 }) {
  const draw = SCENES[scene] || SCENES.loom;
  return draw(h);
}

export const SCENE_KEYS = Object.keys(SCENES);
