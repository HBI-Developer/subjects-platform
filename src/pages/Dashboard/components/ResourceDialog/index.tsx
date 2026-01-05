import {
  Box,
  Button,
  ButtonGroup,
  createOverlay,
  Dialog,
  Flex,
  Group,
  Image,
  Input,
  Portal,
  Show,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  TbBrandParsinta,
  TbFileTypePdf,
  TbHeadphones,
  TbPhoto,
} from "react-icons/tb";
import Slider, { type Settings } from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BiPlus } from "react-icons/bi";

interface Props {
  process: "add" | "edit";
  type?: ResourceType;
  title?: string;
  resources?: Array<string>;
}

const resourceTypes = [
  { value: "video", color: "blue", icon: <TbBrandParsinta /> },
  { value: "audio", color: "cyan", icon: <TbHeadphones /> },
  { value: "images", color: "teal", icon: <TbPhoto /> },
  { value: "pdf", color: "red", icon: <TbFileTypePdf /> },
] as const;

const resourceDialog = createOverlay<Props>(
  ({
    process,
    type: initialType,
    title: initialTitle,
    resources: initialResources,
    ...rest
  }) => {
    const [resourceType, setResourceType] = useState(initialType || "video");
    const [title, setTitle] = useState(initialTitle || "");
    const [url, setUrl] = useState(initialResources?.[0] || "");
    const [urls, setUrls] = useState<Array<string>>(initialResources || []);
    const carouselSettings: Settings = {
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      variableWidth: true,
      swipe: true,
      draggable: true,
      arrows: false,
      swipeToSlide: true,
    };

    return (
      <Dialog.Root
        {...rest}
        placement={"center"}
        size={{ base: "cover", md: "md" }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              backgroundColor={"bg"}
              border={"1px solid"}
              borderColor={"purple.800!important"}
              userSelect={"none"}
              height={"auto"}
            >
              <Dialog.Header justifyContent={"center"}>
                <Dialog.Title>
                  {process === "add" ? "إضافة مصدر" : "تعديل مصدر"}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body spaceY="4">
                <Flex
                  flexDirection={"column"}
                  justifyContent={"center"}
                  rowGap={"20px"}
                  alignItems={"center"}
                >
                  <Tabs.Root
                    defaultValue={resourceType}
                    variant="plain"
                    as={VStack}
                    w={"100%"}
                    alignItems={"center"}
                    rowGap={"20px"}
                    onValueChange={(e) => {
                      setResourceType(e.value as ResourceType);
                      setUrl("");
                    }}
                  >
                    <Tabs.List
                      bg="bg.muted"
                      rounded="l3"
                      p="1"
                      display="flex"
                      gap="10px"
                    >
                      {resourceTypes.map((type, index) => {
                        return (
                          <Tabs.Trigger value={type.value} asChild key={index}>
                            <Button
                              colorPalette={type.color}
                              variant={{ base: "ghost", _selected: "outline" }}
                            >
                              {type.icon}
                            </Button>
                          </Tabs.Trigger>
                        );
                      })}
                    </Tabs.List>

                    <Input
                      width={"100%"}
                      placeholder="أكتب اسم المصدر"
                      maxLength={150}
                      minLength={2}
                      value={title}
                      onChange={(ev: React.ChangeEvent) => {
                        const value = (ev.currentTarget as HTMLInputElement)
                          .value;

                        setTitle(value);
                      }}
                      variant={"flushed"}
                      required
                    />

                    <Show
                      when={resourceType === "images"}
                      fallback={
                        <Input
                          width={"100%"}
                          placeholder="أكتب رابط المصدر"
                          type={"url"}
                          variant={"flushed"}
                          colorPalette={"purple"}
                          value={url}
                          onChange={(ev: React.ChangeEvent) => {
                            const value = (ev.currentTarget as HTMLInputElement)
                              .value;

                            setUrl(value);
                          }}
                          required
                        />
                      }
                    >
                      <VStack w={"100%"} rowGap={"15px"}>
                        <Box
                          width="100%"
                          height="100px"
                          p="0.5rem"
                          bg="bg.muted"
                          overflow="hidden"
                          css={{
                            "& .slick-slider": {
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                            },
                            "& .slick-list": {
                              height: "100%",
                              width: "100%",
                            },
                            "& .slick-track": {
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                            },
                            "& .slick-slide": {
                              marginRight: "10px",
                              height: "100%",
                              aspectRatio: 16 / 9,
                            },
                          }}
                        >
                          <Slider {...carouselSettings}>
                            {urls.map((src, index) => (
                              <Box key={index} height="full" outline="none">
                                <Image
                                  src={src}
                                  alt={`slide-${index}`}
                                  height="100%"
                                  width="auto"
                                  aspectRatio="16 / 9"
                                  objectFit="cover"
                                  draggable={false}
                                  display="block"
                                  borderRadius="md"
                                />
                              </Box>
                            ))}
                          </Slider>
                        </Box>

                        <Group attached w="full">
                          <Input
                            flex="1"
                            placeholder="أضف رابط"
                            value={url}
                            onChange={(ev: React.ChangeEvent) => {
                              const value = (
                                ev.currentTarget as HTMLInputElement
                              ).value;

                              setUrl(value);
                            }}
                          />
                          <Button variant="subtle">
                            <BiPlus />
                          </Button>
                        </Group>
                      </VStack>
                    </Show>
                  </Tabs.Root>
                  <ButtonGroup variant={"outline"} colorPalette={"teal"}>
                    <Button
                      colorPalette={"gray"}
                      onClick={() => resourceDialog.close("resourceDialog")}
                    >
                      إغلاق
                    </Button>
                    <Button>
                      حفظ {process === "add" ? "وإضافة" : "وتعديل"}
                    </Button>
                    <Button>حفظ</Button>
                  </ButtonGroup>
                </Flex>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    );
  }
);

export default resourceDialog;
