import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./VideoPlayer.css";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
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


function VideoPlayer() {
  const { videoId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [videoDetails, setVideoDetails] = useState(null);
  const [channelDetails, setChannelDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedVideos, setRelatedVideos] = useState([]);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        // 1. Fetch video details
        const videoRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: {
            part: "snippet,statistics",
            id: videoId,
            key: API_KEY,
          },
        });

        const video = videoRes.data.items[0];
        setVideoDetails(video);

        // 2. Fetch channel details
        const channelId = video.snippet.channelId;
        const channelRes = await axios.get("https://www.googleapis.com/youtube/v3/channels", {
          params: {
            part: "snippet,statistics",
            id: channelId,
            key: API_KEY,
          },
        });

        setChannelDetails(channelRes.data.items[0]);

        // 3. Fetch comments
        const commentRes = await axios.get("https://www.googleapis.com/youtube/v3/commentThreads", {
          params: {
            part: "snippet",
            videoId,
            maxResults: 20,
            key: API_KEY,
          },
        });

        setComments(commentRes.data.items);

        // 4. Fetch related videos
        const relatedRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            part: "snippet",
            relatedToVideoId: videoId,
            type: "video",
            maxResults: 20,
            key: API_KEY,
          },
        });

        // ✅ FIX: Filter out invalid video IDs
        const validIds = relatedRes.data.items
          .map((item) => item.id?.videoId)
          .filter((id) => !!id);

        if (validIds.length === 0) {
          setRelatedVideos([]);
          return;
        }

        const relatedDetails = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: {
            part: "snippet,statistics",
            id: validIds.join(","),
            key: API_KEY,
          },
        });
        console.log(relatedDetails);

        const formattedRelated = relatedDetails.data.items.map((vid) => ({
          id: vid.id,
          title: vid.snippet.title,
          thumbnail: vid.snippet.thumbnails.medium.url,
          channel: vid.snippet.channelTitle,
          views: vid.statistics.viewCount,
        }));

        setRelatedVideos(formattedRelated);
      } catch (err) {
        console.error("Error loading video data:", err.message);
      }
    };

    fetchVideoData();
  }, [videoId]);

  return (
    <div className="video-player-wrapper">
      <div className="video-player-main">
        <iframe
          width="100%"
          height="480"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          frameBorder="0"
          allowFullScreen
          title="YouTube Video"
        ></iframe>

        {videoDetails && channelDetails && (
          <div className="video-meta">
            <h2>{videoDetails.snippet.title}</h2>

            <div className="channel-info">
              <img src={channelDetails.snippet.thumbnails.default.url} alt="Channel DP" />
              <div>
                <p>{channelDetails.snippet.title}</p>
                <p>{formatCount(channelDetails.statistics.subscriberCount)} subscribers</p>
              </div>
              <button className="subscribe-btn">Subscribe</button>
            </div>

            <div className="video-stats">
              <p>{formatCount(videoDetails.statistics.viewCount)} views</p>
              <p>{formatCount(videoDetails.statistics.likeCount)} likes</p>

              <p>{formatRelativeDate(videoDetails.snippet.publishedAt)}</p>
            </div>

            <p className="video-description">{videoDetails.snippet.description}</p>

            <div className="comments-section">
              <h3>Comments</h3>
              {comments.map((comment) => {
                const c = comment.snippet.topLevelComment.snippet;
                return (
                  <div key={comment.id} className="comment">
                    <img src={c.authorProfileImageUrl} alt={c.authorDisplayName} className="comment-avatar" />
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-author">{c.authorDisplayName}</span>
                        <span className="comment-time">{formatRelativeDate(c.publishedAt)}</span>
                      </div>
                      <p className="comment-text">{c.textDisplay}</p>
                      <div className="comment-actions">
                        <span className="comment-likes">{formatCount(c.likeCount)} likes</span>
                        <button className="reply-btn">Reply</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <aside className="video-sidebar">
        <h4>Up Next</h4>
        {relatedVideos.length === 0 ? (
          <p>No related videos found.</p>
        ) : (
          relatedVideos.map((video) => (
            <div
              key={video.id}
              className="sidebar-card"
              onClick={() => navigate(`/video/${video.id}`)}
            >
              <img src={video.thumbnail} alt={video.title} />
              <div>
                <p className="sidebar-title">{video.title}</p>
                <p className="sidebar-channel">{video.channel}</p>
                <p className="sidebar-views">{parseInt(video.views).toLocaleString()} views</p>
              </div>
            </div>
          ))
        )}
      </aside>
    </div>
  );
}

export default VideoPlayer;