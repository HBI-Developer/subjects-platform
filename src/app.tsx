import "./app.css";
import { Box, Button, Center, Flex, Grid, Presence, Spinner } from "@chakra-ui/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Page } from "./components";
import { Toaster } from "./components/ui/toaster";
import { COLORS, TITLE } from "./constants";
import randint from "./functions/randint";
import toPage from "./functions/topage";
import { Collections, Resources, Subjects, Welcome } from "./pages";
import type { RootState } from "./store";
import { setColor } from "./store/slice/color";
import { setScope } from "./store/slice/scope";

const ResourceViewport = lazy(async () => {
  const { default: Resource } = await import("./pages/resource");
  return { default: () => <Resource.Viewport /> };
});

function App() {
  const color = useSelector((state: RootState) => state.color.value),
    mainLoading = useSelector((state: RootState) => state.loading.main),
    [resourceUiReady, setResourceUiReady] = useState(false),
    dispatch = useDispatch();

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only app bootstrap
  useEffect(() => {
    document.title = TITLE;
    dispatch(setScope(0.5));
  }, []);

  // Keep optional viewers and their download utilities out of the critical
  // rendering path. They are requested only after the first paint is settled.
  useEffect(() => {
    const timer = window.setTimeout(() => setResourceUiReady(true), 500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.setProperty("--sb-thumb-color", `var(--chakra-colors-${color}-700)`);
  }, [color]);

  return (
    <Grid boxSize="100%" templateRows={"auto 1fr"} direction="rtl">
      <Flex as="header" p={"1rem"} justifyContent="flex-end" backgroundColor={"#00000025"}>
        <Button
          colorPalette={color}
          variant={"outline"}
          size={"xs"}
          onClick={() => dispatch(setColor(COLORS[randint(0, COLORS.length - 1)]))}
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
            <Collections />
          </Page>
          <Page show={2.5} ready={3}>
            <Subjects />
          </Page>
          <Page show={3.5} ready={4}>
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
          zIndex={10}
          position={"absolute"}
          top={0}
          bottom={0}
          left={0}
          right={0}
        >
          <Center p="10" backgroundColor={"bg"} boxSize={"100%"}>
            <Spinner size={"lg"} color="colorPalette.400" borderWidth="3px" colorPalette={color} />
          </Center>
        </Presence>
        {resourceUiReady && (
          <Suspense fallback={null}>
            <ResourceViewport />
          </Suspense>
        )}
      </Box>
      <Toaster />
    </Grid>
  );
}

export default App;
