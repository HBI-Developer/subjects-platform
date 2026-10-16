"use client";

import { ChakraProvider, LocaleProvider } from "@chakra-ui/react";
import { useEffect } from "react";
import { system } from "@/helpers/themes";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";

export function Provider(props: ColorModeProviderProps) {
  // Product standard is forced dark mode. `useColorMode` helpers in
  // `./color-mode` remain for Chakra compatibility but the toggle is
  // intentionally inactive while `forcedTheme` is set.
  //
  // The `dark` class must live on <html> (see index.html): Chakra's `_dark`
  // condition is ancestor-based (`.dark &`), and portals (Dialog, Toaster)
  // render into document.body, outside the in-tree provider span. Without
  // this they fall back to `_light` tokens (e.g. white dialog background).
  useEffect(() => {
    document.documentElement.classList.add("chakra-theme", "dark");
    document.documentElement.style.colorScheme = "dark";
  }, []);
  return (
    <ChakraProvider value={system}>
      <LocaleProvider locale="ar-SD">
        <ColorModeProvider forcedTheme="dark" {...props} />
      </LocaleProvider>
    </ChakraProvider>
  );
}
