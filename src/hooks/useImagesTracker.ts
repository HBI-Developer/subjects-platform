import { useEffect, useRef, useState } from "react";

export default function useImagesTracker() {
  const tracker = useRef<any>(null),
    isStarted = useRef(false),
    images = useRef<Array<HTMLImageElement>>([]),
    [failures, setFailures] = useState<
      Array<{ code: number; image: HTMLImageElement; url: string }>
    >([]),
    [finish, setFinish] = useState<Array<string>>([]),
    [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isStarted.current) return;
    isStarted.current = true;
    images.current = tracker.current?.querySelectorAll("img") || [];

    const increaseCounter = (image: string) => {
      if (!finish.includes(image)) setFinish((prev) => [...prev, image]);
    };

    [].forEach.call(images.current, (image: HTMLImageElement) => {
      const onFinish = () => {
          increaseCounter(image.src);
        },
        onError = async () => {
          const error = { image, code: 0, url: image.src };
          try {
            const url = await fetch(image.src);
            error.code = url.status;
          } catch (_) {
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
