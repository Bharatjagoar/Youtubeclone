// src/pages/MyChannelPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CreateEditChannelModal from "../components/CreateEditChannelModal.jsx";
import UploadVideoModal from "../components/UploadVideoModal.jsx";
import "./MyChannelPage.css";

const MyChannelPage = () => {
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const navigate = useNavigate();

    // Fetch channel on mount
    useEffect(() => {
        async function loadChannel() {
            try {
                const stored = JSON.parse(localStorage.getItem("channel"));
                if (!stored?._id) {
                    setChannel(null);
                } else {
                    const res = await axios.get(`/api/channels/${stored._id}`);
                    setChannel(res.data);
                    localStorage.setItem("channel", JSON.stringify(res.data));
                }
            } catch (err) {
                console.error(err);
                setChannel(null);
            } finally {
                setLoading(false);
            }
        }
        loadChannel();
    }, []);

    // Delete entire channel
    const handleDeleteChannel = async () => {
        if (!window.confirm("Delete your channel forever?")) return;
        try {
            await axios.delete(`/api/channels/${channel._id}`);
            localStorage.removeItem("channel");
            navigate("/");
        } catch (err) {
            alert("Failed to delete channel");
        }
    };

    // After edit, update state + storage
    const handleChannelUpdated = (updated) => {
        setChannel(updated);
        localStorage.setItem("channel", JSON.stringify(updated));
    };

    // After upload, update state + storage
    const handleVideoUploaded = (updated) => {
        setChannel(updated);
        localStorage.setItem("channel", JSON.stringify(updated));
    };

    if (loading) {
        return <p className="loading-text">Loading channel…</p>;
    }

    if (!channel) {
        return (
            <div className="no-channel">
                <p>You don’t have a channel yet.</p>
                <button onClick={() => setShowEditModal(true)}>
                    Create Channel
                </button>

                {showEditModal && (
                    <CreateEditChannelModal
                        onClose={() => setShowEditModal(false)}
                        onSuccess={(newChannel) => {
                            setChannel(newChannel);
                            localStorage.setItem("channel", JSON.stringify(newChannel));
                            setShowEditModal(false);
                        }}
                    />
                )}
            </div>
        );
    }


    return (
        <div className="my-channel-page">
            <div className="channel-header">
                {channel.avatarUrl?.url && (
                    <img
                        src={channel.avatarUrl.url}
                        alt={channel.name}
                        className="channel-avatar"
                    />
                )}
                <h1 className="channel-name">{channel.name}</h1>
                <p className="channel-description">{channel.description}</p>

                <div className="channel-actions">
                    <button onClick={() => setShowEditModal(true)}>
                        Edit Channel
                    </button>
                    <button onClick={handleDeleteChannel}>Delete Channel</button>
                    <button onClick={() => setShowUploadModal(true)}>
                        Upload Video
                    </button>
                </div>
            </div>

            <div className="channel-videos-grid">
                {channel?.videos?.map((video) => (
                    <div key={video._id} className="channel-video-card">
                        <video
                            src={video.url}
                            controls
                            className="video-player-thumb"
                        />
                        <div className="video-info">
                            <h3 className="video-title">{video.title}</h3>
                            <button
                                onClick={async () => {
                                    if (
                                        !window.confirm("Delete this video?")
                                    )
                                        return;
                                    try {
                                        await axios.delete(
                                            `/api/channels/${channel._id}/videos/${video._id}`
                                        );
                                        // Remove from local state
                                        const filtered = channel.videos.filter(
                                            (v) => v._id !== video._id
                                        );
                                        const updated = { ...channel, videos: filtered };
                                        handleVideoUploaded(updated);
                                    } catch (err) {
                                        alert("Failed to delete video");
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showEditModal && (
                <CreateEditChannelModal
                    channel={channel}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleChannelUpdated}
                />
            )}

            {showUploadModal && (
                <UploadVideoModal
                    channelId={channel._id}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={handleVideoUploaded}
                />
            )}
        </div>
    );
};

export default MyChannelPage;
