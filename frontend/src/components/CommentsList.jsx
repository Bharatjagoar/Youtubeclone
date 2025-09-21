// components/CommentsList.jsx
import React from "react";
import CommentItem from "./CommentItem";

function CommentsList({
  comments,
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
  return (
    <div className="comments-section">
      <div className="comments-section-header">
        <span className="comments-count">
          {comments.length.toLocaleString()} Comments
        </span>
      </div>

      {comments.map((comment) => (
        <CommentItem
          key={comment.fromBackend ? comment._id : comment.id}
          comment={comment}
          user={user}
          activeReplyBox={activeReplyBox}
          replyText={replyText}
          editingCommentId={editingCommentId}
          editedCommentText={editedCommentText}
          onReplyToggle={onReplyToggle}
          onReplyTextChange={onReplyTextChange}
          onPostReply={onPostReply}
          onCloseReplyBox={onCloseReplyBox}
          onEditComment={onEditComment}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEdit}
          onEditTextChange={onEditTextChange}
          onDeleteComment={onDeleteComment}
          setActiveReplyBox={setActiveReplyBox}
          setReplyText={setReplyText}
          setComments={setComments}
        />
      ))}
    </div>
  );
}

export default CommentsList;