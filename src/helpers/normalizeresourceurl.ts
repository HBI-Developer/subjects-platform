export type ResourceSource = "link" | "gdrive" | "archive";

function hostnameOf(url: string): string | null {
  try {
    return new URL(url.trim()).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isDriveHost(url: string): boolean {
  const host = hostnameOf(url);
  // drive.google.com (+ subdomains). Exact suffix only -- avoids evil.com?drive.google false positives (CodeQL js/incomplete-url-substring-sanitization).
  if (host) {
    return (
      host === "drive.google.com" ||
      host.endsWith(".drive.google.com") ||
      host === "drive.google" ||
      host.endsWith(".drive.google")
    );
  }
  // Non-absolute input (relative string): preserve legacy substring fallback.
  return url.toLowerCase().includes("drive.google");
}

function isArchiveHost(url: string): boolean {
  const host = hostnameOf(url);
  // archive.org + any subdomain (incl. us.archive.org); exact suffix match only.
  if (host) return host === "archive.org" || host.endsWith(".archive.org");
  return url.toLowerCase().includes("archive.org");
}

export function detectSource(url: string): ResourceSource {
  if (isDriveHost(url)) return "gdrive";
  if (isArchiveHost(url)) return "archive";
  return "link";
}

export function isDriveFolderLink(raw: string): boolean {
  return /\/drive\/folders\//i.test(raw);
}

export function extractDriveId(raw: string): string | null {
  const fileMatch = /\/d\/([a-zA-Z0-9_-]{10,})/.exec(raw);
  if (fileMatch?.[1]) return fileMatch[1];
  const idMatch = /[?&]id=([a-zA-Z0-9_-]{10,})/.exec(raw);
  if (idMatch?.[1]) return idMatch[1];
  return null;
}

export function toDriveDirectUrl(id: string): string {
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

export function toDrivePreviewUrl(id: string): string {
  return `https://drive.google.com/file/d/${id}/preview`;
}

export function toDriveShareUrl(id: string): string {
  return `https://drive.google.com/file/d/${id}/view`;
}

export function isDriveUrl(url: string): boolean {
  return isDriveHost(url);
}

export function isArchiveUrl(url: string): boolean {
  return isArchiveHost(url);
}

export interface DrivePair {
  viewUrl: string;
  downloadUrl: string;
}

/** [view, download?] -> always a full pair. Derives preview for legacy single drive links. */
export function splitDrivePair(resources: Array<string>): DrivePair {
  const view = resources[0] || "";
  const download = resources[1] || resources[0] || "";
  if (resources.length >= 2) return { viewUrl: view, downloadUrl: download };
  const id = extractDriveId(view);
  if (id && isDriveUrl(view)) return { viewUrl: toDrivePreviewUrl(id), downloadUrl: view };
  return { viewUrl: view, downloadUrl: download };
}

interface ArchiveParsed {
  identifier: string;
  file: string | null;
}

export function parseArchiveUrl(raw: string): ArchiveParsed | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (!(host === "archive.org" || host.endsWith(".archive.org"))) return null;

  const segments = url.pathname.split("/").filter(Boolean);
  const downloadIndex = segments.findIndex((s) => s.toLowerCase() === "download");
  if (downloadIndex >= 0 && segments[downloadIndex + 1]) {
    const identifier = segments[downloadIndex + 1];
    const file = segments.slice(downloadIndex + 2).join("/");
    return { identifier, file: file || null };
  }

  // /details/IDENTIFIER[/...] or /embed/IDENTIFIER[/...]
  if ((segments[0] === "details" || segments[0] === "embed") && segments[1]) {
    return { identifier: segments[1], file: null };
  }

  return null;
}

const archiveExtensions: Record<Exclude<ResourceType, "images">, Array<string>> = {
  pdf: [".pdf"],
  video: [".mp4", ".webm", ".ogv", ".mov", ".m4v"],
  audio: [".mp3", ".wav", ".ogg", ".oga", ".m4a", ".aac", ".opus", ".flac"],
  office: [".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"],
};

interface ArchiveMetadataFile {
  name: string;
  size?: string | number;
}

interface ArchiveMetadata {
  files?: Array<ArchiveMetadataFile>;
}

async function fetchArchiveMetadata(identifier: string): Promise<ArchiveMetadata> {
  const response = await fetch(`https://archive.org/metadata/${identifier}`);
  if (!response.ok) throw new Error("archive-fetch");
  return response.json();
}

function encodeArchiveName(name: string): string {
  return name
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function decodeArchivePath(path: string): string {
  return path
    .split("/")
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/");
}

export function archiveUrlMatchesType(url: string, type: ResourceType): boolean {
  if (type === "images") return false;
  const clean = url.split("?")[0].toLowerCase();
  return archiveExtensions[type].some((ext) => clean.endsWith(ext));
}

export async function resolveArchiveFileUrl(raw: string, type: ResourceType): Promise<string> {
  const parsed = parseArchiveUrl(raw);
  if (!parsed) throw new Error("invalid-archive");

  let metadata: ArchiveMetadata;
  try {
    metadata = await fetchArchiveMetadata(parsed.identifier);
  } catch (error) {
    if (error instanceof Error && error.message === "archive-fetch") throw error;
    throw new Error("archive-network");
  }

  let fileName: string;
  if (parsed.file) {
    fileName = decodeArchivePath(parsed.file);
  } else {
    const extensions = type === "images" ? [] : archiveExtensions[type];
    const candidates = (metadata.files || []).filter((file) => {
      const name = file.name.toLowerCase();
      if (name.startsWith("__") || name.endsWith("_meta.sqlite") || name.endsWith("_meta.xml")) {
        return false;
      }
      return extensions.some((ext) => name.endsWith(ext));
    });

    if (candidates.length === 0) throw new Error("archive-no-match");

    candidates.sort((a, b) => Number(b.size || 0) - Number(a.size || 0));
    fileName = candidates[0].name;
  }

  // Canonical persistent URL. The file servers send no CORS headers at all,
  // so Archive PDFs are shown in the browser viewer iframe and downloaded
  // through a plain anchor, never through `fetch`.
  return `https://archive.org/download/${parsed.identifier}/${encodeArchiveName(fileName)}`;
}

export interface NormalizedResource {
  viewUrl: string;
  downloadUrl: string;
  /** What to show back in the dialog input (sharing link for drive). */
  displayUrl: string;
  /** What to store in Firestore (`[view]` when both equal, else `[view, download]`). */
  storage: Array<string>;
}

export async function normalizeResourceUrl(
  source: ResourceSource,
  raw: string,
  type: ResourceType,
): Promise<NormalizedResource> {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("empty");

  if (source === "link")
    return { viewUrl: trimmed, downloadUrl: trimmed, displayUrl: trimmed, storage: [trimmed] };

  if (source === "gdrive") {
    if (isDriveFolderLink(trimmed)) throw new Error("drive-folder");
    const id = extractDriveId(trimmed);
    if (!id) throw new Error("drive-invalid");
    const viewUrl = toDrivePreviewUrl(id);
    const downloadUrl = toDriveDirectUrl(id);
    return {
      viewUrl,
      downloadUrl,
      displayUrl: toDriveShareUrl(id),
      storage: [viewUrl, downloadUrl],
    };
  }

  const direct = await resolveArchiveFileUrl(trimmed, type);
  return { viewUrl: direct, downloadUrl: direct, displayUrl: direct, storage: [direct] };
}

export function sourceErrorMessage(code: string): string {
  switch (code) {
    case "drive-folder":
      return "روابط مجلدات Google Drive غير مدعومة، شارك ملفاً واحداً فقط";
    case "drive-invalid":
      return "رابط Google Drive غير صالح، تأكد من نسخ رابط مشاركة الملف";
    case "invalid-archive":
      return "رابط Internet Archive غير صالح";
    case "archive-no-match":
      return "لم يتم العثور على ملف من نوع المصدر المحدد داخل هذا العنصر";
    case "archive-fetch":
    case "archive-network":
      return "تعذر جلب بيانات Internet Archive، تحقق من الاتصال ثم حاول مجدداً";
    default:
      return "نوع الملف غير صحيح أو حدثت مشكلة أثناء التحقق";
  }
}
