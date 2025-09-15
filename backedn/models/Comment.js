const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    videoId: { type: String, required: true },
    author: { type: String, required: true },
    text: { type: String, required: true },
    avatarColor: { type: String },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }, // 👈 new field
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
