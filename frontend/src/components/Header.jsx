import React, { useState, useEffect, useRef } from "react";
import { FaYoutube, FaSearch, FaSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchSearchResults, setQuery } from "../redux/searchSlice";
import axios from "axios";
import { openAuthModal, closeAuthModal } from "../redux/authSlice";
import { verifyTokenBeforeFetch } from "../utils/verifyTokenBeforeFetch";
import LogoutModal from "./LogoutModal";
import AuthModal from "./AuthModel";
import { setLoginStatus } from "../redux/authSlice";
import "./Header.css";

const Header = () => {
  const [input, setInput] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const suggestionRef = useRef();
  const showAuthModal = useSelector((state) => state.auth.showAuthModal);
  const dispatch = useDispatch();
  const debounceTimer = useRef(null);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    async function setlogin() {
      const verified = await verifyTokenBeforeFetch();
      dispatch(setLoginStatus(verified)); // 🔥 update global state
    }

    setlogin();
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

        const items = searchRes.data.items.map(data=>{
              return data.snippet.title;
        });
        console.log(items);

        setSuggestions([...items]);
      } catch (err) {
        console.error("Error fetching suggestions:", err.message);
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [input]);



  // Inside Header component
  const handleSearch = (query = input) => {
    if (!query.trim()) return;
    console.log("hellow ");
    dispatch(setQuery(query));
    dispatch(fetchSearchResults(query));
    setSuggestions([]);
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
  console.log(isLoggedIn);

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
              {suggestions.map((item,index) => (
                <li
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSearch(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
        {!isLoggedIn ? (
          <button className="signin-btn" onClick={() => dispatch(openAuthModal())}>
            Sign In
          </button>
        ) : (
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
            alt="User Avatar"
            className="user-avatar"
            onClick={() => setShowLogoutModal(true)}
          />
        )}
        {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} />}
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