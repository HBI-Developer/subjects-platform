import { useMediaQuery } from "@chakra-ui/react";

export default function useScreenState() {
  const [isMobile] = useMediaQuery(["(max-width: 768px)"], {
      ssr: false,
      fallback: [false],
    }),
    [isTablet] = useMediaQuery(["(min-width: 769px)"], {
      ssr: false,
      fallback: [false],
    }),
    [isDesktop] = useMediaQuery(["(min-width: 993px)"], {
      ssr: false,
      fallback: [false],
    }),
    [isWide] = useMediaQuery(["(min-width: 1201px)"], {
      ssr: false,
      fallback: [false],
    }),
    [isVerticalScreen] = useMediaQuery(["(orientation: portrait)"], {
      ssr: false,
      fallback: [false],
    });

  return {
    isMobile,
    isVertical: isMobile ? isVerticalScreen : false,
    isTablet: !isDesktop && isTablet,
    isDesktop: !isWide && isDesktop,
    isWide,
  };
}
