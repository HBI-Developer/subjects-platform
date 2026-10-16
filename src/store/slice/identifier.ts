import { createSlice } from "@reduxjs/toolkit";

interface Identifier {
  title: string;
  id: string;
}

const initialState = {
  collection: { title: "", id: "" },
  subject: { title: "", id: "" },
  resource: { title: "", id: "" },
};

const identifierSlice = createSlice({
  name: "identifier",
  initialState,
  reducers: {
    setCollectionIdentifier: (state, { payload }: { payload: Identifier }) => {
      state.collection = payload;
    },
    setSubjectIdentifier: (state, { payload }: { payload: Identifier }) => {
      state.subject = payload;
    },
  },
});

export const { setCollectionIdentifier, setSubjectIdentifier } = identifierSlice.actions;
export default identifierSlice.reducer;
