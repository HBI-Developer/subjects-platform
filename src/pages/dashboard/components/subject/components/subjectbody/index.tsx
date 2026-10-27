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
  useBreakpointValue,
} from "@chakra-ui/react";
import type { FirestoreError, QueryDocumentSnapshot } from "firebase/firestore";
import { type Dispatch, type SetStateAction, useCallback, useRef, useState } from "react";
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
import VirtualPanelList from "@/components/virtualpanellist";
import getErrorMessage from "@/functions/geterrormessage";
import getResourcesPage from "@/functions/getresourcespage";
import { ResourceDeleteConfirm, ResourceDialog } from "../../..";
import styles from "../../index.module.scss";

const RESOURCE_ITEM_HEIGHT = 66;
const RESOURCE_PAGE_SIZE = 20;

function mergeResources(
  previous: Array<ResourceInterface>,
  next: Array<ResourceInterface>,
): Array<ResourceInterface> {
  const byId = new Map(previous.map((resource) => [resource.id, resource]));
  for (const resource of next) byId.set(resource.id, resource);
  return [...byId.values()];
}

interface Props {
  readonly id: string;
  readonly resourcesCount: number | string;
  readonly resources: Array<ResourceInterface>;
  readonly setResources: Dispatch<SetStateAction<Array<ResourceInterface>>>;
}

export default function SubjectBody({ resources, setResources, id, resourcesCount }: Props) {
  const scrollStyle = useBreakpointValue({ base: "", md: styles.scrollbar }),
    [isLoading, setIsLoading] = useState(false),
    [isLoadingMore, setIsLoadingMore] = useState(false),
    [hasMore, setHasMore] = useState(true),
    [error, setError] = useState<number | string>(0),
    cursor = useRef<QueryDocumentSnapshot | undefined>(undefined),
    fetchResource = useCallback(
      async (nextPage = false) => {
        if (nextPage && (!hasMore || isLoadingMore)) return;
        nextPage ? setIsLoadingMore(true) : setIsLoading(true);
        setError(0);
        try {
          const page = await getResourcesPage(
            id,
            nextPage ? cursor.current : undefined,
            RESOURCE_PAGE_SIZE,
          );
          cursor.current = page.cursor;
          setHasMore(page.hasMore);
          setResources((previous) => (nextPage ? mergeResources(previous, page.data) : page.data));
        } catch (error_) {
          const error = error_ as FirestoreError;
          setError(error.code);
        } finally {
          setIsLoadingMore(false);
          setIsLoading(false);
        }
      },
      [hasMore, id, isLoadingMore, setResources],
    ),
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
                onClick={() => {
                  void fetchResource();
                }}
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
          onClick={() => {
            void fetchResource();
          }}
        >
          جلب المصادر
        </Button>
      </Switch.Case>
      <Switch.Default>
        <VirtualPanelList
          items={resources}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={() => {
            void fetchResource(true);
          }}
          itemHeight={RESOURCE_ITEM_HEIGHT}
          className={scrollStyle}
          renderItem={(resource) => {
            const { color, icon } = getTypeIcon(resource.type);
            return (
              <Grid
                templateColumns={"auto 1fr auto"}
                alignItems={"center"}
                padding={".5rem"}
                width={"100%"}
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
        />
      </Switch.Default>
    </Switch.Root>
  );
}
