export const getImageUrl = (url?: string) => {
  if (!url) return "";

  const base = import.meta.env.VITE_IMAGE_URL;

  // already full URL (production safe)
  if (url.startsWith("http")) {
    return url;
  }

  // if backend returns /uploads/...
  if (url.startsWith("/uploads")) {
    return `${base}/api${url}`;
  }

  // if backend returns api/uploads directly
  if (url.startsWith("/api/uploads")) {
    return `${base}${url}`;
  }

  // fallback (just in case)
  return `${base}/api/uploads/${url}`;
};