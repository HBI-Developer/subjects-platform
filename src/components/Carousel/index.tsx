import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useScreenState from "@/hooks/useScreenState";
import { Box, Center, Heading, Image, Text } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import { setResourceLoading } from "@/store/slice/loading";
import getErrorMessage from "@/functions/getErrorMessage";

interface Props {
  resources: Array<string>;
  errors?: Array<[number, number]>;
}

export default function Carousel({ resources, errors = [] }: Props) {
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
    onReady = () => {
      dispatch(setResourceLoading(false));
    };

  return (
    <Slider {...settings} onInit={onReady}>
      {resources.map((resource, index) => {
        const error = errors.find((v) => v[0] === index);
        return (
          <Box
            aspectRatio={4 / 3}
            paddingInline={"10px"}
            _focus={{ outline: "none" }}
          >
            {error ? (
              <Center
                boxSize={"100%"}
                flexDirection={"column"}
                rowGap={"5px"}
                backgroundColor={"bg"}
              >
                <Heading>{error[1]}</Heading>
                <Text>{getErrorMessage(error[1])}</Text>
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
  );
}
