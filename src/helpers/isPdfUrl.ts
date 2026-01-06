import getContentType from "./getContentType";

export default async function isPdfUrl(url: string): Promise<boolean> {
  const contentType = await getContentType(url);
  return contentType === "application/pdf";
}
