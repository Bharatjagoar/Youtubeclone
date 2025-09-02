// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaYoutube, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Header.css";

const Header = () => {
  const [input, setInput] = useState("");               // ✅ Input value
  const [suggestions, setSuggestions] = useState([]);   // ✅ Suggestions list
  const [results, setResults] = useState([]);           // ✅ Search results
  const [isLoading, setIsLoading] = useState(false);    // ✅ Loading state
  const navigate = useNavigate();
  const suggestionRef = useRef();                       // ✅ Ref for suggestion box

  // ✅ Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fetch suggestions from YouTube
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!input.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const searchRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            q: input,
            type: "video",
            maxResults: 5,
            key: import.meta.env.VITE_YOUTUBE_API_KEY,
          },
        });

        const videoIds = searchRes.data.items
          .map((item) => item.id?.videoId)
          .filter(Boolean);

        if (videoIds.length === 0) {
          setSuggestions([]);
          return;
        }

        const detailsRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: {
            part: "snippet",
            id: videoIds.join(","),
            key: import.meta.env.VITE_YOUTUBE_API_KEY,
          },
        });

        setSuggestions(detailsRes.data.items);
      } catch (err) {
        console.error("Error fetching suggestions:", err.message);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [input]);

  // ✅ Fetch search results
  const handleSearch = async (query = input) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setSuggestions([]);

    try {
      // 🔹 Step 1: Fetch up to 50 mixed results (videos + channels)
      const searchRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          q: query,
          part: "snippet",
          maxResults: 50,
          key: import.meta.env.VITE_YOUTUBE_API_KEY,
        },
      });

      const items = searchRes.data.items;

      // 🔹 Step 2: Separate videoIds and channelIds
      const videoIds = items
        .filter((item) => item.id.kind === "youtube#video")
        .map((item) => item.id.videoId);

      const channelIds = items
        .filter((item) => item.id.kind === "youtube#channel")
        .map((item) => item.id.channelId);

      // 🔹 Step 3: Fetch full video details
      const videoDetailsRes = videoIds.length
        ? await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: {
            part: "snippet,statistics,contentDetails",
            id: videoIds.join(","),
            key: import.meta.env.VITE_YOUTUBE_API_KEY,
          },
        })
        : { data: { items: [] } };

      // 🔹 Step 4: Fetch channel details
      const channelDetailsRes = channelIds.length
        ? await axios.get("https://www.googleapis.com/youtube/v3/channels", {
          params: {
            part: "snippet,statistics",
            id: channelIds.join(","),
            key: import.meta.env.VITE_YOUTUBE_API_KEY,
          },
        })
        : { data: { items: [] } };

      // 🔹 Step 5: Merge and enrich
      const enrichedVideos = videoDetailsRes.data.items.map((video) => ({
        type: "video",
        id: video.id,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium.url,
        channelId: video.snippet.channelId,
        channelName: video.snippet.channelTitle,
        channelAvatar: null, // will be filled later
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

      // 🔹 Step 6: Fill channel avatars into video objects
      const channelMap = {};
      enrichedChannels.forEach((c) => {
        channelMap[c.id] = c.avatar;
      });

      enrichedVideos.forEach((v) => {
        v.channelAvatar = channelMap[v.channelId] || null;
      });

      // 🔹 Step 7: Combine and log
      const finalData = [...enrichedVideos, ...enrichedChannels];
      console.log("🔍 Final Search Results:", finalData);
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
                  onClick={() => handleSearch(item.snippet.title)}
                >
                  {item.snippet.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="signin-btn">Sign In</button>
      </header>

      <main className="results-container">
        {isLoading ? (
          <p className="loading-text">Loading results...</p>
        ) : (
          results.map((video) => (
            <div key={video.id} className="video-card">
              <img
                src={video.snippet.thumbnails.medium.url}
                alt={video.snippet.title}
                className="video-thumb"
              />
              <div className="video-info">
                <h4 className="video-title">{video.snippet.title}</h4>
                <p className="video-channel">{video.snippet.channelTitle}</p>
              </div>
            </div>
          ))
        )}
      </main>
    </>
  );
};

export default Header;