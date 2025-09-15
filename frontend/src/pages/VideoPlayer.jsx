import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaThumbsUp } from "react-icons/fa";
import axios from "axios";
import Replies from "../components/replies";
import Avatar from "../components/Avatar";
import "./VideoPlayer.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { formatCount, formatRelativeDate } from "../components/helperfunctions";
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;


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


  const [user, setUser] = useState(null);
  const [activeReplyBox, setActiveReplyBox] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");


  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) setUser(storedUser);
    } catch (err) {
      console.error("Error loading user info:", err);
    }
  }, []);

  useEffect(() => {
    if (videoDetails) {
      setLikeCountUI(Number(videoDetails.statistics.likeCount || 0));
    }
  }, [videoDetails]);

  useEffect(() => {
    if (channelDetails) {
      setSubscriberCountUI(Number(channelDetails.statistics.subscriberCount || 0));
    }
  }, [channelDetails]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Fetch video details
        const vidRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: { part: "snippet,statistics", id: videoId, key: API_KEY },
        });
        const vid = vidRes.data.items[0];
        setVideoDetails(vid);

        // ✅ Fetch channel details
        const chRes = await axios.get("https://www.googleapis.com/youtube/v3/channels", {
          params: { part: "snippet,statistics", id: vid.snippet.channelId, key: API_KEY },
        });
        setChannelDetails(chRes.data.items[0]);

        // ✅ Fetch comments (backend or fallback)
        try {
          const backendComments = await axios.get(`http://localhost:5000/comments/video/${videoId}`);
          if (backendComments.data && backendComments.data.length > 0) {
            setComments(
              backendComments.data.map((saved) => ({
                ...saved,
                fromBackend: true,
              }))
            );
          } else {
            throw new Error("No backend comments");
          }
        } catch (err) {
          console.warn("Backend comments not available, falling back to YouTube API");
          const comRes = await axios.get("https://www.googleapis.com/youtube/v3/commentThreads", {
            params: { part: "snippet", videoId, maxResults: 10, key: API_KEY },
          });
          setComments(comRes.data.items.map((c) => ({ ...c, fromBackend: false })));
        }

        // ✅ Fetch related videos
        const relRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            part: "snippet",
            relatedToVideoId: videoId,
            type: "video",
            maxResults: 15,
            key: API_KEY,
          },
        });

        const ids = relRes.data.items.map((i) => i.id.videoId).filter(Boolean);
        if (ids.length > 0) {
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

      const obj = { ...saved, fromBackend: true };
      setComments((prev) => [obj, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handlePostReply = async (parentId) => {
    const text = replyText.trim();
    if (!text) return;
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      await axios.post(`http://localhost:5000/comments/${parentId}/replies`, {
        author: storedUser.username,
        text,
        videoId,
        avatarColor: storedUser.avatarColor,
      });

      setReplyText("");
      setActiveReplyBox(null);
      // ⚡ Refresh comments from backend so replies show up
      const backendComments = await axios.get(`http://localhost:5000/comments/video/${videoId}`);
      setComments(backendComments.data.map((saved) => ({ ...saved, fromBackend: true })));
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  };

  // closes any open reply box and clears the reply input
  const closeReplyBox = () => {
    setActiveReplyBox(null);
    setReplyText("");
  };


  const deleteCommentById = async (commentId) => {
    try {
      const res = await axios.delete(`http://localhost:5000/comments/${commentId}`);
      if (!res.data) throw new Error("No response from server");
      return res.data;
    } catch (err) {
      console.error("Failed to delete comment:", err);
      throw err;
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditedCommentText(currentText);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedCommentText("");
  };

  const handleSaveEdit = async (commentId) => {
    const trimmed = editedCommentText.trim();
    if (!trimmed) return;

    try {
      const { data: updated } = await axios.put(
        `http://localhost:5000/comments/${commentId}`,
        { text: trimmed }
      );

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, text: updated.text } : c
        )
      );

      setEditingCommentId(null);
      setEditedCommentText("");
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  return (
    <div className="video-player-wrapper">
      <div className="video-player-main">
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

              <div className="description-box">
                <div className={`desc-content ${descExpanded ? "expanded" : ""}`}>
                  {videoDetails.snippet.description}
                </div>
                <button className="desc-toggle-btn" onClick={() => setDescExpanded((p) => !p)}>
                  {descExpanded ? "Show less" : "Show more"}
                </button>
              </div>
            </div>


            {/* comment section */}
            <div className="comments-section">
              <div className="comments-section-header">
                <span className="comments-count">
                  {comments.length.toLocaleString()} Comments
                </span>
                {/* <button className="comments-sort">Sort by</button> */}
              </div>

              <div className="add-comment">
                <Avatar
                  username={user?.username}
                  avatarColor={user?.avatarColor}
                  size={40}
                />
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

              {comments.map((comment) =>
                comment.fromBackend ? (
                  <div key={comment._id} className="comment">
                    <Avatar
                      username={comment.author}
                      avatarColor={comment.avatarColor}
                      size={36}
                    />
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author}</span>
                        <span className="comment-time">
                          {formatRelativeDate(comment.createdAt)}
                        </span>
                      </div>

                      {editingCommentId === comment._id ? (
                        <div className="edit-box">
                          <textarea
                            className="comment-input"
                            value={editedCommentText}
                            onChange={(e) => setEditedCommentText(e.target.value)}
                          />
                          <div className="edit-actions">
                            <button
                              className="comment-post-btn"
                              onClick={() => handleSaveEdit(comment._id)}
                            >
                              Save
                            </button>
                            <button
                              className="comment-post-btn"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="comment-text">{comment.text}</p>
                      )}


                      <div className="comment-actions">
                        <button
                          className="reply-btn"
                          onClick={() =>
                            setActiveReplyBox((prev) =>
                              prev === comment._id ? null : comment._id
                            )
                          }
                        >
                          Reply
                        </button>

                        <button
                          className="edit-btn"
                          onClick={() => handleEditComment(comment._id, comment.text)}
                        >
                          <FaEdit /> Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={async () => {
                            try {
                              await deleteCommentById(comment._id);
                              setComments((prev) =>
                                prev.filter((c) => c._id !== comment._id)
                              );
                            } catch (err) {
                              alert("Failed to delete comment.");
                            }
                          }}
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>

                      {activeReplyBox === comment._id && (
                        <div className="reply-box">
                          <textarea
                            className="reply-input"
                            placeholder="Reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <div className="reply-actions">
                            <button
                              type="button"
                              className="reply-post-btn"
                              onClick={() => handlePostReply(comment._id)}
                            >
                              Post Reply
                            </button>

                            {/* Cancel / Close button */}
                            <button
                              type="button"
                              className="reply-cancel-btn"
                              onClick={closeReplyBox}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}


                      <Replies
                        replies={comment.replies}
                        activeReplyBox={activeReplyBox}
                        setActiveReplyBox={setActiveReplyBox}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        handlePostReply={handlePostReply}
                        setComments={setComments}
                        parentId={comment._id}
                      />
                    </div>
                  </div>
                ) : (
                  <div key={comment.id} className="comment">
                    <img
                      src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl}
                      alt={comment.snippet.topLevelComment.snippet.authorDisplayName}
                      style={{ width: 36, height: 36, borderRadius: "50%" }}
                    />
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-author">
                          {comment.snippet.topLevelComment.snippet.authorDisplayName}
                        </span>
                        <span className="comment-time">
                          {formatRelativeDate(
                            comment.snippet.topLevelComment.snippet.publishedAt
                          )}
                        </span>
                      </div>
                      <p className="comment-text">
                        {comment.snippet.topLevelComment.snippet.textDisplay}
                      </p>
                      <div className="comment-actions">
                        <span className="comment-likes">
                          {formatCount(
                            comment.snippet.topLevelComment.snippet.likeCount
                          )}{" "}
                          likes
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>

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
