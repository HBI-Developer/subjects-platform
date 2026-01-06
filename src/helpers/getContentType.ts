import isValidUrl from "./isValidUrl";

export default async function getContentType(
  url: string
): Promise<string | null> {
  if (!isValidUrl(url)) return null;

  try {
    const response = await fetch(url, { method: "HEAD" });
    if (!response.ok) return null;
    return response.headers.get("content-type");
  } catch (error) {
    console.warn(`Failed to inspect URL: ${url}`, error);
    return null;
  }
}
