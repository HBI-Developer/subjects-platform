import {
  Box,
  Button,
  Center,
  CloseButton,
  createOverlay,
  Dialog,
  Flex,
  Grid,
  Heading,
  Link,
  Portal,
  Presence,
  Show,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { MdFileDownload } from "react-icons/md";
import { TbExternalLink } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import ViewerErrorBoundary from "@/components/errorboundary";
import { toaster } from "@/components/ui/toaster";
import { TITLE } from "@/constants";
import getErrorMessage from "@/functions/geterrormessage";
import verifyResources from "@/functions/verifyresources";
import { isArchiveUrl, isDriveUrl, splitDrivePair } from "@/helpers/normalizeresourceurl";
import type { RootState } from "@/store";
import { setResourceLoading } from "@/store/slice/loading";

interface Props {
  title: string;
  type: ResourceType;
  description?: string;
  resources: Array<string>;
}

// Network-level reachability probe, independent from in-page renderer success.
// Returns true when the host responds (including CORS-blocked opaque
// responses), false only on definite failure (DNS/offline/4xx/5xx/timeout).
// Used for Download and External-open so a View renderer failure does not
// hide them, and vice versa.
async function probeUrlReachable(url: string, timeoutMs = 7000): Promise<boolean> {
  if (!url) return false;
  const fetchWithTimeout = (input: RequestInfo, init: RequestInit) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
  };

  // 1. HEAD is cheap and sufficient when allowed.
  try {
    const head = await fetchWithTimeout(url, { method: "HEAD" });
    if (head.ok) return true;
    // Some hosts reject HEAD (405) while GET works; fall through to GET.
    // Definite client/server errors mean the link itself is broken.
    if (head.status === 405) throw new Error("head-not-allowed");
    if (head.status >= 400) return false;
    return true;
  } catch {
    // fall through to Range GET
  }

  // 2. Range GET fetches 1 byte only; avoids downloading the whole file.
  try {
    const ranged = await fetchWithTimeout(url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
    });
    if (ranged.ok || ranged.status === 206) return true;
    if (ranged.status >= 400) return false;
    return true;
  } catch {
    // fall through to no-cors reachability check
  }

  // 3. CORS-blocked hosts throw TypeError but still serve the file to a
  // plain anchor / new tab. `no-cors` yields an opaque response when the
  // server is reachable, and throws when truly offline/DNS-dead.
  try {
    await fetchWithTimeout(url, { method: "GET", mode: "no-cors" });
    return true;
  } catch {
    return false;
  }
}

function getDrivePair(
  type: ResourceType,
  resources: Array<string>,
): { viewUrl: string; downloadUrl: string } | null {
  if (type === "images") return null;
  if (!resources.some((r) => isDriveUrl(r))) return null;
  return splitDrivePair(resources);
}

function getExternalUrl(
  type: ResourceType,
  drivePair: { viewUrl: string; downloadUrl: string } | null,
  viewSrc: string,
): string {
  // The raw .docx URL can't render in a browser tab, so the new-tab button
  // for office files must open the Microsoft viewer page (view.aspx), not
  // the raw file. Drive pairs already render natively and are left as-is.
  if (type === "office" && !drivePair && viewSrc) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(viewSrc)}`;
  }
  return viewSrc;
}

function getInitialExternalStatus(
  type: ResourceType,
  drivePair: { viewUrl: string; downloadUrl: string } | null,
): ActionStatus {
  if (type === "images") return "failed";
  if (type === "office" && !drivePair) return "ok";
  return "pending";
}

interface ProbePlan {
  readonly needDownloadProbe: boolean;
  readonly needExternalProbe: boolean;
  readonly sharedProbe: boolean;
}

function planProbes(input: {
  readonly type: ResourceType;
  readonly isArchiveDownload: boolean;
  readonly drivePair: { viewUrl: string; downloadUrl: string } | null;
  readonly downloadSrc: string;
  readonly externalUrl: string;
}): ProbePlan {
  if (input.type === "images") {
    return { needDownloadProbe: true, needExternalProbe: false, sharedProbe: false };
  }
  const needDownloadProbe = !input.isArchiveDownload;
  const needExternalProbe = !(input.type === "office" && !input.drivePair);
  const sharedProbe =
    needDownloadProbe && needExternalProbe && input.externalUrl === input.downloadSrc;
  return { needDownloadProbe, needExternalProbe, sharedProbe };
}

function isExternalVisible(input: {
  readonly type: ResourceType;
  readonly viewerSettled: boolean;
  readonly externalStatus: ActionStatus;
}): boolean {
  if (input.type === "images") return false;
  if (!input.viewerSettled) return false;
  return input.externalStatus !== "failed";
}

function isDownloadVisible(input: {
  readonly type: ResourceType;
  readonly viewerSettled: boolean;
  readonly downloadStatus: ActionStatus;
  readonly imagesLoaded: boolean;
  readonly imagesAllFailed: boolean;
}): boolean {
  if (!input.viewerSettled) return false;
  if (input.type === "images") {
    if (input.downloadStatus === "failed") return false;
    if (input.downloadStatus === "ok") return true;
    return input.imagesLoaded && !input.imagesAllFailed;
  }
  return input.downloadStatus !== "failed";
}

function getFallbackExt(type: ResourceType): string {
  switch (type) {
    case "pdf":
      return ".pdf";
    case "video":
      return ".mp4";
    case "audio":
      return ".mp3";
    case "office":
      return ".bin";
    default:
      return "";
  }
}

type ActionStatus = "pending" | "ok" | "failed";

// Heavy viewers stay out of the main chunk and load on demand.
const AudioPlayer = lazy(() => import("@/components/audioplayer")),
  Carousel = lazy(() => import("@/components/carousel")),
  OfficeViewer = lazy(() => import("@/components/officeviewer")),
  PDFViewer = lazy(() => import("@/components/pdfviewer")),
  VideoPlayer = lazy(() => import("@/components/videoplayer"));

const resource = createOverlay<Props>(({ title, description, type, resources, ...rest }) => {
  const color = useSelector((state: RootState) => state.color.value),
    loading = useSelector((state: RootState) => state.loading.resource),
    subject = useSelector((state: RootState) => state.identifier.subject.title),
    dispatch = useDispatch(),
    errors = useRef<Array<[number] | [number, number]>>([]),
    [component, setComponent] = useState<React.JSX.Element | null>(null),
    [isDownloading, setIsDownloading] = useState(false),
    [imagesStatus, setImagesStatus] = useState({
      isLoaded: false,
      allFailed: false,
    }),
    drivePair = getDrivePair(type, resources),
    viewSrc = drivePair?.viewUrl ?? resources[0],
    downloadSrc = drivePair?.downloadUrl ?? resources[1] ?? resources[0],
    externalUrl = getExternalUrl(type, drivePair, viewSrc),
    // Archive file servers send no CORS headers, so Archive PDFs can never be
    // `fetch`ed (EmbedPDF/verify). They render in the browser's native PDF
    // viewer through an iframe instead. Other Archive types don't need CORS:
    // media/img elements and officeapps (server-side) follow redirects.
    isArchivePdf = type === "pdf" && !drivePair && isArchiveUrl(viewSrc),
    isArchiveDownload = type !== "images" && !drivePair && isArchiveUrl(downloadSrc),
    downloadName = (() => {
      let base = downloadSrc.split("?")[0].split("/").pop() || "";
      try {
        base = decodeURIComponent(base);
      } catch {
        // keep raw base name when decoding fails
      }
      base = base.replace(/[\\/:*?"<>|]/g, "_").trim();
      if (base) return base;
      return `${title}${getFallbackExt(type)}`;
    })(),
    // Each header action is tested separately on open. A View failure must
    // not hide Download / External-open, and vice versa. Archive downloads
    // and Office external-viewer links can't be fetch-probed (no CORS /
    // viewer always 200), so they start optimistic `ok` and stay enabled.
    [downloadStatus, setDownloadStatus] = useState<ActionStatus>(() =>
      isArchiveDownload ? "ok" : "pending",
    ),
    [externalStatus, setExternalStatus] = useState<ActionStatus>(() =>
      getInitialExternalStatus(type, drivePair),
    ),
    // Header buttons appear only after viewer loading settles (success or
    // error panel), so the spinner phase never shows a half-ready header.
    // A timeout fallback covers viewers that never clear global loading.
    [viewerSettled, setViewerSettled] = useState(false),
    sawLoading = useRef(false),
    isStart = useRef(false),
    showErrorPanel = () => {
      const { code, message } = getErrorMessage(errors.current[0][0]);
      setComponent(
        <Center
          width={{ base: "100%", sm: "75%", md: "65%", lg: "50%" }}
          aspectRatio={16 / 9}
          flexDirection={"column"}
          rowGap={"5px"}
          backgroundColor={"bg"}
          marginInline={"auto"}
          textAlign={"center"}
          padding={"10px"}
        >
          <Heading>{code}</Heading>
          <Text>{message}</Text>
          <Text fontSize={"sm"} opacity={0.8}>
            تعذر عرض المحتوى داخل الصفحة، لكن يمكنك تجربة التحميل أو الفتح الخارجي من الأزرار أعلاه
            إن كانت ظاهرة.
          </Text>
        </Center>,
      );
      dispatch(setResourceLoading(false));
      setViewerSettled(true);
    },
    showDriveViewer = () => {
      const pair = drivePair as { viewUrl: string; downloadUrl: string };
      const ready = () => {
        dispatch(setResourceLoading(false));
        setViewerSettled(true);
      };
      const fail = () => {
        errors.current.push([500]);
        setContent();
      };
      if (type === "video") {
        setComponent(
          <Box
            aspectRatio={16 / 9}
            marginInline={"auto"}
            width={{ base: "100%", sm: "75%", md: "65%", lg: "50%" }}
          >
            {/* biome-ignore lint/a11y/useMediaCaption: drive files have no caption tracks */}
            <video
              src={pair.downloadUrl}
              controls
              preload="metadata"
              style={{ width: "100%", height: "100%" }}
              onLoadedData={ready}
              onLoadedMetadata={ready}
              onError={fail}
            />
          </Box>,
        );
        return;
      }
      if (type === "audio") {
        setComponent(
          <Box marginInline={"auto"} width={{ base: "100%", sm: "75%", md: "65%", lg: "50%" }}>
            {/* biome-ignore lint/a11y/useMediaCaption: drive files have no caption tracks */}
            <audio
              src={pair.downloadUrl}
              controls
              preload="metadata"
              style={{ width: "100%" }}
              onLoadedData={ready}
              onLoadedMetadata={ready}
              onCanPlay={ready}
              onError={fail}
            />
          </Box>,
        );
        return;
      }
      setComponent(
        <Box
          flex="1"
          minHeight="0"
          position="absolute"
          top="0"
          bottom="0"
          left="0"
          right="0"
          padding={"10px 15px"}
          overflow="hidden"
        >
          <iframe
            src={pair.viewUrl}
            width="100%"
            height="100%"
            title={title}
            allowFullScreen
            style={{ border: "none", width: "100%", height: "100%" }}
            onLoad={ready}
          />
        </Box>,
      );
    },
    showSingleViewer = () => {
      const src = viewSrc;
      if (type === "pdf" && isArchivePdf) {
        const ready = () => {
          dispatch(setResourceLoading(false));
          setViewerSettled(true);
        };
        setComponent(
          <Box
            flex="1"
            minHeight="0"
            position="absolute"
            top="0"
            bottom="0"
            left="0"
            right="0"
            padding={"10px 15px"}
            overflow="hidden"
          >
            <iframe
              src={viewSrc}
              width="100%"
              height="100%"
              title={title}
              allowFullScreen
              style={{ border: "none", width: "100%", height: "100%" }}
              onLoad={ready}
            />
          </Box>,
        );
        return;
      }
      if (type === "pdf") {
        setComponent(<PDFViewer src={src} />);
        return;
      }
      if (type === "office") {
        setComponent(<OfficeViewer src={src} />);
        return;
      }
      if (type === "audio") {
        setComponent(<AudioPlayer src={src} />);
        return;
      }
      if (type === "video") {
        setComponent(<VideoPlayer src={src} />);
      }
    },
    setContent = () => {
      if (errors.current.length) {
        showErrorPanel();
        return;
      }
      if (drivePair) {
        showDriveViewer();
        return;
      }
      showSingleViewer();
    },
    download = async () => {
      if (type !== "images" || resources.length === 0 || isDownloading) return;
      setIsDownloading(true);

      try {
        const results = await Promise.allSettled(
          resources.map(async (url) => {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`status-${response.status}`);
            return { blob: await response.blob(), url };
          }),
        );

        const succeeded = results.flatMap((result) =>
          result.status === "fulfilled" ? [result.value] : [],
        );
        const failedCount = results.length - succeeded.length;

        if (succeeded.length === 0) {
          toaster.create({
            description: `فشل تحميل جميع الصور، رجاءً قم بإعادة المحاولة إذا كان ممكناً.`,
            type: "error",
          });
          return;
        }

        const extFromMime = (mime: string) => {
          switch (mime.toLowerCase().split(";")[0].trim()) {
            case "image/jpeg": {
              return ".jpg";
            }
            case "image/png": {
              return ".png";
            }
            case "image/webp": {
              return ".webp";
            }
            case "image/gif": {
              return ".gif";
            }
            case "image/svg+xml": {
              return ".svg";
            }
            case "image/bmp": {
              return ".bmp";
            }
            case "image/avif": {
              return ".avif";
            }
            default: {
              return "";
            }
          }
        };

        const zip = new JSZip(),
          usedNames = new Set<string>();

        succeeded.forEach(({ blob, url }, index) => {
          let base = url.split("?")[0].split("/").pop() || "";
          try {
            base = decodeURIComponent(base);
          } catch {
            // keep raw base name when decoding fails
          }
          base = base.replace(/[\\/:*?"<>|]/g, "_").trim();

          let ext = base.includes(".") ? base.slice(base.lastIndexOf(".")) : "";
          if (ext.length > 5) ext = "";
          const mimeExt = extFromMime(blob.type);
          if (!ext && mimeExt) ext = mimeExt;
          if (!ext) ext = ".jpg";

          let name = base || `image-${index + 1}${ext}`;
          if (!name.includes(".")) name += ext;

          let candidate = name,
            counter = 1;
          while (usedNames.has(candidate)) {
            counter += 1;
            candidate = name.includes(".")
              ? name.replace(/(\.[^.]+)$/, `-${counter}$1`)
              : `${name}-${counter}`;
          }
          usedNames.add(candidate);
          zip.file(candidate, blob);
        });

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const safeTitle = title.replace(/[\\/:*?"<>|]/g, "_").trim() || "images";
        saveAs(
          new File([zipBlob], `${safeTitle}.zip`, {
            type: "application/zip",
          }),
        );

        toaster.create({
          description: "بدء التحميل بنجاح!",
          type: "success",
        });

        if (failedCount > 0) {
          toaster.create({
            description: `فشل تحميل بعض الصور.`,
            type: "error",
          });
        }
      } catch {
        toaster.create({
          description: `حدث خطأ في عملية التحميل، أعد المحاولة رجاءً`,
          type: "error",
        });
      } finally {
        setIsDownloading(false);
      }
    },
    downloadFile = async () => {
      const src = downloadSrc;
      if (!src || isDownloading) return;
      setIsDownloading(true);
      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error(`status-${response.status}`);
        const blob = await response.blob();
        saveAs(
          new File([blob], downloadName, {
            type: blob.type || "application/octet-stream",
          }),
        );
        toaster.create({
          description: "بدء التحميل بنجاح!",
          type: "success",
        });
      } catch {
        // CORS-blocked (or offline) hosts can't be `fetch`ed: fall back to a
        // plain anchor with the `download` attribute. Same-origin and Firefox
        // save the file; Chrome opens it in a new tab for cross-origin URLs.
        try {
          const anchor = document.createElement("a");
          anchor.href = src;
          anchor.download = downloadName;
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer";
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          toaster.create({
            description: "بدء التحميل بنجاح!",
            type: "success",
          });
        } catch {
          window.open(src, "_blank", "noopener,noreferrer");
        }
      } finally {
        setIsDownloading(false);
      }
    },
    // Each action has its own visibility. View loading / failure never hides
    // Download or External-open: a broken viewer still leaves the other two
    // usable, and vice versa. `pending` counts as visible: a slow probe must
    // not hide a working button (e.g. Drive preview URLs); only a definite
    // `failed` hides. Everything additionally waits for `viewerSettled`.
    showExternal = isExternalVisible({ type, viewerSettled, externalStatus }),
    showDownload = isDownloadVisible({
      type,
      viewerSettled,
      downloadStatus,
      imagesLoaded: imagesStatus.isLoaded,
      imagesAllFailed: imagesStatus.allFailed,
    }),
    showHeaderFlex = showExternal || showDownload;

  // biome-ignore lint/correctness/useExhaustiveDependencies: one-time overlay content init guarded by ref
  useEffect(() => {
    if (isStart.current) return;
    isStart.current = true;
    let cancelled = false;
    const setDownload = (s: ActionStatus) => {
      if (!cancelled) setDownloadStatus(s);
    };
    const setExternal = (s: ActionStatus) => {
      if (!cancelled) setExternalStatus(s);
    };
    // Fallback: some viewers never clear global loading on failure, so the
    // header would stay hidden forever. Settle anyway after 12s.
    const settleTimer = setTimeout(() => {
      if (!cancelled) setViewerSettled(true);
    }, 12_000);

    const startProbes = () => {
      if (type === "images") {
        if (resources.length === 0) {
          setDownload("failed");
        } else {
          Promise.all(resources.map((url) => probeUrlReachable(url)))
            .then((results) => {
              setDownload(results.some(Boolean) ? "ok" : "failed");
            })
            .catch(() => {
              // probeUrlReachable never rejects (false on every path), but a
              // rejection must still map to "failed", like a negative probe.
              setDownload("failed");
            });
        }
        return;
      }
      const plan = planProbes({ type, isArchiveDownload, drivePair, downloadSrc, externalUrl });
      if (plan.sharedProbe) {
        // Same underlying file: one network check, two independent statuses.
        probeUrlReachable(downloadSrc)
          .then((ok) => {
            setDownload(ok ? "ok" : "failed");
            setExternal(ok ? "ok" : "failed");
          })
          .catch(() => {
            setDownload("failed");
            setExternal("failed");
          });
        return;
      }
      if (plan.needDownloadProbe) {
        probeUrlReachable(downloadSrc)
          .then((ok) => {
            setDownload(ok ? "ok" : "failed");
          })
          .catch(() => {
            setDownload("failed");
          });
      }
      if (plan.needExternalProbe) {
        probeUrlReachable(externalUrl)
          .then((ok) => {
            setExternal(ok ? "ok" : "failed");
          })
          .catch(() => {
            setExternal("failed");
          });
      }
    };
    const startViewer = () => {
      if (type === "images") {
        setComponent(
          <Carousel resources={resources} onStatus={(status) => setImagesStatus(status)} />,
        );
        return;
      }
      if (drivePair || isArchivePdf) {
        // Drive renders native elements/iframe; Archive PDFs render the file
        // itself in the browser viewer iframe. Neither needs the `fetch`-based
        // probing below (Archive file servers send no CORS headers, so that
        // `fetch` would always fail).
        setContent();
        return;
      }
      const src = viewSrc;
      verifyResources(type, [src])
        .then(async (codes) => {
          if (codes[0].status === 0) {
            try {
              const resource = await fetch(src);
              if (!resource.ok) {
                errors.current.push([resource.status]);
                return;
              }
            } catch {
              errors.current.push([500]);
            } finally {
              setTimeout(() => {
                setContent();
              }, 50);
            }
          } else {
            setContent();
          }
        })
        .catch(() => {
          // verifyResources never rejects (Promise.all over never-rejecting
          // probes), but a rejection must render the error panel, like a
          // failed fetch.
          errors.current.push([500]);
          setContent();
        });
    };
    // Independent Download / External-open probes (network-level only).
    // View keeps its own renderer-level check below; results never cross.
    startProbes();
    startViewer();
    return () => {
      cancelled = true;
      clearTimeout(settleTimer);
    };
  }, []);

  // Working buttons appear after viewer loading ends (success or failure).
  // `sawLoading` avoids settling instantly when global loading is still
  // false at mount, before the open-dispatch sets it true.
  useEffect(() => {
    if (loading) {
      sawLoading.current = true;
      return;
    }
    if (sawLoading.current) setViewerSettled(true);
  }, [loading]);

  useEffect(() => {
    if (type === "images" && imagesStatus.isLoaded) setViewerSettled(true);
  }, [type, imagesStatus.isLoaded]);

  useEffect(() => {
    if (rest.open) {
      document.title = title;
    } else {
      document.title = `${TITLE} | ${subject}`;
    }
  }, [rest.open, title, subject]);

  return (
    <Dialog.Root size={{ base: "full", md: "cover" }} {...rest}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content dir="rtl" minH={"100%"} h={"auto"}>
            <Dialog.Header userSelect={"none"}>
              <Grid
                templateColumns={"auto 1fr auto"}
                w={"100%"}
                alignItems={"center"}
                justifyItems={"center"}
                columnGap={"15px"}
              >
                <Flex gap={"10px"} visibility={showHeaderFlex ? "visible" : "hidden"}>
                  <Show when={showExternal}>
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      as={Link}
                      variant="outline"
                      //@ts-expect-error target is working here
                      target="_blank"
                      href={externalUrl}
                      colorPalette={color}
                    >
                      <TbExternalLink />
                    </Button>
                  </Show>
                  <Show when={showDownload}>
                    <Show
                      when={isArchiveDownload}
                      fallback={
                        <Button
                          size={{ base: "xs", md: "sm" }}
                          variant="outline"
                          colorPalette={color}
                          loading={isDownloading}
                          onClick={type === "images" ? download : downloadFile}
                        >
                          <MdFileDownload />
                        </Button>
                      }
                    >
                      <Button
                        size={{ base: "xs", md: "sm" }}
                        as={Link}
                        variant="outline"
                        //@ts-expect-error anchor props are valid at runtime through the Link polymorph
                        href={downloadSrc}
                        download={downloadName}
                        colorPalette={color}
                      >
                        <MdFileDownload />
                      </Button>
                    </Show>
                  </Show>
                </Flex>
                <Dialog.Title color={color}>{title}</Dialog.Title>
                <Dialog.CloseTrigger asChild position={"static"}>
                  <CloseButton size={{ base: "xs", md: "sm" }} colorPalette={color} />
                </Dialog.CloseTrigger>
              </Grid>
            </Dialog.Header>
            <Dialog.Body
              spaceY="4"
              position={"relative"}
              overflowX={"hidden"}
              overflowY={loading ? "hidden" : "auto"}
            >
              {description && <Dialog.Description>{description}</Dialog.Description>}
              <ViewerErrorBoundary resetKey={`${type}-${viewSrc}`}>
                <Suspense fallback={null}>{component}</Suspense>
              </ViewerErrorBoundary>
              <Presence
                present={loading}
                animationName={{ _closed: "fade-out" }}
                animationDuration="moderate"
                position={"absolute"}
                top={-6}
                left={0}
                zIndex={25}
                backgroundColor={"bg.panel"}
                right={0}
                bottom={0}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                <Spinner
                  size={"lg"}
                  color="colorPalette.400"
                  borderWidth="4px"
                  colorPalette={color}
                />
              </Presence>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
});

export default resource;
