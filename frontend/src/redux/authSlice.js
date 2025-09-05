import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    showAuthModal: false,
  },
  reducers: {
    openAuthModal: (state) => {
      state.showAuthModal = true;
    },
    closeAuthModal: (state) => {
      state.showAuthModal = false;
    },
  },
});

export const { openAuthModal, closeAuthModal } = authSlice.actions;
export default authSlice.reducer;