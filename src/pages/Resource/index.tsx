import { AudioPlayer, Carousel, OfficeViewer, VideoPlayer } from "@/components";
import getErrorMessage from "@/functions/getErrorMessage";
import verifyResources from "@/functions/verifyResources";
import type { RootState } from "@/store";
import { setResourceLoading } from "@/store/slice/loading";
import {
  Box,
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
import { MdFileDownload } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toaster } from "@/components/ui/toaster";
import { RESOURCE_PADDING, TITLE } from "@/constants";

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
      subject = useSelector(
        (state: RootState) => state.identifier.subject.title,
      ),
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
            </Center>,
          );

          dispatch(setResourceLoading(false));
        } else {
          switch (type) {
            case "pdf": {
              setComponent(
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
                    src={resources[0]}
                    width="100%"
                    height="100%"
                    title="PDF Viewer"
                    style={{ border: "none", width: "100%", height: "100%" }}
                    onLoad={() => dispatch(setResourceLoading(false))}
                  />
                </Box>,
              );
              break;
            }
            case "office": {
              setComponent(<OfficeViewer src={resources[0]} />);
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
      },
      download = async () => {
        if (resources.length > 1 && type === "images") {
          const zip = new JSZip();

          try {
            let counter = 0;
            const promises = resources.map(async (url, index) => {
              const response = await fetch(url);

              if (!response.ok) {
                counter++;
                return;
              }

              const blob = await response.blob();

              const fileName =
                url.substring(url.lastIndexOf("/") + 1) || `image-${index}.jpg`;

              zip.file(fileName, blob);
            });

            await Promise.all(promises);

            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveAs(
              new File([zipBlob], `${title}.zip`, { type: "application/zip" }),
            );

            toaster.create({
              description: "بدء التحميل بنجاح!",
              type: "success",
            });

            if (counter > 0) {
              if (counter === resources.length) {
                toaster.create({
                  description: `فشل تحميل جميع الصور، رجاءً قم بإعادة المحاولة إذا كان ممكناً.`,
                  type: "error",
                });
              } else {
                toaster.create({
                  description: `فشل تحميل بعض الصور.`,
                  type: "error",
                });
              }
            }
          } catch (_) {
            toaster.create({
              description: `حدث خطأ في عملية التحميل، أعد المحاولة رجاءً`,
              type: "error",
            });
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

    useEffect(() => {
      if (rest.open) {
        document.title = title;
      } else {
        document.title = `${TITLE} | ${subject}`;
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rest.open]);

    return (
      <Dialog.Root size={{ base: "full", md: "cover" }} {...rest}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              dir="rtl"
              minH={"100%"}
              h={"auto"}
              overflow={"hidden"}
              height={"stretch"}
            >
              <Dialog.Header userSelect={"none"}>
                <Grid
                  templateColumns={"auto 1fr auto"}
                  w={"100%"}
                  alignItems={"center"}
                  justifyItems={"center"}
                  columnGap={"15px"}
                >
                  <Button
                    size={{ base: "xs", md: "sm" }}
                    as={type === "images" ? Text : Link}
                    variant="outline"
                    //@ts-expect-error target is working here
                    target="_blank"
                    href={resources[0]}
                    onClick={type === "images" ? download : () => {}}
                    colorPalette={color}
                  >
                    {type === "images" ? (
                      <MdFileDownload />
                    ) : (
                      <TbExternalLink />
                    )}
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
                display={"flex"}
                flex={"1"}
                flexDirection={"column"}
                justifyContent={"center"}
                p={RESOURCE_PADDING}
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
  },
);

export default resource;
