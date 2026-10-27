import {
  Button,
  ButtonGroup,
  createOverlay,
  Dialog,
  Field,
  Flex,
  Icon,
  Input,
  NativeSelect,
  Portal,
  Show,
} from "@chakra-ui/react";
import { Icon as Iconify } from "@iconify/react";
import type { FirebaseError } from "firebase/app";
import { collection, doc, increment, runTransaction } from "firebase/firestore";
import type React from "react";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { ORPHAN_COLLECTION_ID } from "@/constants";
import { db } from "@/firebase-config";
import getErrorMessage from "@/functions/geterrormessage";
import { IconSelector } from "..";

interface Props {
  process: "add" | "edit";
  id?: string;
  title?: string;
  icon?: string;
  belongToId?: string;
  collections: Array<CollectionInterface>;
  setSubjectTitle?: (title: string) => void;
  setSubjectIcon?: (icon: string) => void;
  setSubjectCollection?: (belongToId: string) => void;
  setSubject?: (
    id: string,
    title: string,
    icon: string,
    createdTime: number,
    belongToId: string,
  ) => void;
}

const initialIcon = "mingcute:book-4-line";

function validateSubjectFields(title: string, belongToId: string): string {
  if (!title) return "ﻻ يمكن أن يكون حقل الاسم فارغاً";
  if (title.length <= 2) return "الاسم صغير للغاية، يجب أن يتكون من 3 أحرف على الأقل";
  if (title.length > 60) return "النص أطول من حياتك، يجب أن يتكون من 60 حرف على الأكثر";
  if (!belongToId) return "يجب اختيار المجموعة التي تنتمي إليها المادة";
  if (!window.navigator.onLine) return "اتصالك بالإنترنت مقطوع، رجاءً اتصل بالانترنت ثم حاول مجدداً";
  return "";
}

function clearSubjectCache(belongToId: string, defaultBelongToId?: string): void {
  localStorage.removeItem("last_fetch_subjects");
  localStorage.removeItem(`last_fetch_sub_${belongToId}`);
  if (defaultBelongToId) {
    localStorage.removeItem(`last_fetch_sub_${defaultBelongToId}`);
  }
}

function notifySubjectError(error: string, setIsProcess: (v: boolean) => void): void {
  toaster.create({ title: error, type: "error" });
  setIsProcess(false);
}

const subjectDialog = createOverlay<Props>(
  ({
    id,
    title: defaultTitle,
    icon: defaultIcon,
    belongToId: defaultBelongToId,
    collections,
    setSubjectIcon,
    setSubjectTitle,
    setSubjectCollection,
    setSubject,
    process,
    ...rest
  }) => {
    const selectableCollections = collections.filter(
      (collection) => collection.id !== ORPHAN_COLLECTION_ID,
    );
    const [icon, setIcon] = useState(defaultIcon || initialIcon),
      [title, setTitle] = useState(defaultTitle || ""),
      [belongToId, setBelongToId] = useState(defaultBelongToId || ""),
      [isProcess, setIsProcess] = useState(false),
      close = () => subjectDialog.close("subjectDialog"),
      checkFields = () => validateSubjectFields(title, belongToId),
      addSubject = async () => {
        setIsProcess(true);

        let error = checkFields();

        if (!error) {
          try {
            const time = Date.now();
            const belongToRef = doc(db, "collections", belongToId);
            const subjectRef = doc(collection(db, "subjects"));
            await runTransaction(db, async (transaction) => {
              transaction.set(subjectRef, {
                title,
                icon,
                belongTo: belongToRef,
                createdTime: time,
                relatedResources: 0,
              });
              transaction.update(belongToRef, { relatedSubjects: increment(1) });
            });

            clearSubjectCache(belongToId);

            if (setSubject) {
              setSubject(subjectRef.id, title, icon, time, belongToId);
            }
          } catch (error_) {
            const err = error_ as FirebaseError;
            error = getErrorMessage(err.code).message;
          } finally {
            setIsProcess(false);
          }
        }

        if (error) {
          notifySubjectError(error, setIsProcess);
          return;
        }

        return true;
      },
      updateSubject = async () => {
        if (
          (defaultTitle &&
            title === defaultTitle &&
            defaultIcon &&
            icon === defaultIcon &&
            defaultBelongToId &&
            belongToId === defaultBelongToId) ||
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
            const belongToRef = doc(db, "collections", belongToId);
            await runTransaction(db, async (transaction) => {
              const subjectSnapshot = await transaction.get(subjectRef);
              if (!subjectSnapshot.exists()) throw new Error("not-found");
              const previousCollection = subjectSnapshot.data().belongTo;
              transaction.update(subjectRef, { title, icon, belongTo: belongToRef });
              if (previousCollection?.path !== belongToRef.path) {
                transaction.update(previousCollection, { relatedSubjects: increment(-1) });
                transaction.update(belongToRef, { relatedSubjects: increment(1) });
              }
            });

            clearSubjectCache(belongToId, defaultBelongToId);

            if (setSubjectTitle && setSubjectIcon && setSubjectCollection) {
              setSubjectTitle(title);
              setSubjectIcon(icon);
              setSubjectCollection(belongToId);
            }
          } catch (error_) {
            const err = error_ as FirebaseError;
            error = getErrorMessage(err.code).message;
          } finally {
            setIsProcess(false);
          }
        }

        if (error) {
          notifySubjectError(error, setIsProcess);
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
                <Dialog.Title>{process === "add" ? "إضافة مادة" : "تعديل مادة"}</Dialog.Title>
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
                        const value = (ev.currentTarget as HTMLInputElement).value;

                        setTitle(value);
                      }}
                      variant={"flushed"}
                    />
                    <Field.ErrorText>This field is required</Field.ErrorText>
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>
                      المجموعة <Field.RequiredIndicator />
                    </Field.Label>
                    <NativeSelect.Root width={"100%"}>
                      <NativeSelect.Field
                        value={belongToId}
                        onChange={(ev: React.ChangeEvent) => {
                          const value = (ev.currentTarget as HTMLSelectElement).value;
                          setBelongToId(value);
                        }}
                      >
                        <option value="">اختر المجموعة</option>
                        {selectableCollections.map((collection) => (
                          <option key={collection.id} value={collection.id}>
                            {collection.title}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                    <Field.ErrorText>This field is required</Field.ErrorText>
                  </Field.Root>
                  <ButtonGroup variant={"outline"} colorPalette={"teal"}>
                    <Button loading={isProcess} colorPalette={"gray"} onClick={close}>
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
                            setBelongToId("");
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
  },
);

export default subjectDialog;
