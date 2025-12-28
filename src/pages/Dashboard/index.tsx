import { ErrorMessage } from "@/components";
import { NAVIGATION_DURATION } from "@/constants";
import { auth } from "@/firebase-config";
import getResources from "@/functions/getResources";
import getSubjects from "@/functions/getSubjects";
import {
  Avatar,
  Box,
  Center,
  createListCollection,
  Flex,
  Grid,
  HStack,
  Icon,
  Portal,
  Presence,
  Select,
  Separator,
  Show,
  Spinner,
  Stack,
  Tabs,
  Text,
  type ListCollection,
} from "@chakra-ui/react";
import { Icon as Iconify } from "@iconify/react";
import type { FirestoreError } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { GiBookshelf, GiPapers } from "react-icons/gi";

function LoadingCircle({ open }: { open: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const bg = getComputedStyle(document.documentElement).backgroundColor,
      fg = getComputedStyle(
        document.getElementById("dashboard") || document.body
      ).backgroundColor;

    ref.current.style.setProperty(
      "background-color",
      `color-mix(in srgb, ${bg} 45%, ${fg} 55%)`
    );
  }, []);

  return (
    <Presence
      present={open}
      animationName={{
        _open: "fade-in",
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
      <Center
        ref={ref}
        position="absolute"
        top="0"
        bottom="0"
        left="0"
        right="0"
        backgroundColor={"#232323"}
      >
        <Spinner
          size={"lg"}
          color="colorPalette.400"
          borderWidth="4px"
          colorPalette={"gray"}
        />
      </Center>
    </Presence>
  );
}

export default function Dashboard() {
  const [user] = useAuthState(auth),
    [subjects, setSubjects] =
      useState<
        ListCollection<{ label: string; value: string; icon: string }>
      >(),
    [activeSubject, setActiveSubject] = useState<Array<string>>([]),
    [resources, setResources] = useState<
      ListCollection<{
        label: string;
        value: string;
        type: ResourceType;
        resources: Array<string>;
      }>
    >(),
    [error, setError] = useState<number | string>(0),
    [isLoading, setIsLoading] = useState(true);

  const fetchResources = () => {
      getResources(
        activeSubject[0],
        (data) => {
          console.log(data);

          setResources(
            createListCollection({
              items: data.map((item) => ({
                label: item.title,
                value: item.id,
                type: item.type,
                resources: item.resources,
              })),
            })
          );
        },
        (er) => {
          console.log(er);

          const error = er as FirestoreError;
          setError(error.code);
        },
        () => {
          setIsLoading(false);
        }
      );
    },
    fetchSubjects = () => {
      getSubjects(
        (data) => {
          setSubjects(
            createListCollection({
              items: data.map((item) => ({
                label: item.title,
                value: item.id,
                icon: item.icon,
              })),
            })
          );

          setActiveSubject([data[0].id]);
        },
        (er) => {
          const error = er as FirestoreError;
          setError(error.code);
        },
        () => {
          setIsLoading(false);
          fetchResources();
        }
      );
    };

  useEffect(() => {
    fetchSubjects();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex
      dir={"rtl"}
      margin={"2rem"}
      padding={"1rem"}
      id={"dashboard"}
      overflow={"hidden"}
      height={"calc(100dvh - 4rem)"}
      flexDirection={"column"}
      userSelect={"none"}
      borderRadius={".25rem"}
      backgroundColor={"#ffffff10"}
    >
      <Box>
        <HStack key={user?.email} gap="4">
          <Avatar.Root>
            <Avatar.Fallback name={user?.displayName || ""} />
            <Avatar.Image src={user?.photoURL || ""} />
          </Avatar.Root>
          <Stack gap="0" alignItems={"flex-start"}>
            <Text fontWeight="medium">{user?.displayName}</Text>
            <Text color="fg.muted" textStyle="sm">
              {user?.email}
            </Text>
          </Stack>
        </HStack>
      </Box>

      <Separator
        size={"md"}
        marginBlock={"10px 20px"}
        borderColor={"gray.600"}
      />

      <Tabs.Root
        defaultValue="subjects"
        height={"100%"}
        minH={0}
        css={{
          "& .chakra-tabs__content": {
            height: "100%",
            position: "relative",
          },
        }}
      >
        <Tabs.List>
          <Tabs.Trigger value="subjects">
            <GiBookshelf /> المواد
          </Tabs.Trigger>
          <Tabs.Trigger value="resources">
            <GiPapers />
            الموارد
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="subjects">
          <LoadingCircle open={isLoading} />
          <Show
            when={!error}
            fallback={
              <ErrorMessage
                retry={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setError(0);
                    fetchSubjects();
                  }, NAVIGATION_DURATION);
                }}
                code={error}
              />
            }
          >
            <Flex
              flexDirection={"column"}
              rowGap={"10px"}
              overflowY={"auto"}
              h={"90%"}
            >
              {subjects?.items.map((item) => {
                return (
                  <Grid
                    key={item.value}
                    templateColumns={"auto 1fr"}
                    backgroundColor="#00000010"
                    w={"99%"}
                    borderRadius={".25rem"}
                    css={{ "& > *": { padding: "1rem 2rem" } }}
                  >
                    <Center backgroundColor="rgba(0, 0, 0, 0.08)">
                      <Icon size={{ base: "sm", md: "lg" }}>
                        <Iconify icon={item.icon} />
                      </Icon>
                    </Center>
                    <Text
                      textAlign={"start"}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      {item.label}
                    </Text>
                  </Grid>
                );
              })}
            </Flex>
          </Show>
        </Tabs.Content>
        <Tabs.Content value="resources">
          <LoadingCircle open={isLoading} />
          {subjects && (
            <>
              <Select.Root
                collection={subjects}
                width="100%"
                value={activeSubject}
                onValueChange={(e) => setActiveSubject(e.value)}
                cursor={"pointer"}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="اختر مادة" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {subjects.items.map((subject) => (
                        <Select.Item item={subject} key={subject.value}>
                          {subject.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>

              <Show
                when={!error}
                fallback={
                  <ErrorMessage
                    retry={() => {
                      setIsLoading(true);
                      setTimeout(() => {
                        setError(0);
                        fetchResources();
                      }, NAVIGATION_DURATION);
                    }}
                    code={error}
                  />
                }
              >
                <Flex
                  flexDirection={"column"}
                  rowGap={"10px"}
                  overflowY={"auto"}
                  h={"90%"}
                >
                  {resources?.items.map((item) => {
                    return (
                      <Grid
                        key={item.value}
                        templateColumns={"auto 1fr"}
                        backgroundColor="#00000010"
                        w={"99%"}
                        borderRadius={".25rem"}
                        css={{ "& > *": { padding: "1rem 2rem" } }}
                      >
                        <Center backgroundColor="rgba(0, 0, 0, 0.08)">
                          <Icon size={{ base: "sm", md: "lg" }}>
                            <Iconify icon={"tabler:pdf"} />
                          </Icon>
                        </Center>
                        <Text
                          textAlign={"start"}
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          {item.label}
                        </Text>
                      </Grid>
                    );
                  })}
                </Flex>
              </Show>
            </>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  );
}
