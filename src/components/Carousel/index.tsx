import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useScreenState from "@/hooks/useScreenState";
import { Box, Image } from "@chakra-ui/react";

const resources = [
  "https://images.unsplash.com/photo-1483347752412-bf2e183b30a9",
  "https://images.unsplash.com/photo-1531366936337-7c912a4589a7",
  "https://images.unsplash.com/photo-1564634293881-807185c74291",
  "https://images.unsplash.com/photo-1574169208507-84376144848b",
];

export default function Carousel() {
  const { isMobile, isVertical, isTablet } = useScreenState();
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
  };
  return (
    <Slider {...settings}>
      {resources.map((resource) => (
        <Box
          aspectRatio={4 / 3}
          paddingInline={"10px"}
          _focus={{ outline: "none" }}
        >
          <Image
            boxSize={"100%"}
            objectFit={"contain"}
            backgroundColor={"#000"}
            src={resource}
          />
        </Box>
      ))}
    </Slider>
  );
}
