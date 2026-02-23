import React, { useState, useEffect } from "react";
import { Box, Center, Text, Heading } from "@chakra-ui/react";
import getErrorMessage from "@/functions/getErrorMessage";
import { useDispatch } from "react-redux";
import { setResourceLoading } from "@/store/slice/loading";
import isOfficeUrl from "@/helpers/isOfficeUrl";

interface Props {
  src: string;
}

const OfficeViewer: React.FC<Props> = ({ src }) => {
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      isOfficeUrl(src).then((res) => {
        if (!res && typeof res === "number") {
          setErrorStatus(415);
        }

        dispatch(setResourceLoading(false));
      });
    }

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
