// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { FaYoutube, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setQuery, fetchSearchResults } from "../redux/searchSlice";
import axios from "axios";
import "./Header.css";

const Header = () => {
  const [input, setInput] = useState("");               // ✅ Local input state
  const [suggestions, setSuggestions] = useState([]);   // ✅ Enriched suggestions
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Fetch suggestions with full metadata
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!input.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        // 🔹 Step 1: Get video IDs from search endpoint
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
          .filter(Boolean); // ✅ Filter out undefined/null IDs

        if (videoIds.length === 0) {
          setSuggestions([]);
          return;
        }

        // 🔹 Step 2: Fetch full video details using videos endpoint
        const detailsRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: {
            part: "snippet",
            id: videoIds.join(","),
            key: import.meta.env.VITE_YOUTUBE_API_KEY,
          },
        });

        // ✅ Store enriched suggestions with title/snippet
        setSuggestions(detailsRes.data.items);
      } catch (err) {
        console.error("Error fetching enriched suggestions:", err.message);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [input]);

  // ✅ Trigger search and update Redux state
  const handleSearch = (query = input) => {
    if (!query.trim()) return;
    dispatch(setQuery(query));
    dispatch(fetchSearchResults(query));
    navigate(`/search/${query}`);
    setSuggestions([]);
  };

  // ✅ Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // ✅ Navigate to homepage on logo click
  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header className="header">
      {/* ✅ Logo section */}
      <div className="logo-combo" onClick={handleLogoClick}>
        <FaYoutube size={24} color="red" className="youtube-icon" />
        <span className="logo-text">YouTube</span>
      </div>

      {/* ✅ Search bar section */}
      <div className="search-container">
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

        {/* ✅ Suggestions dropdown */}
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

      {/* ✅ Placeholder for future auth */}
      <button className="signin-btn">Sign In</button>
    </header>
  );
};

export default Header;