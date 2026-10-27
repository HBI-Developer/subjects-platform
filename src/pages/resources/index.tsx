import { Center, Flex, Heading, Icon, Show, Text } from "@chakra-ui/react";
import type { FirestoreError, QueryDocumentSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { BiChevronRight } from "react-icons/bi";
import { GiSolarSystem } from "react-icons/gi";
import {
  TbBook2,
  TbBrandOffice,
  TbBrandParsinta,
  TbFileTypePdf,
  TbHeadphones,
  TbPhoto,
} from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { ErrorMessage, Panel } from "@/components";
import VirtualPanelList from "@/components/virtualpanellist";
import { NAVIGATION_DURATION, TITLE } from "@/constants";
import getResourcesPage from "@/functions/getresourcespage";
import navigate from "@/functions/navigate";
import openResource from "@/functions/openresource";
import type { RootState } from "@/store";
import { setMainLoading, setResourceLoading } from "@/store/slice/loading";
import { setScope } from "@/store/slice/scope";

export default function Resources() {
  const color = useSelector((state: RootState) => state.color.value),
    subject = useSelector((state: RootState) => state.identifier.subject),
    dispatch = useDispatch(),
    [resources, setResources] = useState<Array<ResourceInterface>>([]),
    [error, setError] = useState<number | string>(0),
    [hasMore, setHasMore] = useState(true),
    [isLoadingMore, setIsLoadingMore] = useState(false),
    cursor = useRef<QueryDocumentSnapshot | undefined>(undefined),
    fetchResource = useCallback(
      async (nextPage = false) => {
        if (!subject.id) {
          dispatch(setMainLoading(false));
          dispatch(setScope(3));
          return;
        }

        if (nextPage && (!hasMore || isLoadingMore)) return;
        nextPage ? setIsLoadingMore(true) : dispatch(setMainLoading(true));
        try {
          const page = await getResourcesPage(subject.id, nextPage ? cursor.current : undefined);
          cursor.current = page.cursor;
          setHasMore(page.hasMore);
          setResources((previous) => (nextPage ? [...previous, ...page.data] : page.data));
        } catch (error_) {
          const error = error_ as FirestoreError;
          setError(error.code);
        } finally {
          setIsLoadingMore(false);
          if (!nextPage) {
            dispatch(setMainLoading(false));
            dispatch(setScope(4));
          }
        }
      },
      [dispatch, hasMore, isLoadingMore, subject.id],
    ),
    getIcon = (type: ResourceType) => {
      switch (type) {
        case "pdf": {
          return <TbFileTypePdf />;
        }

        case "images": {
          return <TbPhoto />;
        }

        case "audio": {
          return <TbHeadphones />;
        }

        case "video": {
          return <TbBrandParsinta />;
        }

        case "office": {
          return <TbBrandOffice />;
        }

        default: {
          return <TbBook2 />;
        }
      }
    };

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only fetch; helper has per-render identity and is also called from the retry handler
  useEffect(() => {
    if (!subject.id) {
      document.title = TITLE;
      dispatch(setMainLoading(false));
      dispatch(setScope(3));
      return;
    }

    document.title = `${TITLE} | ${subject.title}`;
    void fetchResource();
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
        onClick={() => navigate(3.5, 2.5)}
        transition={".2s color ease-in-out"}
        color={{ base: color, _hover: `${color}.500` }}
      >
        <BiChevronRight size={30} />
        <Heading>{subject.title}</Heading>
      </Flex>
      <Show
        when={!error}
        fallback={
          <ErrorMessage
            retry={() => {
              dispatch(setMainLoading(true));
              dispatch(setScope(3.5));
              setTimeout(() => {
                setError(0);
                fetchResource();
              }, NAVIGATION_DURATION);
            }}
            code={error}
          />
        }
      >
        <Show
          when={resources.length}
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
              <Text>ﻻ يوجد موارد هنا بعد</Text>
            </Center>
          }
        >
          <VirtualPanelList
            items={resources}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={() => void fetchResource(true)}
            renderItem={(resource) => (
              <Panel
                key={resource.id}
                title={resource.title}
                icon={getIcon(resource.type)}
                onClick={() => {
                  dispatch(setResourceLoading(true));
                  void openResource({
                    title: resource.title,
                    type: resource.type,
                    resources: resource.resources,
                  });
                }}
              />
            )}
          />
        </Show>
      </Show>
    </Flex>
  );
}
