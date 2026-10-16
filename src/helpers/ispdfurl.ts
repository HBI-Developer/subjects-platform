import getContentType from "./getcontenttype";

export default async function isPdfUrl(url: string): Promise<boolean> {
  const contentType = await getContentType(url);
  return contentType === "application/pdf";
}
