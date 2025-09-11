import React from "react";
import "./LogoutModal.css";
import { useDispatch } from "react-redux";
import { setLoginStatus } from "../redux/authSlice";

const LogoutModal = ({ onClose }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(setLoginStatus(false));
    onClose();
  };

  return (
    <div className="logout-modal-overlay">
      <div className="logout-modal">
        <h3>Log Out?</h3>
        <p>Are you sure you want to log out?</p>
        <div className="logout-buttons">
          <button className="btn-confirm" onClick={handleLogout}>Yes</button>
          <button className="btn-cancel" onClick={onClose}>No</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;