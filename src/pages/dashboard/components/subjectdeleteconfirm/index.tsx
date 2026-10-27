import {
  Button,
  Center,
  createOverlay,
  Dialog,
  Portal,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  getDocFromServer,
  getDocsFromServer,
  increment,
  limit,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { db } from "@/firebase-config";
import getErrorMessage from "@/functions/geterrormessage";

interface Props {
  id: string;
  title: string;
  onSuccess: () => void;
}

const subjectDeleteConfirm = createOverlay<Props>(({ id, title, onSuccess, ...rest }: Props) => {
  const [deleting, setDeleting] = useState(false),
    [deletedResources, setDeletedResources] = useState(0),
    [deleteError, setDeleteError] = useState(""),
    startDeleting = async () => {
      if (!window.navigator.onLine) {
        toaster.create({
          title: "اتصالك بالإنترنت مقطوع، رجاءً اتصل بالانترنت ثم حاول مجدداً",
          type: "error",
        });

        return;
      }
      setDeleting(true);
      setDeleteError("");

      try {
        const subjectRef = doc(db, "subjects", id);
        const resourcesQuery = query(
          collection(db, "resources"),
          where("subject", "==", subjectRef),
        );
        let deleted = deletedResources;

        // Firestore allows up to 500 writes per batch. Keep margin for any
        // future bookkeeping writes and commit resource deletes in chunks.
        while (true) {
          const resourcesSnapshot = await getDocsFromServer(query(resourcesQuery, limit(450)));
          if (resourcesSnapshot.empty) break;

          const batch = writeBatch(db);
          resourcesSnapshot.docs.forEach((resourceDoc) => {
            batch.delete(resourceDoc.ref);
          });
          await batch.commit();
          deleted += resourcesSnapshot.size;
          setDeletedResources(deleted);
        }

        const subjectSnapshot = await getDocFromServer(subjectRef);
        const subjectData = subjectSnapshot.data();
        const batch = writeBatch(db);
        batch.delete(subjectRef);
        if (subjectData?.belongTo) {
          batch.update(subjectData.belongTo, { relatedSubjects: increment(-1) });
        }

        await batch.commit();
        localStorage.removeItem("last_fetch_subjects");
        localStorage.removeItem(`last_fetch_res_${id}`);
        onSuccess();
        subjectDeleteConfirm.close("deleteSubject");
      } catch (error_) {
        const error = error_ as FirebaseError;
        setDeleteError(getErrorMessage(error.code).message);
        toaster.create({
          title: getErrorMessage(error.code).message,
          type: "error",
        });
      } finally {
        setDeleting(false);
      }
    };

  return (
    <Dialog.Root
      {...rest}
      placement={"center"}
      role="alertdialog"
      closeOnEscape={!deleting}
      closeOnInteractOutside={!deleting}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{deleting ? "جارٍ حذف المادة" : "هل أنت متأكد؟"}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body spaceY="4">
              {deleting ? (
                <Center py="6">
                  <VStack gap="4">
                    <Spinner size="lg" />
                    <Text textAlign="center">
                      لا تغلق هذه النافذة. انتظر حتى يكتمل حذف المادة وجميع مصادرها.
                    </Text>
                    <Text textAlign="center" color="fg.muted">
                      تم حذف {deletedResources} مصدر حتى الآن
                    </Text>
                  </VStack>
                </Center>
              ) : (
                <>
                  <p>هل أنت متأكد من أنك تريد حذف مادة "{title}" مع جميع مصادرها؟</p>
                  {deleteError && (
                    <Text color="red.400">{deleteError} — أعد المحاولة لإكمال الحذف.</Text>
                  )}
                </>
              )}
            </Dialog.Body>
            {!deleting && (
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">إلغاء الأمر</Button>
                </Dialog.ActionTrigger>
                <Button colorPalette="red" onClick={startDeleting}>
                  {deleteError ? "إعادة المحاولة" : "تأكيد"}
                </Button>
              </Dialog.Footer>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
});

export default subjectDeleteConfirm;
