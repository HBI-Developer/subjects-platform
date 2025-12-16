import { Panel } from "@/components";
import navigate from "@/functions/navigate";
import type { RootState } from "@/store";
import { Flex, Heading } from "@chakra-ui/react";
import { BiAtom, BiChevronRight } from "react-icons/bi";
import { useSelector } from "react-redux";
import { Resource } from "..";

export default function Resources() {
  const color = useSelector((state: RootState) => state.color.value);

  return (
    <Flex
      width={"100%"}
      flexDirection={"column"}
      rowGap={"15px"}
      h={"100%"}
      p={"1rem"}
      paddingRight={{ base: "1rem", md: "1.2rem" }}
      className="custom-scroll"
      overflowY={"auto"}
      alignItems={{ base: "center", md: "flex-start" }}
    >
      <Flex
        columnGap={"10px"}
        alignItems={"center"}
        userSelect={"none"}
        cursor={"pointer"}
        alignSelf={"flex-start"}
        onClick={() => navigate(2.5, 1.5)}
        transition={".2s color ease-in-out"}
        color={{ base: color, _hover: `${color}.500` }}
      >
        <BiChevronRight size={30} />
        <Heading>موضوع</Heading>
      </Flex>
      {Array.from({ length: 15 }).map((_, i) => {
        return (
          <Panel
            key={i}
            title={"موضوع آخر"}
            icon={<BiAtom />}
            onClick={() =>
              Resource.open("r", {
                title: "موضوع آخر",
              })
            }
          />
        );
      })}
    </Flex>
  );
}
