import { useMediaQuery } from "@chakra-ui/react";

export default function useScreenState() {
  const [isMobile] = useMediaQuery(["(max-width: 768px)"], {
      ssr: false,
      fallback: [false],
    }),
    [isVerticalScreen] = useMediaQuery(["(orientation: portrait)"], {
      ssr: false,
      fallback: [false],
    });

  return { isMobile, isVertical: isMobile ? isVerticalScreen : false };
}
