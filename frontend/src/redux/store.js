// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "./searchSlice";

// ✅ Configure Redux store with search reducer
export const store = configureStore({
  reducer: {
    search: searchReducer,
  },
});