import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const ApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  useEffect(() => {
    async function fetchChannelInfo() {
      try {
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
      } catch (err) {
        console.error("Error fetching channel data:", err);
      }
    }

    fetchChannelInfo();
  }, [channelId]);

  if (!channelData) return <div>Loading...</div>;

  const { snippet, statistics, brandingSettings } = channelData;

  return (
    <div className="channel-page">
      <div className="banner">
        <img src={brandingSettings?.image?.bannerExternalUrl} alt="Banner" />
      </div>

      <div className="channel-header">
        <img
          className="avatar"
          src={snippet.thumbnails.default.url}
          alt="Avatar"
        />
        <div className="channel-info">
          <h2>{snippet.title}</h2>
          <p>
            {formatCount(statistics.subscriberCount)} subscribers •{" "}
            {formatCount(statistics.videoCount)} videos
          </p>
          <p className="channel-description">
            {truncate(cleanText(snippet.description))}
          </p>
        </div>
        <button className="subscribe-btn">Subscribe</button>
      </div>

      <div className="video-grid">
        {videos.map((item) => {
          const video = item.snippet;
          return (
            <div key={video.resourceId.videoId} className="video-card">
              <img src={video.thumbnails.medium.url} alt={video.title} />
              <h4>{video.title}</h4>
              <p>{formatRelativeDate(video.publishedAt)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChannelPage;
