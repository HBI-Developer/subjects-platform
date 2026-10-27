import { Center, Flex, Heading, Icon, Show, Text } from "@chakra-ui/react";
import { Icon as Iconify } from "@iconify/react";
import type { FirestoreError, QueryDocumentSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { BiChevronRight } from "react-icons/bi";
import { GiSolarSystem } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { ErrorMessage, Panel } from "@/components";
import VirtualPanelList from "@/components/virtualpanellist";
import { NAVIGATION_DURATION, TITLE } from "@/constants";
import getSubjectsPage from "@/functions/getsubjectspage";
import navigate from "@/functions/navigate";
import type { RootState } from "@/store";
import { setSubjectIdentifier } from "@/store/slice/identifier";
import { setMainLoading } from "@/store/slice/loading";
import { setScope } from "@/store/slice/scope";

export default function Subjects() {
  const color = useSelector((state: RootState) => state.color.value),
    collection = useSelector((state: RootState) => state.identifier.collection),
    dispatch = useDispatch(),
    [subjects, setSubjects] = useState<Array<SubjectInterface>>([]),
    [error, setError] = useState<number | string>(0),
    [hasMore, setHasMore] = useState(true),
    [isLoadingMore, setIsLoadingMore] = useState(false),
    cursor = useRef<QueryDocumentSnapshot | undefined>(undefined),
    fetchSubjects = useCallback(
      async (nextPage = false) => {
        if (!collection.id) {
          dispatch(setMainLoading(false));
          dispatch(setScope(2));
          return;
        }
        if (nextPage && (!hasMore || isLoadingMore)) return;
        nextPage ? setIsLoadingMore(true) : dispatch(setMainLoading(true));
        try {
          const page = await getSubjectsPage(collection.id, nextPage ? cursor.current : undefined);
          cursor.current = page.cursor;
          setHasMore(page.hasMore);
          setSubjects((previous) => (nextPage ? [...previous, ...page.data] : page.data));
        } catch (error_) {
          const error = error_ as FirestoreError;
          setError(error.code);
        } finally {
          setIsLoadingMore(false);
          if (!nextPage) {
            dispatch(setMainLoading(false));
            dispatch(setScope(3));
          }
        }
      },
      [collection.id, dispatch, hasMore, isLoadingMore],
    );

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only fetch; helper has per-render identity and is also called from the retry handler
  useEffect(() => {
    if (!collection.id) {
      document.title = `${TITLE} | قائمة المجموعات`;
      dispatch(setMainLoading(false));
      dispatch(setScope(2));
      return;
    }

    document.title = `${TITLE} | ${collection.title}`;
    void fetchSubjects();
  }, []);

  return (
    <Flex
      width={"100%"}
      flexDirection={"column"}
      rowGap={"15px"}
      h={"100%"}
      p={"1rem"}
      paddingRight={{ base: "1rem", md: "1.2rem" }}
      className="custom-scroll"
      position={"relative"}
      overflow="hidden"
      alignItems={{ base: "center", md: "flex-start" }}
    >
      <Flex
        columnGap={"10px"}
        alignItems={"center"}
        userSelect={"none"}
        cursor={"pointer"}
        zIndex={7}
        alignSelf={"flex-start"}
        onClick={() => navigate(2.5, 1.5)}
        transition={".2s color ease-in-out"}
        color={{ base: color, _hover: `${color}.500` }}
      >
        <BiChevronRight size={30} />
        <Heading>{collection.title}</Heading>
      </Flex>
      <Show
        when={!error}
        fallback={
          <ErrorMessage
            retry={() => {
              dispatch(setMainLoading(true));
              dispatch(setScope(2.5));
              setTimeout(() => {
                setError(0);
                fetchSubjects();
              }, NAVIGATION_DURATION);
            }}
            code={error}
          />
        }
      >
        <Show
          when={subjects.length}
          fallback={
            <Center
              position={"absolute"}
              top={0}
              bottom={0}
              left={0}
              right={0}
              color={color}
              userSelect={"none"}
              flexDirection={"column"}
              rowGap={"10px"}
            >
              <Icon boxSize={"55px"}>
                <GiSolarSystem />
              </Icon>
              <Text>ﻻ يوجد مواد هنا بعد</Text>
            </Center>
          }
        >
          <VirtualPanelList
            items={subjects}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={() => void fetchSubjects(true)}
            renderItem={(subject) => (
              <Panel
                key={subject.id}
                title={subject.title}
                icon={<Iconify icon={subject.icon} />}
                onClick={() => {
                  dispatch(setMainLoading(true));
                  dispatch(setSubjectIdentifier({ title: subject.title, id: subject.id }));
                  navigate(2.5, 3.5);
                }}
              />
            )}
          />
        </Show>
      </Show>
    </Flex>
  );
}
