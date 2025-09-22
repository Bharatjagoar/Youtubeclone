// src/pages/ChannelPage.jsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ChannelPage.css";
import {
  formatRelativeDate,
  formatCount,
  cleanText,
} from "../components/helperfunctions";

function truncate(text, maxLength = 200) {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

function ChannelPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const ApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // new local subscription state
  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);

  const sentinelRef = useRef(null);

  // 1. Fetch channel info + initial videos
  useEffect(() => {
    async function fetchChannelInfo() {
      setIsLoading(true);
      try {
        // Channel metadata
        const channelRes = await axios.get(
          "https://www.googleapis.com/youtube/v3/channels",
          {
            params: {
              part: "snippet,statistics,brandingSettings,contentDetails",
              id: channelId,
              key: ApiKey,
            },
          }
        );
        const channel = channelRes.data.items[0];
        setChannelData(channel);

        // initialize subscriber count from API
        setSubscriberCount(Number(channel.statistics.subscriberCount));

        // Initial videos batch
        const uploadsPlaylistId =
          channel.contentDetails.relatedPlaylists.uploads;
        const videosRes = await axios.get(
          "https://www.googleapis.com/youtube/v3/playlistItems",
          {
            params: {
              part: "snippet",
              playlistId: uploadsPlaylistId,
              maxResults: 12,
              key: ApiKey,
            },
          }
        );
        setVideos(videosRes.data.items);
        setNextPageToken(videosRes.data.nextPageToken || null);
      } catch (err) {
        console.error("Error fetching channel data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChannelInfo();
  }, [channelId, ApiKey]);

  // 2. Fetch more videos when sentinel is visible
  const loadMore = useCallback(async () => {
    if (!nextPageToken || isLoading) return;
    setIsLoading(true);
    try {
      const videosRes = await axios.get(
        "https://www.googleapis.com/youtube/v3/playlistItems",
        {
          params: {
            part: "snippet",
            playlistId: channelData.contentDetails.relatedPlaylists.uploads,
            maxResults: 12,
            pageToken: nextPageToken,
            key: ApiKey,
          },
        }
      );
      setVideos((prev) => [...prev, ...videosRes.data.items]);
      setNextPageToken(videosRes.data.nextPageToken || null);
    } catch (err) {
      console.error("Error loading more videos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [ApiKey, channelData, isLoading, nextPageToken]);

  // 3. IntersectionObserver to trigger loadMore
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [loadMore]);

  if (!channelData) return <div className="loading">Loading channel…</div>;

  const { snippet, statistics, brandingSettings } = channelData;

  const handleChannelClick = () => {
    navigate(`/channel/${channelId}`);
  };

  // ✅ handle subscribe toggle
  const handleSubscribe = () => {
    setSubscribed((prev) => !prev);

    setSubscriberCount((prev) => {
      if (prev < 1000) {
        return subscribed ? prev - 1 : prev + 1; // toggle count
      }
      return prev; // >=1000 → no change
    });
  };

  return (
    <div className="channel-page">
      {brandingSettings?.image?.bannerExternalUrl && (
        <div className="banner">
          <img
            src={brandingSettings.image.bannerExternalUrl}
            alt="Channel Banner"
          />
        </div>
      )}

      <div className="channel-header">
        <div
          className="channel-left"
          onClick={handleChannelClick}
          style={{ cursor: "pointer" }}
        >
          <img
            className="avatar"
            src={snippet.thumbnails.default.url}
            alt={`${snippet.title} avatar`}
          />
          <div className="channel-meta">
            <h2 className="channel-title">{snippet.title}</h2>
            <p className="channel-stats">
              {formatCount(subscriberCount)} subscribers •{" "}
              {formatCount(statistics.videoCount)} videos
            </p>
            <p className="channel-description">
              {truncate(cleanText(snippet.description))}
            </p>
          </div>
        </div>

        <button
          className={`subscribe-btn ${subscribed ? "subscribed" : ""}`}
          onClick={handleSubscribe}
        >
          {subscribed ? "Subscribed" : "Subscribe"}
        </button>
      </div>

      <div className="video-grid">
        {videos.map((item) => {
          const video = item.snippet;
          const vidId = video.resourceId.videoId;

          return (
            <div
              key={vidId}
              className="video-card"
              onClick={() => navigate(`/video/${vidId}`)}
              style={{ cursor: "pointer" }}
            >
              <img src={video.thumbnails.medium.url} alt={video.title} />
              <h4>{video.title}</h4>
              <p>{formatRelativeDate(video.publishedAt)}</p>
            </div>
          );
        })}
      </div>

      {/* Sentinel div: triggers loading more when it scrolls into view */}
      <div ref={sentinelRef} className="sentinel">
        {isLoading && <p>Loading more videos…</p>}
        {!nextPageToken && !isLoading && <p>No more videos</p>}
      </div>
    </div>
  );
}

export default ChannelPage;
