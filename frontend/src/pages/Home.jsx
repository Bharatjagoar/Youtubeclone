import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx"; // Optional: Sidebar component (not used here but imported)
import VideoCard from "../components/VideoCard.jsx"; // ✅ Reusable card component for each video
import "./Home.css"; // ✅ Styles for the Home layout
import axios from "axios"; // ✅ HTTP client for API calls

// ✅ Utility: Format large numbers into readable strings (e.g., 1.2K, 3.4M)
const formatCount = (num) => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
};

// ✅ Utility: Convert ISO date string to relative time (e.g., "2 days ago")
const formatRelativeDate = (dateString) => {
  const publishedDate = new Date(dateString);
  const now = new Date();
  const diffMs = now - publishedDate;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`;
  if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  return "Just now";
};

const Home = () => {
  const [videos, setVideos] = useState([]); // ✅ Store formatted video data
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY; // ✅ Load API key from environment

  // ✅ Utility: Convert YouTube's ISO 8601 duration format to seconds
  const parseISO8601Duration = (duration) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || "0", 10);
    const minutes = parseInt(match[2] || "0", 10);
    const seconds = parseInt(match[3] || "0", 10);
    return hours * 3600 + minutes * 60 + seconds;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // ✅ Step 1: Search for trending videos
        // const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        //   params: {
        //     part: "snippet",
        //     q: "trending",
        //     type: "video",
        //     maxResults: 50,
        //     key: API_KEY,
        //   },
        // });

        // // ✅ Filter out items without valid videoId
        // const items = res.data.items.filter((item) => item.id.videoId);
        // const videoIds = items.map((item) => item.id.videoId).join(",");

        // // ✅ Step 2: Fetch detailed video info (duration, views, channelId)
        // const detailsRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
        //   params: {
        //     part: "contentDetails,statistics,snippet",
        //     id: videoIds,
        //     key: API_KEY,
        //   },
        // });

        // // ✅ Step 3: Extract unique channel IDs for profile pictures
        // const channelIds = [...new Set(detailsRes.data.items.map((video) => video.snippet.channelId))];
        // const channelIdStr = channelIds.join(",");

        // // ✅ Step 4: Fetch channel details (name + avatar)
        // const channelRes = await axios.get("https://www.googleapis.com/youtube/v3/channels", {
        //   params: {
        //     part: "snippet",
        //     id: channelIdStr,
        //     key: API_KEY,
        //   },
        // });

        // // ✅ Map channelId to channel info for quick lookup
        // const channelMap = {};
        // channelRes.data.items.forEach((channel) => {
        //   channelMap[channel.id] = {
        //     name: channel.snippet.title,
        //     dp: channel.snippet.thumbnails.default.url,
        //   };
        // });

        // ✅ Step 5: Format video data for rendering
        // const formattedVideos = detailsRes.data.items.map((video) => {
        //   const durationSeconds = parseISO8601Duration(video.contentDetails.duration);
        //   const isShort = durationSeconds <= 60; // ✅ Flag Shorts
        //   const channelInfo = channelMap[video.snippet.channelId] || {};

        //   return {
        //     id: video.id,
        //     title: video.snippet.title,
        //     thumbnail: video.snippet.thumbnails.medium.url,
        //     isShort,
        //     views: formatCount(Number(video.statistics.viewCount)), // ✅ Format views
        //     publishedAt: formatRelativeDate(video.snippet.publishedAt), // ✅ Format date
        //     channel: channelInfo.name || video.snippet.channelTitle,
        //     channelDp: channelInfo.dp || "",
        //   };
        // });

        console.log(formattedVideos); // ✅ Debug: log formatted output
        setVideos(formattedVideos); // ✅ Update state
      } catch (error) {
        console.error("Error fetching videos:", error.response?.data || error.message);
      }
    };

    fetchVideos(); // ✅ Trigger fetch on mount
  }, [API_KEY]);

  return (
    <div className="home">
      {/* ✅ Main grid layout for video cards */}
      <main className="video-grid">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} /> // ✅ Render each video as a card
        ))}
      </main>
    </div>
  );
};

export default Home;