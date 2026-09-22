"use client";
import { useRef, useState } from "react";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import { cropToFile } from "@/lib/cropImage";
import CropDialog from "@/components/admin/CropDialog";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

// Product images: an ordered list, one flagged isPrimary. First upload
// becomes primary automatically. With an `aspect`, each chosen photo is
// cropped (one after another) before it uploads.
export default function MultiImageUploader({ images, onChange, altPlaceholder = "", aspect }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  // Crop step: files waiting to be cropped, or an existing image being re-cropped.
  const [queue, setQueue] = useState([]);
  const [cropSrc, setCropSrc] = useState(null);
  const [recropIndex, setRecropIndex] = useState(null);

  async function upload(file) {
    setProgress(0);
    const uploaded = await uploadImageToCloudinary(file, setProgress);
    return { url: uploaded.url, width: uploaded.width, height: uploaded.height };
  }

  function newImage(uploaded, list) {
    return {
      ...uploaded,
      // Every image needs non-empty alt text to save — default to the
      // product name (editable per-image below).
      alt: altPlaceholder || "Product photo",
      isPrimary: list.length === 0,
    };
  }

  async function handleFiles(fileList) {
    const files = [...(fileList || [])];
    if (!files.length) return;
    setError("");
    if (aspect) {
      const usable = files.filter((f) => ACCEPTED.includes(f.type));
      if (usable.length < files.length) setError("Some files were skipped — use JPEG, PNG or WebP photos.");
      if (usable.length) startCrop(usable);
      return;
    }
    setUploading(true);
    try {
      let list = images;
      for (const file of files) list = [...list, newImage(await upload(file), list)];
      onChange(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  function startCrop(files) {
    setQueue(files.slice(1));
    setCropSrc(URL.createObjectURL(files[0]));
  }

  function nextInQueue() {
    if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    if (recropIndex === null && queue.length) {
      setCropSrc(URL.createObjectURL(queue[0]));
      setQueue(queue.slice(1));
    } else {
      setCropSrc(null);
      setQueue([]);
    }
    setRecropIndex(null);
  }

  async function onCropConfirm(area) {
    setUploading(true);
    try {
      const uploaded = await upload(await cropToFile(cropSrc, area));
      if (recropIndex !== null) {
        onChange(images.map((img, idx) => (idx === recropIndex ? { ...img, ...uploaded } : img)));
      } else {
        onChange([...images, newImage(uploaded, images)]);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      nextInQueue();
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
    if (wasPrimary && next.length > 0) next[0] = { ...next[0], isPrimary: true };
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
                placeholder="Describe the photo"
                value={img.alt || ""}
                onChange={(e) => updateImage(i, { alt: e.target.value })}
              />
              <div className="multi-uploader-actions">
                {aspect && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    disabled={uploading || !!cropSrc}
                    onClick={() => {
                      setRecropIndex(i);
                      setCropSrc(img.url);
                    }}
                  >
                    Adjust crop
                  </button>
                )}
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
          <>Uploading… {progress}%</>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <path d="M17 8l-5-5-5 5" />
              <path d="M12 3v12" />
            </svg>
            Tap to choose photos, or drag them here
            <br />
            <span style={{ fontSize: "0.74rem" }}>
              JPEG, PNG or WebP — {aspect ? "you'll crop each one next; " : ""}the first becomes the main photo
            </span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {cropSrc && (
        <CropDialog
          key={cropSrc}
          src={cropSrc}
          aspect={aspect}
          busy={uploading}
          onCancel={nextInQueue}
          onConfirm={onCropConfirm}
        />
      )}
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}
