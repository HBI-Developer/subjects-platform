import {
  Box,
  Button,
  Center,
  Grid,
  Heading,
  Icon,
  Menu,
  Portal,
  Separator,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { Icon as Iconify } from "@iconify/react";
import styles from "./index.module.scss";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";
import { MdEdit } from "react-icons/md";
import { useEffect, useState } from "react";
import getResourcesCount from "@/functions/getResourcesCount";
import type { FirebaseError } from "firebase/app";
import { useDispatch } from "react-redux";
import { increaseDashboardSubject } from "@/store/slice/counter";
import { SubjectBody } from "./components";
import { ResourceDialog, SubjectDialog } from "..";

interface Props {
  id: string;
  icon: string;
  title: string;
  onDelete: () => void;
}

export default function Subject({
  id,
  icon: initialIcon,
  title: initialTitle,
  onDelete,
}: Props) {
  const scrollStyle = useBreakpointValue({ base: "", md: styles.scrollbar }),
    [title, setTitle] = useState(initialTitle),
    [icon, setIcon] = useState(initialIcon),
    [resourcesCount, setResourcesCount] = useState<number | string>(0),
    [countError, setCountError] = useState<number | string>(0),
    dispatch = useDispatch();

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
        setTimeout(() => dispatch(increaseDashboardSubject()), 0);
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
                  <Button
                    variant={"ghost"}
                    colorPalette={"teal"}
                    onClick={() => {
                      SubjectDialog.open("subjectDialog", {
                        type: "edit",
                        title: title,
                        icon: icon,
                        id,
                        setSubjectTitle: setTitle,
                        setSubjectIcon: setIcon,
                      });
                    }}
                  >
                    <Icon size={"lg"}>
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
                  <Button
                    variant={"ghost"}
                    colorPalette={"red"}
                    onClick={onDelete}
                  >
                    <Icon size={"lg"}>
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
        <SubjectBody id={id} resourcesCount={resourcesCount} />
      </Box>
      <Separator borderColor={"purple.800"} />
      <Box padding={".5rem 1rem"}>
        <Button
          width={"100%"}
          colorPalette={"purple"}
          variant={"outline"}
          borderStyle={"dashed"}
          onClick={() => {
            ResourceDialog.open("resourceDialog", {
              process: "add",
            });
          }}
        >
          <FaPlus />
          إضافة مصدر جديد
        </Button>
      </Box>
    </Grid>
  );
}
