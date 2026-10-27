import { Button, createOverlay, Dialog, Portal } from "@chakra-ui/react";
import type { FirebaseError } from "firebase/app";
import { doc, increment, writeBatch } from "firebase/firestore";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { db } from "@/firebase-config";
import getErrorMessage from "@/functions/geterrormessage";

interface Props {
  id: string;
  title: string;
  subjectId: string;
  onSuccess: () => void;
}

const resourceDeleteConfirm = createOverlay<Props>(
  ({ id, title, subjectId, onSuccess, ...rest }: Props) => {
    const [deleting, setDeleting] = useState(false),
      startDeleting = async () => {
        if (!window.navigator.onLine) {
          toaster.create({
            title: "اتصالك بالإنترنت مقطوع، رجاءً اتصل بالانترنت ثم حاول مجدداً",
            type: "error",
          });

          return;
        }
        setDeleting(true);
        try {
          const batch = writeBatch(db);
          batch.delete(doc(db, "resources", id));
          batch.update(doc(db, "subjects", subjectId), { relatedResources: increment(-1) });
          await batch.commit();
          localStorage.removeItem(`last_fetch_res_${subjectId}`);
          onSuccess();
        } catch (error_) {
          const error = error_ as FirebaseError;
          toaster.create({
            title: getErrorMessage(error.code).message,
            type: "error",
          });
        } finally {
          resourceDeleteConfirm.close("deleteResource");
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
                <p>هل أنت متأكد من أن تريد حذف المصدر "{title}"؟</p>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button loading={deleting} variant="outline">
                    إلغاء الأمر
                  </Button>
                </Dialog.ActionTrigger>
                <Button loading={deleting} colorPalette="red" onClick={startDeleting}>
                  تأكيد
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    );
  },
);

export default resourceDeleteConfirm;
