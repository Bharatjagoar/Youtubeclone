import React from "react";
import { useNavigate } from "react-router-dom";
import "./VideoCard.css";

const VideoCard = ({ video }) => {
  const navigate = useNavigate();

  // ✅ Navigate to video player page with full video data
  const handleClick = () => {
    navigate(`/video/${video.id}`, { state: { video } });
  };

  return (
    <div className="video-card" onClick={handleClick}>
      {/* ✅ Thumbnail preview */}
      <img src={video.thumbnail} alt={video.title} className="thumbnail" />

      {/* ✅ Video metadata section */}
      <div className="video-details">
        {/* ✅ Channel avatar (fallback to first letter if no image) */}
        <div className="channel-avatar">
          {video.channelDp ? (
            <img src={video.channelDp} alt={video.channel} className="avatar-circle" />
          ) : (
            <div className="avatar-circle">{video.channel?.charAt(0)}</div>
          )}
        </div>

        {/* ✅ Title, channel name, and stats */}
        <div className="video-meta">
          <h3 className="video-title">{video.title}</h3>
          <p className="video-channel">{video.channel}</p>
          <p className="video-stats">
            {video.views} views · {video.publishedAt}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;