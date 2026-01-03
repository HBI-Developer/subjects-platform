import {
  Avatar,
  Box,
  Button,
  Center,
  Grid,
  Heading,
  Icon,
  Menu,
  Portal,
  Separator,
  Show,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { Icon as Iconify } from "@iconify/react";
import styles from "./index.module.scss";
import { FaPlus, FaRegFolderOpen, FaTrash } from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";
import { MdEdit } from "react-icons/md";
import { useEffect, useState } from "react";
import getResourcesCount from "@/functions/getResourcesCount";
import type { FirebaseError } from "firebase/app";
import getErrorMessage from "@/functions/getErrorMessage";
import { useDispatch } from "react-redux";
import { setDashboardSubject } from "@/store/slice/counter";
import getResources from "@/functions/getResources";
import type { FirestoreError } from "firebase/firestore";
import {
  TbBrandParsinta,
  TbFileTypePdf,
  TbHeadphones,
  TbPhoto,
} from "react-icons/tb";

interface Props {
  id: string;
  icon: string;
  title: string;
}

export default function Subject({ id, icon, title }: Props) {
  const scrollStyle = useBreakpointValue({ base: "", md: styles.scrollbar }),
    [resourcesCount, setResourcesCount] = useState<number | string>(0),
    [countError, setCountError] = useState<number | string>(0),
    [isLoading, setIsLoading] = useState(false),
    [resourcesError, setResourcesError] = useState<number | string>(0),
    [resources, setResources] = useState<Array<ResourceInterface>>([]),
    dispatch = useDispatch(),
    fetchResource = () => {
      setIsLoading(true);
      setResourcesError(0);
      getResources(
        id,
        (data) => {
          setResources(data);
        },
        (er) => {
          const error = er as FirestoreError;
          setResourcesError(error.code);
        },
        () => {
          setIsLoading(false);
        }
      );
    },
    getTypeIcon = (type: ResourceType) => {
      switch (type) {
        case "pdf": {
          return { color: "red", icon: <TbFileTypePdf /> };
        }
        case "images": {
          return { color: "teal", icon: <TbPhoto /> };
        }
        case "audio": {
          return { color: "cyan", icon: <TbHeadphones /> };
        }
        case "video": {
          return { color: "blue", icon: <TbBrandParsinta /> };
        }
      }
    };

  useEffect(() => {
    getResourcesCount(
      id,
      (count) => {
        switch (true) {
          case count === 0: {
            setResourcesCount(0);
            break;
          }

          case count === 1: {
            setResourcesCount("مصدر واحد");
            break;
          }

          case count === 2: {
            setResourcesCount("مصدران");
            break;
          }

          case count > 2 && count < 11: {
            setResourcesCount(`${count} مصادر`);
            break;
          }

          default: {
            setResourcesCount(`${count} مصدر`);
          }
        }
      },
      (er: unknown) => {
        const error = er as FirebaseError;
        setCountError(error.code);
      },
      () => {
        setTimeout(
          () => dispatch(setDashboardSubject((p: number) => p + 1)),
          0
        );
      }
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid
      backgroundColor={"gray.800"}
      height={"500px"}
      borderRadius={".5rem"}
      border={"1px solid"}
      borderColor={"purple.800"}
      templateRows={"auto auto 1fr auto auto"}
    >
      <Grid
        templateColumns={"auto 1fr auto"}
        alignItems={"center"}
        padding={".5rem"}
        width={"100%"}
        columnGap={"10px"}
      >
        <Center
          backgroundColor={"gray.900"}
          boxSize={"40px"}
          borderRadius={"50%"}
        >
          <Icon size={"sm"}>
            <Iconify icon={icon} />
          </Icon>
        </Center>
        <VStack
          rowGap={"0"}
          overflow={"hidden"}
          css={{ "& > *": { width: "100%", textAlign: "start" } }}
        >
          <Heading size={{ base: "md", md: "lg" }} truncate>
            {title}
          </Heading>
          <Text
            textStyle={{ base: "xs", md: "sm" }}
            color={"gray.500"}
            truncate
          >
            {countError
              ? "حدث خطأ في جلب العدد"
              : resourcesCount !== 0
              ? resourcesCount
              : "ﻻ توجد مصادر"}
          </Text>
        </VStack>
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button variant="plain" size="sm">
              <HiDotsVertical />
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item
                  asChild
                  value="edit-subject"
                  justifyContent={"flex-start"}
                  columnGap={"10px"}
                  color={"teal"}
                >
                  <Button variant={"ghost"} colorPalette={"teal"}>
                    <Icon size={"xs"}>
                      <MdEdit />
                    </Icon>
                    <Text textStyle={"sm"}>تعديل</Text>
                  </Button>
                </Menu.Item>
                <Menu.Item
                  value="delete-subject"
                  justifyContent={"flex-start"}
                  columnGap={"10px"}
                  color={"red.400"}
                  asChild
                >
                  <Button variant={"ghost"} colorPalette={"red"}>
                    <Icon size={"xs"}>
                      <FaTrash />
                    </Icon>
                    <Text textStyle={"sm"}>حذف</Text>
                  </Button>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Grid>
      <Separator borderColor={"purple.800"} />
      <Box
        padding={".5rem 1rem"}
        overflowY={"auto"}
        className={scrollStyle}
        css={{ "& > *:not(:last-child)": { marginBottom: "10px" } }}
      >
        {resources.length && !isLoading ? (
          <>
            {resources.map((resource, index) => {
              const { color, icon } = getTypeIcon(resource.type);
              return (
                <Grid
                  templateColumns={"auto 1fr auto"}
                  alignItems={"center"}
                  padding={".5rem"}
                  width={"100%"}
                  key={index}
                  borderRadius={".35rem"}
                  columnGap={"10px"}
                  backgroundColor={{ base: "gray.950", _hover: "gray.500" }}
                  transition={".2s background-color ease-in-out"}
                >
                  <Avatar.Root colorPalette={color}>
                    <Avatar.Fallback>
                      <Icon size={"md"}>{icon}</Icon>
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <Heading
                    textAlign={"start"}
                    size={{ base: "sm", md: "md" }}
                    title={resource.title}
                    truncate
                  >
                    {resource.title}
                  </Heading>
                  <Menu.Root>
                    <Menu.Trigger asChild>
                      <Button variant="plain" size="sm">
                        <HiDotsVertical />
                      </Button>
                    </Menu.Trigger>
                    <Portal>
                      <Menu.Positioner>
                        <Menu.Content>
                          <Menu.Item
                            value="edit-subject"
                            justifyContent={"flex-start"}
                            columnGap={"10px"}
                            color={"teal"}
                            asChild
                          >
                            <Button variant={"ghost"} colorPalette={"teal"}>
                              <Icon size={"xs"}>
                                <MdEdit />
                              </Icon>
                              <Text textStyle={"sm"}>تعديل</Text>
                            </Button>
                          </Menu.Item>
                          <Menu.Item
                            value="delete-subject"
                            justifyContent={"flex-start"}
                            columnGap={"10px"}
                            color={"red.400"}
                            asChild
                          >
                            <Button variant={"ghost"} colorPalette={"red"}>
                              <Icon size={"xs"}>
                                <FaTrash />
                              </Icon>
                              <Text textStyle={"sm"}>حذف</Text>
                            </Button>
                          </Menu.Item>
                        </Menu.Content>
                      </Menu.Positioner>
                    </Portal>
                  </Menu.Root>
                </Grid>
              );
            })}
          </>
        ) : (
          <Center
            boxSize={"100%"}
            flexDirection={"column"}
            rowGap={"10px"}
            color={"gray"}
            backgroundColor={"gray.800"}
          >
            <Show
              when={resourcesError === 0}
              fallback={(() => {
                const { code, message } = getErrorMessage(resourcesError);

                return (
                  <>
                    <Heading>{code}</Heading>
                    <Text textAlign={"justify"} textAlignLast={"center"}>
                      {message}
                    </Text>
                    <Button
                      variant={"outline"}
                      colorPalette={"purple"}
                      size={"sm"}
                      onClick={fetchResource}
                    >
                      إعادة المحاولة
                    </Button>
                  </>
                );
              })()}
            >
              <Show
                when={resourcesCount !== 0}
                fallback={
                  <>
                    <Icon size={"2xl"}>
                      <FaRegFolderOpen />
                    </Icon>
                    <Text>ﻻ توجد مصادر</Text>
                  </>
                }
              >
                <Button
                  variant={"outline"}
                  colorPalette={"purple"}
                  size={"sm"}
                  loading={isLoading}
                  onClick={fetchResource}
                >
                  جلب المصادر
                </Button>
              </Show>
            </Show>
          </Center>
        )}
      </Box>
      <Separator borderColor={"purple.800"} />
      <Box padding={".5rem 1rem"}>
        <Button
          width={"100%"}
          colorPalette={"purple"}
          variant={"outline"}
          borderStyle={"dashed"}
        >
          <FaPlus />
          إضافة مصدر جديد
        </Button>
      </Box>
    </Grid>
  );
}
