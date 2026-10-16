import {
  Avatar,
  Button,
  Center,
  For,
  Grid,
  Heading,
  Icon,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react";
import type { FirestoreError } from "firebase/firestore";
import { type Dispatch, type SetStateAction, useState } from "react";
import { FaRegFolderOpen, FaTrash } from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";
import { MdEdit } from "react-icons/md";
import {
  TbBrandOffice,
  TbBrandParsinta,
  TbFileTypePdf,
  TbHeadphones,
  TbPhoto,
} from "react-icons/tb";
import { Switch } from "@/components";
import getErrorMessage from "@/functions/geterrormessage";
import getResources from "@/functions/getresources";
import { ResourceDeleteConfirm, ResourceDialog } from "../../..";

interface Props {
  readonly id: string;
  readonly resourcesCount: number | string;
  readonly resources: Array<ResourceInterface>;
  readonly setResources: Dispatch<SetStateAction<Array<ResourceInterface>>>;
  readonly setResourcesCount: Dispatch<SetStateAction<number>>;
}

export default function SubjectBody({
  resources,
  setResources,
  setResourcesCount,
  id,
  resourcesCount,
}: Props) {
  const [isLoading, setIsLoading] = useState(false),
    [error, setError] = useState<number | string>(0),
    fetchResource = () => {
      setIsLoading(true);
      setError(0);
      void getResources(
        id,
        (data) => {
          setResources(data);
        },
        (error_) => {
          const error = error_ as FirestoreError;
          setError(error.code);
        },
        () => {
          setIsLoading(false);
        },
      );
    },
    applyResourceInfo =
      (resourceId: string) => (type: ResourceType, title: string, thisResources: Array<string>) => {
        setResources((resources) =>
          resources.map((res) => {
            if (res.id === resourceId) {
              return { ...res, type, title, resources: thisResources };
            }
            return res;
          }),
        );
      },
    openEditResource = (resource: ResourceInterface) => {
      ResourceDialog.open("resourceDialog", {
        process: "edit",
        type: resource.type,
        title: resource.title,
        resources: resource.resources,
        id: resource.id,
        setResourceInfo: applyResourceInfo(resource.id),
      });
    },
    handleResourceDeleted = (resourceId: string) => () => {
      setResources((resources) => resources.filter(({ id }) => id !== resourceId));
      setResourcesCount((count) => count - 1);
    },
    openDeleteResource = (resource: ResourceInterface, subjectId: string) => {
      ResourceDeleteConfirm.open("deleteResource", {
        id: resource.id,
        title: resource.title,
        subjectId,
        onSuccess: handleResourceDeleted(resource.id),
      });
    },
    getTypeIcon = (type: ResourceType) => {
      switch (type) {
        case "office": {
          return { color: "orange", icon: <TbBrandOffice /> };
        }
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

  return (
    <Switch.Root>
      <Switch.Layout withDefault={false}>
        <Center
          boxSize={"100%"}
          flexDirection={"column"}
          rowGap={"10px"}
          color={"gray"}
          backgroundColor={"gray.800"}
        ></Center>
      </Switch.Layout>
      <Switch.Case condition={resourcesCount === 0}>
        <Icon size={"2xl"}>
          <FaRegFolderOpen />
        </Icon>
        <Text>ﻻ توجد مصادر</Text>
      </Switch.Case>
      <Switch.Case condition={Boolean(error)}>
        {(() => {
          const { code, message } = getErrorMessage(error);
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
      </Switch.Case>
      <Switch.Case condition={resources.length === 0}>
        <Button
          variant={"outline"}
          colorPalette={"purple"}
          size={"sm"}
          loading={isLoading}
          onClick={fetchResource}
        >
          جلب المصادر
        </Button>
      </Switch.Case>
      <Switch.Default>
        <For each={resources}>
          {(resource, index) => {
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
                          <Button
                            variant={"ghost"}
                            colorPalette={"teal"}
                            onClick={() => openEditResource(resource)}
                          >
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
                          <Button
                            variant={"ghost"}
                            colorPalette={"red"}
                            onClick={() => openDeleteResource(resource, id)}
                          >
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
          }}
        </For>
      </Switch.Default>
    </Switch.Root>
  );
}
