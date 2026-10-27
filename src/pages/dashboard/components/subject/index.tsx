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
  VStack,
} from "@chakra-ui/react";
import { Icon as Iconify } from "@iconify/react";
import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";
import { MdEdit } from "react-icons/md";
import { ORPHAN_COLLECTION_ID } from "@/constants";
import { ResourceDialog, SubjectDialog } from "..";
import { SubjectBody } from "./components";

interface Props {
  readonly id: string;
  readonly icon: string;
  readonly title: string;
  readonly belongToId: string;
  readonly collectionTitle: string;
  readonly relatedResources: number;
  readonly collections: Array<CollectionInterface>;
  readonly onDelete: () => void;
  readonly onCollectionChange: (belongToId: string) => void;
}

export default function Subject({
  id,
  icon: initialIcon,
  title: initialTitle,
  belongToId: initialBelongToId,
  collectionTitle,
  relatedResources,
  collections,
  onDelete,
  onCollectionChange,
}: Props) {
  const [title, setTitle] = useState(initialTitle),
    [resources, setResources] = useState<Array<ResourceInterface>>([]),
    [icon, setIcon] = useState(initialIcon),
    [belongToId, setBelongToId] = useState(initialBelongToId),
    [resourcesCount, setResourcesCount] = useState<number>(relatedResources),
    isOrphan = belongToId === ORPHAN_COLLECTION_ID,
    resourcesCountInWord = (count: number) => {
      switch (true) {
        case count === 0: {
          return "ﻻ توجد مصادر";
        }

        case count === 1: {
          return "مصدر واحد";
        }

        case count === 2: {
          return "مصدران";
        }

        case count > 2 && count < 11: {
          return `${count} مصادر`;
        }

        default: {
          return `${count} مصدر`;
        }
      }
    };

  useEffect(() => {
    setResourcesCount(relatedResources);
  }, [relatedResources]);

  useEffect(() => {
    setTitle(initialTitle);
    setIcon(initialIcon);
    setBelongToId(initialBelongToId);
  }, [initialIcon, initialTitle, initialBelongToId]);

  return (
    <Grid
      backgroundColor={"gray.800"}
      height={"500px"}
      borderRadius={".5rem"}
      border={"1px solid"}
      borderColor={isOrphan ? "orange.700" : "purple.800"}
      templateRows={"auto auto 1fr auto auto"}
      filter={isOrphan ? "grayscale(1)" : "none"}
    >
      <Grid
        templateColumns={"auto 1fr auto"}
        alignItems={"center"}
        padding={".5rem"}
        width={"100%"}
        columnGap={"10px"}
      >
        <Center backgroundColor={"gray.900"} boxSize={"40px"} borderRadius={"50%"}>
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
          <Text textStyle={{ base: "xs", md: "sm" }} color={"gray.500"} truncate>
            {resourcesCountInWord(resourcesCount)}
          </Text>
          <Text
            textStyle={{ base: "xs", md: "sm" }}
            color={isOrphan ? "orange.400" : "gray.500"}
            truncate
          >
            {isOrphan ? "مادة يتيمة — أعد إسنادها لمجموعة" : `المجموعة: ${collectionTitle}`}
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
                        process: "edit",
                        title: title,
                        icon: icon,
                        id,
                        belongToId,
                        collections,
                        setSubjectTitle: setTitle,
                        setSubjectIcon: setIcon,
                        setSubjectCollection: (nextBelongToId) => {
                          setBelongToId(nextBelongToId);
                          onCollectionChange(nextBelongToId);
                        },
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
                  <Button variant={"ghost"} colorPalette={"red"} onClick={onDelete}>
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
      <Box padding={".5rem 1rem"} display={"flex"} minHeight={"0"}>
        <SubjectBody
          id={id}
          resourcesCount={resourcesCount}
          resources={resources}
          setResources={setResources}
        />
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
              subjectId: id,
              setResource: (id, type, title, thisResources, createdTime) => {
                if (resourcesCount === 0 || resources.length) {
                  setResources((resources) => [
                    ...resources,
                    { id, type, title, resources: thisResources, createdTime },
                  ]);
                }
              },
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
