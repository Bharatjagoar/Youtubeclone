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
      const searchRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          q: query,
          type: "video",
          maxResults: 20,
          key: import.meta.env.VITE_YOUTUBE_API_KEY,
        },
      });

      const videoIds = searchRes.data.items
        .map((item) => item.id?.videoId)
        .filter(Boolean);

      if (videoIds.length === 0) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      const detailsRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
        params: {
          part: "snippet",
          id: videoIds.join(","),
          key: import.meta.env.VITE_YOUTUBE_API_KEY,
        },
      });

      setResults(detailsRes.data.items);
    } catch (err) {
      console.error("Error fetching search results:", err.message);
      setResults([]);
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