import { Box, Button, Center, Flex, Heading, Image, Text } from "@chakra-ui/react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import getErrorMessage from "@/functions/geterrormessage";
import useImagesTracker from "@/hooks/useimagestracker";
import useScreenState from "@/hooks/usescreenstate";
import { setResourceLoading } from "@/store/slice/loading";

interface Props {
  readonly resources: Array<string>;
  readonly onStatus?: (status: { isLoaded: boolean; allFailed: boolean }) => void;
}

function getSlidesToShow(isMobile: boolean, isVertical: boolean, isTablet: boolean): number {
  if (isMobile && isVertical) return 1;
  if ((isMobile && !isVertical) || isTablet) return 2;
  return 3;
}

export default function Carousel({ resources, onStatus }: Props) {
  const { isMobile, isVertical, isTablet } = useScreenState();
  const dispatch = useDispatch();
  const slidesToShow = getSlidesToShow(isMobile, isVertical, isTablet),
    slidesToScroll = slidesToShow,
    [emblaRef, emblaApi] = useEmblaCarousel({
      direction: "rtl",
      loop: true,
      align: "start",
      slidesToScroll,
    }),
    [selectedIndex, setSelectedIndex] = useState(0),
    [scrollSnaps, setScrollSnaps] = useState<Array<number>>([]),
    { tracker, isLoaded, failures } = useImagesTracker();

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // Sync with the Embla external system: initial snap list plus
    // subscriptions for select/reInit updates.
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-init is intentionally tied to the visible-slide count
  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, slidesToShow]);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        dispatch(setResourceLoading(false));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, dispatch]);

  useEffect(() => {
    onStatus?.({
      isLoaded,
      allFailed: isLoaded && failures.length > 0 && failures.length >= resources.length,
    });
  }, [isLoaded, failures, resources.length, onStatus]);

  return (
    <Box ref={tracker}>
      <Box ref={emblaRef} overflow="hidden" dir="rtl">
        <Flex>
          {resources.map((resource) => {
            const image = failures.find((f) => f.url === resource),
              { code, message } = getErrorMessage(image?.code || 500);

            return (
              <Box
                key={resource}
                flex={`0 0 calc(100% / ${slidesToShow})`}
                minWidth={0}
                aspectRatio={4 / 3}
                paddingInline="10px"
                _focus={{ outline: "none" }}
              >
                {image ? (
                  <Center boxSize="100%" flexDirection="column" rowGap="5px" backgroundColor="bg">
                    <Heading>{code}</Heading>
                    <Text>{message}</Text>
                  </Center>
                ) : (
                  <Image boxSize="100%" objectFit="contain" backgroundColor="#000" src={resource} />
                )}
              </Box>
            );
          })}
        </Flex>
      </Box>
      <Flex justifyContent="center" alignItems="center" gap="10px" mt="10px">
        <Button
          size="xs"
          variant="ghost"
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Previous slides"
        >
          {"<"}
        </Button>
        <Flex gap="5px">
          {scrollSnaps.map((snap, index) => (
            <Box
              key={snap}
              as="button"
              boxSize="8px"
              borderRadius="full"
              backgroundColor={index === selectedIndex ? "purple.600" : "gray.300"}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide group ${index + 1}`}
            />
          ))}
        </Flex>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Next slides"
        >
          {">"}
        </Button>
      </Flex>
    </Box>
  );
}
