import { PDFViewer } from "@/components";
import type { RootState } from "@/store";
import {
  Button,
  CloseButton,
  createOverlay,
  Dialog,
  Grid,
  Portal,
  Presence,
  Spinner,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";

interface Props {
  title: string;
  description?: string;
}

const resource = createOverlay<Props>(({ title, description, ...rest }) => {
  const color = useSelector((state: RootState) => state.color.value);

  return (
    <Dialog.Root size={{ base: "full", md: "cover" }} {...rest}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content dir="rtl" minH={"100%"} h={"auto"}>
            <Dialog.Header userSelect={"none"}>
              <Grid
                templateColumns={"auto 1fr auto"}
                w={"100%"}
                alignItems={"center"}
                justifyItems={"center"}
                columnGap={"15px"}
              >
                <Button
                  variant="outline"
                  size={{ base: "xs", md: "sm" }}
                  colorPalette={color}
                >
                  Click
                </Button>
                <Dialog.Title color={color}>{title}</Dialog.Title>
                <Dialog.CloseTrigger asChild position={"static"}>
                  <CloseButton
                    size={{ base: "xs", md: "sm" }}
                    colorPalette={color}
                  />
                </Dialog.CloseTrigger>
              </Grid>
            </Dialog.Header>
            <Dialog.Body spaceY="4" position={"relative"}>
              {description && (
                <Dialog.Description>{description}</Dialog.Description>
              )}
              <PDFViewer />
              <Presence
                present={false}
                animationName={{ _closed: "fade-out" }}
                animationDuration="moderate"
                position={"absolute"}
                top={0}
                left={0}
                right={0}
                bottom={0}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                <Spinner
                  size={"lg"}
                  color="colorPalette.400"
                  borderWidth="4px"
                  colorPalette={color}
                />
              </Presence>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
});

export default resource;
