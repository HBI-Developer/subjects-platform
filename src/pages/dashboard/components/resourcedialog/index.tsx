import {
  Box,
  Button,
  ButtonGroup,
  Center,
  createOverlay,
  Dialog,
  Flex,
  Group,
  Image,
  Input,
  NativeSelect,
  Portal,
  Presence,
  Show,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { BiPlus } from "react-icons/bi";
import { FaTimes } from "react-icons/fa";
import {
  TbBrandOffice,
  TbBrandParsinta,
  TbFileTypePdf,
  TbHeadphones,
  TbPhoto,
} from "react-icons/tb";
import { toaster } from "@/components/ui/toaster";
import { db } from "@/firebase-config";
import isAudioUrl from "@/helpers/isaudiourl";
import isImageUrl from "@/helpers/isimageurl";
import isOfficeUrl from "@/helpers/isofficeurl";
import isPdfUrl from "@/helpers/ispdfurl";
import isVideoUrl from "@/helpers/isvideourl";
import {
  archiveUrlMatchesType,
  detectSource,
  extractDriveId,
  isDriveUrl,
  normalizeResourceUrl,
  type ResourceSource,
  sourceErrorMessage,
  toDriveDirectUrl,
  toDriveShareUrl,
} from "@/helpers/normalizeresourceurl";
import {
  isUpdateUnchanged,
  resolveFinalStoragePure,
  toFirestoreErrorMessage,
  toResolveErrorMessage,
  validateResourceFields,
} from "@/helpers/resourceform";

interface Props {
  process: "add" | "edit";
  subjectId?: string;
  type?: ResourceType;
  title?: string;
  id?: string;
  resources?: Array<string>;
  setResource?: (
    id: string,
    type: ResourceType,
    title: string,
    resources: Array<string>,
    createdTime: number,
  ) => void;
  setResourceInfo?: (type: ResourceType, title: string, resources: Array<string>) => void;
}

const resourceTypes = [
  { value: "office", color: "orange", icon: <TbBrandOffice /> },
  { value: "video", color: "blue", icon: <TbBrandParsinta /> },
  { value: "audio", color: "cyan", icon: <TbHeadphones /> },
  { value: "images", color: "teal", icon: <TbPhoto /> },
  { value: "pdf", color: "red", icon: <TbFileTypePdf /> },
] as const;

function getSourcePlaceholder(source: ResourceSource): string {
  if (source === "gdrive") return "الصق رابط مشاركة Google Drive";
  if (source === "archive") return "الصق رابط details أو download من Internet Archive";
  return "أكتب رابط المصدر";
}

const resourceDialog = createOverlay<Props>(
  ({
    id,
    process,
    subjectId,
    type: initialType,
    title: initialTitle,
    resources: initialResources,
    setResource,
    setResourceInfo,
    ...rest
  }) => {
    const [type, setType] = useState(initialType || "office");
    const [title, setTitle] = useState(initialTitle || "");
    const [isChecking, setIsChecking] = useState(false);
    const [isProcess, setIsProcess] = useState(false);
    const [activeImage, setActiveImage] = useState(-1);
    const initialDisplayUrl = (() => {
      if (initialType === "images" || !initialResources?.[0]) return "";
      const first = initialResources[0];
      if (isDriveUrl(first) || (initialResources[1] && isDriveUrl(initialResources[1]))) {
        const id = extractDriveId(initialResources[1] || "") || extractDriveId(first);
        if (id) return toDriveShareUrl(id);
      }
      return first;
    })();
    const [url, setUrl] = useState(initialDisplayUrl);
    const initialDownloadUrl = (() => {
      if (initialType === "images" || !initialResources || initialResources.length < 2) return "";
      const first = initialResources[0] || "";
      const second = initialResources[1] || "";
      if (!second) return "";
      if (isDriveUrl(first) || isDriveUrl(second)) {
        const id = extractDriveId(first) || extractDriveId(second);
        if (id && second === toDriveDirectUrl(id)) return "";
      }
      return second;
    })();
    const [downloadUrl, setDownloadUrl] = useState(initialDownloadUrl);
    const [source, setSource] = useState<ResourceSource>(() =>
      initialType !== "images" && initialResources?.[0]
        ? detectSource(initialResources[0])
        : "link",
    );
    const [images, setImages] = useState<Array<string>>(initialResources || []);
    const sourcePlaceholder = getSourcePlaceholder(source);
    const resolveUrl = async (raw: string) => normalizeResourceUrl(source, raw, type);
    const checkUrl = async () => {
        if (!url.trim()) return;
        setIsChecking(true);
        try {
          const normalized = await resolveUrl(url);
          setUrl(normalized.displayUrl);
          // Drive links are validated by file-ID extraction only (HEAD/CORS unreliable).
          // The preview page itself is HTML, so strict content-type checks don't apply.
          if (source === "gdrive") return;

          let check = false;
          switch (type) {
            case "video": {
              check = await isVideoUrl(normalized.viewUrl);
              break;
            }
            case "audio": {
              check = await isAudioUrl(normalized.viewUrl);
              break;
            }
            case "pdf": {
              check = await isPdfUrl(normalized.viewUrl);
              break;
            }

            case "office": {
              check = typeof (await isOfficeUrl(normalized.viewUrl)) === "string";
              break;
            }
          }

          // Node-URL HEAD checks can still be flaky; the metadata lookup already
          // matched the file extension, so accept an extension match as fallback.
          if (!check && source === "archive") {
            check = archiveUrlMatchesType(normalized.viewUrl, type);
          }

          if (!check) {
            setUrl("");
            toaster.create({
              title: "نوع الملف غير صحيح أو حدثت مشكلة أثناء التحقق",
              type: "error",
            });
          }
        } catch (error) {
          setUrl("");
          toaster.create({
            title: sourceErrorMessage(error instanceof Error ? error.message : ""),
            type: "error",
          });
        } finally {
          setIsChecking(false);
        }
      },
      addImage = async () => {
        setIsChecking(true);
        const link = url,
          check = await isImageUrl(link);

        if (check) {
          setImages((images) => [...images, link]);
        } else {
          toaster.create({
            title: "نوع الملف غير صحيح أو حدثت مشكلة أثناء التحقق",
            type: "error",
          });
        }

        setUrl("");
        setIsChecking(false);
      },
      close = () => resourceDialog.close("resourceDialog"),
      checkFields = () =>
        validateResourceFields({
          title,
          type,
          url,
          downloadUrl,
          imagesLength: images.length,
          online: window.navigator.onLine,
        }),
      resolveFinalStorage = (normalized: Awaited<ReturnType<typeof resolveUrl>>): Array<string> =>
        resolveFinalStoragePure(normalized, downloadUrl),
      resolveForSave = async (): Promise<{
        readonly finalStorage: Array<string> | null;
        readonly error: string;
      }> => {
        if (type === "images") return { finalStorage: null, error: "" };
        try {
          const normalized = await resolveUrl(url);
          setUrl(normalized.displayUrl);
          return { finalStorage: resolveFinalStorage(normalized), error: "" };
        } catch (error_) {
          return { finalStorage: null, error: toResolveErrorMessage(error_) };
        }
      },
      failWith = (error: string) => {
        toaster.create({ title: error, type: "error" });
        setIsProcess(false);
      },
      persistAdd = async (
        finalStorage: Array<string> | null,
      ): Promise<{ readonly error: string }> => {
        try {
          const time = Date.now();
          const subjectRef = doc(db, "subjects", subjectId as string);
          const currentResources = type === "images" ? images : (finalStorage as Array<string>);
          const newDoc = await addDoc(collection(db, "resources"), {
            title,
            type: type,
            resources: currentResources,
            subject: subjectRef,
            createdTime: time,
          });
          localStorage.removeItem(`last_fetch_res_${subjectId}`);
          if (setResource) {
            setResource(newDoc.id, type, title, currentResources, time);
          }
          return { error: "" };
        } catch (error_) {
          return { error: toFirestoreErrorMessage(error_) };
        } finally {
          setIsProcess(false);
        }
      },
      persistUpdate = async (
        finalStorage: Array<string> | null,
      ): Promise<{ readonly error: string }> => {
        try {
          const resourceRef = doc(db, "resources", id as string);
          const resources = type === "images" ? images : (finalStorage as Array<string>);
          await updateDoc(resourceRef, { title, type: type, resources });
          if (setResourceInfo) {
            setResourceInfo(type, title, resources);
          }
          return { error: "" };
        } catch (error_) {
          return { error: toFirestoreErrorMessage(error_) };
        } finally {
          setIsProcess(false);
        }
      },
      addResource = async () => {
        if (!subjectId) {
          close();
          return;
        }
        setIsProcess(true);
        const fieldError = checkFields();
        if (fieldError) {
          failWith(fieldError);
          return;
        }
        const resolved = await resolveForSave();
        if (resolved.error) {
          failWith(resolved.error);
          return;
        }
        const saved = await persistAdd(resolved.finalStorage);
        if (saved.error) {
          failWith(saved.error);
          return;
        }
        return true;
      },
      updateResource = async () => {
        const initialStorage = initialResources || [];
        const unchanged = isUpdateUnchanged({
          id,
          type,
          initialType,
          title,
          initialTitle,
          source,
          initialStorage,
          downloadUrl,
          initialDownloadUrl,
          images,
          url,
          initialDisplayUrl,
        });
        if (unchanged) {
          close();
          return;
        }
        setIsProcess(true);
        const fieldError = checkFields();
        if (fieldError) {
          failWith(fieldError);
          return;
        }
        const resolved = await resolveForSave();
        let finalStorage = resolved.finalStorage;
        if (!resolved.error && type !== "images") {
          // Skip the update when the resolved pair matches what's already stored.
          if (JSON.stringify(finalStorage) === JSON.stringify(initialStorage)) {
            finalStorage = initialStorage;
          }
        }
        if (resolved.error) {
          failWith(resolved.error);
          return;
        }
        const saved = await persistUpdate(finalStorage);
        if (saved.error) {
          failWith(saved.error);
          return;
        }
        return true;
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
            >
              <Dialog.Header justifyContent={"center"}>
                <Dialog.Title>{process === "add" ? "إضافة مصدر" : "تعديل مصدر"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body spaceY="4">
                <Flex
                  flexDirection={"column"}
                  justifyContent={"center"}
                  rowGap={"20px"}
                  alignItems={"center"}
                >
                  <Tabs.Root
                    defaultValue={type}
                    variant="plain"
                    as={VStack}
                    w={"100%"}
                    alignItems={"center"}
                    rowGap={"20px"}
                    onValueChange={(e) => {
                      setType(e.value as ResourceType);
                      setSource("link");
                      setUrl("");
                      setDownloadUrl("");
                    }}
                  >
                    <Tabs.List bg="bg.muted" rounded="l3" p="1" display="flex" gap="10px">
                      {resourceTypes.map((type) => {
                        return (
                          <Tabs.Trigger value={type.value} asChild key={type.value}>
                            <Button
                              colorPalette={type.color}
                              variant={{ base: "ghost", _selected: "outline" }}
                            >
                              {type.icon}
                            </Button>
                          </Tabs.Trigger>
                        );
                      })}
                    </Tabs.List>

                    <Input
                      width={"100%"}
                      placeholder="أكتب اسم المصدر"
                      maxLength={150}
                      minLength={2}
                      value={title}
                      onChange={(ev: React.ChangeEvent) => {
                        const value = (ev.currentTarget as HTMLInputElement).value;

                        setTitle(value);
                      }}
                      variant={"flushed"}
                      required
                    />

                    <Show
                      when={type === "images"}
                      fallback={
                        <VStack width={"100%"} gap={"10px"} alignItems={"stretch"}>
                          <Flex width={"100%"} gap={"10px"} alignItems={"stretch"}>
                            <NativeSelect.Root width={"150px"} flexShrink={0}>
                              <NativeSelect.Field
                                value={source}
                                onChange={(ev: React.ChangeEvent) => {
                                  const value = (ev.currentTarget as HTMLSelectElement)
                                    .value as ResourceSource;
                                  setSource(value);
                                  setUrl("");
                                }}
                              >
                                <option value="link">رابط</option>
                                <option value="gdrive">Google Drive</option>
                                <option value="archive">Internet Archive</option>
                              </NativeSelect.Field>
                              <NativeSelect.Indicator />
                            </NativeSelect.Root>
                            <Input
                              flex={"1"}
                              placeholder={sourcePlaceholder}
                              type={"url"}
                              variant={"flushed"}
                              colorPalette={"purple"}
                              value={url}
                              onBlur={checkUrl}
                              onChange={(ev: React.ChangeEvent) => {
                                const value = (ev.currentTarget as HTMLInputElement).value;

                                setUrl(value);
                              }}
                              required
                            />
                          </Flex>
                          <Input
                            width={"100%"}
                            placeholder="رابط التحميل (اختياري)"
                            type={"url"}
                            variant={"flushed"}
                            colorPalette={"purple"}
                            value={downloadUrl}
                            onChange={(ev: React.ChangeEvent) => {
                              const value = (ev.currentTarget as HTMLInputElement).value;

                              setDownloadUrl(value);
                            }}
                          />
                        </VStack>
                      }
                    >
                      <VStack w={"100%"} rowGap={"15px"}>
                        <Box
                          width="100%"
                          height="100px"
                          p="0.5rem"
                          bg="bg.muted"
                          overflowX="auto"
                          overflowY="hidden"
                        >
                          <Flex height="100%" alignItems="center" gap="10px" width="max-content">
                            {images.map((src, index) => (
                              <Box
                                // biome-ignore lint/suspicious/noArrayIndexKey: thumbnails are position-addressed; selection state is index-based
                                key={index}
                                height="full"
                                outline="none"
                                onClick={() => {
                                  if (activeImage === index) {
                                    setActiveImage(-1);
                                  } else {
                                    setActiveImage(index);
                                  }
                                }}
                                position={"relative"}
                              >
                                <Image
                                  src={src}
                                  alt={`slide-${index}`}
                                  height="100%"
                                  width="auto"
                                  aspectRatio="16 / 9"
                                  objectFit="cover"
                                  draggable={false}
                                  display="block"
                                  borderRadius="md"
                                />
                                <Presence
                                  present={activeImage === index}
                                  animationName={{
                                    _open: "fade-in",
                                    _closed: "fade-out",
                                  }}
                                  animationDuration="fast"
                                >
                                  <Center
                                    position={"absolute"}
                                    top={0}
                                    left={0}
                                    bottom={0}
                                    right={0}
                                    backgroundColor={"#00000045"}
                                  >
                                    <Button
                                      variant={"ghost"}
                                      colorPalette={"red"}
                                      onClick={() => {
                                        setImages((images) => images.filter((_, i) => index !== i));
                                      }}
                                    >
                                      <FaTimes />
                                    </Button>
                                  </Center>
                                </Presence>
                              </Box>
                            ))}
                          </Flex>
                        </Box>

                        <Group attached w="full">
                          <Input
                            flex="1"
                            placeholder="أضف رابط"
                            value={url}
                            onChange={(ev: React.ChangeEvent) => {
                              const value = (ev.currentTarget as HTMLInputElement).value;

                              setUrl(value);
                            }}
                          />
                          <Button
                            variant="subtle"
                            loading={isChecking}
                            disabled={isProcess}
                            onClick={addImage}
                          >
                            <BiPlus />
                          </Button>
                        </Group>
                      </VStack>
                    </Show>
                  </Tabs.Root>
                  <ButtonGroup variant={"outline"} colorPalette={"teal"}>
                    <Button
                      colorPalette={"gray"}
                      onClick={close}
                      loading={isProcess}
                      disabled={isChecking}
                    >
                      إغلاق
                    </Button>
                    <Show when={process === "add"}>
                      <Button
                        loading={isProcess}
                        disabled={isChecking}
                        onClick={async () => {
                          const success = Boolean(await addResource());

                          if (success) {
                            setTitle("");
                            setUrl("");
                            setDownloadUrl("");
                            setImages([]);
                            setActiveImage(-1);
                          }
                        }}
                      >
                        حفظ وإضافة
                      </Button>
                    </Show>
                    <Button
                      loading={isProcess}
                      disabled={isChecking}
                      onClick={async () => {
                        let success = false;

                        if (process === "edit") {
                          success = Boolean(await updateResource());
                        } else {
                          success = Boolean(await addResource());
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

export default resourceDialog;
