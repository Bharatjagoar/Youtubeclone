// src/pages/MyChannelPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CreateEditChannelModal from "../components/CreateEditChannelModal";
import UploadVideoModal from "../components/UploadVideoModal";
import MyChannelVideoCard from "../components/MyChannelVideoCard";
import DeleteChannelModal from "../components/DeleteChannelModal.jsx";
import "./MyChannelPage.css";

function getYouTubeIdFromUrl(url) {
  try {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  } catch {
    return null;
  }
}

function MyChannelPage() {
  const [channelData, setChannelData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false); // ✅ NEW
  const navigate = useNavigate();

  // ✅ safe JSON parse
  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw || raw === "undefined") return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  };

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      navigate("/");
      return;
    }

    async function fetchMyChannel() {
      try {
        const res = await axios.get(
          `http://localhost:5000/channels/user/${user._id}`
        );
        setChannelData(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setChannelData(null);
          setShowCreateModal(true); // ✅ show create modal
        } else {
          console.error("Error fetching my channel:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMyChannel();
  }, [navigate]);

  if (loading) return <div className="loading">Loading…</div>;

  // Delete channel handler
  const handleConfirmDelete = async () => {
    try {
      const user = getStoredUser();
      if (!user) return navigate("/");

      await axios.delete(
        `http://localhost:5000/channels/${channelData._id}`,
        { data: { user: user._id } }
      );

      alert("Channel deleted successfully!");
      setChannelData(null); // ✅ reset → triggers create modal
    } catch (err) {
      console.error("Failed to delete channel:", err);
      alert("Failed to delete channel");
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Delete handler for videos
  const handleDeleteVideo = async (videoId) => {
    try {
      const user = getStoredUser();
      if (!user) return navigate("/");

      const res = await axios.delete(
        `http://localhost:5000/channels/${channelData._id}/videos/${videoId}/user/${user._id}`,
        { withCredentials: true }
      );

      setChannelData({
        ...channelData,
        videos: channelData.videos.filter((v) => v._id !== videoId),
      });

      console.log("Deleted video:", res.data);
    } catch (err) {
      console.error("Error deleting video:", err);
      alert("Failed to delete video");
    }
  };

  return (
    <div className="my-channel-page">
      {!channelData && showCreateModal && (
        <CreateEditChannelModal
          onClose={() => setShowCreateModal(false)} // ✅ Now closes properly
          onSuccess={(newChannel) => {
            setChannelData(newChannel);
            setShowCreateModal(false);
          }}
        />
      )}

      {channelData && (
        <>
          <div className="my-channel-header">
            <div className="avatar">
              {channelData.avatarUrl ? (
                <img src={channelData.avatarUrl} alt={channelData.name} />
              ) : (
                <div className="avatar-fallback">
                  {channelData.name
                    ? channelData.name.charAt(0).toUpperCase()
                    : "?"}
                </div>
              )}
            </div>

            <div className="channel-meta">
              <h2 className="channel-title">{channelData.name}</h2>
              <p className="channel-username">{channelData.username}</p>
              {channelData.description && (
                <p className="channel-description">{channelData.description}</p>
              )}
            </div>

            <div className="hamburger-wrapper">
              <button
                className={`hamburger ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span />
                <span />
                <span />
              </button>

              {menuOpen && (
                <div className="menu-dropdown">
                  <button onClick={() => {setShowEditModal(true);
                    setMenuOpen(false);
                  }}>
                    ✏️ Edit Channel
                  </button>
                  <button onClick={() => {setShowDeleteModal(true);
                    setMenuOpen(false);
                  }}>
                    🗑️ Delete Channel
                  </button>
                  <button onClick={() => {setShowUploadModal(true);
                    setMenuOpen(false);
                  }}>
                    ⬆️ Upload Video
                  </button>
                </div>
              )}

              {showEditModal && (
                <CreateEditChannelModal
                  channel={channelData}
                  onClose={() => setShowEditModal(false)}
                  onSuccess={(updatedChannel) => {
                    setChannelData(updatedChannel);
                    setShowEditModal(false);
                  }}
                />
              )}

              {showDeleteModal && (
                <DeleteChannelModal
                  onClose={() => setShowDeleteModal(false)}
                  onConfirm={handleConfirmDelete}
                />
              )}
            </div>
          </div>

          {channelData.videos?.length > 0 ? (
            <div className="mychannel-video-grid">
              {channelData.videos.map((video) => {
                const ytId = getYouTubeIdFromUrl(video.url);
                const thumb = ytId
                  ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                  : "/default-thumb.jpg";
                return (
                  <MyChannelVideoCard
                    key={video._id}
                    video={video}
                    thumb={thumb}
                    onDelete={handleDeleteVideo}
                  />
                );
              })}
            </div>
          ) : (
            <p className="no-videos">No videos uploaded yet.</p>
          )}

          {showUploadModal && (
            <UploadVideoModal
              channelId={channelData._id}
              onClose={() => setShowUploadModal(false)}
              onSuccess={(newVideo) => {
                setChannelData({
                  ...channelData,
                  videos: [...(channelData.videos || []), newVideo],
                });
                setShowUploadModal(false);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default MyChannelPage;
