import type { RootState } from "@/store";
import {
  Card,
  Center,
  Flex,
  Grid,
  Icon,
  Text,
  type CardRootProps,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";

type Props = CardRootProps & {
  title: string;
  icon: React.ReactNode;
};

export default function Panel({ icon, title, ...props }: Props) {
  const color = useSelector((state: RootState) => state.color.value);

  return (
    <Card.Root
      variant={"subtle"}
      userSelect={"none"}
      backgroundColor={{
        base: "#202020",
        _active: "#1f1f1f",
        _hover: "#222",
      }}
      w={{ base: "95%", md: "65%", lg: "50%" }}
      cursor={{ base: "pointer", _active: "grabbing" }}
      transition={".2s background-color ease-in-out"}
      {...props}
    >
      <Card.Body p={0}>
        <Grid templateColumns={"auto 1fr"}>
          <Center paddingInline={"1.5rem"} backgroundColor={"#00000010"}>
            <Icon color={color}>{icon}</Icon>
          </Center>
          <Flex h={"100px"} alignItems={"center"} paddingInline={"1rem"}>
            <Text color={color}>{title}</Text>
          </Flex>
        </Grid>
      </Card.Body>
    </Card.Root>
  );
}
