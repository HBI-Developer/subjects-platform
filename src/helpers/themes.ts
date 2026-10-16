import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        black: { value: "#242424" },
        // Full palette so `white` behaves like the other COLORS entries:
        // `colorPalette="white"`, `white.500`, and
        // `var(--chakra-colors-white-700)` all resolve.
        white: {
          DEFAULT: { value: "#FFFFFF" },
          50: { value: "#FFFFFF" },
          100: { value: "#FFFFFF" },
          200: { value: "#FAFAFA" },
          300: { value: "#F5F5F5" },
          400: { value: "#EEEEEE" },
          500: { value: "#E0E0E0" },
          600: { value: "#CCCCCC" },
          700: { value: "#BDBDBD" },
          800: { value: "#9E9E9E" },
          900: { value: "#757575" },
          950: { value: "#616161" },
        },
      },
    },
    // Button/outline/solid recipes read `colorPalette.fg`, `.solid`,
    // `.contrast`, etc. Those only exist for Chakra's built-in palettes,
    // so without these `white` falls back to gray-ish defaults (black text
    // on outline, gray bg on solid). Mirror the other palettes' structure.
    semanticTokens: {
      colors: {
        white: {
          contrast: {
            value: { _light: "black", _dark: "black" },
          },
          fg: {
            value: { _light: "{colors.white.800}", _dark: "{colors.white.300}" },
          },
          subtle: {
            value: { _light: "{colors.white.100}", _dark: "{colors.white.900}" },
          },
          muted: {
            value: { _light: "{colors.white.200}", _dark: "{colors.white.800}" },
          },
          emphasized: {
            value: { _light: "{colors.white.300}", _dark: "{colors.white.700}" },
          },
          solid: {
            value: { _light: "{colors.white}", _dark: "{colors.white}" },
          },
          focusRing: {
            value: { _light: "{colors.white.500}", _dark: "{colors.white.500}" },
          },
          border: {
            value: { _light: "{colors.white.500}", _dark: "{colors.white.400}" },
          },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
