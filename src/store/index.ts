import { configureStore } from "@reduxjs/toolkit";
import colorSlice from "./slice/color";
import identifierSlice from "./slice/identifier";
import loadingSlice from "./slice/loading";
import scopeSlice from "./slice/scope";

export const store = configureStore({
  reducer: {
    color: colorSlice,
    scope: scopeSlice,
    loading: loadingSlice,
    identifier: identifierSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
