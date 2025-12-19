import { ErrorMessage, Panel } from "@/components";
import { db } from "@/firebase-config.ts";
import navigate from "@/functions/navigate";
import { Flex, Show } from "@chakra-ui/react";
import { BiAtom } from "react-icons/bi";
import { collection, FirestoreError, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { setMainLoading } from "@/store/slice/loading";
import { setScope } from "@/store/slice/scope";

interface Subject {
  id: string;
  icon: string;
  title: string;
}

export default function Subjects() {
  const [subjects, setSubjects] = useState<Array<Subject>>([]),
    [error, setError] = useState(0),
    loading = useSelector((state: RootState) => state.loading.main),
    dispatch = useDispatch();

  const fetchSubjects = async () => {
    try {
      const subjectsCollection = collection(db, "subjects");
      const snapshot = await getDocs(subjectsCollection);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Array<Subject>;

      setSubjects(data);
    } catch (er) {
      const error = er as FirestoreError;
      let code = 500;

      switch (error.code as string) {
        case "CANCELLED": {
          break;
        }
        case "INVALID_ARGUMENT": {
          break;
        }
        case "DEADLINE_EXCEEDED": {
          break;
        }
        case "NOT_FOUND": {
          break;
        }
        case "ALREADY_EXISTS": {
          break;
        }
        case "PERMISSION_DENIED": {
          break;
        }
        case "RESOURCE_EXHAUSTED": {
          break;
        }
        case "FAILED_PRECONDITION": {
          break;
        }
        case "ABORTED": {
          break;
        }
        case "OUT_OF_RANGE": {
          break;
        }
        case "UNIMPLEMENTED": {
          break;
        }
        case "INTERNAL": {
          break;
        }
        case "UNAVAILABLE": {
          break;
        }
        case "DATA_LOSS": {
          break;
        }
        case "UNAUTHENTICATED": {
          break;
        }

        default: {
          code = 500;
        }
      }

      setError(code);
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
      <Show when={!error} fallback={<ErrorMessage code={error} />}>
        {subjects.map((subject, i) => {
          return (
            <Panel
              key={i}
              title={subject.title}
              icon={<BiAtom />}
              onClick={() => {
                navigate(1.5, 2.5);
              }}
            />
          );
        })}
      </Show>
    </Flex>
  );
}
