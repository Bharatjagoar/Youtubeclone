// models/channel.js
const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: "" },
  url:         { type: String, required: true },   // video link (YouTube link or file URL)
  createdAt:   { type: Date, default: Date.now },
});

// Channel: one channel per user
const ChannelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name:        { type: String, required: true },
  username:    { type: String },
  description: { type: String },
  avatarUrl:   { type: String },
  videos:      [VideoSchema],
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model("Channel", ChannelSchema);
