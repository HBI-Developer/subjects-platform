import getContentType from "./getcontenttype";

export default async function isImageUrl(url: string): Promise<boolean> {
  const contentType = await getContentType(url);
  return contentType?.startsWith("image/") ?? false;
}
