import { configureStore } from "@reduxjs/toolkit";
import colorSlice from "./slice/color";
import scopeSlice from "./slice/scope";
import loadingSlice from "./slice/loading";
import identifierSlice from "./slice/identifier";

export const store = configureStore({
  reducer: {
    color: colorSlice,
    scope: scopeSlice,
    loading: loadingSlice,
    identifier: identifierSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
