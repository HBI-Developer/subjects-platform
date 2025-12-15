import { createSlice } from "@reduxjs/toolkit";

const initialState = { value: "white" };

const colorSlice = createSlice({
  name: "color",
  initialState,
  reducers: {
    setColor: (state, { payload }) => {
      state.value = payload;
    },
  },
});

export const { setColor } = colorSlice.actions;
export default colorSlice.reducer;
