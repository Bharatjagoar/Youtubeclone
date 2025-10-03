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


  // Only auto-generate username if creating
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
      let avatarUrl = avatarPreview;

      // Upload avatar to Cloudinary if new file selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        const cloudinaryRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );

        avatarUrl = cloudinaryRes.data.secure_url;
      }

      const user = JSON.parse(localStorage.getItem("user"));

      // Payload (skip username in edit mode)
      const payload = {
        name,
        description,
        avatarUrl,
        ...(channel ? {} : { username }), // only send username if creating
        user: user._id,
      };

      let backendRes;
      if (channel) {
        // Update existing channel
        console.log(channel);
        backendRes = await axios.put(
          `http://localhost:5000/channels/${channel._id}`,
          payload,
          { headers: { Authorization: `Bearer ${user._id}` } }
        );
      } else {
        // Create new channel
        backendRes = await axios.post("http://localhost:5000/channels", payload, {
          headers: { Authorization: `Bearer ${user._id}` },
        });
      }

      const { channel: savedChannel, user: updatedUser } = backendRes.data;

      // ✅ Update localStorage with fresh user object from backend
      console.log(user,updatedUser)
      localStorage.setItem("user", JSON.stringify(user));

      // Fire onSuccess
      onSuccess(savedChannel);

      onClose();
    } catch (err) {
      console.error("Channel save failed:", err);
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

        {/* Username - only visible in create mode */}
        {!channel && (
          <label className="cecc-field">
            Channel Handle
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <small>This will be your channel handle (must be unique)</small>
          </label>
        )}

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
          By clicking {channel ? "Save" : "Create channel"} you agree to YouTube’s Terms of Service.
        </p>

        <div className="cecc-actions">
          <button type="button" onClick={onClose} disabled={submitting} className="cecc-btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={`cecc-btn-primary ${submitting ? "loading" : ""}`}>
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
