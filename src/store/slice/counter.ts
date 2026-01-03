import { createSlice } from "@reduxjs/toolkit";

const initialState = { dashboardSubject: 0 };

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    setDashboardSubject: (state, { payload }) => {
      state.dashboardSubject = payload;
    },
  },
});

export const { setDashboardSubject } = counterSlice.actions;
export default counterSlice.reducer;
