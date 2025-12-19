import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "./store";
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Presence,
  Spinner,
} from "@chakra-ui/react";
import { setColor } from "./store/slice/color";
import { COLORS } from "./constants";
import randint from "./functions/randint";
import { Resource, Resources, Subjects, Welcome } from "./pages";
import { Page } from "./components";
import { setScope } from "./store/slice/scope";
import { useEffect } from "react";
import toPage from "./functions/toPage";

function App() {
  const color = useSelector((state: RootState) => state.color.value),
    mainLoading = useSelector((state: RootState) => state.loading.main),
    dispatch = useDispatch();

  useEffect(() => {
    dispatch(setScope(0.5));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.setProperty(
      "--sb-thumb-color",
      `var(--chakra-colors-${color}${color !== "white" ? "-700" : ""})`
    );
  }, [color]);

  return (
    <Grid boxSize="100%" templateRows={"auto 1fr"} direction="rtl">
      <Flex
        as="header"
        p={"1rem"}
        justifyContent="flex-end"
        backgroundColor={"#00000025"}
      >
        <Button
          colorPalette={color}
          variant={"outline"}
          size={"xs"}
          onClick={() =>
            dispatch(setColor(COLORS[randint(0, COLORS.length - 1)]))
          }
        >
          تغيير اللون
        </Button>
      </Flex>
      <Box boxSize={"100%"} position={"relative"} overflow={"hidden"}>
        <Box as="main" minHeight={"100%"} width={"100%"} position={"relative"}>
          <Page show={0.5} ready={1} initFunc={() => toPage(1)}>
            <Welcome />
          </Page>
          <Page show={1.5} ready={2}>
            <Subjects />
          </Page>
          <Page show={2.5} ready={3} initFunc={() => toPage(3)}>
            <Resources />
          </Page>
        </Box>
        <Presence
          present={mainLoading}
          animationName={{
            _open: "fade-in",
            _closed: "fade-out",
          }}
          animationDuration="moderate"
          zIndex={5}
          position={"absolute"}
          top={0}
          bottom={0}
          left={0}
          right={0}
        >
          <Center p="10" backgroundColor={"bg"} boxSize={"100%"}>
            <Spinner
              size={"lg"}
              color="colorPalette.400"
              borderWidth="3px"
              colorPalette={color}
            />
          </Center>
        </Presence>
        <Resource.Viewport />
      </Box>
    </Grid>
  );
}

export default App;
