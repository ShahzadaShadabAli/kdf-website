"use client";
import { useRef, useState } from "react";
import { uploadImageToCloudinary } from "@/lib/uploadImage";

// Single-image uploader for a { url, alt, width?, height? } field — drag,
// drop, or click to pick a file; uploads straight to Cloudinary. Falls back
// gracefully (a clear error, not a crash) when Cloudinary isn't configured.
export default function ImageUploader({ value, onChange, altPlaceholder = "" }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function handleFile(file) {
    if (!file) return;
    setError("");
    setUploading(true);
    setProgress(0);
    try {
      const uploaded = await uploadImageToCloudinary(file, setProgress);
      // Every image needs non-empty alt text to save — fall back to a
      // generic default rather than block the save on a blank field (the
      // admin can still edit it here before saving, or after).
      onChange({
        url: uploaded.url,
        width: uploaded.width,
        height: uploaded.height,
        alt: value?.alt || altPlaceholder || "Photo",
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  if (value?.url) {
    return (
      <div className="uploader-preview">
        <div className="uploader-preview-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.url} alt={value.alt || ""} />
        </div>
        <div className="uploader-preview-body">
          <input
            type="text"
            placeholder="Alt text (required for accessibility)"
            value={value.alt || ""}
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
          />
          <div className="uploader-preview-actions">
            <button type="button" className="admin-btn admin-btn-outline" onClick={() => inputRef.current?.click()}>
              Replace
            </button>
            <button type="button" className="admin-btn-danger" onClick={() => onChange(null)}>
              Remove
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {error && <p className="admin-error">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div
        className={`dropzone${dragOver ? " drag-over" : ""}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
      >
        {uploading ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 3v18M6 9l6-6 6 6" style={{ opacity: 0.4 }} />
            </svg>
            Uploading… {progress}%
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <path d="M17 8l-5-5-5 5" />
              <path d="M12 3v12" />
            </svg>
            Drag an image here, or click to choose one
            <br />
            <span style={{ fontSize: "0.74rem" }}>JPEG/PNG/WebP, up to 8MB</span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}
