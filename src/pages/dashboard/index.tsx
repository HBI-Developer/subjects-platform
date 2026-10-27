import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Heading,
  Presence,
  Show,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { signOut } from "firebase/auth";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { IoMdExit } from "react-icons/io";
import { MdFolderCopy } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ORPHAN_COLLECTION_ID, TITLE } from "@/constants";
import { auth, db } from "@/firebase-config";
import getErrorMessage from "@/functions/geterrormessage";
import { useAuthState } from "@/hooks/useauthstate";
import {
  CollectionDialog,
  IconSelector,
  ManageCollections,
  ResourceDeleteConfirm,
  ResourceDialog,
  Subject,
  SubjectDeleteConfirm,
  SubjectDialog,
} from "./components";

function DashboardErrorPanel({ error }: { readonly error: number | string }) {
  const { code, message } = getErrorMessage(error);
  return (
    <>
      <Heading>{code}</Heading>
      <Text>{message}</Text>
    </>
  );
}

export default function Dashboard() {
  const [user] = useAuthState(auth),
    [subjects, setSubjects] = useState<Array<SubjectInterface>>([]),
    [collections, setCollections] = useState<Array<CollectionInterface>>([]),
    [isLoading, setIsLoading] = useState(true),
    [subjectLimit, setSubjectLimit] = useState(9),
    [collectionLimit, setCollectionLimit] = useState(10),
    [listenerVersion, setListenerVersion] = useState(0),
    [isSignout, setIsSignout] = useState(false),
    [error, setError] = useState<number | string>(0),
    navigate = useNavigate(),
    collectionTitleOf = (belongToId: string) =>
      collections.find((collection) => collection.id === belongToId)?.title || "يتيمة",
    handleSubjectDeleted = (subjectId: string) => () => {
      setSubjects((subjects) => subjects.filter(({ id }) => id !== subjectId));
    },
    openDeleteSubject = (subject: SubjectInterface) => {
      SubjectDeleteConfirm.open("deleteSubject", {
        id: subject.id,
        title: subject.title,
        onSuccess: handleSubjectDeleted(subject.id),
      });
    },
    applyCollectionChange = (subjectId: string) => (belongToId: string) => {
      setSubjects((prev) =>
        prev.map((item) => (item.id === subjectId ? { ...item, belongToId } : item)),
      );
    },
    refresh = () => {
      setError(0);
      setIsLoading(true);
      setListenerVersion((version) => version + 1);
    };

  useEffect(() => {
    document.title = `${TITLE} | لوحة التحكم`;
    if (listenerVersion > 0) setIsLoading(true);
    let subjectsReady = false;
    let collectionsReady = false;
    const finishInitialLoad = () => {
      if (subjectsReady && collectionsReady) setIsLoading(false);
    };
    // These listeners use the SDK's persistent local cache first, then emit a
    // server snapshot. Local writes are optimistic and every manager receives
    // the same subsequent remote changes.
    const unsubscribeSubjects = onSnapshot(
      query(collection(db, "subjects"), orderBy("createdTime", "asc"), limit(subjectLimit)),
      { includeMetadataChanges: true },
      (snapshot) => {
        setError(0);
        setSubjects(
          snapshot.docs.map((item) => {
            const data = item.data() as Omit<SubjectInterface, "id" | "belongToId"> & {
              belongTo?: { id: string };
            };
            return { id: item.id, ...data, belongToId: data.belongTo?.id || "" };
          }),
        );
        subjectsReady = true;
        finishInitialLoad();
      },
      (snapshotError) => {
        setError(snapshotError.code);
        setIsLoading(false);
      },
    );
    const unsubscribeCollections = onSnapshot(
      query(collection(db, "collections"), orderBy("createdTime", "asc"), limit(collectionLimit)),
      { includeMetadataChanges: true },
      (snapshot) => {
        setError(0);
        setCollections(
          snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as CollectionInterface),
        );
        collectionsReady = true;
        finishInitialLoad();
      },
      (snapshotError) => {
        setError(snapshotError.code);
        setIsLoading(false);
      },
    );
    return () => {
      unsubscribeSubjects();
      unsubscribeCollections();
    };
  }, [collectionLimit, listenerVersion, subjectLimit]);

  return (
    <>
      <Grid
        dir={"rtl"}
        boxSize={"100%"}
        templateColumns={{ base: "1fr", md: "255px 1fr" }}
        templateRows={{ base: "auto auto 1fr", md: "auto 1fr" }}
        userSelect={"none"}
      >
        <Flex
          flexDirection={{ base: "row", md: "column" }}
          justifyContent={"space-between"}
          padding={"1rem"}
          gridRow={{ base: "auto", md: "span 2" }}
          backgroundColor={"gray.800"}
          borderInlineEndWidth={{ base: "0", md: "1px" }}
          borderBottomWidth={{ base: "1px", md: "0" }}
          borderStyle={"solid"}
          borderColor={"purple.800"}
        >
          <Flex
            flexDirection={{ base: "row", md: "column" }}
            rowGap={"5px"}
            columnGap={"10px"}
            alignItems={"flex-start"}
          >
            <Avatar.Root
              border={"3px solid"}
              borderColor={"purple.800"}
              padding={"2px"}
              size={{ base: "lg", md: "2xl" }}
            >
              <Avatar.Fallback name={user?.displayName || "User"} />
              <Avatar.Image src={user?.photoURL || ""} />
            </Avatar.Root>
            <Box css={{ "& > *": { textAlign: "start" } }}>
              <Heading size={{ base: "md", md: "lg" }} truncate>
                {user?.displayName}
              </Heading>
              <Text textStyle={{ base: "xs", md: "sm" }} color={"gray.500"} truncate>
                {user?.email}
              </Text>
            </Box>
          </Flex>
          <Button
            variant={"ghost"}
            colorPalette={"red"}
            loading={isSignout}
            onClick={async () => {
              setIsSignout(true);
              await signOut(auth);
              navigate("/");
            }}
          >
            <IoMdExit />
            <Text display={{ base: "none", md: "block" }}>تسجيل الخروج</Text>
          </Button>
        </Flex>
        <Flex padding={"1rem"} justifyContent={"flex-end"} gap={"10px"} flexWrap={"wrap"}>
          <Button
            size={{ base: "sm", md: "md" }}
            colorPalette={"teal"}
            variant={"outline"}
            borderRadius={"20px"}
            onClick={() => {
              ManageCollections.open("manageCollections", {
                collections,
                subjects,
                setCollections,
                setSubjects,
                loadMoreCollections: () => setCollectionLimit((value) => value + 10),
              });
            }}
          >
            <MdFolderCopy />
            <Text>إدارة المجموعات</Text>
          </Button>
          <Button
            size={{ base: "sm", md: "md" }}
            colorPalette={"teal"}
            variant={"outline"}
            borderRadius={"20px"}
            onClick={() => {
              CollectionDialog.open("collectionDialog", {
                process: "add",
                setCollection: (id, title, createdTime) => {
                  setCollections((prev) => [
                    ...prev,
                    { id, title, createdTime, relatedSubjects: 0 },
                  ]);
                },
              });
            }}
          >
            <FaPlus />
            <Text>إضافة مجموعة جديدة</Text>
          </Button>
          <Button
            size={{ base: "sm", md: "md" }}
            colorPalette={"purple"}
            borderRadius={"20px"}
            onClick={() => {
              SubjectDialog.open("subjectDialog", {
                process: "add",
                collections,
                setSubject: (id, title, icon, createdTime, belongToId) => {
                  setSubjects((subjects) => [
                    ...subjects,
                    { id, title, icon, createdTime, belongToId, relatedResources: 0 },
                  ]);
                },
              });
            }}
          >
            <FaPlus />
            <Text>إضافة مادة جديدة</Text>
          </Button>
        </Flex>
        <Show
          when={!error}
          fallback={
            <Center>
              <VStack>
                <DashboardErrorPanel error={error} />
                <Button
                  variant={"outline"}
                  colorPalette={"purple"}
                  size={"sm"}
                  onClick={() => {
                    setIsLoading(true);
                    refresh();
                    setError(0);
                  }}
                >
                  إعادة محاولة جلب البيانات
                </Button>
              </VStack>
            </Center>
          }
        >
          <Grid
            overflowY={"auto"}
            padding={"1rem 5%"}
            templateColumns={{
              base: "1fr",
              md: "repeat(2, calc(100% / 2 - 5px))",
              lg: "repeat(3, calc(100% / 3 - 10px))",
            }}
            justifyContent={"space-between"}
            rowGap={"20px"}
            onScroll={(event) => {
              const element = event.currentTarget;
              if (
                subjects.length === subjectLimit &&
                element.scrollTop + element.clientHeight >= element.scrollHeight - 600
              ) {
                setSubjectLimit((value) => value + 9);
              }
            }}
          >
            {subjects.map((subject) => (
              <Subject
                key={subject.id}
                title={subject.title}
                id={subject.id}
                icon={subject.icon}
                belongToId={subject.belongToId}
                relatedResources={subject.relatedResources || 0}
                collectionTitle={collectionTitleOf(subject.belongToId)}
                collections={collections.filter(
                  (collection) => collection.id !== ORPHAN_COLLECTION_ID,
                )}
                onCollectionChange={applyCollectionChange(subject.id)}
                onDelete={() => openDeleteSubject(subject)}
              />
            ))}
          </Grid>
        </Show>
      </Grid>
      <Presence
        present={isLoading}
        animationName={{
          _closed: "fade-out",
        }}
        animationDuration="moderate"
        zIndex={10}
        position={"absolute"}
        top={0}
        bottom={0}
        left={0}
        right={0}
      >
        <Center p="10" backgroundColor={"bg"} boxSize={"100%"}>
          <Spinner size={"lg"} borderWidth="3px" colorPalette={"gray"} />
        </Center>
      </Presence>
      <SubjectDialog.Viewport />
      <CollectionDialog.Viewport />
      <ManageCollections.Viewport />
      <IconSelector.Viewport />
      <SubjectDeleteConfirm.Viewport />
      <ResourceDialog.Viewport />
      <ResourceDeleteConfirm.Viewport />
      <Toaster />
    </>
  );
}
