import {
  Button,
  ButtonGroup,
  createOverlay,
  Dialog,
  Field,
  Flex,
  Input,
  Portal,
} from "@chakra-ui/react";
import type { FirebaseError } from "firebase/app";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import type React from "react";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { db } from "@/firebase-config";
import cleanName, { checkCleanName } from "@/functions/cleanname";
import getErrorMessage from "@/functions/geterrormessage";

interface Props {
  process: "add" | "edit";
  id?: string;
  title?: string;
  setCollectionTitle?: (title: string) => void;
  setCollection?: (id: string, title: string, createdTime: number) => void;
}

const collectionDialog = createOverlay<Props>(
  ({ id, title: defaultTitle, setCollectionTitle, setCollection, process, ...rest }) => {
    const [title, setTitle] = useState(defaultTitle || ""),
      [isProcess, setIsProcess] = useState(false),
      close = () => collectionDialog.close("collectionDialog"),
      checkFields = (cleaned: string) => {
        return checkCleanName(cleaned);
      },
      addCollection = async () => {
        setIsProcess(true);

        const cleaned = cleanName(title);
        let error = checkFields(cleaned);

        if (!error) {
          try {
            const time = Date.now();
            const docRef = await addDoc(collection(db, "collections"), {
              title: cleaned,
              createdTime: time,
            });

            localStorage.removeItem("last_fetch_collections");

            if (setCollection) {
              setCollection(docRef.id, cleaned, time);
            }
          } catch (error_) {
            const err = error_ as FirebaseError;
            error = getErrorMessage(err.code).message;
          } finally {
            setIsProcess(false);
          }
        }

        if (error) {
          toaster.create({
            title: error,
            type: "error",
          });
          setIsProcess(false);
          return;
        }

        return true;
      },
      updateCollection = async () => {
        const cleaned = cleanName(title);

        if ((defaultTitle && cleaned === defaultTitle) || !id) {
          close();
          return;
        }

        setIsProcess(true);

        let error = checkFields(cleaned);

        if (!error) {
          try {
            const collectionRef = doc(db, "collections", id);
            await updateDoc(collectionRef, {
              title: cleaned,
            });

            localStorage.removeItem("last_fetch_collections");

            if (setCollectionTitle) {
              setCollectionTitle(cleaned);
            }
          } catch (error_) {
            const err = error_ as FirebaseError;
            error = getErrorMessage(err.code).message;
          } finally {
            setIsProcess(false);
          }
        }

        if (error) {
          toaster.create({
            title: error,
            type: "error",
          });
          setIsProcess(false);
          return;
        }

        return true;
      };

    return (
      <Dialog.Root
        {...rest}
        placement={"center"}
        size={{ base: "cover", md: "md" }}
        closeOnEscape={!isProcess}
        closeOnInteractOutside={!isProcess}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              backgroundColor={"bg"}
              border={"1px solid"}
              borderColor={"purple.800!important"}
              userSelect={"none"}
              height={"auto"}
            >
              <Dialog.Header justifyContent={"center"}>
                <Dialog.Title>{process === "add" ? "إضافة مجموعة" : "تعديل مجموعة"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body spaceY="4">
                <Flex
                  flexDirection={"column"}
                  justifyContent={"center"}
                  rowGap={"20px"}
                  alignItems={"center"}
                >
                  <Field.Root required>
                    <Field.Label>
                      اسم المجموعة <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      width={"100%"}
                      placeholder="أكتب اسم المجموعة"
                      maxLength={60}
                      minLength={3}
                      value={title}
                      onChange={(ev: React.ChangeEvent) => {
                        const value = (ev.currentTarget as HTMLInputElement).value;

                        setTitle(value);
                      }}
                      variant={"flushed"}
                    />
                    <Field.ErrorText>This field is required</Field.ErrorText>
                  </Field.Root>
                  <ButtonGroup variant={"outline"} colorPalette={"teal"}>
                    <Button loading={isProcess} colorPalette={"gray"} onClick={close}>
                      إغلاق
                    </Button>
                    <Button
                      loading={isProcess}
                      onClick={async () => {
                        let success = false;

                        if (process === "edit") {
                          success = Boolean(await updateCollection());
                        } else {
                          success = Boolean(await addCollection());
                        }

                        if (success) {
                          if (process === "add") {
                            setTitle("");
                          } else {
                            close();
                          }
                        }
                      }}
                    >
                      حفظ
                    </Button>
                  </ButtonGroup>
                </Flex>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    );
  },
);

export default collectionDialog;
