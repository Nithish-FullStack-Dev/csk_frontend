// src/lib/image.ts

export const getImageUrl = (url?: string) => {
    if (!url) return "";

    const base = import.meta.env.VITE_IMAGE_URL;

    // if already full URL
    if (url.startsWith("http")) {
        return url.replace("http://localhost:3000", base);
    }

    // if backend returns /uploads/...
    if (url.startsWith("/uploads")) {
        return `${base}/api${url}`;
    }

    return `${base}/${url}`;
};