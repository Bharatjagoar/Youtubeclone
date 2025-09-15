import { useState } from "react";
import Avatar from "./Avatar";
import { formatRelativeDate } from "./helperfunctions";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import axios from "axios";
import "./Replies.css";

export default function Replies({
  replies,
  activeReplyBox,
  setActiveReplyBox,
  replyText,
  setReplyText,
  handlePostReply,
  setComments,
  parentId,
}) {
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editedText, setEditedText] = useState("");

  if (!replies || replies.length === 0) return null;

  const handleDeleteReply = async (replyId) => {
    try {
      await axios.delete(`http://localhost:5000/comments/${replyId}`);
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === parentId) {
            return {
              ...comment,
              replies: comment.replies.filter((r) => r._id !== replyId),
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error("Error deleting reply:", err);
    }
  };

  const handleEditReply = (replyId, currentText) => {
    setEditingReplyId(replyId);
    setEditedText(currentText);
  };

  const handleCancelEdit = () => {
    setEditingReplyId(null);
    setEditedText("");
  };

  const handleSaveEdit = async (replyId) => {
    const trimmed = editedText.trim();
    if (!trimmed) return;

    try {
      const { data: updated } = await axios.put(
        `http://localhost:5000/comments/${replyId}`,
        { text: trimmed }
      );

      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === parentId) {
            return {
              ...comment,
              replies: comment.replies.map((r) =>
                r._id === replyId ? { ...r, text: updated.text } : r
              ),
            };
          }
          return comment;
        })
      );

      setEditingReplyId(null);
      setEditedText("");
    } catch (err) {
      console.error("Error updating reply:", err);
    }
  };

  return (
    <div className="replies">
      {replies.map((reply) => (
        <div key={reply._id} className="comment reply">
          <Avatar
            username={reply.author}
            avatarColor={reply.avatarColor}
            size={28}
          />
          <div className="comment-body">
            <div className="comment-header">
              <span className="comment-author">{reply.author}</span>
              <span className="comment-time">
                {formatRelativeDate(reply.createdAt)}
              </span>
            </div>

            {editingReplyId === reply._id ? (
              <div className="edit-box">
                <textarea
                  className="reply-input"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                />
                <div className="edit-actions">
                  <button
                    className="save-btn"
                    onClick={() => handleSaveEdit(reply._id)}
                  >
                    <FaSave /> Save
                  </button>
                  <button className="cancel-btn" onClick={handleCancelEdit}>
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="comment-text">{reply.text}</p>
            )}

            <div className="comment-actions">
              <button
                className="reply-btn"
                onClick={() =>
                  setActiveReplyBox((prev) =>
                    prev === reply._id ? null : reply._id
                  )
                }
              >
                Reply
              </button>

              <button
                className="edit-btn"
                onClick={() => handleEditReply(reply._id, reply.text)}
              >
                <FaEdit /> Edit
              </button>

              <button
                className="delete-btn"
                onClick={() => handleDeleteReply(reply._id)}
              >
                <FaTrash /> Delete
              </button>
            </div>

            {activeReplyBox === reply._id && (
              <div className="reply-box">
                <textarea
                  className="reply-input"
                  placeholder="Reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="reply-actions">
                  <button
                    className="reply-post-btn"
                    onClick={() => handlePostReply(reply._id)}
                  >
                    Post Reply
                  </button>
                  <button
                    className="reply-cancel-btn"
                    onClick={() => {
                      setActiveReplyBox(null);
                      setReplyText("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}


            <Replies
              replies={reply.replies}
              activeReplyBox={activeReplyBox}
              setActiveReplyBox={setActiveReplyBox}
              replyText={replyText}
              setReplyText={setReplyText}
              handlePostReply={handlePostReply}
              setComments={setComments}
              parentId={parentId}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
