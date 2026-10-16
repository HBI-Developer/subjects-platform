import { describe, expect, it } from "vitest";
import getErrorMessage from "../functions/geterrormessage";
import isPlatformVideo from "./isplatformvideo";
import isValidUrl from "./isvalidurl";
import {
  detectSource,
  extractDriveId,
  isArchiveUrl,
  isDriveUrl,
  parseArchiveUrl,
} from "./normalizeresourceurl";
import {
  isUpdateUnchanged,
  resolveFinalStoragePure,
  toFirestoreErrorMessage,
  toResolveErrorMessage,
  validateResourceFields,
} from "./resourceform";

describe("scan-smoke", () => {
  it("detectSource classifies drive/archive/link", () => {
    expect(detectSource("https://drive.google.com/file/d/ABC123456789/view")).toBe("gdrive");
    expect(detectSource("https://archive.org/download/foo/bar.pdf")).toBe("archive");
    expect(detectSource("https://us.archive.org/download/foo/bar.pdf")).toBe("archive");
    expect(detectSource("https://example.com/a.pdf")).toBe("link");
  });

  it("extractDriveId parses /d/ and ?id=", () => {
    expect(extractDriveId("https://drive.google.com/file/d/ABC123456789/view")).toBe(
      "ABC123456789",
    );
    expect(extractDriveId("https://drive.google.com/uc?id=ABC123456789&export=download")).toBe(
      "ABC123456789",
    );
    expect(extractDriveId("https://example.com/noid")).toBeNull();
  });

  it("isDriveUrl / isArchiveUrl helpers", () => {
    expect(isDriveUrl("https://drive.google.com/x")).toBe(true);
    expect(isDriveUrl("https://example.com/x")).toBe(false);
    expect(isArchiveUrl("https://archive.org/details/foo")).toBe(true);
    expect(isArchiveUrl("https://example.com/foo")).toBe(false);
  });

  it("isValidUrl accepts http/https only", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("ftp://example.com")).toBe(false);
    expect(isValidUrl("not-a-url")).toBe(false);
  });

  it("rejects attacker hostnames containing trusted substrings", () => {
    expect(detectSource("https://evil.com/?x=drive.google")).toBe("link");
    expect(detectSource("https://evil.com/?x=archive.org")).toBe("link");
    expect(detectSource("https://archive.org.evil.com/download/foo/bar.pdf")).toBe("link");
    expect(isDriveUrl("https://evil.com/drive.google/x")).toBe(false);
    expect(isArchiveUrl("https://evil.com/archive.org/details/foo")).toBe(false);
    expect(parseArchiveUrl("https://evil.com/archive.org/download/foo/bar.pdf")).toBeNull();
    expect(parseArchiveUrl("https://archive.org/download/foo/bar.pdf")?.identifier).toBe("foo");
  });

  it("isPlatformVideo matches hosts exactly, not substrings", () => {
    expect(isPlatformVideo("https://www.youtube.com/watch?v=x")).toBe("youtube");
    expect(isPlatformVideo("https://youtu.be/x")).toBe("youtube");
    expect(isPlatformVideo("https://example.com/video.m3u8")).toBe("hls");
    expect(isPlatformVideo("https://evil.com/?x=youtube.com")).toBe(false);
    expect(isPlatformVideo("https://youtube.com.evil.com/watch")).toBe(false);
    expect(isPlatformVideo("https://example.com/video.mp4")).toBe(false);
  });

  it("getErrorMessage preserves http + firebase mappings", () => {
    expect(getErrorMessage(200).message).toBe("تمت العملية بنجاح, ولكن لا يوجد محتوى لإرجاعه");
    expect(getErrorMessage(404)).toMatchObject({ code: 404 });
    expect(getErrorMessage("NOT_FOUND")).toMatchObject({ code: 404 });
    expect(getErrorMessage("not-found")).toMatchObject({ code: 404 });
    expect(getErrorMessage("PERMISSION_DENIED")).toMatchObject({ code: 403 });
    expect(getErrorMessage("UNAUTHENTICATED")).toMatchObject({ code: 401 });
    expect(getErrorMessage("ALREADY_EXISTS")).toMatchObject({ code: 409 });
    expect(getErrorMessage("ABORTED")).toMatchObject({ code: 409 });
    expect(getErrorMessage(9999).code).toBe(9999);
    expect(getErrorMessage("SOME_UNKNOWN_CODE").code).toBe(500);
  });

  it("validateResourceFields mirrors dialog rules", () => {
    const base = {
      title: "فيزياء",
      type: "pdf" as const,
      url: "https://example.com/a.pdf",
      downloadUrl: "",
      imagesLength: 0,
      online: true,
    };
    expect(validateResourceFields(base)).toBe("");
    expect(validateResourceFields({ ...base, title: "" })).not.toBe("");
    expect(validateResourceFields({ ...base, title: "أب" })).not.toBe("");
    expect(validateResourceFields({ ...base, online: false })).not.toBe("");
    expect(validateResourceFields({ ...base, type: "images" as const, imagesLength: 0 })).not.toBe(
      "",
    );
    expect(validateResourceFields({ ...base, type: "images" as const, imagesLength: 2 })).toBe("");
    expect(validateResourceFields({ ...base, url: "" })).not.toBe("");
    expect(validateResourceFields({ ...base, downloadUrl: "ftp://x/y" })).toBe(
      "رابط التحميل غير صالح",
    );
    expect(validateResourceFields({ ...base, downloadUrl: "not-a-url" })).toBe(
      "رابط التحميل غير صالح",
    );
  });

  it("isUpdateUnchanged detects no-op edits", () => {
    const base = {
      id: "r1",
      type: "pdf" as const,
      initialType: "pdf" as const,
      title: "A",
      initialTitle: "A",
      source: "link",
      initialStorage: ["https://example.com/a.pdf"],
      downloadUrl: "",
      initialDownloadUrl: "",
      images: [],
      url: "https://example.com/a.pdf",
      initialDisplayUrl: "https://example.com/a.pdf",
    };
    expect(isUpdateUnchanged(base)).toBe(true);
    expect(isUpdateUnchanged({ ...base, title: "B" })).toBe(false);
    expect(isUpdateUnchanged({ ...base, id: undefined })).toBe(true);
  });

  it("resolveFinalStoragePure keeps custom download override", () => {
    const normalized = { storage: ["v"], viewUrl: "v" };
    expect(resolveFinalStoragePure(normalized, "")).toEqual(["v"]);
    expect(resolveFinalStoragePure(normalized, "v")).toEqual(["v"]);
    expect(resolveFinalStoragePure(normalized, "https://example.com/d.pdf")).toEqual([
      "v",
      "https://example.com/d.pdf",
    ]);
    expect(toResolveErrorMessage(new Error("drive-invalid"))).not.toBe("");
    expect(toResolveErrorMessage("oops")).toBe("حدث خطأ أثناء تجهيز الرابط");
    expect(toFirestoreErrorMessage({ code: "NOT_FOUND" })).toBe("المورد غير موجود");
  });
});
