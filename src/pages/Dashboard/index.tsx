import { auth } from "@/firebase-config";
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
import { IoMdExit } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  IconSelector,
  ResourceDialog,
  Subject,
  SubjectDeleteConfirm,
} from "./components";
import { useEffect, useState } from "react";
import type { FirestoreError } from "firebase/firestore";
import getSubjects from "@/functions/getSubjects";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import getErrorMessage from "@/functions/getErrorMessage";
import { SubjectDialog } from "./components";
import { Toaster } from "@/components/ui/toaster";

export default function Dashboard() {
  const [user] = useAuthState(auth),
    [subjects, setSubjects] = useState<Array<SubjectInterface>>([]),
    [isLoading, setIsLoading] = useState(true),
    [error, setError] = useState<number | string>(0),
    subjectCounter = useSelector(
      (state: RootState) => state.counter.dashboardSubject
    ),
    fetchSubjects = () => {
      getSubjects(
        (data: Array<SubjectInterface>) => {
          setSubjects(data);
        },
        (er: unknown) => {
          const error = er as FirestoreError;
          setError(error.code);
        },
        () => {
          setIsLoading(false);
        }
      );
    };

  useEffect(() => {
    fetchSubjects();
  }, []);

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
              <Text
                textStyle={{ base: "xs", md: "sm" }}
                color={"gray.500"}
                truncate
              >
                {user?.email}
              </Text>
            </Box>
          </Flex>
          <Button variant={"ghost"} colorPalette={"red"}>
            <IoMdExit />
            <Text display={{ base: "none", md: "block" }}>تسجيل الخروج</Text>
          </Button>
        </Flex>
        <Flex padding={"1rem"} justifyContent={"flex-end"}>
          <Button
            size={{ base: "sm", md: "md" }}
            colorPalette={"purple"}
            borderRadius={"20px"}
            onClick={() => {
              SubjectDialog.open("subjectDialog", {
                type: "add",
                setSubject: (id, title, icon, createdTime) => {
                  setSubjects((subjects) => [
                    ...subjects,
                    { id, title, icon, createdTime },
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
            <>
              <Center>
                <VStack>
                  {(() => {
                    const { code, message } = getErrorMessage(error);
                    return (
                      <>
                        <Heading>{code}</Heading>
                        <Text>{message}</Text>
                      </>
                    );
                  })()}
                  <Button
                    variant={"outline"}
                    colorPalette={"purple"}
                    size={"sm"}
                    onClick={() => {
                      setIsLoading(true);
                      fetchSubjects();
                      setError(0);
                    }}
                  >
                    إعادة محاولة جلب البيانات
                  </Button>
                </VStack>
              </Center>
            </>
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
          >
            {subjects.map((subject, index) => (
              <Subject
                key={index}
                title={subject.title}
                id={subject.id}
                icon={subject.icon}
                onDelete={() => {
                  SubjectDeleteConfirm.open("deleteSubject", {
                    id: subject.id,
                    title: subject.title,
                    onSuccess: () => {
                      console.log(JSON.stringify(subjects));
                      console.log(subject.id);

                      setSubjects((subjects) =>
                        subjects.filter(({ id }) => id !== subject.id)
                      );
                    },
                  });
                }}
              />
            ))}
          </Grid>
        </Show>
      </Grid>
      <Presence
        present={isLoading && subjectCounter === subjects.length}
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
      <IconSelector.Viewport />
      <SubjectDeleteConfirm.Viewport />
      <ResourceDialog.Viewport />
      <Toaster />
    </>
  );
}
