// components/AddComment.jsx
import React from "react";
import Avatar from "./Avatar";

function AddComment({ user, newComment, onCommentChange, onPostComment }) {
  return (
    <div className="add-comment">
      <Avatar
        username={user?.username}
        avatarColor={user?.avatarColor}
        size={40}
      />
      <textarea
        className="comment-input"
        placeholder="Add a public comment..."
        value={newComment}
        onChange={(e) => onCommentChange(e.target.value)}
      />
      <button className="comment-post-btn" onClick={onPostComment}>
        Comment
      </button>
    </div>
  );
}

export default AddComment;