export default function isValidUrl(url: string) {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    // Invalid URL string -- treated as non-URL (intentional fallback to false).
    return false;
  }
}
