// src/components/SearchResults.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { verifyTokenBeforeFetch } from "../utils/verifyTokenBeforeFetch";
import "./SearchResults.css";
import PromptsModal from "./promptsModal.jsx";

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
  const { results, query } = useSelector((state) => state.search); // assuming query is stored
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [pageToken, setPageToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allResults, setAllResults] = useState(results || []);

  const observerTarget = useRef(null);
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  // Append results on new search
  useEffect(() => {
    setAllResults(results || []);
    setPageToken(null);
    setError(false);
    setErrorMessage("");
  }, [results]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showModal]);

  const fetchMoreResults = useCallback(
    async (token) => {
      if (!query || loading) return;
      setLoading(true);

      try {
        const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            part: "snippet",
            q: query,
            type: "video",
            maxResults: 20,
            key: API_KEY,
            pageToken: token,
          },
        });

        const newItems = res.data.items
          .filter((item) => item.id.videoId)
          .map((item) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            channelName: item.snippet.channelTitle,
            channelAvatar: item.snippet.thumbnails.default?.url,
            thumbnail: item.snippet.thumbnails.medium?.url,
            publishedAt: formatRelativeDate(item.snippet.publishedAt),
            type: "video",
            // you can fetch stats in a second call if needed
          }));

        setAllResults((prev) => [...prev, ...newItems]);
        setPageToken(res.data.nextPageToken || null);
      } catch (err) {
        console.error("Error fetching more search results:", err);

        // pick the best message from the API or fallback
        const msg =
          err.response?.data?.error?.message ||
          err.response?.data?.error?.errors?.[0]?.message ||
          "Failed to load more results. Please try again.";

        setErrorMessage(msg);
        setError(true);
      } finally {
        setLoading(false);
      }

    },
    [API_KEY, query, loading]
  );

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!observerTarget.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pageToken) {
          fetchMoreResults(pageToken);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [pageToken, fetchMoreResults]);

  const handleClick = async (video) => {
    const isValid = await verifyTokenBeforeFetch();
    if (!isValid) {
      setShowModal(true);
      return;
    }
    navigate(`/video/${video.id}`, { state: { video } });
  };

  if (!allResults.length) {
    return <p className="no-results">No results found.</p>;
  }

  return (
    <>
      {showModal && (<PromptsModal onClose={() => setShowModal(false)} />)}
      <div className="search-results">
        {error && (
          <div className="error-banner">
            <span>{errorMessage}</span>
            <button onClick={() => fetchMoreResults(pageToken)}>Retry</button>
          </div>
        )}

        <div className="results-grid">
          {allResults.map((item) => (
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
                    <p className="result-meta">{item.publishedAt}</p>
                    <p className="result-description">{item.description}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div ref={observerTarget} style={{ height: "50px", margin: "20px", textAlign: "center" }}>
          {loading && <p>Loading more results...</p>}
        </div>
      </div>
    </>

  );
};

export default SearchResults;
