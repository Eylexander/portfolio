import apiClient from "@/lib/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

function isLocalUploadUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("/api/v1/uploads/")) return true;
  if (API_URL && url.startsWith(`${API_URL}/api/v1/uploads/`)) return true;
  try {
    const base = typeof window !== "undefined" ? window.location.origin : API_URL || "http://localhost";
    return new URL(url, base).pathname.startsWith("/api/v1/uploads/");
  } catch {
    return false;
  }
}

/** Downloads an externally-hosted image and returns the re-hosted local URL. Falls back to the original URL if re-hosting fails. */
export async function rehostImageUrl(url: string): Promise<string> {
  if (!url || !/^https?:\/\//i.test(url) || isLocalUploadUrl(url)) {
    return url;
  }
  try {
    return await apiClient.uploadImageFromUrl(url);
  } catch {
    return url;
  }
}

const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g;

/** Re-hosts every externally-hosted image referenced in markdown content and rewrites the links to point at the local copies. */
export async function rehostMarkdownImages(markdown: string): Promise<string> {
  if (!markdown) return markdown;

  const externalUrls = Array.from(
    new Set(Array.from(markdown.matchAll(MARKDOWN_IMAGE_RE), (m) => m[1]).filter((u) => !isLocalUploadUrl(u)))
  );
  if (externalUrls.length === 0) return markdown;

  const entries = await Promise.all(externalUrls.map(async (url) => [url, await rehostImageUrl(url)] as const));

  let result = markdown;
  for (const [oldUrl, newUrl] of entries) {
    if (newUrl !== oldUrl) {
      result = result.split(oldUrl).join(newUrl);
    }
  }
  return result;
}
