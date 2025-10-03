import React, { useState, useEffect, useRef } from "react";
import { FaYoutube, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchSearchResults, setQuery, clearResults } from "../redux/searchSlice";
import axios from "axios";
import {
  openAuthModal,
  closeAuthModal,
  setLoginStatus,
} from "../redux/authSlice";
import { verifyTokenBeforeFetch } from "../utils/verifyTokenBeforeFetch";
import LogoutModal from "./LogoutModal";
import AuthModal from "./AuthModel";
import UserMenu from "./UserMenu";
import "./Header.css";

const Header = () => {
  const [input, setInput] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // ✅ Track user info in state
  const [username, setUsername] = useState("");
  const [avatarColor, setAvatarColor] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const suggestionRef = useRef();
  const debounceTimer = useRef(null);
  const avatarRef = useRef(null);

  const showAuthModal = useSelector((state) => state.auth.showAuthModal);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  // ✅ Load user from localStorage
  useEffect(() => {
    if (localStorage.getItem("user")) {
      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      const storedUsername = storedUser.username || "";
      let storedAvatarColor = storedUser.avatarColor;

      if (!storedAvatarColor && storedUsername) {
        const randomHue = Math.floor(Math.random() * 360);
        storedAvatarColor = `hsl(${randomHue}, 70%, 50%)`;
        localStorage.setItem(
          "user",
          JSON.stringify({ ...storedUser, avatarColor: storedAvatarColor })
        );
      }

      setUsername(storedUsername);
      setAvatarColor(storedAvatarColor);
    }
  });

  // ✅ Generate initials from username
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    async function setLoginStatusFromToken() {
      const verified = await verifyTokenBeforeFetch();
      dispatch(setLoginStatus(verified));
    }
    setLoginStatusFromToken();

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

  // ✅ Debounce search suggestions
  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const searchRes = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              q: input,
              part: "snippet",
              maxResults: 10,
              key: import.meta.env.VITE_YOUTUBE_API_KEY,
            },
          }
        );

        const items = searchRes.data.items.map((data) => data.snippet.title);
        setSuggestions([...items]);
      } catch (err) {
        console.error("Error fetching suggestions:", err.message);
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [input]);

  const handleSearch = (query = input) => {
    if (!query.trim()) return;
    navigate("/");
    dispatch(setQuery(query));
    dispatch(fetchSearchResults(query));
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleLogoClick = () => {
    navigate("/");
    setInput("");
    setSuggestions([]);
    setResults([]);
    dispatch(clearResults());
  };

  const handleChannelDetails = () => {
    setShowMenu(false);
    navigate("/Mychannel");
  };

  const handleLogoutClick = () => {
    setShowMenu(false);
    setShowLogoutModal(true);
  };

  return (
    <>
      <header className="header">
        {/* Logo */}
        <div className="logo-combo" onClick={handleLogoClick}>
          <FaYoutube size={24} color="red" className="youtube-icon" />
          <span className="logo-text">YouTube</span>
        </div>

        {/* Search */}
        <div className="search-container" ref={suggestionRef}>
          <input
            type="text"
            placeholder="Search"
            className="search-bar"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="search-btn"
            aria-label="Search"
            onClick={() => handleSearch()}
          >
            <FaSearch />
          </button>

          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((item, index) => (
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

        {/* Auth / Profile */}
        {!isLoggedIn ? (
          <button
            className="signin-btn"
            onClick={() => dispatch(openAuthModal())}
          >
            Sign In
          </button>
        ) : (
          <div className="user-avatar-wrapper">
            <div
              className="user-avatar-initials"
              style={{ backgroundColor: avatarColor }}
              ref={avatarRef}
              onClick={() => setShowMenu((prev) => !prev)}
            >
              {getInitials(username)}
            </div>

            {showMenu && (
              <UserMenu
                avatarRef={avatarRef}
                onClose={() => setShowMenu(false)}
                onChannelDetails={handleChannelDetails}
                onLogout={handleLogoutClick}
              />
            )}
          </div>
        )}

        {/* Modals */}
        {showLogoutModal && (
          <LogoutModal onClose={() => setShowLogoutModal(false)} />
        )}
        {showAuthModal && (
          <AuthModal onClose={() => dispatch(closeAuthModal())} />
        )}
      </header>

      {/* Search Results */}
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
