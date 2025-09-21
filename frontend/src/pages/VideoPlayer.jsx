// pages/VideoPlayer.jsx - REFACTORED VERSION
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import VideoInfo from "../components/VideoInfo";
import AddComment from "../components/AddComment";
import CommentsList from "../components/CommentsList";
import RelatedVideos from "../components/RelatedVideos";
import { cleanText } from "../components/helperfunctions";
import "./VideoPlayer.css";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

function VideoPlayer() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  // Video & Channel State
  const [videoDetails, setVideoDetails] = useState(null);
  const [channelDetails, setChannelDetails] = useState(null);
  const [Relatedquery, setRelatedquery] = useState("");

  // Video Interaction State
  const [liked, setLiked] = useState(false);
  const [likeCountUI, setLikeCountUI] = useState(0);
  const [subscriberCountUI, setSubscriberCountUI] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);

  // Comments State
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [activeReplyBox, setActiveReplyBox] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  // User State
  const [user, setUser] = useState(null);

  // Load user on mount
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) setUser(storedUser);
    } catch (err) {
      console.error("Error loading user info:", err);
    }
  }, []);

  // Update UI counts when video/channel details change
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

  // Fetch all data when videoId changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch video details
        const vidRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: { part: "snippet,statistics", id: videoId, key: API_KEY },
        });
        const vid = vidRes.data.items[0];
        setRelatedquery(vid.snippet.title);
        setVideoDetails(vid);

        // Fetch channel details
        const chRes = await axios.get("https://www.googleapis.com/youtube/v3/channels", {
          params: { part: "snippet,statistics", id: vid.snippet.channelId, key: API_KEY },
        });
        setChannelDetails(chRes.data.items[0]);

        // Fetch comments (backend or fallback)
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
      } catch (e) {
        console.error("Error fetching video data:", e);
      }
    };

    fetchData();
  }, [videoId]);

  // Video interaction handlers
  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCountUI((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleSubscribe = () => setSubscriberCountUI((p) => p + 1);

  const handleChannelClick = () => {
    if (channelDetails) {
      navigate(`/channel/${channelDetails.id}`);
    }
  };

  // Comment handlers
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

  const handleReplyToggle = (commentId) => {
    setActiveReplyBox((prev) => (prev === commentId ? null : commentId));
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
      
      // Refresh comments from backend so replies show up
      const backendComments = await axios.get(`http://localhost:5000/comments/video/${videoId}`);
      setComments(backendComments.data.map((saved) => ({ ...saved, fromBackend: true })));
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  };

  const handleCloseReplyBox = () => {
    setActiveReplyBox(null);
    setReplyText("");
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

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await axios.delete(`http://localhost:5000/comments/${commentId}`);
      if (!res.data) throw new Error("No response from server");
      
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
      alert("Failed to delete comment.");
    }
  };
  console.log(channelDetails);
  return (
    <div className="video-player-wrapper">
      <div className="video-player-main">
        <VideoInfo
          videoId={videoId}
          videoDetails={videoDetails}
          channelDetails={channelDetails}
          liked={liked}
          likeCountUI={likeCountUI}
          subscriberCountUI={subscriberCountUI}
          descExpanded={descExpanded}
          onLike={handleLike}
          onSubscribe={handleSubscribe}
          onChannelClick={handleChannelClick}
          onDescToggle={() => setDescExpanded((p) => !p)}
        />

        <AddComment
          user={user}
          newComment={newComment}
          onCommentChange={setNewComment}
          onPostComment={handlePostComment}
        />

        <CommentsList
          comments={comments}
          user={user}
          activeReplyBox={activeReplyBox}
          replyText={replyText}
          editingCommentId={editingCommentId}
          editedCommentText={editedCommentText}
          onReplyToggle={handleReplyToggle}
          onReplyTextChange={setReplyText}
          onPostReply={handlePostReply}
          onCloseReplyBox={handleCloseReplyBox}
          onEditComment={handleEditComment}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
          onEditTextChange={setEditedCommentText}
          onDeleteComment={handleDeleteComment}
          setActiveReplyBox={setActiveReplyBox}
          setReplyText={setReplyText}
          setComments={setComments}
        />
      </div>

      <aside className="video-sidebar">
        <RelatedVideos query={Relatedquery} />
      </aside>
    </div>
  );
}

export default VideoPlayer;