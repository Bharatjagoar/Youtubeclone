import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import VideoCard from "../components/VideoCard.jsx";
import "./Home.css";
import axios from "axios";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

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
        // Step 1: Search for videos
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

        // Step 2: Fetch video details (duration + views + channelId)
        const detailsRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: {
            part: "contentDetails,statistics,snippet",
            id: videoIds,
            key: API_KEY,
          },
        });

        // Step 3: Extract unique channel IDs
        const channelIds = [...new Set(detailsRes.data.items.map((video) => video.snippet.channelId))];
        const channelIdStr = channelIds.join(",");

        // Step 4: Fetch channel details (display picture)
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

        // Step 5: Format videos
        const formattedVideos = detailsRes.data.items.map((video) => {
          const durationSeconds = parseISO8601Duration(video.contentDetails.duration);
          const isShort = durationSeconds <= 60;
          const channelInfo = channelMap[video.snippet.channelId] || {};

          return {
            id: video.id,
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.medium.url,
            isShort,
            views: video.statistics.viewCount,
            channel: channelInfo.name || video.snippet.channelTitle,
            channelDp: channelInfo.dp || "", // fallback if not found
          };
        });
        console.log(formattedVideos);
        setVideos(formattedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error.response?.data || error.message);
      }
    };

    fetchVideos();
  }, [API_KEY]);

  return (
    <div className="home">
      <main className="video-grid">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </main>
    </div>
  );
};

export default Home;