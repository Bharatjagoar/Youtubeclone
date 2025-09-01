// src/redux/searchSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Load YouTube API key from environment
const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

// ✅ Async thunk to fetch search results based on query
export const fetchSearchResults = createAsyncThunk(
  "search/fetchSearchResults",
  async (query) => {
    const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        q: query,
        type: "video",
        maxResults: 20,
        key: apiKey,
      },
    });
    return res.data.items; // ✅ Return array of video objects
  }
);

// ✅ Create slice for search state
const searchSlice = createSlice({
  name: "search",
  initialState: {
    query: "",        // ✅ Current search query
    results: [],      // ✅ Array of search result videos
    isLoading: false, // ✅ Loading state for UI feedback
  },
  reducers: {
    // ✅ Update query string
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    // ✅ Clear previous search results
    clearResults: (state) => {
      state.results = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.results = action.payload;
        state.isLoading = false;
      });
  },
});

// ✅ Export actions and reducer
export const { setQuery, clearResults } = searchSlice.actions;
export default searchSlice.reducer;