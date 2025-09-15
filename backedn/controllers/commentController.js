const Comment = require("../models/Comment");

// Post a top-level comment
exports.postComment = async (req, res) => {
  try {
    const { videoId, author, text, avatarColor } = req.body;
    const comment = await Comment.create({
      videoId,
      author,
      text,
      avatarColor,
      parentId: null, // 👈 root comment
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reply to a specific comment
exports.replyToComment = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { author, text, videoId, avatarColor } = req.body;

    const reply = await Comment.create({
      videoId,
      author,
      text,
      avatarColor,
      parentId, // 👈 mark reply’s parent
    });

    await Comment.findByIdAndUpdate(parentId, {
      $push: { replies: reply._id },
    });

    res.status(201).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all top-level comments for a video (with populated replies)
exports.getCommentsByVideoId = async (req, res) => {
  try {
    const { videoId } = req.params;

    const comments = await Comment.find({ videoId, parentId: null }) // 👈 only root comments
      .sort({ createdAt: -1 })
      .populate({
        path: "replies",
        populate: { path: "replies" }, // recursive nesting
      });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Delete a comment and all its nested replies
exports.deleteCommentWithReplies = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Recursive function to delete replies and clean up parent references
    const deleteRecursively = async (id) => {
      const comment = await Comment.findById(id);
      if (!comment) return;

      // 🔁 Recursively delete nested replies
      if (comment.replies && comment.replies.length > 0) {
        for (const replyId of comment.replies) {
          await deleteRecursively(replyId);
        }
      }

      // 🧹 Remove reference from parent if it's a reply
      if (comment.parentId) {
        await Comment.findByIdAndUpdate(comment.parentId, {
          $pull: { replies: comment._id },
        });
      }

      // 🗑️ Delete the comment itself
      await Comment.findByIdAndDelete(id);
    };

    await deleteRecursively(commentId);

    res.status(200).json({ message: "Comment and all nested replies deleted." });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: err.message });
  }
};
