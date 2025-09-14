import React from "react";

function Avatar({ username, avatarColor, size = 40 }) {
  const initial = username ? username[0].toUpperCase() : "?";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: avatarColor || "#888",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: size / 2,
        userSelect: "none",
      }}
    >
      {initial}
    </div>
  );
}

export default Avatar;
