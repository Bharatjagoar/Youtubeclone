const Comment = require("../models/Comment");

exports.postComment = async (req, res) => {
  try {
    const { videoId, author, text, avatarColor } = req.body;
    const comment = await Comment.create({ videoId, author, text, avatarColor });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.replyToComment = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { author, text } = req.body;
    const reply = await Comment.create({ videoId: "", author, text });
    await Comment.findByIdAndUpdate(parentId, { $push: { replies: reply._id } });
    res.status(201).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ NEW CONTROLLER
exports.getCommentsByVideoId = async (req, res) => {
  try {
    const { videoId } = req.params;
    const comments = await Comment.find({ videoId }).sort({ createdAt: -1 }); // newest first
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
