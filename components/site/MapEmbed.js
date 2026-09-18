export default function MapEmbed({ address, lat, lng }) {
  const hasCoords = typeof lat === "number" && typeof lng === "number";
  if (!address && !hasCoords) return null;

  // Exact coordinates pin the map precisely; otherwise fall back to a text
  // search on the address (still works, just less precise).
  const src = hasCoords
    ? `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="map-embed">
      <iframe
        src={src}
        title={`Map location — ${address || `${lat}, ${lng}`}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
