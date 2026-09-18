import sanitizeHtml from "sanitize-html";

// Plain-text fields render as text, never HTML — this strips any tags a
// submitter tries to sneak in rather than trusting client-side escaping alone.
export function toPlainText(value) {
  if (typeof value !== "string") return value;
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
}

export function sanitizeRichText(value) {
  if (typeof value !== "string") return value;
  return sanitizeHtml(value, {
    allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
    allowedAttributes: {},
  });
}
