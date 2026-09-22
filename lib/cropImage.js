"use client";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Cloudinary sends CORS headers, so an already-uploaded photo can be re-cropped too.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load the photo for cropping"));
    img.src = src;
  });
}

// Cuts `area` (pixels of the original, as given by react-easy-crop) out of the
// image and returns a JPEG File, scaled down so the long side is at most
// `maxSide` — phone photos shrink from several MB to a few hundred KB.
export async function cropToFile(src, area, { maxSide = 1600, fileName = "photo.jpg" } = {}) {
  const img = await loadImage(src);
  const scale = Math.min(1, maxSide / Math.max(area.width, area.height));
  const width = Math.round(area.width * scale);
  const height = Math.round(area.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; // transparent areas become white in the JPEG
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, width, height);

  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not crop the photo"))), "image/jpeg", 0.88)
  );
  return new File([blob], fileName, { type: "image/jpeg" });
}
