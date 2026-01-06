import {
  Box,
  Button,
  ButtonGroup,
  Center,
  createOverlay,
  Dialog,
  Flex,
  Group,
  Image,
  Input,
  Portal,
  Presence,
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
import { FaTimes } from "react-icons/fa";
import isVideoUrl from "@/helpers/isVideoUrl";
import isAudioUrl from "@/helpers/isAudioUrl";
import isPdfUrl from "@/helpers/isPdfUrl";
import { toaster } from "@/components/ui/toaster";
import isImageUrl from "@/helpers/isImageUrl";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase-config";
import type { FirebaseError } from "firebase/app";
import getErrorMessage from "@/functions/getErrorMessage";

interface Props {
  process: "add" | "edit";
  subjectId?: string;
  type?: ResourceType;
  title?: string;
  id?: string;
  resources?: Array<string>;
  setResource?: (
    id: string,
    type: ResourceType,
    title: string,
    resources: Array<string>,
    createdTime: number
  ) => void;
  setResourceInfo?: (
    type: ResourceType,
    title: string,
    resources: Array<string>
  ) => void;
}

const resourceTypes = [
  { value: "video", color: "blue", icon: <TbBrandParsinta /> },
  { value: "audio", color: "cyan", icon: <TbHeadphones /> },
  { value: "images", color: "teal", icon: <TbPhoto /> },
  { value: "pdf", color: "red", icon: <TbFileTypePdf /> },
] as const;

const resourceDialog = createOverlay<Props>(
  ({
    id,
    process,
    subjectId,
    type: initialType,
    title: initialTitle,
    resources: initialResources,
    setResource,
    setResourceInfo,
    ...rest
  }) => {
    const [type, setType] = useState(initialType || "video");
    const [title, setTitle] = useState(initialTitle || "");
    const [isChecking, setIsChecking] = useState(false);
    const [isProcess, setIsProcess] = useState(false);
    const [activeImage, setActiveImage] = useState(-1);
    const [url, setUrl] = useState(
      (initialType !== "images" && initialResources?.[0]) || ""
    );
    const [images, setImages] = useState<Array<string>>(initialResources || []);
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
    const checkUrl = async () => {
        setIsChecking(true);
        let check = false;
        switch (type) {
          case "video": {
            check = await isVideoUrl(url);
            break;
          }
          case "audio": {
            check = await isAudioUrl(url);
            break;
          }
          case "pdf": {
            check = await isPdfUrl(url);
            break;
          }
        }

        if (!check) {
          setUrl("");
          toaster.create({
            title: "نوع الملف غير صحيح أو حدثت مشكلة أثناء التحقق",
            type: "error",
          });
        }

        setIsChecking(false);
      },
      addImage = async () => {
        setIsChecking(true);
        const link = url,
          check = await isImageUrl(link);

        if (check) {
          setImages((images) => [...images, link]);
        } else {
          toaster.create({
            title: "نوع الملف غير صحيح أو حدثت مشكلة أثناء التحقق",
            type: "error",
          });
        }

        setUrl("");
        setIsChecking(false);
      },
      close = () => resourceDialog.close("resourceDialog"),
      checkFields = () => {
        let error = "";

        if (!title) {
          error = "ﻻ يمكن أن يكون حقل الاسم فارغاً";
        } else if (title.length <= 2) {
          error = "الاسم صغير للغاية، يجب أن يتكون من 3 أحرف على الأقل";
        } else if (title.length > 60) {
          error = "النص أطول من حياتك، يجب أن يتكون من 60 حرف على الأكثر";
        } else if (!window.navigator.onLine) {
          error = "اتصالك بالإنترنت مقطوع، رجاءً اتصل بالانترنت ثم حاول مجدداً";
        } else if (type === "images" && images.length === 0) {
          error = "يجب أن يكون هناك صورة واحدة على الأقل";
        } else if (type !== "images" && !url) {
          error = "يجب أن يكون هناك رابط للمصدر";
        }

        return error;
      },
      addResource = async () => {
        if (!subjectId) {
          close();
          return;
        }

        setIsProcess(true);

        let error = checkFields();

        if (!error) {
          try {
            const time = Date.now();
            const subjectRef = doc(db, "subjects", subjectId);
            const currentResources = type === "images" ? images : [url];
            const newDoc = await addDoc(collection(db, "resources"), {
              title,
              type: type,
              resources: currentResources,
              subject: subjectRef,
              createdTime: time,
            });

            if (setResource) {
              setResource(newDoc.id, type, title, currentResources, time);
            }
          } catch (er) {
            const err = er as FirebaseError;
            error = getErrorMessage(err.code).message;
          } finally {
            setIsProcess(false);
          }
        }

        if (error) {
          toaster.create({
            title: error,
            type: "error",
          });
          setIsProcess(false);
          return;
        }

        return true;
      },
      updateResource = async () => {
        if (
          !id ||
          (type === initialType &&
            title === initialTitle &&
            ((type === "images" &&
              JSON.stringify(images) === JSON.stringify(initialResources)) ||
              (type !== "images" && initialResources?.[0] === url)))
        ) {
          close();
          return;
        }

        setIsProcess(true);

        let error = checkFields();

        if (!error) {
          try {
            const resourceRef = doc(db, "resources", id);
            const resources = type === "images" ? images : [url];
            await updateDoc(resourceRef, {
              title,
              type: type,
              resources,
            });

            if (setResourceInfo) {
              setResourceInfo(type, title, resources);
            }
          } catch (er) {
            const err = er as FirebaseError;
            error = getErrorMessage(err.code).message;
          } finally {
            setIsProcess(false);
          }
        }

        if (error) {
          toaster.create({
            title: error,
            type: "error",
          });
          setIsProcess(false);
          return;
        }

        return true;
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
                    defaultValue={type}
                    variant="plain"
                    as={VStack}
                    w={"100%"}
                    alignItems={"center"}
                    rowGap={"20px"}
                    onValueChange={(e) => {
                      setType(e.value as ResourceType);
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
                      when={type === "images"}
                      fallback={
                        <Input
                          width={"100%"}
                          placeholder="أكتب رابط المصدر"
                          type={"url"}
                          variant={"flushed"}
                          colorPalette={"purple"}
                          value={url}
                          onBlur={checkUrl}
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
                            {images.map((src, index) => (
                              <Box
                                key={index}
                                height="full"
                                outline="none"
                                onClick={() => {
                                  if (activeImage === index) {
                                    setActiveImage(-1);
                                  } else {
                                    setActiveImage(index);
                                  }
                                }}
                                position={"relative"}
                              >
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
                                <Presence
                                  present={activeImage === index}
                                  animationName={{
                                    _open: "fade-in",
                                    _closed: "fade-out",
                                  }}
                                  animationDuration="fast"
                                >
                                  <Center
                                    position={"absolute"}
                                    top={0}
                                    left={0}
                                    bottom={0}
                                    right={0}
                                    backgroundColor={"#00000045"}
                                  >
                                    <Button
                                      variant={"ghost"}
                                      colorPalette={"red"}
                                      onClick={() => {
                                        setImages((images) =>
                                          images.filter((_, i) => index !== i)
                                        );
                                      }}
                                    >
                                      <FaTimes />
                                    </Button>
                                  </Center>
                                </Presence>
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
                          <Button
                            variant="subtle"
                            loading={isChecking}
                            disabled={isProcess}
                            onClick={addImage}
                          >
                            <BiPlus />
                          </Button>
                        </Group>
                      </VStack>
                    </Show>
                  </Tabs.Root>
                  <ButtonGroup variant={"outline"} colorPalette={"teal"}>
                    <Button
                      colorPalette={"gray"}
                      onClick={close}
                      loading={isProcess}
                      disabled={isChecking}
                    >
                      إغلاق
                    </Button>
                    <Show when={process === "add"}>
                      <Button
                        loading={isProcess}
                        disabled={isChecking}
                        onClick={async () => {
                          const success = Boolean(await addResource());

                          if (success) {
                            setTitle("");
                            setUrl("");
                            setImages([]);
                            setActiveImage(-1);
                          }
                        }}
                      >
                        حفظ وإضافة
                      </Button>
                    </Show>
                    <Button
                      loading={isProcess}
                      disabled={isChecking}
                      onClick={async () => {
                        let success = false;

                        if (process === "edit") {
                          success = Boolean(await updateResource());
                        } else {
                          success = Boolean(await addResource());
                        }

                        if (success) {
                          close();
                        }
                      }}
                    >
                      حفظ
                    </Button>
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
