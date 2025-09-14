const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    videoId: { type: String, required: true },
    author: { type: String, required: true },
    text: { type: String, required: true },
    avatarColor: { type: String }, // ✅ store avatar color for consistent rendering
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
