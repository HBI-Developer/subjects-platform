import { createSlice } from "@reduxjs/toolkit";

const initialState = { value: 0 };

const scopeSlice = createSlice({
  name: "scope",
  initialState,
  reducers: {
    setScope: (state, { payload }) => {
      state.value = payload;
    },
  },
});

export const { setScope } = scopeSlice.actions;
export default scopeSlice.reducer;
