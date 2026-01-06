import { toaster } from "@/components/ui/toaster";
import { db } from "@/firebase-config";
import getErrorMessage from "@/functions/getErrorMessage";
import { Button, createOverlay, Dialog, Portal } from "@chakra-ui/react";
import type { FirebaseError } from "firebase/app";
import { deleteDoc, doc } from "firebase/firestore";
import { useState } from "react";

interface Props {
  id: string;
  title: string;
  onSuccess: () => void;
}

const resourceDeleteConfirm = createOverlay<Props>(
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
        try {
          await deleteDoc(doc(db, "resources", id));
          onSuccess();
        } catch (er) {
          const error = er as FirebaseError;
          toaster.create({
            title: getErrorMessage(error.code),
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

export default resourceDeleteConfirm;
