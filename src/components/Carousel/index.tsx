import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useScreenState from "@/hooks/useScreenState";
import { Box, Center, Heading, Image, Text } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import { setResourceLoading } from "@/store/slice/loading";
import getErrorMessage from "@/functions/getErrorMessage";
import useImagesTracker from "@/hooks/useImagesTracker";

interface Props {
  resources: Array<string>;
}

export default function Carousel({ resources }: Props) {
  const { isMobile, isVertical, isTablet } = useScreenState();
  const dispatch = useDispatch();
  const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      rtl: true,
      slidesToShow:
        isMobile && isVertical
          ? 1
          : (isMobile && !isVertical) || isTablet
          ? 2
          : 3,
      slidesToScroll:
        isMobile && isVertical
          ? 1
          : (isMobile && !isVertical) || isTablet
          ? 2
          : 3,
    },
    { tracker, isLoaded, failures } = useImagesTracker();

  return (
    <Box ref={tracker}>
      <Slider {...settings}>
        {resources.map((resource, index) => {
          const image = failures.find((f) => f.url === resource),
            { code, message } = getErrorMessage(image?.code || 500);

          if (isLoaded && index === resources.length - 1) {
            setTimeout(() => {
              dispatch(setResourceLoading(false));
            }, 200);
          }

          return (
            <Box
              aspectRatio={4 / 3}
              paddingInline={"10px"}
              _focus={{ outline: "none" }}
            >
              {image ? (
                <Center
                  boxSize={"100%"}
                  flexDirection={"column"}
                  rowGap={"5px"}
                  backgroundColor={"bg"}
                >
                  <Heading>{code}</Heading>
                  <Text>{message}</Text>
                </Center>
              ) : (
                <Image
                  boxSize={"100%"}
                  objectFit={"contain"}
                  backgroundColor={"#000"}
                  src={resource}
                />
              )}
            </Box>
          );
        })}
      </Slider>
    </Box>
  );
}
