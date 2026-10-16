const platformHosts: Array<[string, string]> = [
  ["youtube.com", "youtube"],
  ["youtu.be", "youtube"],
  ["vimeo.com", "vimeo"],
  ["twitch.tv", "twitch"],
  ["soundcloud.com", "soundcloud"],
  ["streamable.com", "streamable"],
  ["wistia.com", "wistia"],
  ["dailymotion.com", "dailymotion"],
  ["mux.com", "mux"],
];

function hostnameEndsWith(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

const isPlatformVideo = (url: string) => {
  let host = "";
  let path = "";
  try {
    const parsed = new URL(url);
    host = parsed.hostname.toLowerCase();
    path = `${parsed.pathname}${parsed.search}`.toLowerCase();
  } catch {
    // Non-absolute URL: fall back to anchored substring checks below (intentional).
  }

  if (host) {
    // Hostname-exact matching -- avoids evil.com?youtube.com false positives (CodeQL js/regex/missing-regexp-anchor).
    for (const [domain, name] of platformHosts) {
      if (hostnameEndsWith(host, domain)) return name;
    }
    if (path.endsWith(".m3u8") || path.includes(".m3u8?") || path.includes(".m3u8&")) return "hls";
    return false;
  }

  // Legacy fallback for relative strings: keep anchored patterns (no bare substring).
  const fallbackPatterns = [
    [/(^|\.)youtube\.com([/:?#]|$)/, "youtube"],
    [/(^|\/)youtu\.be([/:?#]|$)/, "youtube"],
    [/(^|\.)vimeo\.com([/:?#]|$)/, "vimeo"],
    [/(^|\.)twitch\.tv([/:?#]|$)/, "twitch"],
    [/(^|\.)soundcloud\.com([/:?#]|$)/, "soundcloud"],
    [/(^|\.)streamable\.com([/:?#]|$)/, "streamable"],
    [/(^|\.)wistia\.com([/:?#]|$)/, "wistia"],
    [/(^|\.)dailymotion\.com([/:?#]|$)/, "dailymotion"],
    [/(^|\.)mux\.com([/:?#]|$)/, "mux"],
    [/\.m3u8([?#]|$)/, "hls"],
  ] as const;
  return fallbackPatterns.find((current) => current[0].test(url.toLowerCase()))?.[1] || false;
};

export default isPlatformVideo;
