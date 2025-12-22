import { AudioPlayer, Carousel, PDFViewer, VideoPlayer } from "@/components";
import getErrorMessage from "@/functions/getErrorMessage";
import verifyResources from "@/functions/verifyResources";
import type { RootState } from "@/store";
import { setResourceLoading } from "@/store/slice/loading";
import {
  Button,
  Center,
  CloseButton,
  createOverlay,
  Dialog,
  Grid,
  Heading,
  Link,
  Portal,
  Presence,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { TbExternalLink } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";

interface Props {
  title: string;
  type: ResourceType;
  description?: string;
  resources: Array<string>;
}

const resource = createOverlay<Props>(
  ({ title, description, type, resources, ...rest }) => {
    const color = useSelector((state: RootState) => state.color.value),
      loading = useSelector((state: RootState) => state.loading.resource),
      dispatch = useDispatch(),
      errors = useRef<Array<[number] | [number, number]>>([]),
      [component, setComponent] = useState<React.JSX.Element>(<></>),
      isStart = useRef(false),
      setContent = () => {
        if (errors.current.length) {
          const { code, message } = getErrorMessage(errors.current[0][0]);

          setComponent(
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

          dispatch(setResourceLoading(false));
        } else {
          switch (type) {
            case "pdf": {
              setComponent(<PDFViewer src={resources[0]} />);
              break;
            }
            case "audio": {
              setComponent(<AudioPlayer src={resources[0]} />);
              break;
            }
            case "video": {
              setComponent(<VideoPlayer src={resources[0]} />);
              break;
            }
          }
        }
      };

    useEffect(() => {
      if (isStart.current) return;
      isStart.current = true;
      if (type === "images") {
        setComponent(<Carousel resources={resources} />);
      } else {
        const src = resources[0];
        verifyResources(type, [src]).then(async (codes) => {
          if (codes[0].status === 0) {
            try {
              const resource = await fetch(src);

              console.log(resource.status);

              if (!resource.ok) {
                errors.current.push([resource.status]);

                return;
              }
            } catch (_) {
              errors.current.push([500]);
            } finally {
              setTimeout(() => {
                setContent();
              }, 50);
            }
          } else {
            setContent();
          }
        });
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                    as={Link}
                    //@ts-expect-error target is working here
                    target="_blank"
                    href={resources[0]}
                    visibility={type === "images" ? "hidden" : "visible"}
                    colorPalette={color}
                  >
                    <TbExternalLink />
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
              <Dialog.Body
                spaceY="4"
                position={"relative"}
                overflowX={"hidden"}
                overflowY={loading ? "hidden" : "auto"}
              >
                {description && (
                  <Dialog.Description>{description}</Dialog.Description>
                )}
                {component}
                <Presence
                  present={loading}
                  animationName={{ _closed: "fade-out" }}
                  animationDuration="moderate"
                  position={"absolute"}
                  top={-6}
                  left={0}
                  zIndex={25}
                  backgroundColor={"bg.panel"}
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
  }
);

export default resource;
