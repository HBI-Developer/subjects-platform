import { createSlice } from "@reduxjs/toolkit";

interface Identifier {
  title: string;
  id: string;
}

const initialState = {
  subject: { title: "", id: "" },
  resource: { title: "", id: "" },
};

const identifierSlice = createSlice({
  name: "identifier",
  initialState,
  reducers: {
    setSubjectIdentifier: (state, { payload }: { payload: Identifier }) => {
      state.subject = payload;
    },
    setResourceIdentifier: (state, { payload }: { payload: Identifier }) => {
      state.resource = payload;
    },
  },
});

export const { setSubjectIdentifier, setResourceIdentifier } =
  identifierSlice.actions;
export default identifierSlice.reducer;
