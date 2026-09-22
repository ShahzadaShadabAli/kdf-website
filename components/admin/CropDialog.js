"use client";
import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";

// Full-screen crop step shown before a photo is uploaded. The frame's shape
// (aspect) matches the spot on the website where the photo will appear.
export default function CropDialog({ src, aspect, busy, onCancel, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && !busy) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div className="crop-overlay" role="dialog" aria-modal="true" aria-labelledby="crop-title">
      <div className="crop-dialog">
        <div className="crop-head">
          <h3 id="crop-title">Choose what to show</h3>
          <p>
            Drag the photo to move it and zoom with the slider (or pinch on a phone). Only what is
            inside the frame appears on the website.
          </p>
        </div>
        <div className="crop-stage">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            maxZoom={4}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
          />
        </div>
        <label className="crop-zoom">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
          />
        </label>
        <div className="crop-actions">
          <button type="button" className="admin-btn admin-btn-outline" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => onConfirm(area)}
            disabled={!area || busy}
          >
            {busy ? "Uploading…" : "Use this crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
