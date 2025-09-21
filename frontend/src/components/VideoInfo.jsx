// components/VideoInfo.jsx
import React from "react";
import { FaThumbsUp } from "react-icons/fa";
import { formatCount, formatRelativeDate } from "./helperfunctions";

function VideoInfo({
  videoId,
  videoDetails,
  channelDetails,
  liked,
  likeCountUI,
  subscriberCountUI,
  descExpanded,
  onLike,
  onSubscribe,
  onChannelClick,
  onDescToggle
}) {
  if (!videoDetails || !channelDetails) return null;

  return (
    <>
      {/* Video Player */}
      <iframe
        width="100%"
        height="480"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="YouTube Video"
      />

      {/* Video Meta Information */}
      <div className="video-meta">
        <h2>{videoDetails.snippet.title}</h2>
        
        {/* Channel Info */}
        <div className="channel-info" onClick={onChannelClick} style={{ cursor: 'pointer' }}>
          <img 
            src={channelDetails.snippet.thumbnails.default.url} 
            alt={channelDetails.snippet.title} 
          />
          <div>
            <p>{channelDetails.snippet.title}</p>
            <p>{formatCount(subscriberCountUI)} subscribers</p>
          </div>
          <button 
            className="subscribe-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onSubscribe();
            }}
          >
            Subscribe
          </button>
        </div>

        {/* Video Stats */}
        <div className="video-stats">
          <span>{formatCount(videoDetails.statistics.viewCount)} views</span>
          <span className="dot">•</span>
          <button className={`like-btn ${liked ? "liked" : ""}`} onClick={onLike}>
            <FaThumbsUp className="like-icon" />
            <span className="like-count">{formatCount(likeCountUI)}</span>
          </button>
          <span className="dot">•</span>
          <span>{formatRelativeDate(videoDetails.snippet.publishedAt)}</span>
        </div>

        {/* Description */}
        <div className="description-box">
          <div className={`desc-content ${descExpanded ? "expanded" : ""}`}>
            {videoDetails.snippet.description}
          </div>
          <button className="desc-toggle-btn" onClick={onDescToggle}>
            {descExpanded ? "Show less" : "Show more"}
          </button>
        </div>
      </div>
    </>
  );
}

export default VideoInfo;