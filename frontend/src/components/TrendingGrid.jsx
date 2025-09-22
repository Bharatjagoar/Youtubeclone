// src/components/TrendingGrid.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import VideoCard from "./VideoCard";
import PromptsModal from "./promptsModal";
import "./TrendingGrid.css";
import { formatRelativeDate, formatCount } from "./helperfunctions";

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
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);


  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const observerTarget = useRef(null);

  // Fetch videos function
  const fetchVideos = useCallback(
    async (pageToken = null) => {
      if (loading) return;
      setLoading(true);

      try {
        const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            part: "snippet",
            q: "trending",
            type: "video",
            maxResults: 20, // smaller batch for infinite scroll
            key: API_KEY,
            pageToken,
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

        setVideos((prev) => [...prev, ...formattedVideos]);
        setNextPageToken(res.data.nextPageToken || null);
      } catch (error) {
        console.error("Error fetching trending videos:", error.response?.data || error.message);

        // Determine a friendly message
        const status = error.response?.status;
        if (status === 403) {
          setErrorMsg("API quota exceeded. Please try again later.");
        } else {
          setErrorMsg("Failed to load trending videos. Check your connection or API key.");
        }

        setErrorOpen(true);
      } finally {
        setLoading(false);
      }

    },
    [loading]
  );

  // Initial fetch
  useEffect(() => {
    fetchVideos();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPageToken) {
          fetchVideos(nextPageToken);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [nextPageToken, fetchVideos]);

  const detect = (isValid) => {
    if (!isValid) setShowPrompt(true);
  };

  return (
    <div className="trending-grid">
      {errorOpen && (
        <div className="error-banner">
          <span>{errorMsg}</span>
          <button
            onClick={() => {
              setErrorOpen(false);
              fetchVideos(nextPageToken || null);
            }}
          >
            Retry
          </button>
        </div>
      )}

      <main className="video-grid">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} detect={detect} />
        ))}
      </main>

      <div ref={observerTarget} style={{ height: "50px", margin: "20px", textAlign: "center" }}>
        {loading && <p>Loading more videos...</p>}
      </div>
    </div>
  );

};

export default TrendingGrid;
