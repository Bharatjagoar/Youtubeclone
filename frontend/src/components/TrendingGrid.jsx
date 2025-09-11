// src/components/TrendingGrid.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import VideoCard from "./VideoCard";
import PromptsModal from "./promptsModal";
import "./TrendingGrid.css";

const formatCount = (num) => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
};

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

const parseISO8601Duration = (duration) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
};

const TrendingGrid = () => {
  const [videos, setVideos] = useState([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            part: "snippet",
            q: "trending",
            type: "video",
            maxResults: 50,
            key: API_KEY,
          },
        });

        const items = res.data.items.filter((item) => item.id.videoId);
        const videoIds = items.map((item) => item.id.videoId).join(",");

        const detailsRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: {
            part: "contentDetails,statistics,snippet",
            id: videoIds,
            key: API_KEY,
          },
        });

        const channelIds = [...new Set(detailsRes.data.items.map((video) => video.snippet.channelId))];
        const channelIdStr = channelIds.join(",");

        const channelRes = await axios.get("https://www.googleapis.com/youtube/v3/channels", {
          params: {
            part: "snippet",
            id: channelIdStr,
            key: API_KEY,
          },
        });

        const channelMap = {};
        channelRes.data.items.forEach((channel) => {
          channelMap[channel.id] = {
            name: channel.snippet.title,
            dp: channel.snippet.thumbnails.default.url,
          };
        });

        const formattedVideos = detailsRes.data.items.map((video) => {
          const durationSeconds = parseISO8601Duration(video.contentDetails.duration);
          const isShort = durationSeconds <= 60;
          const channelInfo = channelMap[video.snippet.channelId] || {};

          return {
            id: video.id,
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.medium.url,
            isShort,
            views: formatCount(Number(video.statistics.viewCount)),
            publishedAt: formatRelativeDate(video.snippet.publishedAt),
            channel: channelInfo.name || video.snippet.channelTitle,
            channelDp: channelInfo.dp || "",
          };
        });

        setVideos(formattedVideos);
      } catch (error) {
        console.error("Error fetching trending videos:", error.response?.data || error.message);
      }
    };

    fetchVideos();
  }, [API_KEY]);

  const detect = (isValid) => {
    if (!isValid) setShowPrompt(true);
  };

  return (
    <div className="trending-grid">
      {showPrompt && <PromptsModal onClose={() => setShowPrompt(false)} />}
      <main className="video-grid">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} detect={detect} />
        ))}
      </main>
    </div>
  );
};

export default TrendingGrid;