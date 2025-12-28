"use client";

import { ChakraProvider, LocaleProvider } from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
import { system } from "@/helpers/themes";

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <LocaleProvider locale="ar-SD">
        <ColorModeProvider forcedTheme="dark" {...props} />
      </LocaleProvider>
    </ChakraProvider>
  );
}
