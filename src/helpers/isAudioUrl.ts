import getContentType from "./getContentType";

export default async function isAudioUrl(url: string): Promise<boolean> {
  const contentType = await getContentType(url);
  if (contentType?.startsWith("audio/")) return true;
  return /\.(mp3|wav|ogg|m4a|aac)$/i.test(url);
}
