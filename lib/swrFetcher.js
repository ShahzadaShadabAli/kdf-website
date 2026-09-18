export async function fetcher(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Request failed");
  }
  return res.json();
}

export async function apiSend(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let message = "Request failed";
    if (typeof data.error === "string") {
      message = data.error;
    } else if (data.error?.formErrors?.length) {
      message = data.error.formErrors.join(", ");
    } else if (data.error?.fieldErrors) {
      // zod's flatten() puts field-specific messages here — e.g.
      // { images: ["String must contain at least 1 character(s)"] } — surface
      // the field name too so "images" errors aren't mistaken for "message".
      const entries = Object.entries(data.error.fieldErrors).filter(([, v]) => v?.length);
      if (entries.length) {
        message = entries.map(([field, msgs]) => `${field}: ${msgs[0]}`).join("; ");
      }
    }
    throw new Error(message);
  }
  return data;
}
