import { ErrorMessage, Panel } from "@/components";
import navigate from "@/functions/navigate";
import type { RootState } from "@/store";
import { Center, Flex, Heading, Icon, Show, Text } from "@chakra-ui/react";
import { BiChevronRight } from "react-icons/bi";
import { GiSolarSystem } from "react-icons/gi";
import {
  TbFileTypePdf,
  TbPhoto,
  TbHeadphones,
  TbBrandParsinta,
  TbBook2,
} from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { Resource } from "..";
import {
  collection,
  doc,
  FirestoreError,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import { useEffect, useState } from "react";
import { setMainLoading, setResourceLoading } from "@/store/slice/loading";
import { setScope } from "@/store/slice/scope";
import { NAVIGATION_DURATION } from "@/constants";

interface ResourceInterface {
  id: string;
  type: ResourceType;
  title: string;
  resources: Array<string>;
}

export default function Resources() {
  const color = useSelector((state: RootState) => state.color.value),
    loading = useSelector((state: RootState) => state.loading.main),
    subject = useSelector((state: RootState) => state.identifier.subject),
    dispatch = useDispatch(),
    [resources, setResources] = useState<Array<ResourceInterface>>([]),
    [error, setError] = useState<number | string>(0),
    fetchResource = async () => {
      try {
        const resourcesCollection = collection(db, "resources");
        const subjectRef = doc(db, "subjects", subject.id);
        const q = query(
          resourcesCollection,
          where("subject", "==", subjectRef)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => {
          const data = {
            id: doc.id,
            ...doc.data(),
          };

          //@ts-expect-error false data type
          delete data.subject;

          return data;
        }) as Array<ResourceInterface>;

        setResources(data);
      } catch (er) {
        const error = er as FirestoreError;
        setError(error.code);
      } finally {
        dispatch(setMainLoading(false));
        dispatch(setScope(3));
      }
    },
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

        default: {
          return <TbBook2 />;
        }
      }
    };

  useEffect(() => {
    fetchResource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      overflowY={loading ? "hidden" : "auto"}
      alignItems={{ base: "center", md: "flex-start" }}
    >
      <Flex
        columnGap={"10px"}
        alignItems={"center"}
        userSelect={"none"}
        cursor={"pointer"}
        zIndex={5}
        alignSelf={"flex-start"}
        onClick={() => navigate(2.5, 1.5)}
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
              dispatch(setScope(2.5));
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
          {resources.map((resource, i) => {
            return (
              <Panel
                key={i}
                title={resource.title}
                icon={getIcon(resource.type)}
                onClick={() => {
                  dispatch(setResourceLoading(true));
                  Resource.open("r", {
                    title: resource.title,
                    type: resource.type,
                    resources: resource.resources,
                  });
                }}
              />
            );
          })}
        </Show>
      </Show>
    </Flex>
  );
}
