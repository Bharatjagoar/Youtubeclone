// src/components/CreateEditChannelModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateEditChannelModal.css";
import { useNavigate } from "react-router-dom";

const CreateEditChannelModal = ({ channel, onClose, onSuccess }) => {
  const nav = useNavigate();
  const [name, setName] = useState(channel?.name || "");
  const [description, setDescription] = useState(channel?.description || "");
  const [username, setUsername] = useState(channel?.username || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(channel?.avatarUrl || "");
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate handle (username) when user enters a name (only on create)
  useEffect(() => {
    if (!localStorage.getItem("user")) {
      console.log("No token");
      nav("/");
    }
    if (!channel && name) {
      const base = name.trim().toLowerCase().replace(/\s+/g, "");
      const suffix = Math.random().toString(36).slice(2, 6);
      setUsername(`@${base}-${suffix}`);
    }
  }, [name, channel]);

  // Avatar file selection
  const onAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let avatarUrl = "";

      // Upload avatar to Cloudinary if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );

        const cloudinaryRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          formData
        );

        avatarUrl = cloudinaryRes.data.secure_url;
      }

      // Prepare channel payload
      const payload = {
        name,
        description,
        avatarUrl,
        username,
      };

      const user = JSON.parse(localStorage.getItem("user"));
      payload.user = user._id;

      // Send channel data to backend
      const backendRes = await axios.post(
        "http://localhost:5000/channels",
        payload,
        {
          headers: {
            Authorization: `Bearer ${user._id}`,
          },
        }
      );

      // Extract updated user + channel from backend
      const { channel: createdChannel, user: updatedUser } = backendRes.data;

      // ✅ Update localStorage with fresh user object from backend
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Fire onSuccess with new channel
      onSuccess(createdChannel);

      // Close modal
      onClose();
    } catch (err) {
      console.error("Channel creation failed:", err);
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cecc-overlay">
      <form className="cecc-modal" onSubmit={handleSubmit}>
        <h2>{channel ? "Edit channel" : "How you'll appear"}</h2>

        {/* Avatar */}
        <div className="cecc-avatar-section">
          <div className="cecc-avatar-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar preview" />
            ) : (
              <div className="cecc-avatar-placeholder">
                {name.charAt(0).toUpperCase() || "A"}
              </div>
            )}
          </div>
          <label className="cecc-avatar-label">
            Select picture
            <input type="file" accept="image/*" onChange={onAvatarChange} />
          </label>
        </div>

        {/* Channel Name */}
        <label className="cecc-field">
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        {/* Generated Username (Handle) */}
        <label className="cecc-field">
          Channel Handle
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // allow manual edit
            required
          />
          <small>This will be your channel handle (must be unique)</small>
        </label>

        {/* Description */}
        <label className="cecc-field">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Tell viewers what your channel is about"
          />
        </label>

        <p className="cecc-disclaimer">
          By clicking {channel ? "Save" : "Create channel"} you agree to
          YouTube’s Terms of Service. Changes to your name and picture are
          visible only on YouTube.
        </p>

        {/* Buttons */}
        <div className="cecc-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="cecc-btn-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`cecc-btn-primary ${submitting ? "loading" : ""}`}
          >
            {submitting
              ? channel
                ? "Saving…"
                : "Creating…"
              : channel
              ? "Save"
              : "Create channel"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEditChannelModal;
