export default function Seam({ tone = "paper" }) {
  return (
    <div className={`seam on-${tone}`} aria-hidden="true">
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <pattern id={`stitch-${tone}`} width="26" height="26" patternUnits="userSpaceOnUse">
            <path
              d="M0 13 H14"
              stroke="var(--gold)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.85"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#stitch-${tone})`} />
      </svg>
    </div>
  );
}
