// models/Comment.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  videoId:   { type: String, required: true },
  author:    { type: String, required: true },
  text:      { type: String, required: true },
  replies:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);