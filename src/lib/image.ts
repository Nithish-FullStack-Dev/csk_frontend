// src\lib\image.ts
export const getImageUrl = (url?: string) => {
    if (!url) return "";

    return url.replace(
        "http://localhost:3000",
        import.meta.env.IMAGE_URL
    );
};