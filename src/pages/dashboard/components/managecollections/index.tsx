import {
  Button,
  createOverlay,
  Dialog,
  Flex,
  Heading,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { FirebaseError } from "firebase/app";
import { collection, doc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { type Dispatch, type SetStateAction, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { toaster } from "@/components/ui/toaster";
import { ORPHAN_COLLECTION_ID } from "@/constants";
import { db } from "@/firebase-config";
import getErrorMessage from "@/functions/geterrormessage";
import { CollectionDialog } from "..";

interface Props {
  collections: Array<CollectionInterface>;
  subjects: Array<SubjectInterface>;
  setCollections: Dispatch<SetStateAction<Array<CollectionInterface>>>;
  setSubjects: Dispatch<SetStateAction<Array<SubjectInterface>>>;
}

const manageCollections = createOverlay<Props>(
  ({ collections, subjects, setCollections, setSubjects, ...rest }) => {
    const [deletingId, setDeletingId] = useState(""),
      [confirmId, setConfirmId] = useState(""),
      close = () => manageCollections.close("manageCollections"),
      visibleCollections = collections.filter(
        (collection) => collection.id !== ORPHAN_COLLECTION_ID,
      ),
      countFor = (collectionId: string) =>
        subjects.filter((subject) => subject.belongToId === collectionId).length,
      applyCollectionTitle = (collectionId: string) => (title: string) => {
        setCollections((prev) =>
          prev.map((item) => (item.id === collectionId ? { ...item, title } : item)),
        );
      },
      openEditCollection = (collection: CollectionInterface) => {
        CollectionDialog.open("collectionDialog", {
          process: "edit",
          id: collection.id,
          title: collection.title,
          setCollectionTitle: applyCollectionTitle(collection.id),
        });
      },
      startDeleting = async (collectionId: string, collectionTitle: string) => {
        if (!window.navigator.onLine) {
          toaster.create({
            title: "اتصالك بالإنترنت مقطوع، رجاءً اتصل بالانترنت ثم حاول مجدداً",
            type: "error",
          });

          return;
        }

        setDeletingId(collectionId);

        try {
          const batch = writeBatch(db),
            collectionRef = doc(db, "collections", collectionId),
            orphanRef = doc(db, "collections", ORPHAN_COLLECTION_ID),
            subjectsQuery = query(
              collection(db, "subjects"),
              where("belongTo", "==", collectionRef),
            ),
            subjectsSnapshot = await getDocs(subjectsQuery);

          subjectsSnapshot.forEach((subjectDoc) => {
            batch.update(subjectDoc.ref, { belongTo: orphanRef });
          });

          batch.delete(collectionRef);
          await batch.commit();

          localStorage.removeItem("last_fetch_collections");
          localStorage.removeItem(`last_fetch_sub_${collectionId}`);

          setCollections((prev) => prev.filter(({ id }) => id !== collectionId));
          setSubjects((prev) =>
            prev.map((subject) =>
              subject.belongToId === collectionId
                ? { ...subject, belongToId: ORPHAN_COLLECTION_ID }
                : subject,
            ),
          );
          setConfirmId("");

          toaster.create({
            title: `تم حذف "${collectionTitle}" ونقل موادها إلى اليتامى`,
            type: "success",
          });
        } catch (error_) {
          const error = error_ as FirebaseError;
          toaster.create({
            title: getErrorMessage(error.code).message,
            type: "error",
          });
        } finally {
          setDeletingId("");
        }
      };

    return (
      <Dialog.Root {...rest} placement={"center"} size={{ base: "cover", md: "md" }}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              backgroundColor={"bg"}
              border={"1px solid"}
              borderColor={"purple.800!important"}
              userSelect={"none"}
              height={"auto"}
              maxHeight={"80vh"}
              overflowY={"auto"}
            >
              <Dialog.Header justifyContent={"center"}>
                <Dialog.Title>إدارة المجموعات</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body spaceY="4">
                <VStack alignItems={"stretch"} rowGap={"10px"}>
                  {visibleCollections.length === 0 && (
                    <Text color={"gray.500"} textAlign={"center"}>
                      ﻻ توجد مجموعات بعد
                    </Text>
                  )}
                  {visibleCollections.map((collection) => (
                    <Flex
                      key={collection.id}
                      alignItems={"center"}
                      justifyContent={"space-between"}
                      gap={"10px"}
                      padding={".5rem"}
                      borderRadius={".35rem"}
                      backgroundColor={"gray.800"}
                      border={"1px solid"}
                      borderColor={"purple.800"}
                    >
                      <VStack alignItems={"flex-start"} rowGap={"0"} flex={"1"} overflow={"hidden"}>
                        <Heading size={"sm"} truncate maxWidth={"100%"}>
                          {collection.title}
                        </Heading>
                        <Text textStyle={"xs"} color={"gray.500"}>
                          {countFor(collection.id) === 0
                            ? "ﻻ توجد مواد"
                            : `${countFor(collection.id)} مادة`}
                        </Text>
                      </VStack>
                      {confirmId === collection.id ? (
                        <Flex gap={"5px"}>
                          <Button
                            size={"xs"}
                            variant={"outline"}
                            colorPalette={"gray"}
                            onClick={() => setConfirmId("")}
                          >
                            إلغاء
                          </Button>
                          <Button
                            size={"xs"}
                            colorPalette={"red"}
                            loading={deletingId === collection.id}
                            onClick={() => {
                              void startDeleting(collection.id, collection.title);
                            }}
                          >
                            تأكيد الحذف
                          </Button>
                        </Flex>
                      ) : (
                        <Flex gap={"5px"}>
                          <Button
                            size={"xs"}
                            variant={"ghost"}
                            colorPalette={"teal"}
                            onClick={() => openEditCollection(collection)}
                          >
                            <MdEdit />
                          </Button>
                          <Button
                            size={"xs"}
                            variant={"ghost"}
                            colorPalette={"red"}
                            loading={deletingId === collection.id}
                            onClick={() => setConfirmId(collection.id)}
                          >
                            <FaTrash />
                          </Button>
                        </Flex>
                      )}
                    </Flex>
                  ))}
                </VStack>
                <Flex justifyContent={"center"}>
                  <Button variant={"outline"} colorPalette={"gray"} onClick={close}>
                    إغلاق
                  </Button>
                </Flex>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    );
  },
);

export default manageCollections;
