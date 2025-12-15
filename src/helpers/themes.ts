import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  conditions: {
    svg: "& svg",
  },
  theme: {
    tokens: {
      colors: {
        black: { value: "#242424" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
