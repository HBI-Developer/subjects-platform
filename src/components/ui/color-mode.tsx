"use client";

import type { IconButtonProps, SpanProps } from "@chakra-ui/react";
import { ClientOnly, IconButton, Skeleton, Span } from "@chakra-ui/react";
import * as React from "react";
import { LuMoon } from "react-icons/lu";

export interface ColorModeProviderProps {
  readonly children?: React.ReactNode;
  // Accepted for API compatibility with the previous next-themes-based
  // provider; intentionally ignored since the product standard is forced
  // dark mode. Kept so callers passing forcedTheme etc. don't break.
  readonly forcedTheme?: string;
  readonly [key: string]: unknown;
}

// Forced dark mode without next-themes. The previous ThemeProvider rendered
// a <script> tag during React render, which triggers the dev warning:
// "Encountered a script tag while rendering React component..."
export function ColorModeProvider({ children }: ColorModeProviderProps) {
  return <Span className="chakra-theme dark">{children}</Span>;
}

export type ColorMode = "light" | "dark";

export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
}

export function useColorMode(): UseColorModeReturn {
  return {
    colorMode: "dark",
    setColorMode: () => {},
    toggleColorMode: () => {},
  };
}

export function useColorModeValue<T>(_light: T, dark: T) {
  return dark;
}

export function ColorModeIcon() {
  return <LuMoon />;
}

interface ColorModeButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const ColorModeButton = React.forwardRef<HTMLButtonElement, ColorModeButtonProps>(
  function ColorModeButton(props, ref) {
    return (
      <ClientOnly fallback={<Skeleton boxSize="9" />}>
        <IconButton
          variant="ghost"
          aria-label="Toggle color mode"
          size="sm"
          ref={ref}
          {...props}
          css={{
            _icon: {
              width: "5",
              height: "5",
            },
          }}
        >
          <ColorModeIcon />
        </IconButton>
      </ClientOnly>
    );
  },
);

export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function LightMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    );
  },
);

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(function DarkMode(props, ref) {
  return (
    <Span
      color="fg"
      display="contents"
      className="chakra-theme dark"
      colorPalette="gray"
      colorScheme="dark"
      ref={ref}
      {...props}
    />
  );
});
