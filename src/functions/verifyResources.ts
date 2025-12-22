type VideoTarget = "video" | "iframe";

interface VerifyResult {
  url: string;
  status: number;
}

function resolveVideoTarget(url: string): VideoTarget {
  const platformHosts = [
    "youtube.com",
    "youtu.be",
    "vimeo.com",
    "dailymotion.com",
    "twitch.tv",
    "facebook.com",
    "fb.watch",
    "streamable.com",
    "wistia.com",
    "loom.com",
  ];

  const videoExts = [".mp4", ".webm", ".ogg", ".ogv", ".mov", ".m4v"];

  try {
    const u = new URL(url.toLowerCase());

    if (platformHosts.some((h) => u.hostname.includes(h))) {
      return "iframe";
    }

    if (videoExts.some((ext) => u.pathname.endsWith(ext))) {
      return "video";
    }

    return "iframe";
  } catch {
    return "iframe";
  }
}

export default function verifyResources(
  type: ResourceType,
  resources: string[],
  timeout = 7000
): Promise<VerifyResult[]> {
  return Promise.all(
    resources.map((url) => {
      return new Promise<VerifyResult>((resolve) => {
        let el: HTMLElement;
        let successEvents: string[] = [];
        let settled = false;

        const finish = (status: number) => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve({ url, status });
        };

        const success = () => finish(200);
        const failure = () => finish(0);

        // ---------- اختيار العنصر ----------
        if (type === "video") {
          const target = resolveVideoTarget(url);

          if (target === "video") {
            const v = document.createElement("video");
            v.preload = "metadata";
            v.muted = true;
            v.src = url;
            el = v;
            successEvents = ["loadeddata", "canplay", "canplaythrough"];
          } else {
            const f = document.createElement("iframe");
            f.src = url;
            f.allow =
              "accelerometer; autoplay; encrypted-media; picture-in-picture";
            f.allowFullscreen = true;
            f.referrerPolicy = "no-referrer";
            el = f;
            successEvents = ["load"];
          }
        } else if (type === "pdf") {
          const o = document.createElement("object");
          o.type = "application/pdf";
          o.data = url;
          o.width = "0";
          o.height = "0";
          el = o;
          successEvents = ["load"];
        } else if (type === "images") {
          const i = document.createElement("img");
          i.src = url;
          el = i;
          successEvents = ["load"];
        } else {
          // audio
          const a = document.createElement("audio");
          a.preload = "metadata";
          a.muted = true;
          a.src = url;
          el = a;
          successEvents = ["loadeddata", "canplay"];
        }

        // ---------- الربط ----------
        successEvents.forEach((e) =>
          el.addEventListener(e, success, { once: true })
        );

        el.addEventListener("error", failure, { once: true });
        setTimeout(failure, timeout);

        el.style.display = "none";
        document.body.appendChild(el);

        // ---------- تنظيف ----------
        function cleanup() {
          successEvents.forEach((e) => el.removeEventListener(e, success));
          el.removeEventListener("error", failure);
          el.remove();
        }
      });
    })
  );
}
