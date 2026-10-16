import { Box, Center, Heading, Text } from "@chakra-ui/react";
import type React from "react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import getErrorMessage from "@/functions/geterrormessage";
import isOfficeUrl from "@/helpers/isofficeurl";
import { setResourceLoading } from "@/store/slice/loading";

interface Props {
  readonly src: string;
}

const OfficeViewer: React.FC<Props> = ({ src }) => {
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;
    void isOfficeUrl(src)
      .then((res) => {
        // Guard async completion against unmount (isMounted is set false in cleanup).
        if (!isMounted) return;
        if (!res && typeof res === "number") {
          setErrorStatus(415);
        }

        dispatch(setResourceLoading(false));
      })
      .catch(() => {
        // isOfficeUrl never rejects today (all paths caught internally), but
        // if it ever does, clear loading so the spinner cannot hang forever.
        if (!isMounted) return;
        dispatch(setResourceLoading(false));
      });

    return () => {
      isMounted = false;
    };
  }, [src, dispatch]);

  if (errorStatus) {
    const { code, message } = getErrorMessage(errorStatus);
    return (
      <Center
        width={{ base: "100%", sm: "75%", md: "65%", lg: "50%" }}
        aspectRatio={16 / 9}
        flexDirection={"column"}
        rowGap={"5px"}
        backgroundColor={"bg"}
        marginInline={"auto"}
      >
        <Heading>{code}</Heading>
        <Text>{message}</Text>
      </Center>
    );
  }

  const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`;

  return (
    <Box
      flex="1"
      minHeight="0"
      position="absolute"
      top="0"
      bottom="0"
      left="0"
      right="0"
      padding={"10px 15px"}
      overflow="hidden"
    >
      <iframe
        src={viewerUrl}
        width="100%"
        height="100%"
        title="Office Document Viewer"
        style={{ border: "none", width: "100%", height: "100%" }}
      />
    </Box>
  );
};

export default OfficeViewer;
