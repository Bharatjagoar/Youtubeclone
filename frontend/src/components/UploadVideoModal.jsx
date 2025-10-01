// src/components/UploadVideoModal.jsx
import React, { useState } from "react";
import "./UploadVideoModal.css";

const UploadVideoModal = ({ channelId, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a video file.");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("video", file);
      form.append("title", title);
      form.append("description", description);

      const res = await fetch(`/api/channels/${channelId}/videos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      const updated = await res.json();
      onSuccess(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="uvm-overlay">
      <form className="uvm-modal" onSubmit={handleSubmit}>
        <h2>Upload Video</h2>

        <label className="uvm-field">
          Video File
          <input
            type="file"
            accept="video/*"
            onChange={handleFile}
            required
          />
        </label>

        <label className="uvm-field">
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className="uvm-field">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>

        <div className="uvm-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="uvm-btn-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="uvm-btn-primary"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadVideoModal;
