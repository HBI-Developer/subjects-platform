export default function isValidUrl(url: string) {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch (_) {
    return false;
  }
}
