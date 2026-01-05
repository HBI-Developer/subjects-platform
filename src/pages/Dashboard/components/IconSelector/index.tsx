import {
  Button,
  Center,
  createOverlay,
  Dialog,
  EmptyState,
  Flex,
  Grid,
  Heading,
  Icon,
  Input,
  InputGroup,
  Portal,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Icon as Iconify } from "@iconify/react";
import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { Switch } from "@/components";
import getErrorMessage from "@/functions/getErrorMessage";

interface Props {
  setIcon: (icon: string) => void;
}

const iconSelector = createOverlay<Props>(({ setIcon, ...rest }) => {
  const [search, setSearch] = useState(""),
    [isSearching, setIsSearching] = useState(false),
    [error, setError] = useState<string | number>(0),
    [icons, setIcons] = useState<Array<string>>([]),
    fetchIcons = async () => {
      setIsSearching(true);
      setError(0);

      try {
        const response = await fetch(
            `https://api.iconify.design/search?query=${search}&limit=100`
          ),
          data = await response.json();

        setIcons(data.icons);
      } catch (er) {
        const error = er as { code: string | number };
        setError(error.code || 500);
      } finally {
        setIsSearching(false);
      }
    };

  useEffect(() => {
    if (search.length > 2) {
      fetchIcons();
    } else {
      setIsSearching(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <Dialog.Root {...rest} placement={"center"} size={"cover"}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            backgroundColor={"bg"}
            border={"1px solid"}
            borderColor={"purple.800!important"}
            userSelect={"none"}
          >
            <Dialog.Header justifyContent={"center"}>
              <Dialog.Title>قم باختيار أيقونة</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body spaceY="4" overflow={"hidden"}>
              <Grid
                justifyContent={"center"}
                rowGap={"20px"}
                templateColumns={"1fr"}
                templateRows={"auto 1fr"}
                alignItems={"start"}
                height={"100%"}
              >
                <InputGroup dir={"ltr"} flex="1" startElement={<LuSearch />}>
                  <Input
                    placeholder="قم بالبحث عن أيقونة"
                    onChange={(ev: React.ChangeEvent) => {
                      const value = (
                        ev.currentTarget as HTMLInputElement
                      ).value.trim();
                      setSearch(value);
                    }}
                  />
                </InputGroup>
                <Flex
                  gap={"20px"}
                  justifyContent={"center"}
                  flexWrap={"wrap"}
                  overflowY={"auto"}
                  height={"100%"}
                >
                  <Switch.Root>
                    <Switch.Case condition={isSearching}>
                      <Center>
                        <Spinner />
                      </Center>
                    </Switch.Case>
                    <Switch.Case condition={Boolean(error)}>
                      <>
                        {(() => {
                          const { code, message } = getErrorMessage(error);

                          return (
                            <VStack
                              alignItems={"center"}
                              justifyContent={"center"}
                            >
                              <Heading>{code}</Heading>
                              <Text>{message}</Text>
                              <Button variant={"outline"} onClick={fetchIcons}>
                                إعادة المحاولة
                              </Button>
                            </VStack>
                          );
                        })()}
                      </>
                    </Switch.Case>
                    <Switch.Case condition={search.length <= 2}>
                      <EmptyState.Root>
                        <EmptyState.Content>
                          <EmptyState.Indicator>
                            <LuSearch />
                          </EmptyState.Indicator>
                          <VStack textAlign="center">
                            <EmptyState.Title>
                              أكتب بعض الكلمات للبحث عن أيقونات
                            </EmptyState.Title>
                          </VStack>
                        </EmptyState.Content>
                      </EmptyState.Root>
                    </Switch.Case>
                    <Switch.Default>
                      {icons.map((icon, i) => (
                        <Button
                          variant={"subtle"}
                          key={i}
                          onClick={() => {
                            setIcon(icon);
                            iconSelector.close("iconSelector");
                          }}
                        >
                          <Icon key={i} size={"md"}>
                            <Iconify icon={icon} />
                          </Icon>
                        </Button>
                      ))}
                    </Switch.Default>
                  </Switch.Root>
                </Flex>
              </Grid>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
});

export default iconSelector;
