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
