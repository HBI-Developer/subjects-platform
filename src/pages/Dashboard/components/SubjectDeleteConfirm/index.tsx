import { toaster } from "@/components/ui/toaster";
import { db } from "@/firebase-config";
import getErrorMessage from "@/functions/getErrorMessage";
import { Button, createOverlay, Dialog, Portal } from "@chakra-ui/react";
import type { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { useState } from "react";

interface Props {
  id: string;
  title: string;
  onSuccess: () => void;
}

const subjectDeleteConfirm = createOverlay<Props>(
  ({ id, title, onSuccess, ...rest }: Props) => {
    const [deleting, setDeleting] = useState(false),
      startDeleting = async () => {
        if (!window.navigator.onLine) {
          toaster.create({
            title:
              "اتصالك بالإنترنت مقطوع، رجاءً اتصل بالانترنت ثم حاول مجدداً",
            type: "error",
          });

          return;
        }
        setDeleting(true);
        const batch = writeBatch(db);

        try {
          const subjectRef = doc(db, "subjects", id);
          const resourcesQuery = query(
            collection(db, "resources"),
            where("subject", "==", subjectRef)
          );
          const resourcesSnapshot = await getDocs(resourcesQuery);

          resourcesSnapshot.forEach((resourceDoc) => {
            batch.delete(resourceDoc.ref);
          });

          batch.delete(subjectRef);

          await batch.commit();
          onSuccess();
        } catch (er) {
          const error = er as FirebaseError;
          toaster.create({
            title: getErrorMessage(error.code),
            type: "error",
          });
        } finally {
          subjectDeleteConfirm.close("deleteSubject");
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
                <Dialog.Title>هل أنت متأكد؟</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body spaceY="4">
                <p>
                  هل أنت متأكد من أنك تريد حذف مادة {title} مع جميع مواردها؟
                </p>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button loading={deleting} variant="outline">
                    إلغاء الأمر
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  loading={deleting}
                  colorPalette="red"
                  onClick={startDeleting}
                >
                  تأكيد
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    );
  }
);

export default subjectDeleteConfirm;
