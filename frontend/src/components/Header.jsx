import React, { useState, useEffect, useRef } from "react";
import { FaYoutube, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { openAuthModal, closeAuthModal } from "../redux/authSlice";
import AuthModal from "./AuthModel";
import "./Header.css";

const Header = () => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const suggestionRef = useRef();
  const showAuthModal = useSelector((state) => state.auth.showAuthModal);
  const dispatch = useDispatch();
  const debounceTimer = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Debounced suggestion fetch (videos + channels)
  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const searchRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            q: input,
            part: "snippet",
            maxResults: 10,
            key: import.meta.env.VITE_YOUTUBE_API_KEY,
          },
        });

        const items = searchRes.data.items;

        const videoIds = items
          .filter((item) => item.id.kind === "youtube#video")
          .map((item) => item.id.videoId);

        const channelIds = items
          .filter((item) => item.id.kind === "youtube#channel")
          .map((item) => item.id.channelId);

        const videoDetailsRes = videoIds.length
          ? await axios.get("https://www.googleapis.com/youtube/v3/videos", {
              params: {
                part: "snippet",
                id: videoIds.join(","),
                key: import.meta.env.VITE_YOUTUBE_API_KEY,
              },
            })
          : { data: { items: [] } };

        const channelDetailsRes = channelIds.length
          ? await axios.get("https://www.googleapis.com/youtube/v3/channels", {
              params: {
                part: "snippet",
                id: channelIds.join(","),
                key: import.meta.env.VITE_YOUTUBE_API_KEY,
              },
            })
          : { data: { items: [] } };

        const enrichedVideos = videoDetailsRes.data.items.map((video) => ({
          type: "video",
          id: video.id,
          title: video.snippet.title,
        }));

        const enrichedChannels = channelDetailsRes.data.items.map((channel) => ({
          type: "channel",
          id: channel.id,
          title: channel.snippet.title,
        }));

        setSuggestions([...enrichedVideos, ...enrichedChannels]);
      } catch (err) {
        console.error("Error fetching suggestions:", err.message);
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [input]);

  const handleSearch = async (query = input) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setSuggestions([]);

    try {
      const searchRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          q: query,
          part: "snippet",
          maxResults: 50,
          key: import.meta.env.VITE_YOUTUBE_API_KEY,
        },
      });

      const items = searchRes.data.items;

      const videoIds = items
        .filter((item) => item.id.kind === "youtube#video")
        .map((item) => item.id.videoId);

      const channelIds = items
        .filter((item) => item.id.kind === "youtube#channel")
        .map((item) => item.id.channelId);

      const videoDetailsRes = videoIds.length
        ? await axios.get("https://www.googleapis.com/youtube/v3/videos", {
            params: {
              part: "snippet,statistics,contentDetails",
              id: videoIds.join(","),
              key: import.meta.env.VITE_YOUTUBE_API_KEY,
            },
          })
        : { data: { items: [] } };

      const channelDetailsRes = channelIds.length
        ? await axios.get("https://www.googleapis.com/youtube/v3/channels", {
            params: {
              part: "snippet,statistics",
              id: channelIds.join(","),
              key: import.meta.env.VITE_YOUTUBE_API_KEY,
            },
          })
        : { data: { items: [] } };

      const enrichedVideos = videoDetailsRes.data.items.map((video) => ({
        type: "video",
        id: video.id,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium.url,
        channelId: video.snippet.channelId,
        channelName: video.snippet.channelTitle,
        channelAvatar: null,
        views: video.statistics.viewCount,
        likes: video.statistics.likeCount,
        duration: video.contentDetails.duration,
      }));

      const enrichedChannels = channelDetailsRes.data.items.map((channel) => ({
        type: "channel",
        id: channel.id,
        title: channel.snippet.title,
        avatar: channel.snippet.thumbnails.default.url,
        subscribers: channel.statistics.subscriberCount,
        description: channel.snippet.description,
      }));

      const channelMap = {};
      enrichedChannels.forEach((c) => {
        channelMap[c.id] = c.avatar;
      });

      enrichedVideos.forEach((v) => {
        v.channelAvatar = channelMap[v.channelId] || null;
      });

      const finalData = [...enrichedVideos, ...enrichedChannels];
      console.log("🔍 Final Search Results:", finalData);
      setResults(finalData);
    } catch (err) {
      console.error("❌ Error fetching enriched search results:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLogoClick = () => {
    navigate("/");
    setInput("");
    setSuggestions([]);
    setResults([]);
  };

  return (
    <>
      <header className="header">
        <div className="logo-combo" onClick={handleLogoClick}>
          <FaYoutube size={24} color="red" className="youtube-icon" />
          <span className="logo-text">YouTube</span>
        </div>

        <div className="search-container" ref={suggestionRef}>
          <input
            type="text"
            placeholder="Search"
            className="search-bar"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="search-btn" aria-label="Search" onClick={() => handleSearch()}>
            <FaSearch />
          </button>

          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((item) => (
                <li
                  key={item.id}
                  className="suggestion-item"
                  onClick={() => handleSearch(item.title)}
                >
                  {item.type === "channel" ? `📺 ${item.title}` : item.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="signin-btn" onClick={() => dispatch(openAuthModal())}>Sign In</button>
        {showAuthModal && <AuthModal onClose={() => dispatch(closeAuthModal())} />}
      </header>

      <main className="results-container">
        {isLoading ? (
          <p className="loading-text">Loading results...</p>
        ) : (
          results.map((video) => (
            <div key={video.id} className="video-card">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="video-thumb"
              />
              <div className="video-info">
                <h4 className="video-title">{video.title}</h4>
                <p className="video-channel">{video.channelName}</p>
              </div>
            </div>
          ))
        )}
      </main>
    </>
  );
};

export default Header;