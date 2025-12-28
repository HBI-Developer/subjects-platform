import getErrorMessage from "@/functions/getErrorMessage";
import useScreenState from "@/hooks/useScreenState";
import type { RootState } from "@/store";
import {
  Button,
  Center,
  Heading,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";

interface Props {
  code: number | string;
  retry: () => void;
}

export default function ErrorMessage({ code: errorCode, retry }: Props) {
  const color = useSelector((state: RootState) => state.color.value),
    { isMobile, isVertical } = useScreenState(),
    { code, message } = getErrorMessage(errorCode);

  return (
    <Center
      position={"absolute"}
      zIndex={6}
      backgroundColor={"bg"}
      userSelect={"none"}
      flexDirection={"column"}
      top={0}
      left={0}
      bottom={0}
      right={0}
    >
      <Stack
        flexDirection={isMobile && isVertical ? "column" : "row"}
        columnGap={0}
        rowGap={0}
        paddingInline={"1em"}
      >
        <Heading size={"3xl"}>{code}</Heading>
        <Separator
          orientation={isMobile && isVertical ? "horizontal" : "vertical"}
          visibility={isMobile && isVertical ? "hidden" : "visible"}
          alignSelf={"stretch"}
          marginInline={"5px 10px"}
          size={"md"}
          color={"white"}
        />
        <Text>{message}</Text>
      </Stack>
      <Button
        colorPalette={color}
        variant={"outline"}
        size={"md"}
        marginTop={"10px"}
        onClick={retry}
      >
        إعادة المحاولة
      </Button>
    </Center>
  );
}
