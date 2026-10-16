import getErrorMessage from "../functions/geterrormessage";
import { detectSource, sourceErrorMessage } from "./normalizeresourceurl";

export interface ResourceFieldInput {
  readonly title: string;
  readonly type: ResourceType;
  readonly url: string;
  readonly downloadUrl: string;
  readonly imagesLength: number;
  readonly online: boolean;
}

export function validateResourceFields(input: ResourceFieldInput): string {
  const title = input.title;
  const url = input.url;
  const downloadUrl = input.downloadUrl;
  if (!title) return "ﻻ يمكن أن يكون حقل الاسم فارغاً";
  if (title.length <= 2) return "الاسم صغير للغاية، يجب أن يتكون من 3 أحرف على الأقل";
  if (title.length > 60) return "النص أطول من حياتك، يجب أن يتكون من 60 حرف على الأكثر";
  if (!input.online) return "اتصالك بالإنترنت مقطوع، رجاءً اتصل بالانترنت ثم حاول مجدداً";
  if (input.type === "images") {
    if (input.imagesLength === 0) return "يجب أن يكون هناك صورة واحدة على الأقل";
    return "";
  }
  if (!url) return "يجب أن يكون هناك رابط للمصدر";
  const custom = downloadUrl.trim();
  if (!custom) return "";
  let parsed: URL;
  try {
    parsed = new URL(custom);
  } catch {
    return "رابط التحميل غير صالح";
  }
  if (!["http:", "https:"].includes(parsed.protocol)) return "رابط التحميل غير صالح";
  return "";
}

export interface UpdateUnchangedInput {
  readonly id?: string;
  readonly type: ResourceType;
  readonly initialType?: ResourceType;
  readonly title?: string;
  readonly initialTitle?: string;
  readonly source: string;
  readonly initialStorage: Array<string>;
  readonly downloadUrl: string;
  readonly initialDownloadUrl: string;
  readonly images: Array<string>;
  readonly url: string;
  readonly initialDisplayUrl: string;
}

export function isUpdateUnchanged(input: UpdateUnchangedInput): boolean {
  if (!input.id) return true;
  if (input.type !== input.initialType) return false;
  if (input.title !== input.initialTitle) return false;
  const initialSource = input.initialStorage[0] ? detectSource(input.initialStorage[0]) : "link";
  if (input.source !== initialSource) return false;
  if (input.downloadUrl.trim() !== input.initialDownloadUrl) return false;
  if (input.type === "images") {
    return JSON.stringify(input.images) === JSON.stringify(input.initialStorage);
  }
  return input.url === input.initialDisplayUrl;
}

export function resolveFinalStoragePure(
  normalized: { readonly storage: Array<string>; readonly viewUrl: string },
  customDownloadUrl: string,
): Array<string> {
  const custom = customDownloadUrl.trim();
  if (!custom) return [...normalized.storage];
  if (custom === normalized.viewUrl) return [normalized.viewUrl];
  return [normalized.viewUrl, custom];
}

export function toResolveErrorMessage(error_: unknown): string {
  if (error_ instanceof Error) return sourceErrorMessage(error_.message);
  return "حدث خطأ أثناء تجهيز الرابط";
}

export function toFirestoreErrorMessage(error_: unknown): string {
  const code = (error_ as { readonly code?: number | string })?.code ?? "UNKNOWN";
  return getErrorMessage(code).message;
}
