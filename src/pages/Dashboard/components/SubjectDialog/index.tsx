import {
  Button,
  ButtonGroup,
  createOverlay,
  Dialog,
  Field,
  Flex,
  Icon,
  Input,
  Portal,
  Show,
} from "@chakra-ui/react";
import { Icon as Iconify } from "@iconify/react";
import { IconSelector } from "..";
import React, { useState } from "react";
import { toaster } from "@/components/ui/toaster";
import type { FirebaseError } from "firebase/app";
import getErrorMessage from "@/functions/getErrorMessage";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase-config";

interface Props {
  process: "add" | "edit";
  id?: string;
  title?: string;
  icon?: string;
  setSubjectTitle?: (title: string) => void;
  setSubjectIcon?: (icon: string) => void;
  setSubject?: (
    id: string,
    title: string,
    icon: string,
    createdTime: number
  ) => void;
}

const initialIcon = "mingcute:book-4-line";

const subjectDialog = createOverlay<Props>(
  ({
    id,
    title: defaultTitle,
    icon: defaultIcon,
    setSubjectIcon,
    setSubjectTitle,
    setSubject,
    process,
    ...rest
  }) => {
    const [icon, setIcon] = useState(defaultIcon || initialIcon),
      [title, setTitle] = useState(defaultTitle || ""),
      [isProcess, setIsProcess] = useState(false),
      close = () => subjectDialog.close("subjectDialog"),
      checkFields = () => {
        let error = "";

        if (!title) {
          error = "ﻻ يمكن أن يكون حقل الاسم فارغاً";
        } else if (title.length <= 2) {
          error = "الاسم صغير للغاية، يجب أن يتكون من 3 أحرف على الأقل";
        } else if (title.length > 60) {
          error = "النص أطول من حياتك، يجب أن يتكون من 60 حرف على الأكثر";
        } else if (!window.navigator.onLine) {
          error = "اتصالك بالإنترنت مقطوع، رجاءً اتصل بالانترنت ثم حاول مجدداً";
        }

        return error;
      },
      addSubject = async () => {
        setIsProcess(true);

        let error = checkFields();

        if (!error) {
          try {
            const time = Date.now();
            const docRef = await addDoc(collection(db, "subjects"), {
              title,
              icon,
              createdTime: time,
            });

            if (setSubject) {
              setSubject(docRef.id, title, icon, time);
            }
          } catch (er) {
            const err = er as FirebaseError;
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
      updateSubject = async () => {
        if (
          (defaultTitle &&
            title === defaultTitle &&
            defaultIcon &&
            icon === defaultIcon) ||
          !id
        ) {
          close();
          return;
        }

        setIsProcess(true);

        let error = checkFields();

        if (!error) {
          try {
            const subjectRef = doc(db, "subjects", id);
            await updateDoc(subjectRef, {
              title,
              icon,
            });

            if (setSubjectTitle && setSubjectIcon) {
              setSubjectTitle(title);
              setSubjectIcon(icon);
            }
          } catch (er) {
            const err = er as FirebaseError;
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
                <Dialog.Title>
                  {process === "add" ? "إضافة مادة" : "تعديل مادة"}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body spaceY="4">
                <Flex
                  flexDirection={"column"}
                  justifyContent={"center"}
                  rowGap={"20px"}
                  alignItems={"center"}
                >
                  <Button
                    size={"xl"}
                    variant={"subtle"}
                    marginInline={"auto"}
                    onClick={() => {
                      IconSelector.open("iconSelector", {
                        setIcon,
                      });
                    }}
                  >
                    <Icon>
                      <Iconify icon={icon} />
                    </Icon>
                  </Button>
                  <Field.Root required>
                    <Field.Label>
                      اسم المادة <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      width={"100%"}
                      placeholder="أكتب اسم المادة"
                      maxLength={60}
                      minLength={3}
                      value={title}
                      onChange={(ev: React.ChangeEvent) => {
                        const value = (ev.currentTarget as HTMLInputElement)
                          .value;

                        setTitle(value);
                      }}
                      variant={"flushed"}
                    />
                    <Field.ErrorText>This field is required</Field.ErrorText>
                  </Field.Root>
                  <ButtonGroup variant={"outline"} colorPalette={"teal"}>
                    <Button
                      loading={isProcess}
                      colorPalette={"gray"}
                      onClick={close}
                    >
                      إغلاق
                    </Button>
                    <Show when={process === "add"}>
                      <Button
                        loading={isProcess}
                        onClick={async () => {
                          const success = Boolean(await addSubject());

                          if (success) {
                            setTitle("");
                            setIcon(initialIcon);
                          }
                        }}
                      >
                        حفظ وإضافة
                      </Button>
                    </Show>
                    <Button
                      loading={isProcess}
                      onClick={async () => {
                        let success = false;

                        if (process === "edit") {
                          success = Boolean(await updateSubject());
                        } else {
                          success = Boolean(await addSubject());
                        }

                        if (success) {
                          close();
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
  }
);

export default subjectDialog;
