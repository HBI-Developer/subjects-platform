const isPlatform = (url: string) => {
  const platformPatterns = [
      [/youtube\.com/, "youtube"],
      [/youtu\.be/, "youtube"],
      [/vimeo\.com/, "vimeo"],
      [/twitch\.tv/, "twitch"],
      [/soundcloud\.com/, "soundcloud"],
      [/streamable\.com/, "streamable"],
      [/wistia\.com/, "wistia"],
      [/dailymotion\.com/, "dailymotion"],
      [/mux\.com/, "mux"],
      [/\.m3u8/, "hls"],
    ] as const,
    result =
      platformPatterns.find((current) => current[0].test(url))?.[1] || false;

  return result;
};

export default isPlatform;
