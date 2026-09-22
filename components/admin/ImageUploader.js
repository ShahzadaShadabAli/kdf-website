"use client";
import { useRef, useState } from "react";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import { cropToFile } from "@/lib/cropImage";
import CropDialog from "@/components/admin/CropDialog";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

// Single-image uploader for a { url, alt, width?, height? } field — drag,
// drop, or click to pick a file; uploads straight to Cloudinary. With an
// `aspect`, the admin first crops the photo to the shape of the spot where it
// appears on the site; without one (logos), the file is uploaded as-is.
export default function ImageUploader({ value, onChange, altPlaceholder = "", aspect }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [cropSrc, setCropSrc] = useState(null);

  async function upload(file) {
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

  function handleFile(file) {
    if (!file) return;
    setError("");
    if (!aspect) return upload(file);
    if (!ACCEPTED.includes(file.type)) return setError("Use a JPEG, PNG or WebP photo.");
    setCropSrc(URL.createObjectURL(file));
  }

  function closeCrop() {
    if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }

  async function onCropConfirm(area) {
    try {
      const file = await cropToFile(cropSrc, area);
      await upload(file);
      closeCrop();
    } catch (e) {
      setError(e.message);
      closeCrop();
    }
  }

  function onPick(e) {
    handleFile(e.target.files?.[0]);
    e.target.value = ""; // allow picking the same file again
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  const fileInput = (
    <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} hidden onChange={onPick} />
  );
  const cropper = cropSrc && (
    <CropDialog src={cropSrc} aspect={aspect} busy={uploading} onCancel={closeCrop} onConfirm={onCropConfirm} />
  );

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
            placeholder="Describe the photo (read aloud to blind visitors)"
            value={value.alt || ""}
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
          />
          <div className="uploader-preview-actions">
            {aspect && (
              <button type="button" className="admin-btn admin-btn-outline" onClick={() => setCropSrc(value.url)} disabled={uploading}>
                Adjust crop
              </button>
            )}
            <button type="button" className="admin-btn admin-btn-outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? `Uploading… ${progress}%` : "Replace"}
            </button>
            <button type="button" className="admin-btn-danger" onClick={() => onChange(null)}>
              Remove
            </button>
          </div>
        </div>
        {fileInput}
        {cropper}
        {error && <p className="admin-error">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div
        className={`dropzone${dragOver ? " drag-over" : ""}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !uploading) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
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
            Tap to choose a photo, or drag one here
            <br />
            <span style={{ fontSize: "0.74rem" }}>
              JPEG, PNG or WebP{aspect ? " — you'll choose the crop next" : ", up to 8MB"}
            </span>
          </>
        )}
      </div>
      {fileInput}
      {cropper}
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}
