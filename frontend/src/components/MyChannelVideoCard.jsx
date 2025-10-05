// src/components/MyChannelVideoCard.jsx
import React, { useEffect, useRef, useState } from "react";
import "./MyChannelVideoCard.css";
import ConfirmDialog from "./ConfirmDialog.jsx";

const MyChannelVideoCard = ({ video, thumb, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef(null);

  // close menu when clicking outside
  useEffect(() => {
    const handleDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    setConfirmOpen(false);
    onDelete(video._id);
  };

  const cancelDelete = () => setConfirmOpen(false);

  const createdStr = video.createdAt
    ? new Date(video.createdAt).toLocaleDateString()
    : "";

  return (
    <>
      <div
        className="mychannel-video-card"
        role="article"
        aria-label={video.title}
      >
        {/* Thumbnail */}
        <div
          className="mychannel-thumb-wrapper"
          role="button"
          tabIndex={0}
          // onClick={() => onOpen(video._id)}
        >
          <img className="mychannel-thumb" src={thumb} alt={video.title} />
          <div className="mychannel-play-overlay" aria-hidden>
            ▶
          </div>
        </div>

        {/* Video Info + Menu */}
        <div className="mychannel-video-row">
          <div
            className="mychannel-video-meta"
            role="button"
            tabIndex={0}
          >
            <h4 className="mychannel-video-title">{video.title}</h4>
            <p className="mychannel-video-date">{createdStr}</p>
          </div>

          {/* 3-dot menu */}
          <div className="mychannel-menu-area" ref={menuRef}>
            <button
              className="mychannel-menu-btn"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((s) => !s);
              }}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              title="Options"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                <circle cx="5" cy="12" r="1.8"></circle>
                <circle cx="12" cy="12" r="1.8"></circle>
                <circle cx="19" cy="12" r="1.8"></circle>
              </svg>
            </button>

            {menuOpen && (
              <div
                className="mychannel-menu"
                onClick={(e) => e.stopPropagation()} // important
              >
                <button
                  className="mychannel-menu-item"
                  onClick={handleDeleteClick}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    style={{ marginRight: 8 }}
                  >
                    <path
                      d="M3 6h18M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete video?"
        message="Are you sure you want to delete this video? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};

export default MyChannelVideoCard;
