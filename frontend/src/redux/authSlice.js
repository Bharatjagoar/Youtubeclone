import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    showAuthModal: false,
    isLoggedIn: false, // 🔥 new global login state
  },
  reducers: {
    openAuthModal: (state) => {
      state.showAuthModal = true;
    },
    closeAuthModal: (state) => {
      state.showAuthModal = false;
    },
    setLoginStatus: (state, action) => {
      state.isLoggedIn = action.payload;
    },
  },
});

export const { openAuthModal, closeAuthModal, setLoginStatus } = authSlice.actions;
export default authSlice.reducer;