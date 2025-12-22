import { ErrorMessage, Panel } from "@/components";
import { db } from "@/firebase-config.ts";
import navigate from "@/functions/navigate";
import { Flex, Show } from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import {
  collection,
  FirestoreError,
  getDocsFromCache,
  getDocsFromServer,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { setMainLoading } from "@/store/slice/loading";
import { setScope } from "@/store/slice/scope";
import { setSubjectIdentifier } from "@/store/slice/identifier";
import { NAVIGATION_DURATION } from "@/constants";

interface Subject {
  id: string;
  icon: string;
  title: string;
}

export default function Subjects() {
  const [subjects, setSubjects] = useState<Array<Subject>>([]),
    [error, setError] = useState<number | string>(0),
    loading = useSelector((state: RootState) => state.loading.main),
    dispatch = useDispatch();

  const fetchSubjects = async () => {
    const CACHE_KEY = "last_fetch_subjects";
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    try {
      const subjectsCollection = collection(db, "subjects");
      const lastFetch = localStorage.getItem(CACHE_KEY);
      const now = Date.now();

      let snapshot;
      const isDataFresh = lastFetch && now - parseInt(lastFetch) < ONE_DAY_MS;

      if (isDataFresh) {
        try {
          snapshot = await getDocsFromCache(subjectsCollection);
          if (snapshot.empty) throw new Error("Cache empty");
        } catch (_) {
          snapshot = await getDocsFromServer(subjectsCollection);
          localStorage.setItem(CACHE_KEY, now.toString());
        }
      } else {
        snapshot = await getDocsFromServer(subjectsCollection);
        localStorage.setItem(CACHE_KEY, now.toString());
      }

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Array<Subject>;

      setSubjects(data);
    } catch (er) {
      const error = er as FirestoreError;

      setError(error.code);
    } finally {
      dispatch(setMainLoading(false));
      dispatch(setScope(2));
    }
  };

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                fetchSubjects();
              }, NAVIGATION_DURATION);
            }}
            code={error}
          />
        }
      >
        {subjects.map((subject, i) => {
          return (
            <Panel
              key={i}
              title={subject.title}
              icon={<Icon icon={subject.icon} />}
              onClick={() => {
                dispatch(setMainLoading(true));
                dispatch(
                  setSubjectIdentifier({ title: subject.title, id: subject.id })
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
