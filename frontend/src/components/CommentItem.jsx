// components/CommentItem.jsx
import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Avatar from "./Avatar";
import Replies from "./replies";
import { formatCount, formatRelativeDate } from "./helperfunctions";

function CommentItem({
  comment,
  user,
  activeReplyBox,
  replyText,
  editingCommentId,
  editedCommentText,
  onReplyToggle,
  onReplyTextChange,
  onPostReply,
  onCloseReplyBox,
  onEditComment,
  onCancelEdit,
  onSaveEdit,
  onEditTextChange,
  onDeleteComment,
  setActiveReplyBox,
  setReplyText,
  setComments
}) {
  // Render backend comment
  if (comment.fromBackend) {
    return (
      <div className="comment">
        <Avatar
          username={comment.author}
          avatarColor={comment.avatarColor}
          size={36}
        />
        <div className="comment-body">
          <div className="comment-header">
            <span className="comment-author">{comment.author}</span>
            <span className="comment-time">
              {formatRelativeDate(comment.createdAt)}
            </span>
          </div>

          {editingCommentId === comment._id ? (
            <div className="edit-box">
              <textarea
                className="comment-input"
                value={editedCommentText}
                onChange={(e) => onEditTextChange(e.target.value)}
              />
              <div className="edit-actions">
                <button
                  className="comment-post-btn"
                  onClick={() => onSaveEdit(comment._id)}
                >
                  Save
                </button>
                <button
                  className="comment-post-btn"
                  onClick={onCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="comment-text">{comment.text}</p>
          )}

          <div className="comment-actions">
            <button
              className="reply-btn"
              onClick={() => onReplyToggle(comment._id)}
            >
              Reply
            </button>

            <button
              className="edit-btn"
              onClick={() => onEditComment(comment._id, comment.text)}
            >
              <FaEdit /> Edit
            </button>

            <button
              className="delete-btn"
              onClick={() => onDeleteComment(comment._id)}
            >
              <FaTrash /> Delete
            </button>
          </div>

          {activeReplyBox === comment._id && (
            <div className="reply-box">
              <textarea
                className="reply-input"
                placeholder="Reply..."
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
              />
              <div className="reply-actions">
                <button
                  type="button"
                  className="reply-post-btn"
                  onClick={() => onPostReply(comment._id)}
                >
                  Post Reply
                </button>
                <button
                  type="button"
                  className="reply-cancel-btn"
                  onClick={onCloseReplyBox}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <Replies
            replies={comment.replies}
            activeReplyBox={activeReplyBox}
            setActiveReplyBox={setActiveReplyBox}
            replyText={replyText}
            setReplyText={setReplyText}
            handlePostReply={onPostReply}
            setComments={setComments}
            parentId={comment._id}
          />
        </div>
      </div>
    );
  }

  // Render YouTube API comment
  return (
    <div className="comment">
      <img
        src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl}
        alt={comment.snippet.topLevelComment.snippet.authorDisplayName}
        style={{ width: 36, height: 36, borderRadius: "50%" }}
      />
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">
            {comment.snippet.topLevelComment.snippet.authorDisplayName}
          </span>
          <span className="comment-time">
            {formatRelativeDate(
              comment.snippet.topLevelComment.snippet.publishedAt
            )}
          </span>
        </div>
        <p className="comment-text">
          {comment.snippet.topLevelComment.snippet.textDisplay}
        </p>
        <div className="comment-actions">
          <span className="comment-likes">
            {formatCount(
              comment.snippet.topLevelComment.snippet.likeCount
            )}{" "}
            likes
          </span>
        </div>
      </div>
    </div>
  );
}

export default CommentItem;