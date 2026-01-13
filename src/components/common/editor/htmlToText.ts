export function htmlToText(html: string): string {
  if (!html) return "";

  // Works in browser & Next.js
  if (typeof window === "undefined") {
    // Server-side fallback
    return html
      .replace(/<\/(p|div|h[1-6]|li|br|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n\s*\n/g, "\n")
      .trim();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  return doc.body.textContent?.replace(/\s+/g, " ").trim() || "";
}
