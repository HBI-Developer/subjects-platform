import getContentType from "./getContentType";
import isPlatformVideo from "./isPlatformVideo";
import isValidUrl from "./isValidUrl";

export default async function isVideoUrl(url: string): Promise<boolean> {
  if (!isValidUrl(url)) return false;

  if (isPlatformVideo(url)) {
    return true;
  }

  const contentType = await getContentType(url);
  return contentType?.startsWith("video/") ?? false;
}
