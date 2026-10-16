import { Box, Show } from "@chakra-ui/react";
import { NeutralVideoSkin, Video, VideoPlayer as VjsPlayer } from "@videojs/react/video";
import "@videojs/react/video/neutral-skin.css";
import ReactPlayer from "react-player";
import { useDispatch } from "react-redux";
import isPlatformVideo from "@/helpers/isplatformvideo";
import { setResourceLoading } from "@/store/slice/loading";

interface Props {
  readonly src: string;
}

export default function VideoPlayer({ src }: Props) {
  const platform = isPlatformVideo(src),
    dispatch = useDispatch(),
    onReady = () => {
      dispatch(setResourceLoading(false));
    };

  return (
    <Box
      aspectRatio={16 / 9}
      marginInline={"auto"}
      width={{ base: "100%", sm: "75%", md: "65%", lg: "50%" }}
    >
      <Show
        when={!platform}
        fallback={
          <ReactPlayer
            src={src}
            width={"100%"}
            height={"100%"}
            onLoadedData={onReady}
            onLoadedMetadata={onReady}
            onError={onReady}
          />
        }
      >
        <VjsPlayer key={src}>
          <NeutralVideoSkin style={{ aspectRatio: "16 / 9", width: "100%" }}>
            <Video
              src={src}
              playsInline
              preload="metadata"
              onLoadedData={onReady}
              onLoadedMetadata={onReady}
              onError={onReady}
              onCanPlay={onReady}
            />
          </NeutralVideoSkin>
        </VjsPlayer>
      </Show>
    </Box>
  );
}
