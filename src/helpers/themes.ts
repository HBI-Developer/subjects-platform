import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        black: { value: "#242424" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
