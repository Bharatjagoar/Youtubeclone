import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { openAuthModal } from "../redux/authSlice";
import { verifyTokenBeforeFetch } from "../utils/verifyTokenBeforeFetch";
import "./VideoCard.css";

const VideoCard = ({ video, detect ,clickme}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = async () => {
    const isValid = await verifyTokenBeforeFetch();
    detect(isValid);
    if (!isValid) {
      clickme();
      return;
    }
    navigate(`/video/${video.id}`, { state: { video } });
  };

  return (
    <div className="video-card" onClick={handleClick}>
      <img
        src={video.thumbnail}
        alt={video.title}
        className="thumbnail"
      />
      <div className="video-details">
        <div className="channel-avatar">
          {video.channelDp ? (
            <img
              src={video.channelDp}
              alt={video.channel}
              className="avatar-circle"
            />
          ) : (
            <div className="avatar-circle">
              {video.channel?.charAt(0)}
            </div>
          )}
        </div>
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
