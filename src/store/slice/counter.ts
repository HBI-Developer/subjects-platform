import { createSlice } from "@reduxjs/toolkit";

const initialState = { dashboardSubject: 0 };

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increaseDashboardSubject: (state) => {
      state.dashboardSubject += 1;
    },
    setDashboardSubject: (state, { payload }) => {
      state.dashboardSubject = payload;
    },
  },
});

export const { increaseDashboardSubject, setDashboardSubject } = counterSlice.actions;
export default counterSlice.reducer;
