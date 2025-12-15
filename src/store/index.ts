import { configureStore } from "@reduxjs/toolkit";
import colorSlice from "./slice/color";
import scopeSlice from "./slice/scope";
import loadingSlice from "./slice/loading";

export const store = configureStore({
  reducer: {
    color: colorSlice,
    scope: scopeSlice,
    loading: loadingSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
