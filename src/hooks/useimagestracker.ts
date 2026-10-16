import { useEffect, useRef, useState } from "react";

export default function useImagesTracker() {
  const tracker = useRef<HTMLDivElement | null>(null),
    isStarted = useRef(false),
    images = useRef<Array<HTMLImageElement>>([]),
    [failures, setFailures] = useState<
      Array<{ code: number; image: HTMLImageElement; url: string }>
    >([]),
    [finish, setFinish] = useState<Array<string>>([]),
    [isLoaded, setIsLoaded] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: one-time DOM scan guarded by ref; closure over initial finish state is intentional
  useEffect(() => {
    if (isStarted.current) return;
    isStarted.current = true;
    images.current = Array.from(tracker.current?.querySelectorAll("img") ?? []);

    const increaseCounter = (image: string) => {
      if (!finish.includes(image)) setFinish((prev) => [...prev, image]);
    };

    images.current.forEach((image: HTMLImageElement) => {
      const onFinish = () => {
          increaseCounter(image.src);
        },
        onError = async () => {
          const error = { image, code: 0, url: image.src };
          try {
            const url = await fetch(image.src);
            error.code = url.status;
          } catch {
            // Network/CORS probe failed -- mark as 500 so carousel shows error panel (intentional).
            error.code = 500;
          }

          onFinish();
          setFailures((prev) => [...prev, error]);
        };

      if (image.complete) {
        if (image.naturalHeight && image.naturalWidth) onFinish();
        else onError();
      } else {
        image.addEventListener("load", onFinish);
        image.addEventListener("loadeddata", onFinish);
        image.addEventListener("loadedmetadata", onFinish);
        image.addEventListener("error", onError);
      }
    });
  }, []);

  useEffect(() => {
    if (finish.length === images.current.length) setIsLoaded(true);
  }, [finish]);

  return { tracker, isLoaded, failures };
}
