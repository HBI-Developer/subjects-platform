import getErrorMessage from "@/functions/getErrorMessage";
import type { RootState } from "@/store";
import {
  Button,
  Center,
  Heading,
  HStack,
  Separator,
  Text,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";

interface Props {
  code: number | string;
  retry: () => void;
}

export default function ErrorMessage({ code: errorCode, retry }: Props) {
  const color = useSelector((state: RootState) => state.color.value),
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
      <HStack columnGap={0} paddingInline={"1em"}>
        <Heading size={"3xl"}>{code}</Heading>
        <Separator
          orientation={"vertical"}
          alignSelf={"stretch"}
          marginInline={"5px 10px"}
          size={"md"}
          color={"white"}
        />
        <Text>{message}</Text>
      </HStack>
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
