// src/components/UploadVideoModal.jsx
import React, { useState } from "react";
import axios from "axios";
import "./UploadVideoModal.css";

const UploadVideoModal = ({ channelId, onClose, onSuccess }) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !url.trim()) {
      setError("Title and video link are required.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token"); // use your auth token if available
      let user = JSON.parse(localStorage.getItem("user"));
      console.log(user._id);
      user=user._id;
      const res = await axios.post(
        `http://localhost:5000/channels/${channelId}/videos`,
        { title: title.trim(), description: description.trim(), url: url.trim(),user},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      onSuccess(res.data.video);
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to save video.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="uvm-overlay">
      <form className="uvm-modal" onSubmit={handleSubmit}>
        <h2>Add Video (YouTube link or video URL)</h2>

        <label className="uvm-field">
          Video Link (YouTube link or direct URL)
          <input
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </label>

        <label className="uvm-field">
          Title
          <input
            type="text"
            placeholder="Enter video title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className="uvm-field">
          Description
          <textarea
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="uvm-actions">
          <button type="button" onClick={onClose} disabled={saving} className="uvm-btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="uvm-btn-primary">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadVideoModal;
