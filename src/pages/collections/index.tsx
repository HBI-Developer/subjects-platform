import { Center, Flex, Show } from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import type { FirestoreError, QueryDocumentSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { ErrorMessage, Panel } from "@/components";
import VirtualPanelList from "@/components/virtualpanellist";
import { NAVIGATION_DURATION, ORPHAN_COLLECTION_ID, TITLE } from "@/constants";
import getCollectionsPage from "@/functions/getcollectionspage";
import navigate from "@/functions/navigate";
import { setCollectionIdentifier } from "@/store/slice/identifier";
import { setMainLoading } from "@/store/slice/loading";
import { setScope } from "@/store/slice/scope";

export default function Collections() {
  const [collections, setCollections] = useState<Array<CollectionInterface>>([]),
    [error, setError] = useState<number | string>(0),
    [hasMore, setHasMore] = useState(true),
    [isLoadingMore, setIsLoadingMore] = useState(false),
    cursor = useRef<QueryDocumentSnapshot | undefined>(undefined),
    dispatch = useDispatch();

  const fetchCollections = useCallback(
    async (nextPage = false) => {
      if (nextPage && (!hasMore || isLoadingMore)) return;
      nextPage ? setIsLoadingMore(true) : dispatch(setMainLoading(true));
      try {
        const page = await getCollectionsPage(nextPage ? cursor.current : undefined);
        cursor.current = page.cursor;
        setHasMore(page.hasMore);
        setCollections((previous) => {
          const next = page.data.filter((collection) => collection.id !== ORPHAN_COLLECTION_ID);
          return nextPage ? [...previous, ...next] : next;
        });
      } catch (error_) {
        const error = error_ as FirestoreError;
        setError(error.code);
      } finally {
        setIsLoadingMore(false);
        if (!nextPage) {
          dispatch(setMainLoading(false));
          dispatch(setScope(2));
        }
      }
    },
    [dispatch, hasMore, isLoadingMore],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only fetch; helper has per-render identity and is also called from the retry handler
  useEffect(() => {
    document.title = `${TITLE} | قائمة المجموعات`;
    void fetchCollections();
  }, []);

  return (
    <Flex
      width={"100%"}
      flexDirection={"column"}
      rowGap={"15px"}
      h={"100%"}
      p={"1rem"}
      position={"relative"}
      className="custom-scroll"
      overflow="hidden"
      alignItems={{ base: "center", md: "flex-start" }}
    >
      <Show
        when={!error}
        fallback={
          <ErrorMessage
            retry={() => {
              dispatch(setMainLoading(true));
              dispatch(setScope(1.5));
              setTimeout(() => {
                setError(0);
                fetchCollections();
              }, NAVIGATION_DURATION);
            }}
            code={error}
          />
        }
      >
        <Show when={collections.length} fallback={<Center flex="1">ﻻ توجد مجموعات هنا بعد</Center>}>
          <VirtualPanelList
            items={collections}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={() => void fetchCollections(true)}
            renderItem={(collection) => (
              <Panel
                key={collection.id}
                title={collection.title}
                icon={<Icon icon="mingcute:folder-2-line" />}
                onClick={() => {
                  dispatch(setMainLoading(true));
                  dispatch(setCollectionIdentifier({ title: collection.title, id: collection.id }));
                  navigate(1.5, 2.5);
                }}
              />
            )}
          />
        </Show>
      </Show>
    </Flex>
  );
}
