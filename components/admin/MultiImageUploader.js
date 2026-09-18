"use client";
import { useRef, useState } from "react";
import { uploadImageToCloudinary } from "@/lib/uploadImage";

// Product images: an ordered list, one flagged isPrimary. First upload
// becomes primary automatically.
export default function MultiImageUploader({ images, onChange, altPlaceholder = "" }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function handleFiles(fileList) {
    const files = [...(fileList || [])];
    if (!files.length) return;
    setError("");
    setUploading(true);
    try {
      const newImages = [];
      for (const file of files) {
        setProgress(0);
        const uploaded = await uploadImageToCloudinary(file, setProgress);
        newImages.push({
          url: uploaded.url,
          width: uploaded.width,
          height: uploaded.height,
          // Every image needs non-empty alt text to save — default to the
          // product name (editable per-image below) rather than block the
          // save on an easy-to-miss blank field.
          alt: altPlaceholder || "Product photo",
          isPrimary: images.length === 0 && newImages.length === 0,
        });
      }
      onChange([...images, ...newImages]);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  function updateImage(i, patch) {
    onChange(images.map((img, idx) => (idx === i ? { ...img, ...patch } : img)));
  }

  function setPrimary(i) {
    onChange(images.map((img, idx) => ({ ...img, isPrimary: idx === i })));
  }

  function removeImage(i) {
    const wasPrimary = images[i].isPrimary;
    const next = images.filter((_, idx) => idx !== i);
    if (wasPrimary && next.length > 0) next[0].isPrimary = true;
    onChange(next);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div>
      {images.length > 0 && (
        <div className="multi-uploader-grid">
          {images.map((img, i) => (
            <div className="multi-uploader-item" key={img.url + i}>
              <div className="multi-uploader-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt || ""} />
                {img.isPrimary && <span className="multi-uploader-primary-tag">Primary</span>}
              </div>
              <input
                type="text"
                placeholder="Alt text"
                value={img.alt || ""}
                onChange={(e) => updateImage(i, { alt: e.target.value })}
              />
              <div className="multi-uploader-actions">
                {!img.isPrimary && (
                  <button type="button" className="admin-btn admin-btn-outline" onClick={() => setPrimary(i)}>
                    Make Primary
                  </button>
                )}
                <button type="button" className="admin-btn-danger" onClick={() => removeImage(i)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
          <>Uploading… {progress}%</>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <path d="M17 8l-5-5-5 5" />
              <path d="M12 3v12" />
            </svg>
            Drag images here or click to upload
            <br />
            <span style={{ fontSize: "0.74rem" }}>JPEG/PNG/WebP, up to 8MB — first image becomes primary</span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}
