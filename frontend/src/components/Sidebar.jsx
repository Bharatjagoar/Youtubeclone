import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import {
  MdHome,
  MdHistory,
  MdPlaylistPlay,
  MdVideoLibrary,
  MdWatchLater,
  MdThumbUp
} from "react-icons/md";
import { FaYoutube, FaRegCompass } from "react-icons/fa";
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
  { name: "Liked videos", icon: <MdThumbUp /> }
];

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  // const nav = useNavigate();

  return (
    <aside className={`sidebar ${open ? "open" : "closed"}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        {open ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>
      <ul className="tab-list">
        {tabs.map((tab, index) => (
          <li
            key={index}
            className="tab-item"
            onClick={() => {
              if (tab.name === "Home") {
                nav("/");
              }
            }}
          >
            <span className="tab-icon">{tab.icon}</span>
            {open && <span className="tab-label">{tab.name}</span>}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;