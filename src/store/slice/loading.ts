import { createSlice } from "@reduxjs/toolkit";

const initialState = { main: true, resource: false };

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setMainLoading: (state, { payload }) => {
      state.main = payload;
    },
    setResourceLoading: (state, { payload }) => {
      state.resource = payload;
    },
  },
});

export const { setMainLoading, setResourceLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
