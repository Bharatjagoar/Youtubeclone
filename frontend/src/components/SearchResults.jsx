// src/components/SearchResults.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";
import { useSelector } from "react-redux";
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
  const published = new Date(dateString);
  const now = new Date();
  const diffMs = now - published;
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const month = Math.floor(day / 30);
  const year = Math.floor(day / 365);

  if (year > 0) return `${year} year${year > 1 ? "s" : ""} ago`;
  if (month > 0) return `${month} month${month > 1 ? "s" : ""} ago`;
  if (day > 0) return `${day} day${day > 1 ? "s" : ""} ago`;
  if (hr > 0) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  if (min > 0) return `${min} minute${min > 1 ? "s" : ""} ago`;
  return "Just now";
};

const formatDuration = (iso) => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = parseInt(match[1] || "0", 10);
  const m = parseInt(match[2] || "0", 10);
  const s = parseInt(match[3] || "0", 10);

  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const SearchResults = () => {
  const { results, query } = useSelector((s) => s.search);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pageToken, setPageToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allResults, setAllResults] = useState(results || []);
  const observerTarget = useRef(null);
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  // Reset when query changes
  useEffect(() => {
    setAllResults(results || []);
    setPageToken(null);
    setError(false);
    setErrorMessage("");
  }, [results]);

  // Disable scroll when auth modal is open
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
  }, [showModal]);

  // Fetch more (infinite scroll)
  const fetchMoreResults = useCallback(
    async (token) => {
      if (!query || loading) return;
      setLoading(true);
      try {
        const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            part: "snippet",
            q: query,
            type: "video,channel",
            maxResults: 20,
            key: API_KEY,
            pageToken: token || ""
          },
        });

        // Map both videos and channels
        const newItems = res.data.items
          .map((item) => {
            // Video
            if (item.id.videoId) {
              return {
                id: item.id.videoId,
                type: "video",
                title: item.snippet.title,
                description: item.snippet.description,
                channelName: item.snippet.channelTitle,
                channelAvatar: `${item.snippet.thumbnails.default?.url}`,
                thumbnail: item.snippet.thumbnails.medium?.url,
                publishedAt: formatRelativeDate(item.snippet.publishedAt),
              };
            }
            // Channel
            if (item.id.channelId) {
              return {
                id: item.id.channelId,
                type: "channel",
                title: item.snippet.title,
                description: item.snippet.descriptionSnippet || "",
                channelName: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails.medium?.url,
              };
            }
            return null;
          })
          .filter(Boolean);

        setAllResults((prev) => [...prev, ...newItems]);
        setPageToken(res.data.nextPageToken || null);
      } catch (err) {
        console.error("Error fetching more search results:", err);
        const msg =
          err.response?.data?.error?.message ||
          "Failed to load more results. Please try again.";
        setErrorMessage(msg);
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [API_KEY, query, loading]
  );

  // IntersectionObserver for infinite scroll
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

  // Unified click handler
  const handleItemClick = async (item) => {
    if (item.type === "video") {
      const valid = await verifyTokenBeforeFetch();
      if (!valid) {
        setShowModal(true);
        return;
      }
      navigate(`/video/${item.id}`, { state: { video: item } });
    } else if (item.type === "channel") {
      navigate(`/channel/${item.id}`);
    }
  };

  // No results case
  if (!allResults.length) {
    return <p className="no-results">No results found.</p>;
  }

  return (
    <>
      {showModal && <PromptsModal onClose={() => setShowModal(false)} />}

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
              className={`search-result-card ${item.type}`}  // ← adds “video” or “channel”
              onClick={() => handleItemClick(item)}
            >
              <img
                src={item.thumbnail}
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

                {item.type === "channel" && (
                  <p className="result-channel-only">
                    {item.channelName}
                    {/* you can show subscriber count here once you fetch it */}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          ref={observerTarget}
          style={{ height: "50px", margin: "20px", textAlign: "center" }}
        >
          {loading && <p>Loading more results...</p>}
        </div>
      </div>
    </>
  );
};

export default SearchResults;
