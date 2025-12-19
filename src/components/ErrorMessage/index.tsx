import { httpStatusMessages } from "@/constants";
import { Center, Heading, HStack, Separator, Text } from "@chakra-ui/react";

interface Props {
  code: number;
}

export default function ErrorMessage({ code }: Props) {
  return (
    <Center
      position={"absolute"}
      zIndex={6}
      backgroundColor={"bg"}
      userSelect={"none"}
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
        <Text>{httpStatusMessages.get(code)}</Text>
      </HStack>
    </Center>
  );
}
