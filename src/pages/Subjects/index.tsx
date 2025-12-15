import { Panel } from "@/components";
import navigate from "@/functions/navigate";
import { Flex } from "@chakra-ui/react";
import { BiAtom } from "react-icons/bi";

export default function Subjects() {
  return (
    <Flex
      width={"100%"}
      flexDirection={"column"}
      rowGap={"15px"}
      h={"100%"}
      p={"1rem"}
      className="custom-scroll"
      overflowY={"auto"}
      alignItems={{ base: "center", md: "flex-start" }}
    >
      {Array.from({ length: 15 }).map((_, i) => {
        return (
          <Panel
            key={i}
            title={"موضوع آخر"}
            icon={<BiAtom />}
            onClick={() => {
              navigate(1.5, 2.5);
            }}
          />
        );
      })}
    </Flex>
  );
}
