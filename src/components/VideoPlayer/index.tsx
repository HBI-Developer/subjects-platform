import { Box, Show } from "@chakra-ui/react";
import ReactPlayer from "react-player";
import isPlatform from "./functions/isPlatform";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";

interface Props {
  src: string;
}

export default function VideoPlayer({ src }: Props) {
  const platform = isPlatform(src);

  return (
    <Box
      aspectRatio={16 / 9}
      marginInline={"auto"}
      width={{ base: "100%", sm: "75%", md: "65%", lg: "50%" }}
    >
      <Show
        when={!platform}
        fallback={<ReactPlayer src={src} width={"100%"} height={"100%"} />}
      >
        <Plyr
          source={{ sources: [{ src }], type: "video" }}
          width={"100%"}
          height={"100%"}
        />
      </Show>
    </Box>
  );
}
