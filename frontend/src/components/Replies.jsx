import Avatar from "./Avatar";
import { formatRelativeDate } from "./helperfunctions";
import { FaEdit, FaTrash } from "react-icons/fa";
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
  if (!replies || replies.length === 0) return null;

  const handleDeleteReply = async (replyId) => {
    try {
      // 1️⃣ delete from backend
      console.log("Hello world from deleting")
      await axios.delete(`http://localhost:5000/comments/${replyId}`);
      console.log("Hello world after deleting")
      // 2️⃣ update local state
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
            <p className="comment-text">{reply.text}</p>

            {/* Actions */}
            <div className="comment-actions">
              <button
                className="reply-btn"
                onClick={() =>
                  setActiveReplyBox((prev) => (prev === reply._id ? null : reply._id))
                }
              >
                Reply
              </button>

              <button
                className="edit-btn"
                onClick={() => console.log("Edit Reply:", reply._id)}
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
                <button
                  className="reply-post-btn"
                  onClick={() => handlePostReply(reply._id)}
                >
                  Post Reply
                </button>
              </div>
            )}

            {/* Recursive rendering of nested replies */}
            <Replies
              replies={reply.replies}
              activeReplyBox={activeReplyBox}
              setActiveReplyBox={setActiveReplyBox}
              replyText={replyText}
              setReplyText={setReplyText}
              handlePostReply={handlePostReply}
              setComments={setComments}
              parentId={parentId} // keep passing down
            />
          </div>
        </div>
      ))}
    </div>
  );
}
