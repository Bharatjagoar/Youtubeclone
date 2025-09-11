// src/components/SearchResults.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { verifyTokenBeforeFetch } from "../utils/verifyTokenBeforeFetch";
import "./SearchResults.css";

// Format large numbers into readable strings
const formatCount = (num) => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
};

// Convert ISO date string to relative time
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

// Convert ISO 8601 duration to mm:ss or hh:mm:ss
const formatDuration = (isoDuration) => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = parseInt(match[1] || "0", 10);
  const m = parseInt(match[2] || "0", 10);
  const s = parseInt(match[3] || "0", 10);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const SearchResults = () => {
  const { results, isLoading } = useSelector((state) => state.search);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleClick = async (video) => {
    const isValid = await verifyTokenBeforeFetch();
    if (!isValid) {
      setShowModal(true);
      return;
    }
    navigate(`/video/${video.id}`, { state: { video } });
  };

  if (isLoading) {
    return <p className="loading-text">Loading search results...</p>;
  }

  if (!results.length) {
    return <p className="no-results">No results found.</p>;
  }

  return (
    <div className="search-results">
      {showModal && (
        <div className="auth-modal">
          <div className="auth-modal-content">
            <p>You are not signed in.</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

      {results.map((item) => (
        <div
          key={item.id}
          className="search-result-card"
          onClick={() => item.type === "video" && handleClick(item)}
          style={{ cursor: item.type === "video" ? "pointer" : "default" }}
        >
          <img
            src={item.type === "video" ? item.thumbnail : item.avatar}
            alt={item.title}
            className="result-thumbnail"
          />
          <div className="result-info">
            <h3 className="result-title">{item.title}</h3>
            {item.type === "video" && (
              <>
                <p className="result-channel">
                  {item.channelAvatar && (
                    <img
                      src={item.channelAvatar}
                      alt={item.channelName}
                      className="channel-avatar"
                    />
                  )}
                  {item.channelName}
                </p>
                <p className="result-meta">
                  {formatCount(Number(item.views))} views • {formatDuration(item.duration)}
                </p>
                <p className="result-description">{item.description}</p>
              </>
            )}
            {item.type === "channel" && (
              <>
                <p className="result-meta">
                  {formatCount(Number(item.subscribers))} subscribers
                </p>
                <p className="result-description">{item.description}</p>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
