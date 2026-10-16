import { Flex, Show } from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import type { FirestoreError } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ErrorMessage, Panel } from "@/components";
import { NAVIGATION_DURATION, ORPHAN_COLLECTION_ID, TITLE } from "@/constants";
import getCollections from "@/functions/getcollections";
import navigate from "@/functions/navigate";
import type { RootState } from "@/store";
import { setCollectionIdentifier } from "@/store/slice/identifier";
import { setMainLoading } from "@/store/slice/loading";
import { setScope } from "@/store/slice/scope";

export default function Collections() {
  const [collections, setCollections] = useState<Array<CollectionInterface>>([]),
    [error, setError] = useState<number | string>(0),
    loading = useSelector((state: RootState) => state.loading.main),
    dispatch = useDispatch();

  const fetchCollections = () => {
    void getCollections(
      (data) => {
        setCollections(data.filter((collection) => collection.id !== ORPHAN_COLLECTION_ID));
      },
      (error_) => {
        const error = error_ as FirestoreError;
        setError(error.code);
      },
      () => {
        dispatch(setMainLoading(false));
        dispatch(setScope(2));
      },
    );
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only fetch; helper has per-render identity and is also called from the retry handler
  useEffect(() => {
    document.title = `${TITLE} | قائمة المجموعات`;
    fetchCollections();
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
      overflowY={loading ? "hidden" : "auto"}
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
        {collections.map((collection) => {
          return (
            <Panel
              key={collection.id}
              title={collection.title}
              icon={<Icon icon="mingcute:folder-2-line" />}
              onClick={() => {
                dispatch(setMainLoading(true));
                dispatch(
                  setCollectionIdentifier({
                    title: collection.title,
                    id: collection.id,
                  }),
                );
                navigate(1.5, 2.5);
              }}
            />
          );
        })}
      </Show>
    </Flex>
  );
}
