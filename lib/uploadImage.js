"use client";

// Client-side helper: gets a signed Cloudinary upload from our own
// /api/upload (admin-only), then posts the file straight to Cloudinary —
// the file never passes through our Next.js server as a buffer.
export async function uploadImageToCloudinary(file, onProgress) {
  const signRes = await fetch("/api/upload", { method: "POST" });
  if (!signRes.ok) {
    const data = await signRes.json().catch(() => ({}));
    throw new Error(data.error || "Could not start upload");
  }
  const sign = await signRes.json();

  if (!sign.acceptedMimeTypes.includes(file.type)) {
    throw new Error(`Unsupported file type. Use ${sign.acceptedMimeTypes.join(", ")}.`);
  }
  if (file.size > sign.maxFileSizeBytes) {
    throw new Error(`File too large — max ${Math.round(sign.maxFileSizeBytes / 1024 / 1024)}MB.`);
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", sign.timestamp);
  form.append("signature", sign.signature);
  form.append("folder", sign.folder);

  const result = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", sign.uploadUrl);
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error("Cloudinary upload failed — check your Cloudinary credentials in .env.local"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });

  return {
    url: result.secure_url,
    width: result.width,
    height: result.height,
  };
}
