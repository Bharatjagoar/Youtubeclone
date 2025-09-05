// src/utils/verifyTokenBeforeFetch.js
import axios from "axios";

export async function verifyTokenBeforeFetch() {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }

  try {
    const res = await axios.post(
      "http://localhost:5000/auth/verify-token",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.data.valid) {
      alert("Session expired or invalid. Please sign in again.");
      return false;
    }

    return true;
  } catch (err) {
    console.error("Token verification failed:", err);
    alert("Something went wrong. Please try again.");
    return false;
  }
}