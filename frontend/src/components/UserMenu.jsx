import React, { useEffect, useRef } from "react";
import "./UserMenu.css";

const UserMenu = ({ onClose, onChannelDetails, onLogout, avatarRef }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, avatarRef]);

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="menu-item" onClick={onChannelDetails}>
        Channel Details
      </button>
      <button className="menu-item logout" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
};

export default UserMenu;
