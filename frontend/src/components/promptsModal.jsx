import React from "react";
import "./promptsModal.css";
import { useDispatch } from "react-redux";
import { openAuthModal } from "../redux/authSlice";

const PromptsModal = ({ onClose }) => {
  const dispatch = useDispatch();
  
  const handleClick = async () => {
    dispatch(openAuthModal()); // 🔥 Trigger global modal
    onClose();
  };
  return (
    <div className="auth-modal-overlay">
      
      <div className="auth-modal">
        <h2>Sign In Required</h2>
        <p>You need to sign in to watch videos.</p>
        <button onClick={() => handleClick()} className="btn-primary">
          Go to Sign In
        </button>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
      </div>
    </div>
  );
};

export default PromptsModal;