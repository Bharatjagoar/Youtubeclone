import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

export const fetchSearchResults = createAsyncThunk(
  "search/fetchSearchResults",
  async (query) => {
    const searchRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        q: query,
        part: "snippet",
        maxResults: 50,
        key: apiKey,
      },
    });

    const items = searchRes.data.items;

    const videoIds = items
      .filter((item) => item.id.kind === "youtube#video")
      .map((item) => item.id.videoId);

    const channelIds = items
      .filter((item) => item.id.kind === "youtube#channel")
      .map((item) => item.id.channelId);

    const videoDetailsRes = videoIds.length
      ? await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: {
            part: "snippet,statistics,contentDetails",
            id: videoIds.join(","),
            key: apiKey,
          },
        })
      : { data: { items: [] } };

    const channelDetailsRes = channelIds.length
      ? await axios.get("https://www.googleapis.com/youtube/v3/channels", {
          params: {
            part: "snippet,statistics",
            id: channelIds.join(","),
            key: apiKey,
          },
        })
      : { data: { items: [] } };

    const enrichedVideos = videoDetailsRes.data.items.map((video) => ({
      type: "video",
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.medium.url,
      channelId: video.snippet.channelId,
      channelName: video.snippet.channelTitle,
      channelAvatar: null,
      views: video.statistics.viewCount,
      likes: video.statistics.likeCount,
      
    }));

    const enrichedChannels = channelDetailsRes.data.items.map((channel) => ({
      type: "channel",
      id: channel.id,
      title: channel.snippet.title,
      avatar: channel.snippet.thumbnails.default.url,
      subscribers: channel.statistics.subscriberCount,
      description: channel.snippet.description,
    }));

    const channelMap = {};
    enrichedChannels.forEach((c) => {
      channelMap[c.id] = c.avatar;
    });

    enrichedVideos.forEach((v) => {
      v.channelAvatar = channelMap[v.channelId] || null;
    });

    return [...enrichedVideos, ...enrichedChannels];
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState: {
    query: "",
    results: [],
    isLoading: false,
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
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

export const { setQuery, clearResults } = searchSlice.actions;
export default searchSlice.reducer;