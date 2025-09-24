import React, { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import {
  MdHome,
  MdHistory,
  MdPlaylistPlay,
  MdVideoLibrary,
  MdWatchLater,
  MdThumbUp,
} from "react-icons/md";
import { FaRegCompass } from "react-icons/fa";
import { RiVideoLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const tabs = [
  { name: "Home", icon: <MdHome /> },
  { name: "Shorts", icon: <FaRegCompass /> },
  { name: "Subscriptions", icon: <RiVideoLine /> },
  { name: "History", icon: <MdHistory /> },
  { name: "Playlists", icon: <MdPlaylistPlay /> },
  { name: "Your videos", icon: <MdVideoLibrary /> },
  { name: "Watch later", icon: <MdWatchLater /> },
  { name: "Liked videos", icon: <MdThumbUp /> },
];

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  // 1) Track viewport width
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* 2) Mobile: floating toggle */}
      {isMobile && (
        <button
          className="sidebar-toggle-global"
          onClick={() => setOpen(!open)}
          aria-label="Toggle sidebar"
        >
          {open ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      )}

      <aside
        className={`sidebar ${
          open ? "open" : "closed"
        } ${isMobile ? "mobile" : "desktop"}`}
      >
        {/* 3) Desktop: internal toggle */}
        {!isMobile && (
          <div className="sidebar-toggle-wrapper">
            <button
              className="sidebar-toggle"
              onClick={() => setOpen(!open)}
              aria-label="Toggle sidebar"
            >
              {open ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        )}

        <ul className="tab-list">
          {tabs.map((tab, i) => (
            <li
              key={i}
              className="tab-item"
              onClick={() => {
                if (tab.name === "Home") navigate("/");
                if (isMobile) setOpen(false);
              }}
            >
              <span className="tab-icon">{tab.icon}</span>
              {open && <span className="tab-label">{tab.name}</span>}
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
