import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaThumbsUp } from "react-icons/fa";
import axios from "axios";
import Avatar from "../components/Avatar";
import "./VideoPlayer.css";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const formatCount = (num) => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num?.toString();
};

const formatRelativeDate = (dateString) => {
  const published = new Date(dateString);
  const now = new Date();
  const diff = now - published;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const mon = Math.floor(day / 30);
  const yr = Math.floor(day / 365);

  if (yr > 0) return `${yr} year${yr > 1 ? "s" : ""} ago`;
  if (mon > 0) return `${mon} month${mon > 1 ? "s" : ""} ago`;
  if (day > 0) return `${day} day${day > 1 ? "s" : ""} ago`;
  if (hr > 0) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  if (min > 0) return `${min} minute${min > 1 ? "s" : ""} ago`;
  return "Just now";
};

function VideoPlayer() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [videoDetails, setVideoDetails] = useState(null);
  const [channelDetails, setChannelDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [descExpanded, setDescExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCountUI, setLikeCountUI] = useState(0);
  const [subscriberCountUI, setSubscriberCountUI] = useState(0);
  const [newComment, setNewComment] = useState("");

  // user data
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) setUser(storedUser);
    } catch (err) {
      console.error("Error loading user info:", err);
    }
  }, []);

  useEffect(() => {
    if (videoDetails) setLikeCountUI(Number(videoDetails.statistics.likeCount || 0));
  }, [videoDetails]);

  useEffect(() => {
    if (channelDetails) {
      setSubscriberCountUI(Number(channelDetails.statistics.subscriberCount || 0));
    }
  }, [channelDetails]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ FETCH VIDEO DETAILS
        const vidRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: { part: "snippet,statistics", id: videoId, key: API_KEY },
        });
        const vid = vidRes.data.items[0];
        setVideoDetails(vid);

        // ✅ FETCH CHANNEL DETAILS
        const chRes = await axios.get("https://www.googleapis.com/youtube/v3/channels", {
          params: { part: "snippet,statistics", id: vid.snippet.channelId, key: API_KEY },
        });
        setChannelDetails(chRes.data.items[0]);

        // ✅ FETCH COMMENTS (from backend OR fallback to YouTube)
        try {
          const backendComments = await axios.get(`http://localhost:5000/comments/${videoId}`);
          console.log(backendComments,videoId);
          if (backendComments.data && backendComments.data.length > 0) {
            setComments(
              backendComments.data.map((saved) => ({
                id: saved._id,
                snippet: {
                  topLevelComment: {
                    snippet: {
                      authorDisplayName: saved.author,
                      authorColor: saved.avatarColor,
                      textDisplay: saved.text,
                      publishedAt: saved.createdAt,
                      likeCount: saved.likes || 0,
                    },
                  },
                },
              }))
            );
          }
        } catch (err) {
          console.warn("Backend comments not available, falling back to YouTube API");
          const comRes = await axios.get("https://www.googleapis.com/youtube/v3/commentThreads", {
            params: { part: "snippet", videoId, maxResults: 10, key: API_KEY },
          });
          setComments(comRes.data.items);
        }

        // ✅ FETCH RELATED VIDEOS
        const relRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: { part: "snippet", relatedToVideoId: videoId, type: "video", maxResults: 15, key: API_KEY },
        });
        const ids = relRes.data.items.map((i) => i.id.videoId).filter(Boolean);
        if (ids.length) {
          const relDet = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
            params: { part: "snippet,statistics", id: ids.join(","), key: API_KEY },
          });
          setRelatedVideos(
            relDet.data.items.map((v) => ({
              id: v.id,
              title: v.snippet.title,
              thumbnail: v.snippet.thumbnails.medium.url,
              channel: v.snippet.channelTitle,
              views: v.statistics.viewCount,
            }))
          );
        }
      } catch (e) {
        console.error("Error fetching video data:", e);
      }
    };

    fetchData();
  }, [videoId]);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCountUI((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleSubscribe = () => setSubscriberCountUI((p) => p + 1);

  const handlePostComment = async () => {
    const text = newComment.trim();
    if (!text) return;
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const { data: saved } = await axios.post("http://localhost:5000/comments", {
        videoId,
        author: storedUser.username,
        avatarColor: storedUser.avatarColor,
        text,
      });

      const obj = {
        id: saved._id,
        snippet: {
          topLevelComment: {
            snippet: {
              authorDisplayName: storedUser.username,
              authorColor: storedUser.avatarColor,
              textDisplay: saved.text,
              publishedAt: saved.createdAt,
              likeCount: 0,
            },
          },
        },
      };
      setComments((prev) => [obj, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  return (
    <div className="video-player-wrapper">
      <div className="video-player-main">
        {/* VIDEO PLAYER */}
        <iframe
          width="100%"
          height="480"
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="YouTube Video"
        />
        {videoDetails && channelDetails && (
          <>
            {/* META INFO */}
            <div className="video-meta">
              <h2>{videoDetails.snippet.title}</h2>
              <div className="channel-info">
                <img src={channelDetails.snippet.thumbnails.default.url} alt={channelDetails.snippet.title} />
                <div>
                  <p>{channelDetails.snippet.title}</p>
                  <p>{formatCount(subscriberCountUI)} subscribers</p>
                </div>
                <button className="subscribe-btn" onClick={handleSubscribe}>
                  Subscribe
                </button>
              </div>
              <div className="video-stats">
                <span>{formatCount(videoDetails.statistics.viewCount)} views</span>
                <span className="dot">•</span>
                <button className={`like-btn ${liked ? "liked" : ""}`} onClick={handleLike}>
                  <FaThumbsUp className="like-icon" />
                  <span className="like-count">{formatCount(likeCountUI)}</span>
                </button>
                <span className="dot">•</span>
                <span>{formatRelativeDate(videoDetails.snippet.publishedAt)}</span>
              </div>

              {/* DESCRIPTION */}
              <div className="description-box">
                <div className={`desc-content ${descExpanded ? "expanded" : ""}`}>
                  {videoDetails.snippet.description}
                </div>
                <button className="desc-toggle-btn" onClick={() => setDescExpanded((p) => !p)}>
                  {descExpanded ? "Show less" : "Show more"}
                </button>
              </div>
            </div>

            {/* COMMENTS */}
            <div className="comments-section">
              <div className="comments-section-header">
                <span className="comments-count">{comments.length.toLocaleString()} Comments</span>
                <button className="comments-sort">Sort by</button>
              </div>

              {/* ADD COMMENT */}
              <div className="add-comment">
                <Avatar username={user?.username} avatarColor={user?.avatarColor} size={40} />
                <textarea
                  className="comment-input"
                  placeholder="Add a public comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button className="comment-post-btn" onClick={handlePostComment}>
                  Comment
                </button>
              </div>

              {/* RENDER COMMENTS */}
              {comments.map((comment) => {
                const c = comment.snippet.topLevelComment.snippet;
                const hasProfileImage = c.authorProfileImageUrl; // ✅ check if YouTube provided DP

                return (
                  <div key={comment.id} className="comment">
                    {hasProfileImage ? (
                      <img
                        src={c.authorProfileImageUrl}
                        alt={c.authorDisplayName}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Avatar username={c.authorDisplayName} avatarColor={c.authorColor} size={36} />
                    )}
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
          </>
        )}
      </div>

      {/* SIDEBAR */}
      <aside className="video-sidebar">
        <h4>Up Next</h4>
        {relatedVideos.length === 0 ? (
          <p>No related videos found.</p>
        ) : (
          relatedVideos.map((v) => (
            <div key={v.id} className="sidebar-card" onClick={() => navigate(`/video/${v.id}`)}>
              <img src={v.thumbnail} alt={v.title} />
              <div>
                <p className="sidebar-title">{v.title}</p>
                <p className="sidebar-channel">{v.channel}</p>
                <p className="sidebar-views">{parseInt(v.views).toLocaleString()} views</p>
              </div>
            </div>
          ))
        )}
      </aside>
    </div>
  );
}

export default VideoPlayer;
