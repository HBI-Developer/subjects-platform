import getContentType from "./getContentType";

export default async function isImageUrl(url: string): Promise<boolean> {
  const contentType = await getContentType(url);
  return contentType?.startsWith("image/") ?? false;
}
