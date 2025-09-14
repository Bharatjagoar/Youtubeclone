import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setLoginStatus, closeAuthModal } from "../redux/authSlice";
import "./AuthModal.css";

const AuthModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: null,
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignup && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };

      let res, data;

      if (isSignup) {
        payload.username = formData.username;
        res = await fetch("http://localhost:5000/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("http://localhost:5000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      data = await res.json();

      if (res.ok) {
        console.log(`✅ ${isSignup ? "Signup" : "Login"} successful:`, data);

        // ✅ Generate or reuse random avatar color
        let storedUser = data.user;
        let userWithColor = storedUser;

        if (!storedUser.avatarColor) {
          const randomHue = Math.floor(Math.random() * 360);
          const randomColor = `hsl(${randomHue}, 70%, 50%)`; // bright random color
          userWithColor = { ...storedUser, avatarColor: randomColor };
        }

        // ✅ Save user and token
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(userWithColor));

        dispatch(setLoginStatus(true));
        dispatch(closeAuthModal());
        onClose();
      } else {
        setError(data.error || `${isSignup ? "Signup" : "Login"} failed`);
      }
    } catch (err) {
      console.error("❌ Auth error:", err.message);
      setError("Something went wrong. Please try again.");
    }
  };


  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>{isSignup ? "Create Account" : "Sign In"}</h2>

        {isSignup && (
          <div className="avatar-preview">
            <img
              src={formData.avatar || "https://www.gravatar.com/avatar?d=mp"}
              alt="Avatar"
              className="avatar-img"
            />
            <label className="avatar-label">
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {isSignup && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          )}
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="auth-submit-btn">
            {isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <p className="messageLink" onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;