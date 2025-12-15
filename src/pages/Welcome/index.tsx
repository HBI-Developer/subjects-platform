import navigate from "@/functions/navigate";
import type { RootState } from "@/store";
import { Box, Button, Center, Heading } from "@chakra-ui/react";
import { BiChevronLeft } from "react-icons/bi";
import { useSelector } from "react-redux";

export default function Welcome() {
  const color = useSelector((state: RootState) => state.color.value);
  return (
    <Center
      columnGap={"10px"}
      position={"absolute"}
      backgroundColor={"bg"}
      top={0}
      bottom={0}
      left={0}
      right={0}
    >
      <Box>
        <Heading size="2xl" paddingInlineEnd={"2rem"}>
          منصة
        </Heading>
        <Heading
          color={color}
          size="2xl"
          paddingInlineStart={"2rem"}
          transition={".2s color ease-in-out"}
        >
          جامعية
        </Heading>
      </Box>
      <Button
        colorPalette={color}
        variant={"solid"}
        size={"md"}
        onClick={() => {
          navigate(0.5, 1.5);
        }}
      >
        <BiChevronLeft />
      </Button>
    </Center>
  );
}
