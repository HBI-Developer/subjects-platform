import getErrorMessage from "@/functions/getErrorMessage";
import getResources from "@/functions/getResources";
import {
  Avatar,
  Button,
  Center,
  Grid,
  Heading,
  Icon,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react";
import type { FirestoreError } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaRegFolderOpen, FaTrash } from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";
import { MdEdit } from "react-icons/md";
import {
  TbBrandParsinta,
  TbFileTypePdf,
  TbHeadphones,
  TbPhoto,
} from "react-icons/tb";

interface Props {
  id: string;
  resourcesCount: number | string;
}

export default function SubjectBody({ id, resourcesCount }: Props) {
  const [resources, setResources] = useState<Array<ResourceInterface>>([]),
    [isLoading, setIsLoading] = useState(false),
    [error, setError] = useState<number | string>(0),
    [template, setTemplate] = useState<React.JSX.Element | null>(null),
    fetchResource = () => {
      setIsLoading(true);
      setError(0);
      getResources(
        id,
        (data) => {
          setResources(data);
        },
        (er) => {
          const error = er as FirestoreError;
          setError(error.code);
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
    },
    setTemplateWithConditions = () => {
      setTemplate(null);

      switch (true) {
        case resourcesCount === 0: {
          setTemplate(
            <>
              <Icon size={"2xl"}>
                <FaRegFolderOpen />
              </Icon>
              <Text>ﻻ توجد مصادر</Text>
            </>
          );

          break;
        }

        case Boolean(error): {
          const { code, message } = getErrorMessage(error);

          setTemplate(
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

          break;
        }

        case resources.length === 0: {
          setTemplate(
            <Button
              variant={"outline"}
              colorPalette={"purple"}
              size={"sm"}
              loading={isLoading}
              onClick={fetchResource}
            >
              جلب المصادر
            </Button>
          );

          break;
        }
      }
    };

  useEffect(() => {
    setTemplateWithConditions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTemplateWithConditions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, resourcesCount, isLoading, JSON.stringify(resources)]);

  if (template) {
    return (
      <Center
        boxSize={"100%"}
        flexDirection={"column"}
        rowGap={"10px"}
        color={"gray"}
        backgroundColor={"gray.800"}
      >
        {template}
      </Center>
    );
  }

  return resources.map((resource, index) => {
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
  });
}
