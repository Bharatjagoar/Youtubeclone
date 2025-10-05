// src/components/DeleteChannelModal.jsx
import React from "react";
import "./DeleteChannelModal.css"; // optional CSS for styling

function DeleteChannelModal({ onClose, onConfirm }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content delete-channel-modal">
        <h2>Delete Channel</h2>
        <p>
          Are you sure you want to delete your channel? <br />
          This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-delete" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteChannelModal;
